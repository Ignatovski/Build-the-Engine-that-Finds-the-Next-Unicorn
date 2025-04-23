# Startup Analysis Platform

An AI-driven platform for analyzing and evaluating startups using web search and data analytics. The platform uses Tavily API for intelligent web search and provides comprehensive analysis of startup potential.

## Features

- Smart web search for startup information
- Data-driven insights and scoring
- Success probability calculation
- Unicorn potential assessment
- Strengths and risks analysis
- Strategic recommendations

## Project Structure

```
startup-analysis-platform/
├── backend/               # FastAPI backend
│   └── app/
│       ├── api/          # API endpoints
│       ├── core/         # Core functionality
│       └── static/       # Static files
└── frontend/             # React frontend
    └── src/
        ├── components/   # Reusable components
        └── pages/       # Page components
```

## Tech Stack

- **Backend**: Python, FastAPI, PostgreSQL
- **Frontend**: React, TypeScript, Material-UI
- **AI/ML**: OpenAI API, Custom ML models
- **Infrastructure**: Docker (planned)

## Getting Started

### Backend Setup

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env`:
   ```env
   # Required API Keys
   TAVILY_API_KEY='your_tavily_api_key'  # Required for web search
   OPENAI_API_KEY='your_openai_api_key'  # Optional, for enhanced analysis
   SERP_API_KEY='your_serp_api_key'      # Optional, for additional data
   ```

4. Run the backend:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Main Features Usage

1. **Startup Analysis**:
   - Navigate to http://localhost:3000/analyze
   - Enter startup details (name, description, industry, funding stage)
   - Optionally upload relevant documents (PDF)
   - Click "Analyze Potential"

2. **Analysis Results**:
   - Success probability score
   - Unicorn potential assessment
   - Key strengths identification
   - Risk analysis
   - Strategic recommendations

## API Keys Setup

The platform requires at least the Tavily API key for web search functionality. Other API keys are optional:

1. **Tavily API** (Required)
   - Get your key from: https://tavily.com
   - Add to `.env` as: `TAVILY_API_KEY`

2. **OpenAI API** (Optional)
   - Get your key from: https://platform.openai.com
   - Add to `.env` as: `OPENAI_API_KEY`
   - Enhances analysis with AI-powered insights

3. **SERP API** (Optional)
   - Get your key from: https://serpapi.com
   - Add to `.env` as: `SERP_API_KEY`
   - Provides additional search data

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
