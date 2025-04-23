from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class FounderBase(BaseModel):
    name: str
    role: str
    linkedin_url: Optional[str] = None
    background: Optional[str] = None

class FounderCreate(FounderBase):
    pass

class Founder(FounderBase):
    id: int
    startup_id: int

    class Config:
        from_attributes = True

class StartupBase(BaseModel):
    name: str
    description: str
    website: str
    founding_date: Optional[datetime] = None
    location: str
    industry: str
    tech_stack: List[str]
    funding_history: Dict[str, float]
    team_size: Optional[int] = None

class StartupCreate(StartupBase):
    founders: List[FounderCreate]

class Startup(StartupBase):
    id: int
    founders: List[Founder]

    class Config:
        from_attributes = True

class StartupAnalysisBase(BaseModel):
    market_score: float
    team_score: float
    tech_score: float
    traction_score: float
    overall_score: float
    insights: Dict[str, str]
    risk_factors: List[str]

class StartupAnalysisCreate(StartupAnalysisBase):
    pass

class StartupAnalysis(StartupAnalysisBase):
    id: int
    startup_id: int
    analysis_date: datetime

    class Config:
        from_attributes = True
