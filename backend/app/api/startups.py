from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Optional, List
from ..schemas.startup import StartupAnalysisRequest, StartupCreate
from ..services.analysis import StartupAnalyzer
import aiohttp
import os
import json
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

# Configure OpenAI
if not os.getenv('OPENAI_API_KEY'):
    raise HTTPException(
        status_code=500,
        detail="OpenAI API key not set. Please set OPENAI_API_KEY environment variable."
    )

# Set OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

# Initialize router and analyzer
router = APIRouter()
analyzer = StartupAnalyzer()

async def search_web_data(startup_name: str, industry: Optional[str] = None):
    """Search for startup information using Tavily API"""
    tavily_api_key = os.getenv('TAVILY_API_KEY')
    if not tavily_api_key:
        raise HTTPException(
            status_code=500,
            detail="Tavily API key not set. Please set TAVILY_API_KEY environment variable."
        )

    # Configure Tavily API request
    url = "https://api.tavily.com/search"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {tavily_api_key}"  # Using Bearer token authentication
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            # URL is already defined above
            # Create search parameters
            # Create a more targeted search query
            query_parts = [
                startup_name,
                "company",
                "business",
                "revenue",
                "funding",
                "valuation",
                "market share"
            ]
            if industry:
                query_parts.append(industry)
            
            params = {
                "query": " ".join(query_parts),
                "search_depth": "advanced",
                "include_answer": True,  # Get AI-generated summary
                "include_images": False,
                "max_results": 10,  # Increase results for better coverage
                "sort_by": "relevance"
            }
            
            async with session.post(url, json=params, headers=headers) as response:
                if response.status != 200:
                    error_text = await response.text()
                    print(f"Tavily API error: {error_text}")
                    raise HTTPException(
                        status_code=response.status,
                        detail=f"Tavily API error: {error_text}"
                    )
                return await response.json()
        except Exception as e:
            print(f"Error in web search: {e}")
            return {"error": str(e)}

