from fastapi import APIRouter, HTTPException
from typing import List, Optional
import aiohttp
from datetime import datetime, timedelta

router = APIRouter()

NEWS_API_KEY = "24b10ce9030d4e6db90f6e192afc0783"
NEWS_API_BASE_URL = "https://newsapi.org/v2"

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
