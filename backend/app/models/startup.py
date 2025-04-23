from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Startup(Base):
    __tablename__ = "startups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    website = Column(String)
    founding_date = Column(DateTime, nullable=True)
    location = Column(String)
    industry = Column(String)
    tech_stack = Column(JSON)  # Store as JSON array
    funding_history = Column(JSON)  # Store as JSON object
    team_size = Column(Integer, nullable=True)
    
    # Relationships
    founders = relationship("Founder", back_populates="startup")
    analysis = relationship("StartupAnalysis", back_populates="startup", uselist=False)

class Founder(Base):
    __tablename__ = "founders"

    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id"))
    name = Column(String)
    role = Column(String)
    linkedin_url = Column(String, nullable=True)
    background = Column(String)
    
    # Relationships
    startup = relationship("Startup", back_populates="founders")

class StartupAnalysis(Base):
    __tablename__ = "startup_analyses"

    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id"))
    market_score = Column(Float)
    team_score = Column(Float)
    tech_score = Column(Float)
    traction_score = Column(Float)
    overall_score = Column(Float)
    analysis_date = Column(DateTime)
    insights = Column(JSON)  # Store detailed analysis as JSON
    risk_factors = Column(JSON)  # Store identified risks as JSON
    
    # Relationships
    startup = relationship("Startup", back_populates="analysis")
