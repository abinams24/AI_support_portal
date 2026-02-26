import os
import shutil
from fastapi import APIRouter, Form, HTTPException, UploadFile, File, Query
from app.services.rag_service import (
    ask_rag_bot, 
    load_txt_to_db, 
    load_faq_to_db, 
    get_uploaded_filenames, 
    delete_file_from_db,
    faq_collection  # Ensure this is exported from your service
)

router = APIRouter(prefix="/api/ai", tags=["AI Knowledge Base"])

# --- TASK 3: KB / RAG SEARCH (Home Page & Bot) ---
@router.post("/ask")
async def ask_question(question: str = Form(...)):
    """Queries the Knowledge Base using RAG and LLM."""
    try:
        answer = ask_rag_bot(question)
        return {"question": question, "answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- TASK 2: FAQ INSTANT SEARCH (Home Page) ---
@router.get("/faq/search")
async def search_faqs(q: str = Query(..., min_length=2)):
    """Performs a vector search specifically on the FAQ collection."""
    try:
        # Search the FAQ collection in ChromaDB
        results = faq_collection.query(
            query_texts=[q],
            n_results=5
        )
        
        # Format the vector results for the Frontend
        formatted_results = []
        for i in range(len(results['documents'][0])):
            content = results['documents'][0][i]
            # Assumes format "Q: [question] \n A: [answer]"
            if "A:" in content:
                q_part, a_part = content.split("A:", 1)
                formatted_results.append({
                    "question": q_part.replace("Q:", "").strip(),
                    "answer": a_part.strip()
                })
            else:
                formatted_results.append({
                    "question": "Matched Content", 
                    "answer": content
                })
        return formatted_results
    except Exception as e:
        return []

# --- ADMIN: FILE MANAGEMENT (KB) ---
@router.post("/admin/upload-knowledge")
async def upload_kb(file: UploadFile = File(...)):
    """Uploads and embeds a technical text file into the KB collection."""
    file_path = f"app/temp_uploads/{file.filename}"
    # Ensure temp directory exists
    os.makedirs("app/temp_uploads", exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    success = load_txt_to_db(file_path)
    os.remove(file_path)
    return {"message": "Knowledge Base Updated"}

# --- ADMIN: FILE MANAGEMENT (FAQ) ---
@router.post("/admin/upload-faq")
async def upload_faq(file: UploadFile = File(...)):
    """Uploads and embeds Q&A pairs into the FAQ collection."""
    file_path = f"app/temp_uploads/{file.filename}"
    os.makedirs("app/temp_uploads", exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    success = load_faq_to_db(file_path)
    os.remove(file_path)
    return {"message": "FAQ Section Updated"}

# --- ADMIN: CONTENT LISTING & DELETION ---
@router.get("/files/{type}")
async def list_files(type: str):
    """Lists unique filenames in either the 'kb' or 'faq' collections."""
    # type can be 'kb' or 'faq'
    files = get_uploaded_filenames(type)
    return {"files": files}

@router.delete("/files/{type}/{filename}")
async def delete_file(type: str, filename: str):
    """Removes all document chunks associated with a filename from ChromaDB."""
    success = delete_file_from_db(filename, type)
    if success:
        return {"message": f"File {filename} deleted successfully"}
    raise HTTPException(status_code=404, detail="File not found")

@router.post("/upload-kb")
async def seed_knowledge_base():
    """Seed endpoint for local manual files."""
    success = load_txt_to_db("my_knowledge.txt")
    if success:
        return {"status": "Knowledge base updated successfully"}
    return {"status": "Error: File not found"}