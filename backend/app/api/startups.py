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
import json
import aiohttp
from typing import Optional, List
from fastapi import UploadFile, File
from pydantic import BaseModel
from PyPDF2 import PdfReader
from io import BytesIO
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure API keys
openai_api_key = os.getenv('OPENAI_API_KEY')
serp_api_key = os.getenv('SERP_API_KEY')
tavily_api_key = os.getenv('TAVILY_API_KEY')

# Check if Tavily API key is set
if not os.getenv('TAVILY_API_KEY'):
    raise HTTPException(
        status_code=500,
        detail="Tavily API key not set. Please set TAVILY_API_KEY environment variable."
    )

# Configure OpenAI if available
if os.getenv('OPENAI_API_KEY'):
    openai.api_key = os.getenv('OPENAI_API_KEY')

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

router = APIRouter()
analyzer = StartupAnalyzer()

class StartupAnalysisRequest(BaseModel):
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    funding_stage: Optional[str] = None

async def search_web_data(startup_name: str) -> dict:
    """Search for startup information using Tavily API"""
    results = {
        'news': [],
        'social': [],
        'company_info': {}
    }
    
    if not tavily_api_key:
        return results

    try:
        # Tavily API for news and analysis
        async with aiohttp.ClientSession() as session:
            headers = {"Authorization": f"Bearer {tavily_api_key}"}
            params = {
                "query": f"{startup_name} startup company news funding",
                "search_depth": "advanced",
                "include_domains": ["techcrunch.com", "crunchbase.com", "linkedin.com", "bloomberg.com"]
            }
            
            async with session.get(
                "https://api.tavily.com/search",
                headers=headers,
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    results['news'] = data.get('results', [])

        # Use Tavily API for company information too
        async with aiohttp.ClientSession() as session:
            headers = {"Authorization": f"Bearer {tavily_api_key}"}
            params = {
                "query": f"{startup_name} company profile funding information",
                "search_depth": "advanced"
            }
            
            async with session.get(
                "https://api.tavily.com/search",
                headers=headers,
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    results['company_info'] = data.get('results', [])
    except Exception as e:
        print(f"Error in web search: {e}")
    
    return results

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text content from a PDF file"""
    try:
        pdf = PdfReader(BytesIO(file_bytes))
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def analyze_startup_potential(data: dict) -> dict:
    """Analyze startup potential using OpenAI if available, otherwise return mock data"""
    if not os.getenv('OPENAI_API_KEY'):
        # Generate analysis based on Tavily search results
        news = data.get('web_data', {}).get('news', [])
        titles = [item.get('title', '') for item in news]
        return {
            "success_probability": 75,
            "unicorn_probability": 60,
            "strengths": [
                f"Found {len(news)} relevant news articles",
                "Company has online presence",
                f"Operating in {data.get('industry', 'tech')} industry"
            ],
            "risks": [
                "Analysis limited without OpenAI API",
                "Consider adding OpenAI API for deeper insights"
            ],
            "recommendations": [
                "Add OpenAI API key for better analysis",
                "Upload more documents for detailed assessment"
            ]
        }

    try:
        # Create a detailed prompt for analysis
        prompt = f"""Analyze this startup's potential to become a unicorn ($1B+ valuation) based on the following data:

Company Name: {data.get('name')}
Description: {data.get('description')}
Industry: {data.get('industry')}
Funding Stage: {data.get('funding_stage')}

Web Search Data:
{json.dumps(data.get('web_data', {}), indent=2)}

Additional Documents:
{data.get('documents_text', '')}

Provide a detailed analysis including:
1. Probability of success (0-100)
2. Probability of becoming a unicorn (0-100)
3. Key strengths (list)
4. Major risks (list)
5. Strategic recommendations (list)

Format the response as JSON."""

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a startup analyst expert. Analyze startups and predict their potential to become unicorns."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        # Parse the JSON response
        analysis = json.loads(response.choices[0].message.content)
        return analysis

    except Exception as e:
        print(f"Error in OpenAI analysis: {e}")
        return None

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
    """Get a list of example startups."""
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

@router.get("/startups/{startup_id}", response_model=dict)
async def get_startup(startup_id: int):
    """Get a specific startup by ID (example data)"""
    mock_profiles = {
        1: {
            "name": "AI Health Solutions",
            "description": "A pioneering healthcare startup using artificial intelligence for early disease detection.",
            "industry": "Healthcare",
            "tech_stack": ["Python", "TensorFlow", "AWS"],
            "valuation": "$2.5B",
            "team": "50+ AI researchers and healthcare professionals",
            "metrics": "500k users, 98% accuracy",
            "growth": "200% YoY user growth"
        },
        2: {
            "name": "Green Energy Tech",
            "description": "Developing next-generation solar panels with 40% higher efficiency.",
            "industry": "Clean Tech",
            "tech_stack": ["Material Science", "IoT", "Cloud Computing"],
            "valuation": "$1.8B",
            "team": "100+ engineers and scientists",
            "metrics": "300MW installed capacity",
            "growth": "150% YoY revenue growth"
        }
    }
    
    if startup_id in mock_profiles:
        return {"id": startup_id, "profile": mock_profiles[startup_id]}
    else:
        return {"id": startup_id, "profile": mock_profiles[1]}

@router.post("/startups/analyze", response_model=dict)
async def analyze_startup(
    startup: StartupAnalysisRequest,
    files: Optional[List[UploadFile]] = File(None)
):
    """Analyze a startup's potential using company information, web search, and uploaded documents"""
    try:
        # Initialize data dictionary
        data = startup.dict()
        
        # Process uploaded files
        documents_text = ""
        if files:
            for file in files:
                content = await file.read()
                if file.filename.lower().endswith('.pdf'):
                    documents_text += extract_text_from_pdf(content) + "\n\n"
                else:
                    documents_text += content.decode('utf-8') + "\n\n"
        data['documents_text'] = documents_text

        # Get web search data
        data['web_data'] = await search_web_data(startup.name)

        # Analyze startup potential
        analysis = analyze_startup_potential(data)
        
        if not analysis:
            return {"error": "Failed to analyze startup"}

        return analysis

    except Exception as e:
        return {"error": str(e)}

@router.get("/startups/search/ai", response_model=List[dict])
async def search_startups(
    query: str = Query(..., description="Search query"),
    industry: Optional[str] = Query(None, description="Industry filter")
):
    """Search startups using example data"""
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
