import os
import chromadb
from chromadb.utils import embedding_functions
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# 1. Setup Local Embeddings
local_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Initialize ChromaDB (Persistent storage)
# Note: This will create a 'local_rag_db' folder in your project root
client = chromadb.PersistentClient(path="./local_rag_db")
collection = client.get_or_create_collection("support_kb", embedding_function=local_ef)

# 2. Setup Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY") # Better to use env variable
groq_client = Groq(api_key=GROQ_API_KEY)

def load_txt_to_db(file_path: str):
    """Chunks text files and loads them into ChromaDB with overlap."""
    if not os.path.exists(file_path):
        return False

    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
    
    chunk_size, overlap = 500, 100
    chunks = []
    
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i : i + chunk_size].strip()
        if chunk:
            chunks.append(chunk)
    
    ids = [f"doc_{os.path.basename(file_path)}_{i}" for i in range(len(chunks))]
    collection.upsert(ids=ids, documents=chunks)
    return True

def ask_rag_bot(query: str):
    """Retrieves context and asks the LLM."""
    results = collection.query(query_texts=[query], n_results=4)
    
    if not results['documents'] or not results['documents'][0]:
        return "I'm sorry, I couldn't find any relevant information in our knowledge base."
        
    retrieved_docs = results['documents'][0]
    context = " ".join(retrieved_docs)
    
    chat_completion = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": f"You are a helpful support assistant. Use ONLY this context: {context}. If the answer isn't there, say you don't know."},
            {"role": "user", "content": query}
        ],
        model="llama-3.3-70b-versatile", 
    )
    return chat_completion.choices[0].message.content

# Create a second collection for FAQs
faq_collection = client.get_or_create_collection("faq_kb", embedding_function=local_ef)

def load_faq_to_db(file_path: str):
    """
    Specifically for FAQs. Assumes a format like:
    Q: Question here?
    A: Answer here.
    """
    if not os.path.exists(file_path):
        return False

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Split by double newlines to separate Q&A pairs
    pairs = [p.strip() for p in content.split("\n\n") if p.strip()]
    
    ids = [f"faq_{i}" for i in range(len(pairs))]
    faq_collection.upsert(ids=ids, documents=pairs)
    return True

def get_faqs_from_db():
    """Retrieves all uploaded FAQs for the dashboard."""
    results = faq_collection.get()
    return results['documents']


def get_uploaded_filenames(collection_type="kb"):
    """Returns a list of unique filenames currently in the vector DB."""
    coll = collection if collection_type == "kb" else faq_collection
    results = coll.get()
    
    # Extract filename from the ID (we saved IDs as doc_filename_index)
    filenames = set()
    for id_str in results['ids']:
        # Splits 'doc_my_knowledge.txt_0' into ['doc', 'my_knowledge.txt', '0']
        parts = id_str.split('_')
        if len(parts) >= 2:
            filenames.add(parts[1]) 
    return list(filenames)

def delete_file_from_db(filename, collection_type="kb"):
    """Deletes all chunks associated with a specific filename."""
    coll = collection if collection_type == "kb" else faq_collection
    results = coll.get()
    
    # Find all IDs that belong to this filename
    ids_to_delete = [id_str for id_str in results['ids'] if filename in id_str]
    
    if ids_to_delete:
        coll.delete(ids=ids_to_delete)
        return True
    return False