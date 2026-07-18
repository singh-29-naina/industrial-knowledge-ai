import os
from pathlib import Path
from typing import TypedDict, List
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv

# Explicitly resolve the .env path from the root directory
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class ExtractedEntity(BaseModel):
    entity_name: str = Field(description="Name of the asset, tool, technology, company, or concept.")
    entity_type: str = Field(description="Category (e.g., Technology, Company, Requirement, Metric).")
    context: str = Field(description="Brief context of how this entity is used in the document.")

class ExtractionSchema(BaseModel):
    entities: List[ExtractedEntity]

class AgentState(TypedDict):
    text_content: str
    extracted_data: list

def extract_entities_node(state: AgentState):
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",  # <-- Upgraded to an active, supported model
        temperature=0.1,
        groq_api_key=os.getenv("GROQ_API_KEY")
    )
    
    structured_llm = llm.with_structured_output(ExtractionSchema)
    
    system_prompt = (
        "You are an expert industrial knowledge graph ingestion bot. "
        "Analyze the text and pull out key entities, terms, technologies, and specs."
    )
    
    response = structured_llm.invoke([
        ("system", system_prompt),
        ("human", state["text_content"])
    ])
    
    # CHANGED: Use modern Pydantic v2 model_dump() instead of deprecated .dict()
    return {"extracted_data": [entity.model_dump() for entity in response.entities]}

workflow = StateGraph(AgentState)
workflow.add_node("extractor", extract_entities_node)
workflow.set_entry_point("extractor")
workflow.add_edge("extractor", END)

ai_graph = workflow.compile()