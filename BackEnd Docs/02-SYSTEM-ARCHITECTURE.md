# ByPotomac SDK — System Architecture and Design Philosophy

## Architectural Vision

ByPotomac SDK is designed as a modular, layered backend platform that separates domain-agnostic infrastructure from domain-specific business logic. The architecture follows a two-tier organization where platform services (authentication, sessions, files, knowledge, streaming) operate independently from analyst-specific features (market data, backtesting, AFL, research tools). This separation allows the SDK to serve multiple product verticals while maintaining a single deployment.

The system is async-first from the ground up. Every I/O operation — database queries, HTTP calls to external APIs, file operations, and streaming responses — uses Python's native `asyncio` runtime through FastAPI's ASGI architecture. This enables the SDK to handle thousands of concurrent connections with minimal resource consumption.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Applications                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │   Web    │ │ Windows  │ │ iOS/Mac  │ │ Android  │  ...      │
│  │ Next.js  │ │  WinUI 3 │ │  Swift   │ │  Kotlin  │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       │             │            │             │                 │
│       └─────────────┴────────────┴─────────────┘                │
│                          │                                      │
│                   HTTPS / SSE / WSS                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    ByPotomac SDK                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    FastAPI Application                      │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │              Middleware Pipeline                       │ │ │
│  │  │  CORS → Rate Limit → Auth → Request ID → Logging     │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐   │ │
│  │  │  backend_platform/  │  │     apps/analyst/         │   │ │
│  │  │                     │  │                            │   │ │
│  │  │  auth/              │  │  chat_routes.py            │   │ │
│  │  │  chat/              │  │  market_data/              │   │ │
│  │  │  sessions/          │  │  backtest/                 │   │ │
│  │  │  files/             │  │  afl/                      │   │ │
│  │  │  knowledge/         │  │  researcher/               │   │ │
│  │  │  memories/          │  │  skills/                   │   │ │
│  │  │  preferences/       │  │  tools/                    │   │ │
│  │  │  projects/          │  │  prompts/                  │   │ │
│  │  │  tasks/             │  │                            │   │ │
│  │  │  artifacts/         │  │                            │   │ │
│  │  │  streaming/         │  │                            │   │ │
│  │  └─────────────────────┘  └──────────────────────────┘   │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │                    core/                              │ │ │
│  │  │  anthropic_client  │  claude_engine  │  encryption    │ │ │
│  │  │  supabase_client   │  streaming      │  file_store    │ │ │
│  │  │  context_manager   │  task_manager   │  vercel_ai     │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  PostgreSQL   │  │    Redis     │  │   Supabase Storage    │ │
│  │  (Supabase)   │  │   (Cache)   │  │   (File Storage)      │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  Anthropic    │  │   OpenAI     │  │   SEC EDGAR           │ │
│  │  Claude API   │  │  Embeddings  │  │   (Public Data)       │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Design Principles

### Async-First I/O
Every operation that touches a network boundary or filesystem is implemented as an async coroutine. The application runs on Uvicorn (ASGI server) behind Gunicorn for process management in production. Database operations use the Supabase Python client with async HTTP calls. External API calls to Anthropic, OpenAI, and SEC EDGAR are all async. File operations use Supabase Storage async endpoints. This ensures the SDK can serve hundreds of concurrent requests per process without blocking.

### Two-Tier Module Organization
The codebase is organized into two distinct tiers:

**Tier 1 — Platform Services (`backend_platform/`)**: Domain-agnostic services that any product could use. Authentication, session management, file storage, knowledge management, chat infrastructure, preferences, projects, tasks, artifacts, and streaming. These modules have no knowledge of financial analysis concepts.

**Tier 2 — Domain Services (`apps/analyst/`)**: Financial analysis features that build on top of platform services. Market data retrieval, backtesting, AFL validation, research engine, skills framework, tool definitions, and system prompts. These modules are specific to the analyst product vertical.

### Shared Core (`core/`)
The `core/` module contains infrastructure utilities shared by both tiers: the Anthropic client, Claude conversation engine, encryption utilities, Supabase database client, streaming helpers, file storage abstraction, context management, and task scheduling. Core modules are stateless and imported by both platform and domain services.

### Route-Based API Organization
Every feature area exposes its functionality through FastAPI router modules. Routers are registered in `main.py` with explicit prefixes and tags. This makes the API surface discoverable and ensures each feature area has a well-defined HTTP interface.

### Cookie-Based Authentication for Web
The web client uses httpOnly cookie-based authentication (`potomac_session` cookie) to prevent XSS-based token theft. The session cookie is set with a 7-day expiry, Secure flag, SameSite=None for cross-origin support, and HttpOnly flag. Native clients use Bearer token authentication with the same JWT tokens.

### Streaming-First AI Responses
All AI-powered responses are delivered via Server-Sent Events (SSE) using the Vercel AI SDK Data Stream Protocol. This protocol encodes text tokens, tool invocations, tool results, data payloads, and error signals in a structured line-based format that all platform clients can parse natively. The streaming architecture eliminates perceived latency by delivering tokens as they are generated by the Claude model.

## Request Lifecycle

A typical request through ByPotomac SDK follows this path:

1. **Client sends HTTP request** with authentication credentials (cookie or Bearer token)
2. **CORS middleware** validates the request origin against the whitelist
3. **Rate limiting middleware** checks the request against per-IP rate limits (120 requests/minute)
4. **Authentication middleware** extracts and validates the JWT token from the cookie or Authorization header
5. **Request routing** dispatches the request to the appropriate router handler
6. **Handler execution** performs business logic, database queries, and external API calls
7. **Response serialization** encodes the response as JSON (or SSE stream for AI responses)
8. **Response delivery** sends the response back to the client with appropriate headers

For streaming AI requests, steps 6 and 7 are replaced with:

6. **Stream initialization** opens an SSE connection to the client
7. **Claude API streaming** receives tokens from the Anthropic API and forwards them to the client in real time
8. **Tool execution** when Claude invokes tools, the SDK executes them server-side and feeds results back into the conversation
9. **Stream completion** sends a finish signal and closes the SSE connection
10. **Persistence** saves the complete conversation to the database asynchronously

## Module Dependency Graph

```
main.py
├── config.py
├── backend_platform/main.py
│   ├── backend_platform/auth/ → core/supabase_client, core/encryption
│   ├── backend_platform/chat/ → core/claude_engine, core/anthropic_client, core/streaming
│   ├── backend_platform/sessions/ → core/supabase_client
│   ├── backend_platform/files/ → core/file_store, core/supabase_client
│   ├── backend_platform/knowledge/ → core/supabase_client, core/anthropic_client
│   ├── backend_platform/memories/ → core/supabase_client
│   ├── backend_platform/preferences/ → core/supabase_client
│   ├── backend_platform/projects/ → core/supabase_client
│   ├── backend_platform/tasks/ → core/task_manager
│   ├── backend_platform/artifacts/ → core/artifact_parser
│   └── backend_platform/streaming/ → core/streaming, core/vercel_ai
├── apps/analyst/chat_routes.py → core/claude_engine, apps/analyst/tools/
├── apps/analyst/market_data/ → external market data APIs
├── apps/analyst/backtest/ → core/supabase_client
├── apps/analyst/afl/ → core/afl_validator
├── apps/analyst/researcher/ → core/researcher_engine, core/edgar_client
├── apps/analyst/skills/ → core/skill_gateway
└── apps/analyst/tools/ → core/tools (20+ tool definitions)
```

## External Service Dependencies

| Service | Purpose | Protocol | Authentication |
|---|---|---|---|
| Supabase PostgreSQL | Primary database, vector store | HTTPS (REST API) | Service role key |
| Supabase Auth | User authentication | HTTPS (REST API) | Service role key |
| Supabase Storage | File storage (analyst-files bucket) | HTTPS (REST API) | Service role key |
| Supabase Realtime | Real-time subscriptions | WSS | Anon key + JWT |
| Anthropic Claude | AI conversation engine | HTTPS | API key |
| OpenAI | Text embeddings | HTTPS | API key |
| SEC EDGAR | Public financial filings | HTTPS | None (public API) |

## Deployment Architecture

ByPotomac SDK is deployed as a single containerized application on Railway with the following characteristics:

- **Container**: Python 3.11 slim Docker image
- **Process Manager**: Gunicorn with Uvicorn workers
- **Port**: Dynamically assigned by Railway via `$PORT` environment variable
- **Health Check**: `GET /health` endpoint returns 200 when the application is ready
- **Auto-scaling**: Railway handles horizontal scaling based on load
- **Zero-downtime deploys**: Railway performs rolling deployments with health check gates
- **Region**: US East (configurable)

The production deployment connects to:
- Supabase PostgreSQL cluster (managed)
- Redis instance (managed, when Enterprise features are active)
- Anthropic API (external)
- OpenAI API (external)

## Scalability Characteristics

| Dimension | Strategy |
|---|---|
| Concurrent connections | Async I/O with Uvicorn workers (hundreds per process) |
| Database connections | Connection pooling via Supabase client |
| AI token throughput | Streaming responses (no buffering) |
| File uploads | Direct-to-storage uploads via Supabase Storage (50MB limit) |
| Background processing | Celery workers with Redis broker (Enterprise) |
| Rate limiting | Per-IP sliding window (120 req/min) |
| Horizontal scaling | Stateless application design enables multi-instance deployment |

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
