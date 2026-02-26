🤖 AI Smart Support System

An AI-powered Smart Support Portal built using FastAPI, React, SQLite, and ChromaDB implementing RAG (Retrieval-Augmented Generation) architecture to provide intelligent and context-aware support responses.

---

🔥 Project Overview

The AI Smart Support System is designed to automate and enhance customer support using:

- 🎯 Semantic search
- 🧠 AI-generated responses
- 📂 Knowledge base retrieval
- 🎫 Ticket management system
- 👨‍💼 Admin & Agent dashboards

Instead of simple keyword matching, the system understands user intent using vector embeddings and retrieves the most relevant information before generating responses.

---

🏗 Architecture (RAG Based)

This project follows **Retrieval-Augmented Generation (RAG)** architecture:

1. User submits a query
2. Query is converted into embeddings
3. Vector search performed in ChromaDB
4. Relevant chunks retrieved
5. Context sent to LLM (Groq API)
6. AI generates grounded response
7. Response returned to frontend

Why RAG?

- Reduces hallucination
- Ensures domain-specific answers
- Improves accuracy
- Allows dynamic knowledge updates

---

🧠 Technologies Used

🔹 Backend
- FastAPI
- SQLite
- SQLAlchemy
- Pydantic
- ChromaDB (Vector Database)
- Groq API (LLM Inference)

🔹 Frontend
- React
- Vite
- Tailwind CSS
- Axios

🔹 AI Concepts
- RAG Architecture
- Semantic Search
- Text Embeddings
- Chunking
- Vector Similarity Search

---

📊 Features

👤 Authentication
- Admin login
- Agent login
- Password hashing
- Role-based access

🎫 Ticket Management
- Raise ticket
- Priority system (Low / Medium / High)
- Assign agents
- Status tracking

🤖 AI Support System
- Knowledge base ingestion
- Text chunking
- Embedding generation
- Semantic retrieval
- LLM-based answer generation

🧑‍💼 Dashboards
- Admin dashboard
- Agent dashboard
- Customer dashboard

---

 🚀 How To Run

🔹 Backend Setup

```bash
cd Backend/support_backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
