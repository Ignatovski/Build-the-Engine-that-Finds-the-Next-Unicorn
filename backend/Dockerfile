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

ENV OPENAI_API_KEY=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
ENV SERP_API_KEY=8b11a5aca067f0f6cfdba737956403de0139b24615622ae7a56245e0bb57819a
ENV TAVILY_API_KEY=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
ENV NEWS_API_KEY=24b10ce9030d4e6db90f6e192afc0783

CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]