@router.post("/analyze")
async def analyze_startup(startup: StartupAnalysisRequest):
    """Analyze a startup's potential using Tavily search and OpenAI"""
    print("Raw request data:", startup.dict())
    print("Startup name:", startup.name)
    print("Description:", startup.description)
    print("Industry:", startup.industry)
    print("Funding stage:", startup.funding_stage)
    try:
        print("Received startup data: AFTER", startup)
        # Get startup data
        data = startup.dict()
    except Exception as e:
        print(f"Error processing startup data: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    try:
        try:
            # Search for company information using Tavily
            web_data = await search_web_data(startup.name, startup.industry)
            print("Web data:", web_data)
            print("==============================0")
            if "error" in web_data:
                return web_data
            
            # Extract relevant information from web_data
            search_results = web_data.get('results', [])
            relevant_info = []
            for result in search_results:
                if result.get('content'):
                    relevant_info.append({
                        'title': result.get('title', ''),
                        'content': result.get('content', '')
                    })
            
            data['web_data'] = {
                'search_results': relevant_info[:3]  # Use top 3 most relevant results
            }
            print("Search results:", data['web_data'])
            print("==============================1")
            # Create search insights from web data
            try:
                # First, try to use Tavily's AI answer if available
                if web_data.get('answer'):
                    search_insights = f"AI Summary: {web_data['answer']}\n\nDetailed Sources:\n"
                else:
                    search_insights = "Detailed Sources:\n"
                
                # Add individual sources with titles for context
                for i, result in enumerate(web_data.get('results', [])):
                    title = result.get('title', 'Unknown Source')
                    content = result.get('content', '').strip()
                    if content:
                        search_insights += f"Source {i+1} - {title}:\n{content}\n\n"
            except Exception as e:
                print(f"Error creating search insights: {e}")
                search_insights = "No search results available"
            print("not empty")
            print("==============================2")
            # Prepare Tavily news/facts summary for the AI prompt
            tavily_facts = ""
            if web_data.get("results"):
                for idx, item in enumerate(web_data["results"]):
                    tavily_facts += (
                        f"{idx+1}. {item.get('title', '')}: "
                        f"{item.get('content', item.get('snippet', ''))} "
                    )
            print("After if3")
            print("==============================3")
            prompt = (
                f"You are analyzing {startup.name}. Use all available information to provide a startup analysis.\n\n"
                f"Company Details:\n"
                f"- Name: {startup.name}\n"
                f"- Description: {startup.description or 'Not provided'}\n"
                f"- Industry: {startup.industry or 'Not provided'}\n"
                f"- Funding Stage: {startup.funding_stage or 'Not provided'}\n\n"
                f"Web Research Results:\n{search_insights}\n\n"
                f"Instructions:\n"
                f"1. Use the provided information to analyze the startup.\n"
                f"2. If insufficient data for any metric, use industry averages and market knowledge.\n"
                f"3. Provide numeric scores even with limited data, based on available information.\n"
                f"4. Include reasoning in the strengths/risks sections.\n\n"
                f"Required Analysis Points:\n"
                f"1. Market Score (0-10): Market size, growth potential, competition\n"
                f"2. Team Score (0-10): Leadership, experience, track record\n"
                f"3. Technology Score (0-10): Innovation, technical advantage, IP\n"
                f"4. Traction Score (0-10): Growth, user base, revenue\n"
                f"5. Overall Score (0-10): Weighted average\n"
                f"6. Success Probability (0-1): Likelihood of significant growth\n"
                f"7. Unicorn Probability (0-1): Chance of reaching $1B valuation\n"
                f"8. Key Strengths (3-5 points): Competitive advantages\n"
                f"9. Major Risks (2-3 points): Key challenges\n"
                f"10. Strategic Recommendations (2-3 points): Next steps\n\n"
                f"Return a JSON object with these keys: market_score, team_score, technology_score, "
                f"traction_score, overall_score, success_probability, unicorn_probability, "
                f"strengths (array), risks (array), recommendations (array).\n\n"
                f"Note: All scores must be numbers, not strings. Arrays must contain strings."
            )
            print("Prompt:", prompt)
            print("==============================4")
            try:
                client = openai.AsyncOpenAI()
                response = await client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a startup analyst. Respond ONLY in valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7
                )
                print("OpenAI response received")
                print("==============================5")
                # Get the response content
                # Get response content from the new API format
                raw_content = response.choices[0].message.content.strip()
                print(f"Raw content: {raw_content}")
                try:
                    # Ensure we have valid JSON before parsing
                    if not raw_content:
                        raise HTTPException(status_code=502, detail="Empty response from OpenAI")
                    analysis = json.loads(raw_content)
                except json.JSONDecodeError as e:
                    print(f"JSON decode error: {e}")
                    print(f"Raw OpenAI response: {raw_content}")
                    raise HTTPException(status_code=502, detail=f"OpenAI response was not valid JSON: {raw_content}")
                print("==============================6")
                return {"startup": startup.dict(), "analysis": analysis, "web_data": web_data}

            except openai.APIError as e:
                print(f"OpenAI API error: {e}")
                raise HTTPException(status_code=503, detail=f"OpenAI API error: {str(e)}")
            except openai.RateLimitError as e:
                print(f"OpenAI rate limit error: {e}")
                raise HTTPException(status_code=429, detail=f"OpenAI rate limit exceeded: {str(e)}")
            except Exception as e:
                print(f"Unexpected error in OpenAI call: {e}")
                raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

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
            print(f"Making request to Tavily API with query: {q}")
            async with session.get(
                "https://api.tavily.com/search",
                headers={"api-key": tavily_api_key},
                params=params
            ) as response:
                if response.status == 200:
                    tavily_data = await response.json()
                    print(f"Tavily API response: {tavily_data}")
                    # Structure the response for the frontend
                    results = []
                    if "results" in tavily_data:
                        for item in tavily_data["results"]:
                            result = {
                                "title": item.get("title"),
                                "url": item.get("url"),
                                "snippet": item.get("content"),  # Tavily uses 'content'
                                "source": item.get("source")
                            }
                            if all(result.values()):
                                results.append(result)
                    if not results:
                        print("No valid results found in Tavily response")
                    return [{"synthetic": False, "results": results}]
                else:
                    error_text = await response.text()
                    print(f"Tavily API error: {response.status}, {error_text}")
                    return [{"error": f"Tavily API error: {response.status}"}]
    except Exception as e:
        import traceback
        print(f"Error in Tavily search: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return [{"error": str(e)}]
