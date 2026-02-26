from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os
import shutil
from app.database import get_db
from app import models
from app.services.agent_logic import agent_triage
from app.services.auth_utils import get_current_user
from fastapi.responses import FileResponse

router = APIRouter(
    prefix="/api/tickets",
    tags=["Tickets"]
)

# --- AGENT: Fetch All Tickets with Customer Names ---
@router.get("/all")
async def get_all_tickets(db: Session = Depends(get_db)):
    """Fetch every ticket joined with customer names for the Agent Queue."""
    results = db.query(
        models.Ticket, 
        models.User.name.label("customer_name")
    ).join(models.User, models.Ticket.customer_id == models.User.id).all()
    
    tickets = []
    for ticket, customer_name in results:
        ticket_data = {column.name: getattr(ticket, column.name) for column in ticket.__table__.columns}
        ticket_data["customer_name"] = customer_name
        tickets.append(ticket_data)
        
    return tickets

# --- SHARED: Route to Preview/Download uploaded files ---
@router.get("/file/{ticket_id}")
async def get_ticket_file(ticket_id: int, db: Session = Depends(get_db)):
    """Serves the file content for the frontend preview modal or download."""
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    
    if not ticket or not ticket.file_path:
        raise HTTPException(status_code=404, detail="No attachment found for this ticket")
    
    if not os.path.exists(ticket.file_path):
        raise HTTPException(status_code=404, detail="Physical file missing from server storage")
    
    return FileResponse(ticket.file_path)

# --- CUSTOMER: Fetch My Tickets (Personalized) ---
@router.get("/my-tickets")
async def get_my_tickets(
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Fetch only tickets raised by the currently logged-in customer."""
    return db.query(models.Ticket).filter(models.Ticket.customer_id == current_user.id).all()

# --- SHARED: Get Detailed Ticket + Thread ---
@router.get("/{ticket_id}")
async def get_ticket_details(ticket_id: int, db: Session = Depends(get_db)):
    """Fetch full details including customer name and message history."""
    result = db.query(
        models.Ticket, 
        models.User.name.label("customer_name")
    ).join(models.User, models.Ticket.customer_id == models.User.id).filter(models.Ticket.id == ticket_id).first()

    if not result:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket, customer_name = result
    ticket_dict = {column.name: getattr(ticket, column.name) for column in ticket.__table__.columns}
    ticket_dict["customer_name"] = customer_name

    messages = db.query(models.Message).filter(models.Message.ticket_id == ticket_id).order_by(models.Message.created_at.asc()).all()
    
    return {
        "ticket": ticket_dict,
        "messages": messages
    }

# --- SHARED: Get Just Messages ---
@router.get("/{ticket_id}/messages")
async def get_messages(ticket_id: int, db: Session = Depends(get_db)):
    """Fetch history, ordered so newest messages appear at the bottom."""
    return db.query(models.Message).filter(
        models.Message.ticket_id == int(ticket_id)
    ).order_by(models.Message.created_at.asc()).all()

# --- CUSTOMER: Raise Ticket ---
@router.post("/raise")
async def raise_ticket(
    subject: str = Form(...),
    message: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    file_save_path = None
    if file and file.filename:
        upload_dir = "app/temp_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_save_path = os.path.join(upload_dir, file.filename)
        with open(file_save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    try:
        triage = agent_triage(file_save_path, message)
        
        raw_summary = triage.get('ai_summary', "No summary provided")
        
        if isinstance(raw_summary, list):
            final_summary = " ".join(raw_summary)
        else:
            final_summary = str(raw_summary)

        new_ticket = models.Ticket(
            subject=subject,
            message=message,
            file_path=file_save_path, 
            category=triage.get('assigned_to', 'IT'),
            priority=triage.get('priority', 'Medium'),
            ai_summary=final_summary,
            customer_id=current_user.id,
            status="Open"
        )
        db.add(new_ticket)
        db.commit()
        return {"status": "success", "ticket_id": new_ticket.id}
    except Exception as e:
        db.rollback()
        print(f"Raise Ticket Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")

# --- SHARED: Send Message in Thread ---
@router.post("/{ticket_id}/message")
async def send_message(
    ticket_id: int, 
    text: str = Form(...), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # --- LOCK CHECK: Prevent messages if status is Completed ---
    if ticket.status == "Completed":
        raise HTTPException(
            status_code=403, 
            detail="This ticket is closed and cannot receive new messages."
        )

    new_msg = models.Message(
        ticket_id=ticket_id,
        sender_role=current_user.role,
        sender_name=current_user.name,
        text=text
    )
    db.add(new_msg)
    
    if current_user.role == "agent" and ticket.status == "Open":
        ticket.status = "In Progress"
            
    db.commit()
    return {"status": "success"}

# --- AGENT: Update Ticket (Overrule AI) ---
@router.put("/update/{ticket_id}")
async def update_ticket(
    ticket_id: int, 
    category: str = Form(...), 
    priority: str = Form(...), 
    status: str = Form(...),
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # --- LOCK CHECK: Prevent editing or reopening if already Completed ---
    if ticket.status == "Completed":
        raise HTTPException(
            status_code=403, 
            detail="Completed tickets are locked and cannot be edited or reopened."
        )
    
    ticket.category = category
    ticket.priority = priority
    ticket.status = status
    db.commit()
    return {"message": "Ticket updated successfully"} 