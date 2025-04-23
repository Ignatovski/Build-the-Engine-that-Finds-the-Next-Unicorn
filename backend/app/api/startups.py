from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Optional, List
from ..schemas.startup import StartupAnalysisRequest, StartupCreate
from ..services.analysis import StartupAnalyzer
import aiohttp
import os
import openai
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

# Initialize router and analyzer
router = APIRouter()
analyzer = StartupAnalyzer()

async def search_web_data(startup_name: str) -> Dict:
    """Search for startup information using Tavily API"""
    if not tavily_api_key:
        return {"error": "Tavily API key not configured"}

    try:
        async with aiohttp.ClientSession() as session:
            headers = {"Authorization": f"Bearer {tavily_api_key}"}
            params = {
                "query": f"{startup_name} startup company profile funding news",
                "search_depth": "advanced",
                "include_domains": ["techcrunch.com", "crunchbase.com", "linkedin.com", "bloomberg.com"]
            }
            
            async with session.get(
                "https://api.tavily.com/search",
                headers=headers,
                params=params
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {"error": f"Tavily API error: {response.status}"}
    except Exception as e:
        print(f"Error in web search: {e}")
        return {"error": str(e)}

@router.post("/startups/analyze")
async def analyze_startup(startup: StartupAnalysisRequest):
    """Analyze a startup's potential using Tavily search and OpenAI"""
    try:
        # Get startup data
        data = startup.dict()
        
        try:
            # Search for company information using Tavily
            web_data = await search_web_data(startup.name)
            if "error" in web_data:
                return web_data
            data["web_data"] = web_data

            # Prepare Tavily news/facts summary for the AI prompt
            tavily_facts = ""
            if web_data.get("results"):
                for idx, item in enumerate(web_data["results"]):
                    tavily_facts += (
                        f"{idx+1}. {item.get('title', '')}: "
                        f"{item.get('snippet', '')} "
                        f"(Source: {item.get('source', '')})\n"
                    )

            # Compose OpenAI prompt with both user input and Tavily facts
            prompt = (
                f"You are a world-class startup analyst. Analyze the following startup "
                f"using both the provided details and the latest web data:\n\n"
                f"Startup Info:\n"
                f"- Name: {startup.name}\n"
                f"- Description: {startup.description}\n"
                f"- Industry: {startup.industry}\n"
                f"- Tech Stack: {', '.join(startup.tech_stack) if hasattr(startup, 'tech_stack') else ''}\n"
                f"- Team Size: {getattr(startup, 'team_size', 'N/A')}\n\n"
                f"Relevant News and Facts:\n{tavily_facts}\n"
                f"Please provide:\n"
                f"1. Market Score (0-100)\n"
                f"2. Team Score (0-100)\n"
                f"3. Technology Score (0-100)\n"
                f"4. Traction Score (0-100)\n"
                f"5. Overall Score (0-100)\n"
                f"6. Success Probability (0-1)\n"
                f"7. Unicorn Probability (0-1)\n"
                f"8. Key Strengths (3-5 bullet points)\n"
                f"9. Major Risks (2-3 bullet points)\n"
                f"10. Strategic Recommendations (2-3 bullet points)\n\n"
                f"Format your response as structured JSON with keys: market_score, "
                f"team_score, technology_score, traction_score, overall_score, "
                f"success_probability, unicorn_probability, strengths, risks, recommendations."
            )
            try:
                response = await openai.ChatCompletion.acreate(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a startup analyst. Respond ONLY in valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7
                )

                # Try to parse the AI's response as JSON
                raw_content = response.choices[0].message.content
                try:
                    analysis = json.loads(raw_content)
                except json.JSONDecodeError:
                    # Fallback: return the raw content if parsing fails
                    analysis = {"raw": raw_content}

                return {"startup": startup.dict(), "analysis": analysis, "web_data": web_data}

            except openai.error.OpenAIError as e:
                raise HTTPException(status_code=503, detail=f"OpenAI API error: {str(e)}")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Tavily API error: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")

@router.post("/startups/", response_model=dict)
async def create_startup(startup: StartupCreate):
    """Create a new startup entry and analyze it using AI."""
    try:
        # Analyze startup using OpenAI
        prompt = (
            f"Analyze this startup and provide scores and insights:\n\n"
            f"Name: {startup.name}\n"
            f"Description: {startup.description}\n"
            f"Industry: {startup.industry}\n"
            f"Tech Stack: {', '.join(startup.tech_stack)}\n"
            f"Team Size: {startup.team_size}\n\n"
            f"Please provide a structured analysis with:\n"
            f"1. Market Score (0-100)\n"
            f"2. Team Score (0-100)\n"
            f"3. Technology Score (0-100)\n"
            f"4. Traction Score (0-100)\n"
            f"5. Overall Score (0-100)\n"
            f"6. Success Probability (0-1)\n"
            f"7. Unicorn Probability (0-1)\n"
            f"8. Key Strengths (3-5 bullet points)\n"
            f"9. Major Risks (2-3 bullet points)\n"
            f"10. Strategic Recommendations (2-3 bullet points)\n\n"
            f"Format your response as structured JSON with keys: market_score, team_score, "
            f"technology_score, traction_score, overall_score, success_probability, "
            f"unicorn_probability, strengths, risks, recommendations."
        )
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a startup analyst. Respond ONLY in valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )

            # Parse the AI's response as JSON
            raw_content = response.choices[0].message.content
            try:
                analysis = json.loads(raw_content)
            except json.JSONDecodeError:
                # Fallback: return the raw content if parsing fails
                analysis = {"raw": raw_content}

            return {"startup": startup.dict(), "analysis": analysis}

        except openai.error.OpenAIError as e:
            raise HTTPException(status_code=503, detail=f"OpenAI API error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")

@router.get("/startups/", response_model=List[Dict])
async def get_startups():
    """Get all startups with analysis (real version: returns empty until DB integration)"""
    # TODO: Integrate with persistent storage to return real analyzed startups
    return []



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



@router.get("/startups/search/ai", response_model=List[Dict])
async def search_startups(
    query: str = Query(..., description="Search query"),
    industry: Optional[str] = Query(None, description="Industry filter")
):
    """Search startups using Tavily API (real data)"""
    if not tavily_api_key:
        return [{"error": "Tavily API key not configured"}]
    try:
        async with aiohttp.ClientSession() as session:
            headers = {"Authorization": f"Bearer {tavily_api_key}"}
            q = query if not industry else f"{query} {industry} startup"
            params = {
                "query": q,
                "search_depth": "advanced",
                "include_domains": [
                    "techcrunch.com", "crunchbase.com", "linkedin.com", "bloomberg.com", "reuters.com", "forbes.com"
                ]
            }
            async with session.get(
                "https://api.tavily.com/search",
                headers=headers,
                params=params
            ) as response:
                if response.status == 200:
                    tavily_data = await response.json()
                    # Structure the response for the frontend
                    results = []
                    if "results" in tavily_data:
                        for item in tavily_data["results"]:
                            results.append({
                                "title": item.get("title"),
                                "url": item.get("url"),
                                "snippet": item.get("content"),  # Correct Tavily field name
                                "source": item.get("source")
                            })
                    return [{"synthetic": False, "results": results}]
                else:
                    return [{"error": f"Tavily API error: {response.status}"}]
    except Exception as e:
        print(f"Error in Tavily search: {e}")
        return [{"error": str(e)}]
