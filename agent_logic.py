import io
import os
import json
import PyPDF2
import os
from docx import Document
from groq import Groq

# 1. Setup
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

def get_clean_text(file_path):
    """Detects file type and extracts text from attachments."""
    if not file_path or not os.path.exists(file_path):
        return "No attachment content available."
        
    try:
        if file_path.lower().endswith(".pdf"):
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                return " ".join([p.extract_text() for p in reader.pages])
        
        elif file_path.lower().endswith(".docx"):
            doc = Document(file_path)
            return " ".join([p.text for p in doc.paragraphs])
        
        elif file_path.lower().endswith(".txt"):
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()

    except Exception as e:
        return f"Extraction Error: {str(e)}"
    return ""

def agent_triage(file_path, user_msg):
    """Main AI function that processes the real user message and file content."""
    content = get_clean_text(file_path)
    
    prompt = f"""
    Role: Senior Support Triage Agent
    Inputs: 
      - Message: {user_msg}
      - Attachment: {content[:2000]} 

    Task:
    1. Classify into EXACTLY ONE category: [IT, HR, Facilities]. 
       - Facilities: Office maintenance, HotDesk bookings, gym access, cafeteria, fire drills, gates, building security.
       - IT: Software errors, VPN, MFA, hardware breakages, password locks, Wi-Fi.
       - HR: Payroll, maternity/paternity leave, sick leave, probation, benefits.

    2. Set Priority using STRICT rules:
       - Low: General questions, amenity requests (Gym, Cafeteria, Desk Bookings), or scheduled non-emergency events (Drills).
       - Medium: Non-blocking issues like software requests, policy clarifications, or furniture repairs.
       - High: ACTIVE safety hazards (not drills), total work-stoppers (cannot log in), hardware breakages, or system outages.

    3. Summarize the issue in exactly 2 concise bullet points.

    Return ONLY JSON:
    {{
        "assigned_to": "IT/HR/Facilities",
        "priority": "Low/Medium/High",
        "ai_summary": "Point 1. Point 2."
    }}
    """
    
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"}
    )
    
    result = json.loads(response.choices[0].message.content)

    # REFINEMENT: Ensure assigned_to is a single string for the database
    if "/" in result['assigned_to']:
        result['assigned_to'] = result['assigned_to'].split("/")[0].strip()
    
    # REFINEMENT: Flatten ai_summary to string to avoid MySQL Operand Errors
    if isinstance(result['ai_summary'], list):
        result['ai_summary'] = " ".join(result['ai_summary'])
    
    return result