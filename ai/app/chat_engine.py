import os
import json
from pathlib import Path
from typing import List, Dict, Any
from langchain_groq import ChatGroq
from app.vector_engine import collection
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Initialize Groq LLM
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.3,
    streaming=True,
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def condense_question(question: str, history: List[Dict[str, Any]] = None) -> str:
    """Uses LLM to rewrite a follow-up question based on history into a standalone query."""
    if not history or len(history) == 0:
        return question

    # Format the history into readable text for the model
    chat_history_str = ""
    for msg in history:
        role = "User" if msg.get("role") == "user" else "Assistant"
        chat_history_str += f"{role}: {msg.get('content')}\n"

    condense_prompt = (
        "Given the following chat history and a follow-up question, rewrite the follow-up question "
        "to be a standalone search query that can be used to query a vector database. "
        "Do not add any conversational filler, return ONLY the search query.\n\n"
        f"--- Chat History ---\n{chat_history_str}\n"
        f"Follow-up Question: {question}\n"
        "Standalone Query:"
    )
    
    # We use a quick non-streaming call to get the condensed search term
    response = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.0,
        groq_api_key=os.getenv("GROQ_API_KEY")
    ).invoke([("user", condense_prompt)])
    
    return response.content.strip()

async def generate_rag_stream(question: str, document_name: str = None, history: List[Dict[str, Any]] = None):
    """Generates streaming RAG response incorporating chat history."""
    
    # 1. Condense follow-up question if history exists
    search_query = condense_question(question, history) if history else question
    
    # 2. Query ChromaDB using the optimized query
    context = retrieve_context(search_query, document_name)
    
    # 3. Format history for the final LLM payload
    formatted_messages = [
        ("system", (
            "You are an expert industrial engineering AI helper. "
            "Answer the user's question strictly using the provided context from our documentation. "
            "If you do not know, state it clearly.\n\n"
            f"--- CONTEXT START ---\n{context}\n--- CONTEXT END ---"
        ))
    ]
    
    # Append past history if it exists
    if history:
        for msg in history:
            role = "human" if msg.get("role") == "user" else "ai"
            formatted_messages.append((role, msg.get("content")))
            
    # Append current question
    formatted_messages.append(("human", question))

    # 4. Stream Metadata
    metadata = {
        "search_scope": document_name if document_name else "Global (All Documents)",
        "citations": [document_name] if document_name else ["Extracted Context Segment"],
        "condensed_query": search_query
    }
    yield f"METADATA:{json.dumps(metadata)}\n"

    # 5. Stream LLM tokens
    async for chunk in llm.astream(formatted_messages):
        yield chunk.content

def retrieve_context(query: str, document_name: str = None, n_results: int = 2) -> str:
    """Queries ChromaDB, optionally filtering by a specific document name."""
    where_filter = {"source": document_name} if document_name else None
    results = collection.query(query_texts=[query], n_results=n_results, where=where_filter)
    retrieved_docs = results.get("documents", [[]])[0]
    if not retrieved_docs:
        return "No relevant documentation chunks found."
    return "\n\n---\n\n".join(retrieved_docs)