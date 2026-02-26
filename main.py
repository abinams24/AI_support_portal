from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Change these lines to include 'app.'
from app.database import engine, Base
import app.models as models
from app.routers import auth, tickets, rag

app = FastAPI(title="AI Support Helpdesk")

# --- 1. Middleware (Important for React) ---
# This allows your React frontend (port 3000) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # In production, change "*" to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. Initialize Database ---
# This creates the 'users' and 'tickets' tables in MySQL automatically
models.Base.metadata.create_all(bind=engine)

# --- 3. Include Routers ---
# This pulls in all the logic from auth.py and tickets.py
app.include_router(auth.router)
app.include_router(tickets.router)
app.include_router(rag.router)

@app.get("/")
def root():
    return {"message": "Support Backend is Running", "docs": "/docs"}