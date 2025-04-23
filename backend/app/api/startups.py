from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..schemas.startup import Startup, StartupCreate, StartupAnalysis
from ..services.analysis import StartupAnalyzer
from ..models import startup as models
from datetime import datetime

router = APIRouter()
analyzer = StartupAnalyzer()

@router.post("/startups/", response_model=Startup)
async def create_startup(startup: StartupCreate, db: Session = Depends(get_db)):
    """Create a new startup entry and analyze it."""
    # Create startup
    db_startup = models.Startup(
        name=startup.name,
        description=startup.description,
        website=startup.website,
        founding_date=startup.founding_date,
        location=startup.location,
        industry=startup.industry,
        tech_stack=startup.tech_stack,
        funding_history=startup.funding_history,
        team_size=startup.team_size
    )
    db.add(db_startup)
    db.flush()  # Get the ID without committing

    # Create founders
    for founder in startup.founders:
        db_founder = models.Founder(
            startup_id=db_startup.id,
            **founder.dict()
        )
        db.add(db_founder)
    
    # Analyze startup
    startup_data = startup.dict()
    analysis = await analyzer.analyze_startup(startup_data)
    
    # Create analysis entry
    db_analysis = models.StartupAnalysis(
        startup_id=db_startup.id,
        **analysis
    )
    db.add(db_analysis)
    
    db.commit()
    db.refresh(db_startup)
    return db_startup

@router.get("/startups/", response_model=List[Startup])
def get_startups(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get a list of startups."""
    return db.query(models.Startup).offset(skip).limit(limit).all()

@router.get("/startups/{startup_id}", response_model=Startup)
def get_startup(startup_id: int, db: Session = Depends(get_db)):
    """Get a specific startup by ID."""
    startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
    if startup is None:
        raise HTTPException(status_code=404, detail="Startup not found")
    return startup

@router.get("/startups/{startup_id}/analysis", response_model=StartupAnalysis)
def get_startup_analysis(startup_id: int, db: Session = Depends(get_db)):
    """Get the analysis for a specific startup."""
    analysis = db.query(models.StartupAnalysis).filter(
        models.StartupAnalysis.startup_id == startup_id
    ).first()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis
