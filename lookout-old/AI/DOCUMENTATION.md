 LinkedIn Post Generator AI - Complete Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [API Endpoints](#api-endpoints)
7. [AI/ML Pipeline](#aiml-pipeline)
8. [Rate Limiting](#rate-limiting)
9. [Setup & Configuration](#setup--configuration)
10. [Deployment](#deployment)

---

## System Overview

The LinkedIn Post Generator is an AI-powered application that creates personalized, high-quality LinkedIn posts using:
- **RAG (Retrieval-Augmented Generation)** to reference top creator posts
- **Azure OpenAI GPT** for natural language generation
- **Client-specific memory** to maintain tone and style consistency
- **User tiering** (BEGINNER, NORMAL, PRO, COPYWRITER) for tailored experiences

### Key Features
- ✅ Generate LinkedIn posts from simple prompts
- ✅ Multi-client management (for copywriters)
- ✅ Conversational memory (remembers past interactions)
- ✅ Hook/Framework/CTA customization
- ✅ Similar post retrieval (RAG)
- ✅ Rate-limited API (30 requests/minute per IP)

---

## Architecture

```
┌─────────────────┐
│   Frontend UI   │ (React/HTML+JS)
└────────┬────────┘
         │ HTTP REST API
         │
┌────────▼────────────────────────────────────────┐
│          FastAPI Backend (Python)               │
│  ┌──────────────────────────────────────────┐  │
│  │  Routes Layer (app/api/routes.py)       │  │
│  │  - POST /generate_post                   │  │
│  │  - POST /save_choice                     │  │
│  │  - GET  /clients/{user_id}               │  │
│  │  - POST /clients                         │  │
│  └──────────────────────────────────────────┘  │
│                     │                           │
│  ┌──────────────────▼───────────────────────┐  │
│  │  Services Layer                          │  │
│  │  - LLMService (GPT orchestration)        │  │
│  │  - VectorStoreService (FAISS RAG)        │  │
│  └──────────────────┬───────────────────────┘  │
│                     │                           │
│  ┌──────────────────▼───────────────────────┐  │
│  │  Database Layer (SQLAlchemy)             │  │
│  │  - Users, Clients, Posts                 │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         │                    │
         │                    │
    ┌────▼─────┐      ┌──────▼──────┐
    │ SQLite/  │      │ Azure OpenAI│
    │ Postgres │      │ GPT + Embed │
    └──────────┘      └─────────────┘
         │
    ┌────▼─────┐
    │  FAISS   │
    │ Vector DB│
    └──────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML/CSS/JS (static/index.html) | User interface for prompts and post display |
| **Backend** | FastAPI (Python 3.9+) | REST API server |
| **LLM** | Azure OpenAI GPT-4/GPT-5 | Natural language generation |
| **Embeddings** | Azure OpenAI Embeddings | Convert text to vectors |
| **Vector DB** | FAISS (Facebook AI Similarity Search) | Store and retrieve similar posts |
| **ORM** | SQLAlchemy | Database abstraction |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Persist users, clients, posts |
| **Rate Limiting** | SlowAPI | IP-based request throttling |
| **Framework** | LangChain | LLM orchestration and memory |

---

## Core Components

### 1. **LLMService** (`app/services/llm_service.py`)
Orchestrates LinkedIn post generation with:
- **Client memory**: Tracks conversation history per client
- **Hook/Framework/CTA management**: Loads from CSV files and rotates on request
- **Pattern detection**: Recognizes "change hook/CTA/framework" requests
- **Prompt building**: Assembles system prompt + context + examples + user query
- **Azure OpenAI integration**: Calls GPT with configured parameters

**Key Methods:**
```python
generate_post(query, client_id, is_pro_user) → str
```

### 2. **VectorStoreService** (`app/services/vector_store.py`)
Manages RAG (Retrieval-Augmented Generation):
- **FAISS index**: Builds/loads vector store from `linkedin_multiple_posts.csv`
- **Embeddings**: Uses Azure OpenAI Embeddings API
- **Similarity search**: Returns top-k most relevant posts for a query

**Key Methods:**
```python
search_similar_posts(query, k=3) → List[Document]
```

### 3. **CRUD Layer** (`app/db/crud.py`)
Database operations:
- `get_or_create_user(user_id, user_type)` — User management
- `save_post(user_id, query, content, client_id)` — Post persistence
- `get_clients(user_id)` — Client list for copywriters
- `create_client(user_id, name, industry)` — New client creation
- `save_post_choice(post_id)` — Mark a post as chosen

### 4. **Database Models** (`app/db/models.py`)
SQLAlchemy ORM models:
```python
User:
  - user_id (PK)
  - user_type (BEGINNER|NORMAL|PRO|COPYWRITER)
  - post_count
  - created_at

Client:
  - client_id (PK)
  - user_id (FK → User)
  - name
  - industry
  - created_at

Post:
  - post_id (PK)
  - user_id (FK → User)
  - client_id (FK → Client)
  - query (user prompt)
  - content (generated post)
  - chosen (boolean)
  - created_at
```

### 5. **Rate Limiting** (`app/core/rate_limit.py`)
SlowAPI limiter:
```python
limiter = Limiter(key_func=get_remote_address)
# Applied as @limiter.limit("30/minute")
```

---

## Data Flow

### Post Generation Flow
```
1. User submits prompt → POST /generate_post
   ├── Request: { user_id, query, client_id?, user_type? }
   │
2. Backend processes:
   ├── Get/create user (CRUD)
   ├── Determine user tier (BEGINNER → 1 post, PRO → 2 posts)
   │
3. For each post variant:
   ├── VectorStoreService.search_similar_posts(query)
   │   └── FAISS returns top-3 similar creator posts
   │
   ├── LLMService.generate_post(query, client_id, is_pro)
   │   ├── Load client memory (last 5 interactions)
   │   ├── Select hook/framework/CTA from CSV files
   │   ├── Build prompt:
   │   │   - System instructions
   │   │   - Hook/Framework/CTA requirements
   │   │   - Similar post examples (RAG)
   │   │   - Client history
   │   │   - User query
   │   ├── Call Azure OpenAI GPT
   │   └── Update client memory
   │
   ├── CRUD.save_post(user_id, query, content, client_id)
   │
4. Return response:
   └── { posts: [{ post_id, content }], user_type, similar_posts }
```

### RAG (Retrieval-Augmented Generation) Flow
```
Query → Embed (Azure OpenAI) → FAISS.similarity_search()
  → Top-K creator posts → Include in GPT prompt → Better generation
```

---

## API Endpoints

### **POST /generate_post**
Generate LinkedIn post(s) from a prompt.

**Request:**
```json
{
  "user_id": "user123",
  "query": "Write about AI in healthcare",
  "client_id": "client456",  // Optional (for copywriters)
  "user_type": "PRO"         // Optional: BEGINNER|NORMAL|PRO|COPYWRITER
}
```

**Response:**
```json
{
  "posts": [
    {
      "post_id": "uuid-1",
      "content": "AI is transforming healthcare...",
      "score": null
    }
  ],
  "user_type": "PRO",
  "similar_posts": [
    "Example post 1 content...",
    "Example post 2 content..."
  ]
}
```

**Rate Limit:** None (only GET routes limited to 30/min)

---

### **POST /save_choice**
Mark a post variant as chosen (user feedback).

**Request:**
```json
{
  "user_id": "user123",
  "post_id": "uuid-1",
  "chosen_index": 0,
  "client_id": "client456"
}
```

**Response:**
```json
true
```

---

### **GET /clients/{user_id}**
Retrieve all clients for a user (copywriters).

**Response:**
```json
{
  "clients": [
    {
      "client_id": "uuid-1",
      "name": "Tech Startup Inc",
      "industry": "SaaS",
      "created_at": "2025-11-20T10:30:00"
    }
  ]
}
```

**Rate Limit:** 30 requests/minute per IP

---

### **POST /clients**
Create a new client.

**Query Params:**
- `user_id`: User ID
- `name`: Client name
- `industry`: Client industry (optional)

**Response:**
```json
{
  "clients": [ /* updated client list */ ]
}
```

---

### **GET /**
Health check endpoint.

**Response:**
```json
{
  "message": "Welcome to LinkedIn Post Generator API"
}
```

**Rate Limit:** 30 requests/minute per IP

---

## AI/ML Pipeline

### 1. **Embeddings & Vector Store**
- **Source:** `app/db/linkedin_multiple_posts.csv` (creator posts)
- **Process:**
  1. Load CSV with pandas
  2. Extract post content + metadata (author, date, URL)
  3. Generate embeddings via Azure OpenAI Embeddings API
  4. Build FAISS index
  5. Save to `data/faiss_index/` (index.faiss + index.pkl)

### 2. **Prompt Engineering**
System prompt structure:
```
SYSTEM:
- You are a LinkedIn post generator
- Start with provided hook (customize placeholders)
- Follow framework structure
- End with CTA
- For PRO users: sophisticated content, 2 variants

HOOK REQUIREMENTS:
{selected_hook}

FRAMEWORK TO FOLLOW:
{selected_framework}

CTA REQUIREMENT:
{selected_cta}

TOPIC:
{user_query}

PREVIOUS INTERACTIONS:
{client_history}

SIMILAR POSTS (RAG):
{similar_posts}

USER:
Please craft a polished LinkedIn post...
```

### 3. **Memory Management**
Per-client memory stores:
- Last 20 interactions (capped)
- Query, topic, hook, framework, CTA, generated response
- Timestamp for chronological ordering

### 4. **Hook/Framework/CTA Rotation**
CSV files:
- `app/db/hooks.csv` — Opening lines
- `app/db/frameworks.csv` — Structural templates
- `app/db/cta.csv` — Call-to-action phrases

**Logic:**
- Random selection from pool
- Avoid repeating previous choice (unless forced change)
- Pattern detection: "change the hook" → force new selection

---

## Rate Limiting

**Implementation:** SlowAPI (IP-based)

### Configuration
```python
# app/core/rate_limit.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
```

### Applied Routes
- `GET /` → 30/minute
- `GET /clients/{user_id}` → 30/minute

### Exception Handling
```python
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Try again soon."}
    )
```

### Storage
- **Default:** In-memory (resets on restart)
- **Production:** Use Redis backend for persistence across instances

**Upgrade to Redis:**
```python
from slowapi.util import get_remote_address
from slowapi import Limiter
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379"
)
```

---

## Setup & Configuration

### Prerequisites
- Python 3.9+
- Azure OpenAI API access
- (Optional) Redis for rate limiting

### Installation
```bash
# 1. Clone repository
git clone <repo-url>
cd AI

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt
```

### Environment Variables
Create `.env` file:
```env
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4  # Your deployment name
AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME=text-embedding-ada-002
AZURE_OPENAI_API_VERSION=2023-05-15
LINKEDIN_POSTS_CSV_PATH=app/db/linkedin_multiple_posts.csv
HOOKS_CSV_PATH=app/db/hooks.csv
FRAMEWORKS_CSV_PATH=app/db/frameworks.csv
CTA_CSV_PATH=app/db/cta.csv
FAISS_INDEX_PATH=data/faiss_index
```

### Database Setup
```bash
# Auto-creates on first run (SQLite default)
# For Postgres, update app/db/database.py connection string
```

### Build FAISS Index
```bash
# Automatically builds on first startup if index missing
# Manual rebuild:
python -c "from app.services.vector_store import VectorStoreService; VectorStoreService()"
```

### Run Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Frontend: http://localhost:8000/static/index.html

---

## Swagger UI & API Documentation

FastAPI automatically generates interactive API documentation at `/docs` (Swagger UI) and `/redoc` (ReDoc).

### Access Swagger UI
Once the server is running, navigate to:
```
http://localhost:8000/docs
```

### Available Endpoints in Swagger
The interactive documentation shows all endpoints with:
- **Request schemas** (JSON body, query params, path params)
- **Response schemas** (status codes, response models)
- **Try it out** functionality (test endpoints directly from browser)
- **Model definitions** (Pydantic schemas)

**Screenshot/Example of Swagger UI:**
```
┌─────────────────────────────────────────────────────┐
│ LinkedIn Post Generator API                         │
├─────────────────────────────────────────────────────┤
│ POST /generate_post                                 │
│   Generate LinkedIn post(s) from a prompt          │
│   ▼ Request body (application/json)                │
│     - user_id (string, required)                    │
│     - query (string, required)                      │
│     - client_id (string, optional)                  │
│     - user_type (UserType, optional)                │
│   ▼ Responses                                       │
│     200: Successful Response (PostResponse)         │
│     422: Validation Error                           │
├─────────────────────────────────────────────────────┤
│ POST /save_choice                                   │
│   Mark a post variant as chosen                    │
├─────────────────────────────────────────────────────┤
│ GET /clients/{user_id}                              │
│   Retrieve all clients for a user                  │
│   Rate Limited: 30/minute                           │
├─────────────────────────────────────────────────────┤
│ POST /clients                                       │
│   Create a new client                              │
├─────────────────────────────────────────────────────┤
│ GET /                                               │
│   Health check endpoint                            │
│   Rate Limited: 30/minute                           │
└─────────────────────────────────────────────────────┘
```

### Sample JSON Response (POST /generate_post)

**Request:**
```json
{
  "user_id": "demo-user-789",
  "query": "Write a post about the future of AI in software development",
  "user_type": "PRO"
}
```

**Response (200 OK):**
```json
{
  "posts": [
    {
      "post_id": "a7f3e2c9-4b1d-4e8a-9c3f-2d6e8b9f1a2c",
      "content": "Here's something most developers miss about AI:\n\nIt's not replacing us—it's revealing who we really are.\n\nThe best engineers I know aren't worried about ChatGPT writing code.\n\nThey're excited.\n\nBecause they know the real skill isn't typing syntax—it's:\n→ Understanding business problems\n→ Architecting scalable systems\n→ Making trade-off decisions\n→ Leading teams through uncertainty\n\nAI is the junior developer who never gets tired.\nYou're the senior who knows what to build and why.\n\nThe developers who thrive won't be the ones fighting AI.\nThey'll be the ones leveraging it to ship 10x faster.\n\nSoftware development isn't dying.\nIt's evolving.\n\nAnd the best part?\nThe humans who understand context, creativity, and communication will always be irreplaceable.\n\nWhat's your take—are you worried or excited about AI in development?",
      "score": null
    },
    {
      "post_id": "b4d8f1e2-7c3a-4f9b-8e2d-5a9c3f6b1d4e",
      "content": "The AI revolution in software development isn't what you think.\n\nEveryone's talking about AI replacing developers.\nI'm watching it amplify the great ones.\n\nHere's what's actually happening:\n\n1. Code generation → commoditized\n2. Problem-solving → priceless\n3. Pattern recognition → automated\n4. Strategic thinking → human-only\n\nThe shift is subtle but massive:\n\n❌ Writing boilerplate code\n✅ Designing system architecture\n\n❌ Debugging syntax errors  \n✅ Preventing architectural debt\n\n❌ Copying Stack Overflow solutions\n✅ Creating novel solutions to unique problems\n\nAI tools are like power tools in construction.\nThey don't replace the architect—they empower them.\n\nThe developers who treat AI as a threat will struggle.\nThe ones who treat it as a superpower will dominate.\n\nWe're not in the age of \"AI vs Humans.\"\nWe're in the age of \"Humans + AI vs Humans alone.\"\n\nWhich side are you on?",
      "score": null
    }
  ],
  "user_type": "PRO",
  "similar_posts": [
    "AI won't replace you. A person using AI will.\n\nHere's what that actually means for your career:\n\nThe skill isn't using the tool—it's knowing when, where, and how to apply it...",
    "Most people think AI is the future of work. They're wrong.\n\nAI + human judgment is the future...",
    "I've been testing AI coding assistants for 6 months. Here's what shocked me..."
  ]
}
```

---

## FAISS Index Structure

The vector database stores embeddings of LinkedIn posts for RAG (Retrieval-Augmented Generation).

### Directory Structure
```
data/
└── faiss_index/
    ├── index.faiss       # FAISS vector index (binary format)
    └── index.pkl         # Metadata & docstore (pickled Python object)
```

### File Details

**`index.faiss`** (Binary file)
- Contains vector embeddings of all LinkedIn posts
- Dimension: 1536 (Azure OpenAI text-embedding-ada-002)
- Index type: Flat L2 (exact search, no quantization)
- Size: ~varies based on number of posts (~50-200MB typical)

**`index.pkl`** (Pickle file)
- Stores document metadata:
  - `page_content`: Original post text
  - `metadata`: Author, date, URL, etc.
- Maps FAISS vector IDs → original documents
- Size: ~10-50MB typical

### Sample Code Snippet (Loading FAISS Index)

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import AzureOpenAIEmbeddings
from pathlib import Path

# Initialize embeddings
embeddings = AzureOpenAIEmbeddings(
    azure_deployment="text-embedding-ada-002",
    openai_api_key="your-api-key",
    azure_endpoint="https://your-resource.openai.azure.com/",
    openai_api_version="2023-05-15"
)

# Load existing FAISS index
index_path = Path("data/faiss_index")
vector_store = FAISS.load_local(str(index_path), embeddings)

# Search similar posts
query = "AI in healthcare"
results = vector_store.similarity_search(query, k=3)

for doc in results:
    print(f"Content: {doc.page_content}")
    print(f"Author: {doc.metadata.get('profile_name')}")
    print(f"Date: {doc.metadata.get('post_date')}")
    print("---")
```

### Rebuilding FAISS Index

If you need to rebuild the index from scratch:

```bash
# Delete existing index
rm -rf data/faiss_index/

# Restart server (auto-rebuilds from CSV)
uvicorn app.main:app --reload
```

Or manually:

```python
from app.services.vector_store import VectorStoreService

# Initializing VectorStoreService triggers index build if missing
service = VectorStoreService()
print("FAISS index rebuilt successfully!")
```

### Index Statistics

To check index details:

```python
import faiss
import pickle

# Load FAISS index
index = faiss.read_index("data/faiss_index/index.faiss")
print(f"Total vectors: {index.ntotal}")
print(f"Dimension: {index.d}")

# Load metadata
with open("data/faiss_index/index.pkl", "rb") as f:
    store = pickle.load(f)
    print(f"Total documents: {len(store.docstore._dict)}")
```

---

## Deployment

### Production Checklist
- [ ] Set `allow_origins` in CORS to specific domain (not `"*"`)
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable Redis for rate limiting
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure environment variables via secrets manager
- [ ] Add monitoring (Prometheus/Grafana)
- [ ] Set up logging aggregation
- [ ] Implement backup strategy for database
- [ ] Load test API endpoints
- [ ] Set up CI/CD pipeline

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Platforms
- **Azure App Service:** Deploy FastAPI directly
- **AWS Lambda + API Gateway:** Serverless deployment (use Mangum adapter)
- **Google Cloud Run:** Containerized deployment
- **Heroku:** `Procfile` with `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## Troubleshooting

### Common Issues

**1. FAISS index not loading**
- Ensure `linkedin_multiple_posts.csv` exists
- Check `FAISS_INDEX_PATH` environment variable
- Rebuild index: delete `data/faiss_index/` and restart

**2. Azure OpenAI errors**
- Verify API key and endpoint in `.env`
- Check deployment names match your Azure resource
- Ensure quota limits not exceeded

**3. Rate limit not working**
- Verify `slowapi` installed: `pip install slowapi`
- Check `limiter.limit()` decorator applied
- Test with `curl` from different IPs

**4. Database migration errors**
- Delete `*.db` file (SQLite) and restart
- For Postgres, use Alembic migrations
