from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- USER SCHEMAS ---

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: str  # 'customer', 'agent', or 'admin'

class UserResponse(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True

# --- AUTH SCHEMAS ---

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str 

# --- MESSAGE SCHEMAS ---

class MessageBase(BaseModel):
    text: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    ticket_id: int
    sender_role: str
    sender_name: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- TICKET SCHEMAS (Updated for Metadata & File Preview) ---

class TicketBase(BaseModel):
    subject: str
    message: str

class TicketResponse(TicketBase):
    id: int
    category: str
    priority: str
    ai_summary: str
    status: str
    customer_id: int
    # NEW: Added to show customer name in Agent Detail view
    customer_name: Optional[str] = "Standard User" 
    # NEW: Added to allow frontend to check if a file exists for preview
    file_path: Optional[str] = None 
    created_at: datetime 

    class Config:
        from_attributes = True

# Schema for a Ticket including its full message thread
class TicketWithMessages(TicketResponse):
    messages: List[MessageResponse] = []