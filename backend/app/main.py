from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, FileResponse
from dotenv import load_dotenv
import os

# Import routers
from app.api.startups import router as startup_router
from app.api.news import router as news_router

# Load environment variables
load_dotenv()

# Debug prints for environment variables
print("[DEBUG] Environment variables:")
print("TAVILY_API_KEY:", os.getenv("TAVILY_API_KEY"))
print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))
print("Current working directory:", os.getcwd())

# Get the absolute path to the static directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "app", "static")

app = FastAPI(
    title="Startup Analysis Platform",
    description="AI-driven platform for startup analysis and investment evaluation",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(startup_router, prefix="/api/v1", tags=["startups"])
app.include_router(news_router, prefix="/api/v1", tags=["news"])

# Serve static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    try:
        html_path = os.path.join(STATIC_DIR, "index.html")
        with open(html_path, "r", encoding="utf-8") as f:
            html_content = f.read()
        return HTMLResponse(content=html_content)
    except Exception as e:
        print(f"Error reading index.html: {e}")
        print(f"Current directory: {os.getcwd()}")
        print(f"Static directory: {STATIC_DIR}")
        print(f"Files in static directory: {os.listdir(STATIC_DIR)}")
        raise

@app.get("/favicon.ico")
async def favicon():
    return FileResponse(os.path.join(STATIC_DIR, "favicon.ico"))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "api_version": "1.0.0",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
