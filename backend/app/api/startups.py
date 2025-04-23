from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..schemas.startup import Startup, StartupCreate, StartupAnalysis
from ..services.analysis import StartupAnalyzer
from ..models import startup as models
from datetime import datetime
import openai
import os
from typing import Optional

# Configure OpenAI
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    # For testing, generate mock data without OpenAI
    def generate_mock_startup():
        return {
            "name": "AI Health Solutions",
            "description": "Revolutionizing healthcare with AI-powered diagnostics",
            "industry": "Healthcare",
            "tech_stack": ["Python", "TensorFlow", "AWS"],
            "valuation": "$2.5B",
            "metrics": "500k users, 98% accuracy"
        }
else:
    openai.api_key = api_key

router = APIRouter()
analyzer = StartupAnalyzer()

@router.post("/startups/", response_model=dict)
async def create_startup(startup: StartupCreate):
    """Create a new startup entry and analyze it using AI."""
    try:
        # Analyze startup using OpenAI
        prompt = f"""Analyze this startup and provide scores and insights:

Name: {startup.name}
Description: {startup.description}
Industry: {startup.industry}
Tech Stack: {', '.join(startup.tech_stack)}
Team Size: {startup.team_size}

Provide:
1. Market Score (0-100)
2. Team Score (0-100)
3. Technology Score (0-100)
4. Traction Score (0-100)
5. Overall Score (0-100)
6. Key Insights (3-5 points)
7. Risk Factors (2-3 points)"""

        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a startup analyst. Provide detailed analysis and scores."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        return {"startup": startup.dict(), "analysis": response.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/startups/", response_model=List[dict])
async def get_startups(skip: int = 0, limit: int = 10):
    """Get a list of AI-generated example startups."""
    try:
        if not api_key:
            # Return mock data if no API key
            return [{
                "synthetic": True,
                "results": """
AI Health Solutions
A pioneering healthcare startup using artificial intelligence for early disease detection. Their advanced algorithms achieve 98% accuracy in diagnostic predictions. Industry: Healthcare. Tech Stack: Python, TensorFlow, AWS. Valuation: $2.5B. Key Metrics: 500k users, 200k diagnoses performed.

Green Energy Tech
Developing next-generation solar panels with 40% higher efficiency. Their innovative nanomaterial coating has revolutionized solar energy capture. Industry: Clean Tech. Tech Stack: Material Science, IoT, Cloud Computing. Valuation: $1.8B. Key Metrics: 300MW installed capacity, 50 patents.

Fintech Flow
A modern banking platform offering AI-powered financial advice and automated portfolio management. Industry: Fintech. Tech Stack: Node.js, React, MongoDB. Valuation: $900M. Key Metrics: 2M users, $5B assets under management.

Cyber Shield
Providing enterprise-grade cybersecurity using quantum-resistant encryption. Industry: Cybersecurity. Tech Stack: Rust, Quantum Algorithms, Blockchain. Valuation: $1.2B. Key Metrics: 1000 enterprise clients, zero breaches.

Edu Future
Transforming education with personalized AI tutoring and VR-based immersive learning. Industry: EdTech. Tech Stack: Unity, Python, React Native. Valuation: $750M. Key Metrics: 1M students, 95% improvement rate."""
            }]

        prompt = """Generate 5 realistic startup examples with the following information for each:
1. Name
2. Description
3. Industry
4. Tech Stack
5. Valuation
6. Key Metrics

Format each startup as a clear paragraph."""

        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a startup database. Generate realistic startup examples."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        return [{"synthetic": True, "results": response.choices[0].message.content}]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/startups/{startup_id}", response_model=dict)
async def get_startup(startup_id: int):
    """Get a specific startup by ID (AI-generated example)."""
    try:
        prompt = f"""Generate a detailed profile for a startup with ID {startup_id}. Include:
1. Name
2. Description
3. Industry
4. Tech Stack
5. Valuation
6. Team
7. Key Metrics
8. Growth Trajectory"""

        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a startup database. Generate a detailed startup profile."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        return {"id": startup_id, "profile": response.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/startups/search/ai", response_model=List[dict])
async def search_startups(
    query: str = Query(..., description="Search query"),
    industry: Optional[str] = Query(None, description="Industry filter")
):
    """Search startups using AI to generate relevant results."""
    try:
        if not api_key:
            # Return filtered mock data if no API key
            mock_data = {
                "Healthcare": "AI Health Solutions\nA pioneering healthcare startup using artificial intelligence for early disease detection. Their advanced algorithms achieve 98% accuracy in diagnostic predictions. Industry: Healthcare. Tech Stack: Python, TensorFlow, AWS. Valuation: $2.5B. Key Metrics: 500k users, 200k diagnoses performed.",
                "Clean Tech": "Green Energy Tech\nDeveloping next-generation solar panels with 40% higher efficiency. Their innovative nanomaterial coating has revolutionized solar energy capture. Industry: Clean Tech. Tech Stack: Material Science, IoT, Cloud Computing. Valuation: $1.8B. Key Metrics: 300MW installed capacity, 50 patents.",
                "Fintech": "Fintech Flow\nA modern banking platform offering AI-powered financial advice and automated portfolio management. Industry: Fintech. Tech Stack: Node.js, React, MongoDB. Valuation: $900M. Key Metrics: 2M users, $5B assets under management."
            }
            
            if industry and industry in mock_data:
                return [{"synthetic": True, "results": mock_data[industry]}]
            elif query:
                # Return all results that match the query
                matching = '\n\n'.join(desc for ind, desc in mock_data.items() 
                                    if query.lower() in ind.lower() or query.lower() in desc.lower())
                return [{"synthetic": True, "results": matching or mock_data["Healthcare"]}]
            else:
                return [{"synthetic": True, "results": '\n\n'.join(mock_data.values())}]

        # Create a prompt for generating startup suggestions
        prompt = f"""Generate 5 realistic startup examples that match this search criteria: {query}
{'Must be in industry: ' + industry if industry else ''}

For each startup, include:
1. Name
2. Industry
3. Description
4. Valuation (in billions)
5. Key technologies

Format each startup as a clear paragraph with the name as a heading."""

        # Get AI response
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a startup analysis expert. Generate realistic startup examples based on the search criteria."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        return [{"synthetic": True, "results": response.choices[0].message.content}]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
