"""
ContractRiskAI - FastAPI Backend
A showcase of prompt engineering for contract risk analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from langchain.callbacks import LangChainTracer
from langfuse import Langfuse
import json
from datetime import datetime
from prompts import (
    SYSTEM_PROMPT, 
    get_enhanced_prompt, 
    RiskAnalysisOutput,
    RiskAnalysisOutputArabic
)

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="ContractRiskAI",
    description="Advanced contract clause risk analysis using GPT-4",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ClauseAnalysisRequest(BaseModel):
    clause: str = Field(..., description="The contract clause to analyze")
    context: Optional[str] = Field(None, description="Additional context about the contract")
    industry: Optional[str] = Field(None, description="Industry context for specialized analysis")

class ClauseAnalysisResponse(BaseModel):
    english: Dict[str, Any]
    arabic: Dict[str, Any]
    metadata: Dict[str, Any]

# Initialize LLM with optional tracing
def get_llm():
    callbacks = []
    
    # Add LangFuse tracing if enabled
    if os.getenv("LANGFUSE_ENABLED", "false").lower() == "true":
        langfuse = Langfuse(
            public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
            secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
            host=os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")
        )
        # Note: In langfuse 3.x, you might need to use observe decorator or different integration
        # For now, we'll skip the callback as the API has changed
    
    return ChatOpenAI(
        model="gpt-4o",
        temperature=0.1,
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        callbacks=callbacks,
        model_kwargs={
            "response_format": {"type": "json_object"}
        }
    )

# Health check endpoint
@app.get("/")
async def root():
    return {
        "status": "active",
        "service": "ContractRiskAI",
        "version": "1.0.0",
        "documentation": "/docs"
    }

# Main analysis endpoint
@app.post("/api/analyze", response_model=ClauseAnalysisResponse)
async def analyze_clause(request: ClauseAnalysisRequest):
    """
    Analyze a contract clause for legal and commercial risks.
    Returns risk assessment in both English and Arabic.
    """
    try:
        # Validate input
        if not request.clause or len(request.clause.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Please provide a valid contract clause (at least 10 characters)"
            )
        
        # Get the LLM instance
        llm = get_llm()
        
        # Create the prompt with enhanced context
        prompt = get_enhanced_prompt(
            clause=request.clause,
            context=request.context,
            industry=request.industry
        )
        
        # Create parser for structured output
        parser = PydanticOutputParser(pydantic_object=RiskAnalysisOutput)
        
        # Format the prompt - use from_template to avoid variable substitution issues
        messages = [
            ("system", SYSTEM_PROMPT),
            ("human", prompt)
        ]
        
        # Get the response directly without ChatPromptTemplate to avoid variable conflicts
        start_time = datetime.now()
        response = llm.invoke(messages)
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Parse the JSON response
        result = json.loads(response.content)
        
        # Ensure we have both English and Arabic responses
        if "summary" not in result or "arabic" not in result:
            raise HTTPException(
                status_code=500,
                detail="Invalid response format from AI model"
            )
        
        # Extract English and Arabic parts
        english_result = {
            "summary": result.get("summary"),
            "risk": result.get("risk"),
            "reason": result.get("reason"),
            "rewrite": result.get("rewrite")
        }
        
        arabic_result = result.get("arabic", {})
        
        # Prepare metadata
        metadata = {
            "processing_time": f"{processing_time:.2f}s",
            "model": "gpt-4o",
            "timestamp": datetime.now().isoformat(),
            "clause_length": len(request.clause),
            "has_context": bool(request.context),
            "industry": request.industry
        }
        
        return ClauseAnalysisResponse(
            english=english_result,
            arabic=arabic_result,
            metadata=metadata
        )
        
    except Exception as e:
        # Log error appropriately in production
        print(f"Error in analyze_clause: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

# Batch analysis endpoint for multiple clauses
@app.post("/api/batch-analyze")
async def batch_analyze(clauses: list[ClauseAnalysisRequest]):
    """
    Analyze multiple contract clauses in a single request.
    Useful for analyzing entire contracts.
    """
    if len(clauses) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 clauses per batch request"
        )
    
    results = []
    for clause_request in clauses:
        try:
            result = await analyze_clause(clause_request)
            results.append({
                "status": "success",
                "result": result
            })
        except Exception as e:
            results.append({
                "status": "error",
                "error": str(e),
                "clause": clause_request.clause[:50] + "..."
            })
    
    return {"results": results, "total": len(clauses)}

# Example clauses endpoint for demo purposes
@app.get("/api/examples")
async def get_examples():
    """
    Get example contract clauses for testing the system.
    """
    return {
        "examples": [
            {
                "title": "Unlimited Liability",
                "clause": "The Contractor shall be liable for any and all damages, losses, costs, and expenses arising from or related to the performance of services under this Agreement, without any limitation.",
                "category": "liability"
            },
            {
                "title": "Automatic Renewal",
                "clause": "This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least 90 days prior to the end of the current term.",
                "category": "term"
            },
            {
                "title": "Broad Confidentiality",
                "clause": "All information shared by either party, whether marked confidential or not, shall be deemed confidential and shall not be disclosed for a period of 10 years after termination.",
                "category": "confidentiality"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)