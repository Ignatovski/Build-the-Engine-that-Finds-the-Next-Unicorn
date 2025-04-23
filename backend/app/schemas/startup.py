from pydantic import BaseModel
from typing import Optional, List

class StartupAnalysisRequest(BaseModel):
    """Request model for startup analysis"""
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    funding_stage: Optional[str] = None
    website: Optional[str] = None

class StartupCreate(BaseModel):
    """Model for creating a new startup"""
    name: str
    description: str
    industry: str
    tech_stack: List[str]
    team_size: Optional[int] = None
    valuation: Optional[str] = None
