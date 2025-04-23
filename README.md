# Startup Analysis Platform

An AI-driven platform for analyzing and evaluating startups using machine learning and data analytics.

## Features

- AI-powered startup evaluation
- Data-driven insights and scoring
- Comprehensive due diligence automation
- Market trend analysis
- Team background assessment
- Technology stack evaluation

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

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key and other configurations

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

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
