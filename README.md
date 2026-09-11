# Beacon

Beacon is an enterprise Retrieval-Augmented Generation (RAG) platform that connects enterprise knowledge, vector databases, and multi-provider LLMs into high-performance REST APIs and interactive dashboards.

## Features

- Multi-Provider LLM Engine: Support for Groq, OpenAI, Google Gemini, Anthropic Claude, and custom endpoints.
- Optimized RAG Pipeline: Fast context retrieval with HNSW vector search and token compression.
- GitHub Sync and Webhooks: Automatic repository ingestion and push-triggered auto-indexing.
- Enterprise Security: JWT authentication, scoped API keys, and rate limiting.
- Interactive UI: Web dashboard built with React, Vite, and Three.js.

## Tech Stack

- Backend: Python, FastAPI, LangChain, SentenceTransformers
- Database and Vector Store: PostgreSQL / Supabase with pgvector
- Frontend: React, Vite, Three.js

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL or Supabase with pgvector enabled

### Backend Setup
```bash
cd Backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

## Environment Variables

Create a .env file in the Backend directory:

```env
# Database Credentials
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Auth and Security
JWT_SECRET=your-jwt-secret-key

# LLM Provider Keys
DEFAULT_LLM_PROVIDER=groq
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
```

## License

MIT
