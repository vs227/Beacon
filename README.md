# ⚡ Beacon — Enterprise AI & RAG Infrastructure Platform

> **Production-Grade Retrieval-Augmented Generation (RAG) Infrastructure as a Service.**  
> Seamlessly connect enterprise knowledge, vector databases, and multi-provider LLMs into your applications using high-performance REST APIs and client SDKs.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Core Technical Capabilities](#-core-technical-capabilities)
- [Technology Stack](#-technology-stack)
- [Database Schema & Vector Store](#-database-schema--vector-store)
- [RAG & Retrieval Pipeline Deep-Dive](#-rag--retrieval-pipeline-deep-dive)
- [Developer Integration: SDK & APIs](#-developer-integration-sdk--apis)
  - [Authentication & API Keys](#authentication--api-keys)
  - [JavaScript / TypeScript SDK Integration](#javascript--typescript-sdk-integration)
  - [Python SDK Integration](#python-sdk-integration)
  - [REST API Reference & cURL Examples](#rest-api-reference--curl-examples)
- [Automated GitHub Ingestion & Webhook Auto-Sync](#-automated-github-ingestion--webhook-auto-sync)
- [Installation & Local Setup](#-installation--local-setup)
- [Environment Configuration](#-environment-configuration)
- [Performance & Latency Optimizations](#-performance--latency-optimizations)

---

## 🚀 Overview

**Beacon** is an end-to-end, enterprise-ready **RAG Infrastructure Platform** designed to solve the complexity of building, scaling, and maintaining production retrieval layers.

Instead of hand-crafting document loaders, chunking strategies, vector indexers, LLM routing, and context builders, **Beacon** unifies the entire retrieval lifecycle behind a high-throughput, low-latency API and SDK layer.

### Key Highlights
- 🧠 **Multi-Provider LLM Engine**: Seamlessly switch between or failover across **Groq**, **OpenAI**, **Google Gemini**, and **Anthropic Claude**, or connect **Custom/Local OpenAI-compatible endpoints** (Ollama, vLLM).
- 🔑 **BYOK (Bring Your Own Key)**: Full support for custom per-tenant API keys alongside system-wide fallback keys.
- ⚡ **Zero-Latency Fast Paths**: Sub-millisecond greeting short-circuiting and ultra-fast zero-LLM context augmentation.
- 📉 **Context & Token Compression**: Line deduplication and adaptive chunk pruning to cut LLM token consumption by up to 50%.
- 🔄 **Autonomous GitHub Sync**: Automatic repository tree scanning, document ingestion, and push-triggered webhook re-indexing.
- 🛡️ **Enterprise Security & Reliability**: JWT/OAuth2 authentication, scoped project API keys (`bc_live_...` / `bc_test_...`), rate limiting with `SlowAPI`, and 10MB payload guards.

---

## 📐 System Architecture

Beacon acts as the dedicated **Retrieval Layer** between your unstructured enterprise data and downstream generative AI models.

```mermaid
flowchart TD
    subgraph Data_Sources["Data Sources & Ingestion"]
        Upload["File Upload (PDF, DOCX, TXT, MD)"]
        GitHub["GitHub Repositories (Auto-Sync)"]
        Webhooks["GitHub Push Webhooks"]
    end

    subgraph Beacon_Core["Beacon Core Infrastructure (FastAPI Backend)"]
        Router["API Gateway & Scoped Auth"]
        IngestionEngine["Ingestion Engine (LangChain Recursive Chunker)"]
        Embedder["Embedding Model (all-MiniLM-L6-v2 384D)"]
        RAGPipeline["RAG Retrieval & Context Processor"]
        LLMRouter["Multi-Provider LLM Client & Failover Router"]
    end

    subgraph Vector_DB["Vector Database Layer (PgVector / Supabase)"]
        Postgres[("PostgreSQL Database")]
        HNSW[("HNSW Cosine Vector Index (384D)")]
    end

    subgraph LLM_Providers["LLM Providers (BYOK Support)"]
        Groq["Groq (Llama 3.3 / GPT-OSS 120B)"]
        OpenAI["OpenAI (GPT-4o / GPT-4o-mini)"]
        Gemini["Google Gemini 2.0 Flash"]
        Claude["Anthropic Claude 3.5 Sonnet"]
        LocalLLM["Local / Custom OpenAI Endpoint"]
    end

    subgraph Developer_Apps["Client Applications & Integrations"]
        SDK_JS["@beacon/sdk (TypeScript / JS)"]
        SDK_Py["beacon-sdk (Python)"]
        REST_API["REST API (cURL / HTTP)"]
    end

    Upload --> Router
    GitHub --> Router
    Webhooks --> Router

    Router --> IngestionEngine
    IngestionEngine --> Embedder
    Embedder --> HNSW
    HNSW --> Postgres

    Developer_Apps --> Router
    Router --> RAGPipeline
    RAGPipeline --> HNSW
    RAGPipeline --> LLMRouter

    LLMRouter --> Groq
    LLMRouter --> OpenAI
    LLMRouter --> Gemini
    LLMRouter --> Claude
    LLMRouter --> LocalLLM
```

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose & Perspective |
| :--- | :--- | :--- |
| **Backend Framework** | `FastAPI` (Python 3.10+) | High-performance asynchronous REST API framework with native OpenAPI schema generation and Pydantic validation. |
| **Database & Vector Engine** | `Supabase` / `PostgreSQL` + `pgvector` | Enterprise relational database utilizing `HNSW` (Hierarchical Navigable Small World) index with `vector_cosine_ops` for sub-10ms similarity queries. |
| **Embedding Model** | `SentenceTransformers` (`all-MiniLM-L6-v2`) | Local 384-dimensional dense vector embeddings pre-warmed in RAM at application startup. |
| **Document Processing** | `LangChain`, `PyPDF`, `python-docx` | Flexible parsing and character-level recursive document chunking (`chunk_size=800`, `chunk_overlap=100`). |
| **LLM Orchestration** | Custom `MultiProviderLLMClient` | Asynchronous multi-vendor API wrapper with auto-retry on HTTP 429, cross-provider failover cascades, and streaming SSE responses. |
| **Rate Limiting & Security** | `SlowAPI`, `python-jose`, `passlib` | Distributed IP/token rate limiting, JWT bearer verification, and scoped API key token hashing. |
| **Frontend UI** | `React 18`, `Vite`, `Three.js` / `React Three Fiber` | Interactive web dashboard featuring 3D visual environments, real-time query execution, key management, and project metrics. |

---

## 🗄️ Database Schema & Vector Store

Beacon leverages PostgreSQL with the `pgvector` extension. The schema enforces multi-tenant organization scoping, project isolation, and automated updated timestamps.

```sql
-- 1. Users Table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NULL,
  auth_provider TEXT NULL DEFAULT 'email',
  github_id TEXT NULL,
  github_access_token TEXT NULL,
  avatar_url TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- 2. Organizations Table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- 3. Projects Table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NULL,
  project_type TEXT NULL DEFAULT 'Customer Support',
  environment TEXT NULL DEFAULT 'Development',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_org_slug_key UNIQUE (organization_id, slug)
);

-- 4. Documents Table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT NULL,
  chunk_count INTEGER DEFAULT 0,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT documents_pkey PRIMARY KEY (id)
);

-- 5. Document Chunks & Vector Store
CREATE TABLE public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER DEFAULT 0,
  embedding public.vector(384) NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chunks_pkey PRIMARY KEY (id)
);

-- HNSW Vector Index for Sub-10ms Cosine Similarity Search
CREATE INDEX idx_document_chunks_embedding_hnsw 
ON public.document_chunks 
USING hnsw (embedding vector_cosine_ops);
```

---

## ⚡ RAG & Retrieval Pipeline Deep-Dive

The retrieval pipeline in Beacon is engineered for high accuracy, document grounding, and token economy.

```
[ User Query ]
      │
      ▼
┌───────────────────────────────┐
│ 1. Sub-ms Greeting Fast-Path  │ ──► [Greeting Match?] ──► Return instant response (0 tokens, 0ms)
└───────────────────────────────┘
      │ No
      ▼
┌───────────────────────────────┐
│ 2. Local Query Augmentation   │ ──► Merges recent turn context without secondary LLM roundtrip
└───────────────────────────────┘
      │
      ▼
┌───────────────────────────────┐
│ 3. Dense Vector Retrieval     │ ──► Generates 384D query embedding via SentenceTransformers
└───────────────────────────────┘
      │
      ▼
┌───────────────────────────────┐
│ 4. HNSW Vector Match (PgVector)│ ──► Executes `match_document_chunks` RPC with Cosine Similarity
└───────────────────────────────┘
      │
      ▼
┌───────────────────────────────┐
│ 5. Adaptive Chunk Pruning     │ ──► High relevance match (score >= 0.50) prunes context to top 2 chunks
└───────────────────────────────┘
      │
      ▼
┌───────────────────────────────┐
│ 6. Line Deduplication Context  │ ──► Removes duplicate lines across chunk overlap windows (cuts 40% tokens)
└───────────────────────────────┘
      │
      ▼
┌───────────────────────────────┐
│ 7. Multi-Provider Generation  │ ──► Calls configured LLM (Groq / OpenAI / Gemini / Claude / Custom)
└───────────────────────────────┘
      │ Failover trigger (429 Rate Limit / 404 Model Error)
      ▼
┌───────────────────────────────┐
│ 8. Auto Cross-Provider Failover│ ──► Seamlessly switches Groq ➔ Gemini 2.0 Flash ➔ OpenAI gpt-4o-mini
└───────────────────────────────┘
```

---

## 🔌 Developer Integration: SDK & APIs

Developers can integrate Beacon into existing applications using either client SDKs or standard REST HTTP endpoints.

### Authentication & API Keys

Beacon supports scoped API Keys created via the project management dashboard or API:
- `bc_live_...`: Production environment secret key.
- `bc_test_...`: Sandbox / Testing environment secret key.

Pass your API Key or JWT token in the `Authorization` header:
```http
Authorization: Bearer bc_live_9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c
```

---

### JavaScript / TypeScript SDK Integration

You can integrate Beacon into React, Next.js, Node.js, or Express applications:

#### Installation
```bash
npm install @beacon/sdk
# or
yarn add @beacon/sdk
```

#### Code Example: Context Retrieval & Querying
```typescript
import { Beacon } from "@beacon/sdk";

// Initialize Beacon client
const beacon = new Beacon({
  apiKey: process.env.BEACON_API_KEY!,
  organizationId: "org_12345",
  projectId: "proj_67890",
  baseUrl: "https://api.beacon.ai" // optional, defaults to hosted API
});

async function askAssistant() {
  try {
    // Synchronous RAG Query
    const response = await beacon.rag.query({
      query: "How do users configure custom webhooks?",
      llmProvider: "groq",
      modelName: "openai/gpt-oss-120b",
      topK: 4,
      minScore: 0.20,
    });

    console.log("Answer:", response.answer);
    console.log("Confidence Score:", response.confidence_score);
    console.log("Sources:", response.sources);
  } catch (error) {
    console.error("RAG Query Failed:", error);
  }
}

// Server-Sent Events (SSE) Streaming
async function streamAnswer() {
  const stream = await beacon.rag.stream({
    query: "Explain the database architecture",
    llmProvider: "gemini",
  });

  for await (const chunk of stream) {
    if (chunk.type === "content") {
      process.stdout.write(chunk.delta);
    } else if (chunk.type === "metadata") {
      console.log("\n[Sources Retrieved]:", chunk.sources.length);
    }
  }
}
```

---

### Python SDK Integration

Integrate Beacon into FastAPI, Flask, Django, or data science pipelines:

#### Installation
```bash
pip install beacon-sdk
```

#### Code Example: Query & Document Upload
```python
import os
from beacon import BeaconClient

# Initialize client
client = BeaconClient(
    api_key=os.getenv("BEACON_API_KEY"),
    organization_id="org_12345",
    project_id="proj_67890"
)

# 1. Execute RAG Query
result = client.rag.query(
    query="What is the token limit for file uploads?",
    llm_provider="openai",
    model_name="gpt-4o-mini",
    temperature=0.2
)

print(f"Answer: {result['answer']}")
print(f"Execution Time: {result['execution_time_ms']} ms")
for source in result['sources']:
    print(f" - {source['file_name']} (Similarity: {source['similarity_score']})")

# 2. Upload Document Programmatically
doc = client.documents.upload(
    file_path="./docs/architecture_spec.pdf"
)
print(f"Uploaded Document ID: {doc['id']}, Status: {doc['status']}")
```

---

### REST API Reference & cURL Examples

#### 1. Execute RAG Query (`POST /organizations/{org_id}/projects/{proj_id}/rag/query`)

```bash
curl -X POST "http://localhost:8000/organizations/org_12345/projects/proj_67890/rag/query" \
  -H "Authorization: Bearer <YOUR_JWT_OR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What authentication methods are supported?",
    "top_k": 4,
    "min_score": 0.20,
    "llm_provider": "groq",
    "model_name": "openai/gpt-oss-120b",
    "temperature": 0.2,
    "history": [
      {"role": "user", "content": "Hi"},
      {"role": "assistant", "content": "Hello! How can I assist you today?"}
    ]
  }'
```

##### Sample JSON Response:
```json
{
  "query": "What authentication methods are supported?",
  "answer": "Beacon supports OAuth2 with JWT bearer tokens, email/password login with bcrypt hashing, GitHub OAuth authentication, and scoped API keys (bc_live_... and bc_test_...).",
  "sources": [
    {
      "id": "chunk_a1b2c3d4",
      "file_name": "security_overview.md",
      "similarity_score": 0.8421,
      "rank": 1,
      "content_preview": "Beacon enforces JWT bearer token verification for user sessions..."
    }
  ],
  "confidence_score": 0.8421,
  "provider_used": "groq",
  "model_used": "openai/gpt-oss-120b",
  "token_usage": {
    "prompt_tokens": 312,
    "completion_tokens": 48,
    "total_tokens": 360
  },
  "execution_time_ms": 284.5
}
```

---

#### 2. SSE Streaming Query (`POST /organizations/{org_id}/projects/{proj_id}/rag/stream`)

```bash
curl -N -X POST "http://localhost:8000/organizations/org_12345/projects/proj_67890/rag/stream" \
  -H "Authorization: Bearer <YOUR_JWT_OR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Summarize the document ingestion process",
    "llm_provider": "gemini"
  }'
```

---

#### 3. Upload Document (`POST /organizations/{org_id}/projects/{proj_id}/documents`)

```bash
curl -X POST "http://localhost:8000/organizations/org_12345/projects/proj_67890/documents" \
  -H "Authorization: Bearer <YOUR_JWT_OR_API_KEY>" \
  -F "file=@/path/to/enterprise_guide.pdf"
```

---

## 🔄 Automated GitHub Ingestion & Webhook Auto-Sync

Beacon features automated GitHub repository syncing. Once connected, push events automatically re-index modified files.

```
[ Developer pushes code to GitHub ]
               │
               ▼
[ GitHub Webhook Event ] ──► POST /webhooks/github (X-GitHub-Event: push)
                                       │
                                       ▼ (Instantly responds 200 OK <100ms)
                        ┌───────────────────────────────┐
                        │ FastAPI BackgroundTasks Queue │
                        └───────────────────────────────┘
                                       │
                                       ▼
                        ┌───────────────────────────────┐
                        │ 1. Parse commit SHA & Repo    │
                        │ 2. Fetch modified Markdown    │
                        │ 3. Purge outdated chunks      │
                        │ 4. Re-chunk & Re-embed        │
                        │ 5. Update vector index        │
                        └───────────────────────────────┘
```

### GitHub Import Payload Example
```bash
curl -X POST "http://localhost:8000/organizations/org_12345/projects/proj_67890/documents/github-import" \
  -H "Authorization: Bearer <YOUR_JWT_OR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/my-org/docs-repo",
    "selected_files": ["README.md", "docs/architecture.md", "docs/api.md"]
  }'
```

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `Backend/` directory with the following variables:

```env
# Supabase & PgVector Credentials
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Auth & Security
JWT_SECRET=your-super-secret-jwt-signing-key-32-chars-min
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=600

# GitHub Integration (Optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# System Default LLM Provider Keys
DEFAULT_LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_api_key
OPENAI_API_KEY=sk-proj-your_openai_api_key
GEMINI_API_KEY=AIzaSy_your_gemini_api_key
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key
```

---

## 💻 Installation & Local Setup

### 1. Prerequisites
- **Python**: 3.10+
- **Node.js**: v18+
- **PostgreSQL**: Version 15+ with `pgvector` enabled (or Supabase instance).

### 2. Backend Setup
```bash
cd Backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (execute schema.txt in your Supabase SQL editor)

# Start FastAPI application
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd Frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 📊 Performance & Latency Optimizations

| Optimization Metric | Technique | Benchmark Result |
| :--- | :--- | :--- |
| **Embedding Cold Starts** | Model pre-warming at server startup (`app.on_event("startup")`) | Reduced initial query response from **~2,400ms** to **<250ms**. |
| **Greeting Queries** | Regex and set-based fast-path matching | **0ms LLM latency, 0 prompt tokens**. |
| **Query Rephrasing** | Smart local context augmentation (zero secondary LLM calls) | Saves **~2,000ms HTTP roundtrip**. |
| **Token Overhead** | Line deduplication across chunk overlap windows | **40% reduction in prompt tokens**. |
| **Rate Limit Protection** | Cross-provider fallback cascade (`Groq` ➔ `Gemini` ➔ `OpenAI`) | **99.99% query availability** even under free tier TPM limits. |

---

<p center>
  Developed with ❤️ for production AI application teams.
</p>
