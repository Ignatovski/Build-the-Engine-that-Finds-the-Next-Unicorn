from fastapi import APIRouter, HTTPException
from typing import List, Optional
import aiohttp
from datetime import datetime, timedelta
from urllib.parse import urlparse

router = APIRouter()

NEWS_API_KEY = "24b10ce9030d4e6db90f6e192afc0783"
NEWS_API_BASE_URL = "https://newsapi.org/v2"

def get_company_logo(company_name: str, domain: str = "") -> list[str]:
    """Generate possible logo URLs for a company, focusing only on main websites"""
    sources = []
    cleaned_name = company_name.replace(" ", "").lower()
    
    # Skip if domain is from common non-company sites
    skip_domains = ['wikipedia.org', 'linkedin.com', 'crunchbase.com', 'glassdoor.com', 'indeed.com']
    
    if domain and not any(skip_domain in domain for skip_domain in skip_domains):
        # Try direct favicon first
        sources.append(f"https://{domain}/favicon.ico")
        
        # Try common logo paths
        sources.append(f"https://{domain}/logo.png")
        sources.append(f"https://{domain}/logo.svg")
        sources.append(f"https://{domain}/images/logo.png")
        
        # Then try Clearbit with domain
        sources.append(f"https://logo.clearbit.com/{domain}?size=120")
    
    # Then try Clearbit with company name (only if we didn't find a valid domain)
    if not sources:
        sources.append(f"https://logo.clearbit.com/{cleaned_name}.com?size=120")
    
    return sources

@router.get("/startup-news")
async def get_startup_news(
    page: int = 1,
    page_size: int = 10,
    category: Optional[str] = None
):
    """Get latest news about startups"""
    try:
        # Calculate date for last 7 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        # Build query parameters
        params = {
            "apiKey": NEWS_API_KEY,
            "language": "en",
            "sortBy": "publishedAt",
            "pageSize": page_size,
            "page": page,
            "from": start_date.strftime("%Y-%m-%d"),
            "to": end_date.strftime("%Y-%m-%d"),
            "q": "(startup funding) OR (startup launch) OR (startup acquisition) OR (tech startup)",
        }
        
        if category:
            params["category"] = category
        
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{NEWS_API_BASE_URL}/everything", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Transform articles to include relative time
                    articles = data.get("articles", [])
                    for article in articles:
                        if "publishedAt" in article:
                            pub_date = datetime.strptime(article["publishedAt"], "%Y-%m-%dT%H:%M:%SZ")
                            delta = end_date - pub_date
                            if delta.days > 0:
                                article["timeAgo"] = f"{delta.days}d ago"
                            else:
                                article["timeAgo"] = "Today"
                        
                        # Get domain from URL if available
                        domain = ""
                        if article.get("url"):
                            try:
                                parsed = urlparse(article["url"])
                                domain = parsed.netloc.replace("www.", "")
                            except:
                                pass
                        
                        # Set logo URLs
                        if "source" in article and hasattr(article["source"], "get"):
                            company_name = article["source"].get("name", "")
                            article["logo_urls"] = get_company_logo(company_name, domain)
                        else:
                            article["logo_urls"] = []
                        
                        article["imageUrl"] = article.get("urlToImage", "")
                    
                    return {
                        "articles": articles,
                        "totalResults": data.get("totalResults", 0),
                        "currentPage": page,
                        "pageSize": page_size,
                    }
                else:
                    error_data = await response.json()
                    raise HTTPException(
                        status_code=response.status,
                        detail=f"News API error: {error_data.get('message', 'Unknown error')}"
                    )
                    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching startup news: {str(e)}")
