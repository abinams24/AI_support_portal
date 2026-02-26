from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key = True, index = True)
    name = Column(String(255))
    email = Column(String(255), unique = True, index = True)
    password = Column(String(255))
    role = Column(String(50))



class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(255))
    message = Column(Text)
    category = Column(String(50))
    priority = Column(String(50))
    ai_summary = Column(Text)
    status = Column(String(20), default="Open")
    # NEW FIELD: Connects ticket to the user who raised it
    customer_id = Column(Integer, index=True) 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    file_path = Column(String(255))


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, index=True)
    sender_role = Column(String(50)) # "agent" or "customer"
    sender_name = Column(String(255))
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

