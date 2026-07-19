from fastapi import APIRouter, UploadFile, File, HTTPException
from app.graph_engine import ai_graph
from app.vector_engine import store_document_vectors, delete_document_vectors  
import io
import pypdf
import pandas as pd

router = APIRouter()

def parse_pdf(file_bytes: bytes) -> str:
    pdf_file = io.BytesIO(file_bytes)
    reader = pypdf.PdfReader(pdf_file)
    extracted_text = ""
    for page in reader.pages:
        text = page.extract_text()
        if text:
            extracted_text += text + "\n"
    return extracted_text.strip()

def parse_excel_or_csv(file_bytes: bytes, filename: str) -> str:
    file_io = io.BytesIO(file_bytes)
    if filename.endswith('.csv'):
        df = pd.read_csv(file_io)
    else:
        df = pd.read_excel(file_io)
    return df.to_markdown(index=False)

@router.post("/ingest-heterogeneous")
async def ingest_heterogeneous_document(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        filename = file.filename.lower()
        extracted_content = ""
        doc_type = ""

        if filename.endswith('.pdf'):
            doc_type = "PDF Manual/Report"
            extracted_content = parse_pdf(file_bytes)
        elif filename.endswith(('.xlsx', '.xls', '.csv')):
            doc_type = "Spreadsheet/Log"
            extracted_content = parse_excel_or_csv(file_bytes, filename)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")

        if not extracted_content:
            return {"status": "empty", "message": "No processable text uncovered."}

        # 1. Run the data through LangGraph Knowledge Graph Extraction
        initial_state = {"text_content": extracted_content, "extracted_data": []}
        graph_output = ai_graph.invoke(initial_state)

        # 2. Vectorize and index the chunks locally for semantic search RAG
        total_chunks_indexed = store_document_vectors(file.filename, extracted_content)

        return {
            "status": "success",
            "documentName": file.filename,
            "detectedType": doc_type,
            "vectorDatabaseTelemetry": {
                "indexedChunks": total_chunks_indexed,
                "targetStore": "ChromaDB Embedded"
            },
            "graphKnowledgeTelemetry": graph_output["extracted_data"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Ingestion Core Failure: {str(e)}")
    

@router.delete("/documents/{document_name}")
async def delete_document_vectors_endpoint(document_name: str):
    try:
        deleted_count = delete_document_vectors(document_name)
        if deleted_count == 0:
            return {"status": "not_found", "documentName": document_name, "deletedChunks": 0}
        return {"status": "success", "documentName": document_name, "deletedChunks": deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector purge failed: {str(e)}")