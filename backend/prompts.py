"""
Prompt Engineering Module for ContractRiskAI
Demonstrates advanced prompting techniques for contract analysis
"""

from pydantic import BaseModel, Field
from typing import Literal

# Structured output models
class RiskAnalysisOutput(BaseModel):
    summary: str = Field(..., max_length=40, description="Plain English summary of the clause")
    risk: Literal["Low", "Medium", "High"] = Field(..., description="Risk level assessment")
    reason: str = Field(..., max_length=25, description="Brief reason for risk rating")
    rewrite: str = Field(..., max_length=40, description="Safer alternative wording")

class RiskAnalysisOutputArabic(BaseModel):
    summary: str = Field(..., description="Arabic translation of summary")
    risk: str = Field(..., description="Arabic risk level")
    reason: str = Field(..., description="Arabic reason")
    rewrite: str = Field(..., description="Arabic rewrite")

# Core system prompt from Context.md
SYSTEM_PROMPT = """You are "ContractRiskAI", a senior UAE contract lawyer who writes in plain language.

PURPOSE
For every contract CLAUSE you receive, produce one concise JSON object that helps a busy business user spot legal/commercial risk fast.

OUTPUT FORMAT (exact keys, flat JSON, no markdown)
{{
  "summary": ≤ 40 words, English, plain
  "risk": "Low" | "Medium" | "High"
  "reason": ≤ 25 words, why the clause got that label
  "rewrite": safer wording, ≤ 40 words; if already safe, restate the clause more clearly
  "arabic": {{
    "summary": Arabic translation ≤ 40 words
    "risk": "منخفض" | "متوسط" | "مرتفع"
    "reason": Arabic translation ≤ 25 words
    "rewrite": Arabic translation ≤ 40 words
  }}
}}

RULES
• Keep it SIMPLE & MINIMAL – no legalese beyond what's needed.
• No chatty prose – output must be JSON only, nothing else.
• No chain-of-thought – think silently, then output. Saves tokens.
• No hallucination – do not invent facts not present in the clause.
• If input is empty or not a clause, reply exactly: {{"error":"No valid clause provided"}}

RISK ASSESSMENT FRAMEWORK
Low Risk:
- Standard market terms
- Balanced obligations
- Clear termination rights
- Reasonable limitations

Medium Risk:
- Some imbalanced terms
- Unclear obligations
- Limited remedies
- Ambiguous language

High Risk:
- Unlimited liability
- One-sided obligations
- No termination rights
- Unreasonable restrictions
- Broad indemnification

DISCLAIMER
You are an AI assistant, not a lawyer; users must obtain licensed legal advice."""

def get_enhanced_prompt(clause: str, context: str = None, industry: str = None) -> str:
    """
    Enhance the prompt with additional context and examples.
    This demonstrates advanced prompt engineering techniques.
    """
    
    # Base prompt
    prompt = f"Analyze this contract clause:\n\n{clause}"
    
    # Add context if provided
    if context:
        prompt += f"\n\nAdditional context: {context}"
    
    # Add industry-specific guidance
    if industry:
        industry_guidance = get_industry_guidance(industry)
        prompt += f"\n\nIndustry context ({industry}): {industry_guidance}"
    
    # Add few-shot examples for better performance
    prompt += """

Examples of expected output format:

Input: "The Service Provider shall indemnify and hold harmless the Client from any and all claims."
Output: {{
  "summary": "Service Provider must protect Client from all legal claims and costs",
  "risk": "High",
  "reason": "Unlimited indemnity with no exceptions",
  "rewrite": "Service Provider indemnifies Client for claims arising from Provider's negligence",
  "arabic": {{
    "summary": "يجب على مقدم الخدمة حماية العميل من جميع المطالبات القانونية",
    "risk": "مرتفع",
    "reason": "تعويض غير محدود بدون استثناءات",
    "rewrite": "يعوض مقدم الخدمة العميل عن المطالبات الناتجة عن إهمال المقدم"
  }}
}}

Now analyze the provided clause and respond ONLY with a JSON object following this exact format."""
    
    return prompt

def get_industry_guidance(industry: str) -> str:
    """
    Provide industry-specific risk considerations.
    """
    industry_guides = {
        "technology": "Consider IP ownership, data protection, SLA terms, and software licensing risks.",
        "construction": "Focus on delay penalties, variation procedures, defects liability, and payment terms.",
        "healthcare": "Emphasize patient data privacy, malpractice liability, and regulatory compliance.",
        "retail": "Review inventory risk, return policies, supplier terms, and consumer protection.",
        "finance": "Analyze regulatory compliance, fiduciary duties, and financial exposure limits.",
        "real_estate": "Check title issues, maintenance obligations, rent escalation, and termination rights."
    }
    
    return industry_guides.get(
        industry.lower(), 
        "Apply general commercial contract principles and industry best practices."
    )

# Example prompt chains for complex analysis
class PromptChains:
    """
    Advanced prompt engineering patterns for complex scenarios
    """
    
    @staticmethod
    def multi_clause_analysis():
        """
        Prompt for analyzing related clauses together
        """
        return """When analyzing multiple related clauses:
        1. Identify interdependencies
        2. Assess cumulative risk
        3. Suggest consolidated rewrites
        4. Maintain consistency across all clauses"""
    
    @staticmethod
    def negotiation_strategy():
        """
        Prompt for suggesting negotiation points
        """
        return """For high-risk clauses, also identify:
        - Key negotiation leverage points
        - Alternative middle-ground positions  
        - Industry-standard fallback options
        - Must-have vs nice-to-have changes"""
    
    @staticmethod
    def risk_mitigation():
        """
        Prompt for comprehensive risk mitigation
        """
        return """Beyond rewriting, consider:
        - Insurance requirements
        - Additional protective clauses needed
        - Operational procedures to minimize risk
        - Documentation requirements"""