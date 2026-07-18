
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional,List, Dict, Any
from app.chat_engine import generate_rag_stream
from app.vector_engine import collection
from langchain_groq import ChatGroq


router = APIRouter()

class ChatQuery(BaseModel):
    question: str
    documentName: Optional[str] = None
    # Chat history should be structured as list of dicts: [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
    history: Optional[List[Dict[str, Any]]] = None 

@router.post("/query")
async def query_knowledge_base(payload: ChatQuery):
    try:
        if not payload.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty.")
            
        return StreamingResponse(
            generate_rag_stream(payload.question, payload.documentName, payload.history),
            media_type="text/event-stream"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Streaming Failure: {str(e)}")

@router.post("/query")
async def query_knowledge_base(payload: ChatQuery):
    try:
        if not payload.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty.")
            
        # Return a StreamingResponse with text/event-stream content type
        return StreamingResponse(
            generate_rag_stream(payload.question, payload.documentName),
            media_type="text/event-stream"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Streaming Failure: {str(e)}")
    

@router.get("/documents")
async def list_indexed_documents():
    """Queries ChromaDB metadata to return all unique indexed file sources."""
    try:
        # Retrieve metadata entries up to 100 entries to extract distinct filenames
        data = collection.get(include=["metadatas"])
        metadatas = data.get("metadatas", [])
        
        # Extract unique sources
        unique_docs = list(set([m["source"] for m in metadatas if "source" in m]))
        
        return {"documents": unique_docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")
    

class TitleRequest(BaseModel):
    first_question: str

@router.post("/generate-title")
async def generate_chat_title(payload: TitleRequest):
    """Generates a short 3-5 word title based on the user's first prompt."""
    try:
        title_prompt = (
            "Generate a highly concise, professional 3 to 5 word title for a chat conversation "
            "that starts with the following prompt. Do not use quotation marks, punctuation, "
            f"or conversational filler. Return only the title text.\n\nPrompt: {payload.first_question}"
        )
        
        response = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            groq_api_key=os.getenv("GROQ_API_KEY")
        ).invoke([("user", title_prompt)])
        
        return {"title": response.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate title: {str(e)}")