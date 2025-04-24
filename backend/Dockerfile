FROM python:3.9-slim

WORKDIR /app/backend

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install pillow
RUN pip install PyPDF2
RUN pip install aiohttp
RUN pip install ascii_magic

# Copy application code
COPY . .

RUN touch /app/backend/app/__init__.py

EXPOSE 8000

ENV PYTHONPATH /app:/app/backend/app

ENV OPENAI_API_KEY=...
ENV SERP_API_KEY=...
ENV TAVILY_API_KEY=...
ENV NEWS_API_KEY=...

CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]