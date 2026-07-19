import os
import uuid
import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

# Initialize local persistent disk storage for ChromaDB
# This creates a 'chroma_db' folder inside your project directory
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Use Chroma's built-in fast local embedding utility
embedding_function = DefaultEmbeddingFunction()

# Create or fetch our target collection
collection = chroma_client.get_or_create_collection(
    name="industrial_knowledge_base",
    embedding_function=embedding_function
)

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """Slices long structural text into overlapping semantic fragments."""
    chunks = []
    words = text.split()
    
    # Fast window sliding chunking strategy
    i = 0
    while i < len(words):
        chunk_words = words[i:i + chunk_size]
        chunks.append(" ".join(chunk_words))
        i += chunk_size - chunk_overlap
        
    return chunks

def store_document_vectors(document_name: str, raw_text: str):
    """Chunks text, runs embeddings, and commits segments to ChromaDB."""
    text_chunks = chunk_text(raw_text)
    
    ids = [str(uuid.uuid4()) for _ in text_chunks]
    documents = text_chunks
    metadatas = [{"source": document_name} for _ in text_chunks]
    
    # Upsert the vectors directly into our disk-backed collection
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )
    
    return len(text_chunks)

def delete_document_vectors(document_name: str) -> int:
    """Removes all chunks belonging to a given source document from ChromaDB.
    Returns the number of chunks deleted."""
    existing = collection.get(where={"source": document_name}, include=[])
    ids_to_delete = existing.get("ids", [])
    if not ids_to_delete:
        return 0
    collection.delete(ids=ids_to_delete)
    return len(ids_to_delete)