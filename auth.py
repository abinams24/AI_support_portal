from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services.auth_utils import hash_password, verify_password, create_access_token

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

# --- TASK 3: REGISTRATION API ---
@router.post("/register/{role}")
async def register(
    role: str, 
    name: str = Form(...), 
    email: str = Form(...), 
    password: str = Form(...), 
    db: Session = Depends(get_db)
):
    # Validation: Only allow specific roles
    if role not in ["customer", "agent", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user with hashed password
    new_user = models.User(
        name=name,
        email=email,
        password=hash_password(password),
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "success", "message": f"{role.capitalize()} registered successfully"}

# --- TASK 4: LOGIN API ---
@router.post("/login")
async def login(
    email: str = Form(...), 
    password: str = Form(...), 
    db: Session = Depends(get_db)
):
    # 1. Find user by email
    user = db.query(models.User).filter(models.User.email == email).first()
    
    # 2. Verify user exists and password is correct
    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
    
    # 3. Create JWT Token containing email and role
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    
    # 4. Return token and role for Frontend routing
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role,
        "redirect_url": f"/dashboard/{user.role}"
    }
# Add this to your existing auth.py router
@router.get("/users/{role}")
async def get_users_by_role(role: str, db: Session = Depends(get_db)):
    # Validation to ensure we only query valid roles
    if role not in ["customer", "agent", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    users = db.query(models.User).filter(models.User.role == role).all()
    return users

# --- TASK: LIST ALL AGENTS ---
@router.get("/agents")
async def get_agents(db: Session = Depends(get_db)):
    # Fetch only users whose role is 'agent'
    agents = db.query(models.User).filter(models.User.role == "agent").all()
    return agents

# --- TASK: DELETE AGENT ---
@router.delete("/agent/{agent_id}")
async def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(models.User).filter(models.User.id == agent_id, models.User.role == "agent").first()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    db.delete(agent)
    db.commit()
    return {"status": "success", "message": "Agent deleted successfully"}

# --- TASK: UPDATE AGENT ---
@router.put("/agent/{agent_id}")
async def update_agent(
    agent_id: int, 
    name: str = Form(None), 
    email: str = Form(None), 
    db: Session = Depends(get_db)
):
    agent = db.query(models.User).filter(models.User.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="User not found")

    if name: agent.name = name
    if email: agent.email = email
    
    db.commit()
    db.refresh(agent)
    return {"status": "success", "message": "Agent updated successfully", "agent": agent}