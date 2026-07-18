import io
import pypdf
import pandas as pd

def parse_pdf(file_bytes: bytes) -> str:
    """Extracts text from clean text PDFs using PyPDF."""
    pdf_file = io.BytesIO(file_bytes)
    reader = pypdf.PdfReader(pdf_file)
    extracted_text = ""
    for page in reader.pages:
        text = page.extract_text()
        if text:
            extracted_text += text + "\n"
    return extracted_text.strip()

def parse_excel_or_csv(file_bytes: bytes, filename: str) -> str:
    """Parses Excel or CSV spreadsheets into clean Markdown tables."""
    file_io = io.BytesIO(file_bytes)
    if filename.endswith('.csv'):
        df = pd.read_csv(file_io)
    else:
        df = pd.read_excel(file_io)
    
    # Converting structural data to Markdown keeps context intact for the LLM
    return df.to_markdown(index=False)