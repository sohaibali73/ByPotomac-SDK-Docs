# ByPotomac SDK — Overview

## What is ByPotomac SDK?

ByPotomac SDK is the unified backend engine that powers the entire ByPotomac product ecosystem. It is a high-performance, async-first API platform built on FastAPI and Python, designed to serve as the single source of truth for authentication, data, AI orchestration, and real-time communication across every client application in the platform.

ByPotomac SDK is not a library that ships inside client applications. It is a centralized, server-side platform that exposes RESTful APIs, Server-Sent Event streams, and WebSocket connections. Every client — regardless of platform — communicates exclusively with this SDK to perform all operations.

## Product Identity

| Attribute | Value |
|---|---|
| Product Name | ByPotomac SDK |
| Previous Internal Name | Potomac Analyst Workbench |
| Current Version | 2.0 (Codename: Aventino) |
| Organization | Potomac Fund Management |
| Production Domain | `potomac-analyst-workbench-production.up.railway.app` |

All references to "Potomac Analyst Workbench" throughout this documentation, codebase, and API responses refer to the same system now branded as **ByPotomac SDK**. The rebranding reflects the system's evolution from an internal analyst tool into a platform-grade SDK that serves multiple client applications across every major computing platform.

## Core Capabilities

ByPotomac SDK provides the following capabilities to all connected client applications:

### AI Orchestration
- Conversational AI powered by Anthropic Claude (claude-sonnet-4-5 and claude-haiku-4-5)
- Multi-turn conversation management with persistent session history
- Real-time token streaming via the Vercel AI SDK Data Stream Protocol
- Tool-augmented generation with 20+ integrated financial analysis tools
- Structured generative UI card rendering for rich client experiences

### Authentication and Identity
- Supabase Auth integration with email/password, OAuth, and token refresh
- Microsoft Entra ID (Azure AD) OIDC with PKCE for enterprise single sign-on
- SAML 2.0 federation for enterprise identity provider integration
- API key management with Fernet encryption at rest
- Multi-factor authentication via TOTP and WebAuthn

### Financial Analysis Tools
- Real-time and historical market data retrieval
- SEC EDGAR filing search and document analysis
- Backtesting engine for portfolio strategies
- Analyst Formula Language (AFL) validation and execution
- Skills-based computation framework for quantitative analysis

### Knowledge Management
- Document ingestion and intelligent parsing (PDF, DOCX, XLSX, CSV, TXT, Markdown)
- Vector embedding generation via OpenAI text-embedding-3-small (1536 dimensions)
- Semantic search with cosine similarity across knowledge bases
- Per-user and per-session knowledge retrieval augmented generation (RAG)

### Platform Services
- Project and workspace management
- Task tracking and background job processing
- User preference and configuration persistence
- File upload, storage, and retrieval via Supabase Storage
- Memory and context management for AI conversations
- Artifact parsing and structured data extraction

## Platform Architecture

ByPotomac SDK is the single backend that serves every client application. Each client is built as a 100% native application for its target platform. No cross-platform frameworks are used anywhere in the ecosystem. The SDK is the unifying layer that makes this multi-platform native strategy viable.

| Platform | Technology | Status |
|---|---|---|
| Web | Next.js 16, React 19, TypeScript | Production |
| Windows | WinUI 3, .NET 8, C# 12 — 100% native, no cross-platform framework | Production |
| iOS / macOS | Swift 6.0, SwiftUI, UIKit/AppKit — 100% native, no cross-platform framework | Production |
| Android | Kotlin, Jetpack Compose — 100% native, no cross-platform framework | Planned |
| Linux | C++/Rust, GTK 4 or Qt 6 — 100% native, no cross-platform framework | Planned |
| Tizen (Samsung TV) | 100% native Tizen — no cross-platform framework | Planned |
| Roku TV | BrightScript, SceneGraph — 100% native Roku, no cross-platform framework | Planned |

Every platform client is deliberately, intentionally, and architecturally native. ByPotomac SDK is the single unified engine that all of these native clients connect to. This architectural decision ensures that each client delivers the best possible user experience by leveraging platform-native capabilities, performance characteristics, and design language — while the SDK handles all shared logic, data persistence, and AI orchestration on the server side.

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Language | Python | 3.11 |
| Framework | FastAPI | 0.104+ |
| ASGI Server | Uvicorn + Gunicorn | Latest |
| Database | PostgreSQL 15 (Supabase) | 15+ |
| Vector Store | pgvector | 0.5+ |
| Cache | Redis 7+ | 7.0+ |
| AI Engine | Anthropic Claude | claude-sonnet-4-5 |
| Embeddings | OpenAI | text-embedding-3-small |
| File Storage | Supabase Storage | Latest |
| Real-Time | Supabase Realtime | Latest |
| Auth | Supabase Auth + Entra ID + SAML | Latest |
| Deployment | Railway / Docker | Latest |
| Streaming | Vercel AI SDK Data Stream Protocol (SSE) | Latest |

## Repository Structure

```
Potomac-Analyst-Workbench/
├── main.py                    # Application entry point
├── config.py                  # Environment configuration
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Container build definition
├── railway.json               # Railway deployment configuration
├── backend_platform/          # Domain-agnostic platform services
│   ├── main.py                # Platform router registration
│   ├── auth/                  # Authentication routes and services
│   ├── chat/                  # Chat engine, context, and routes
│   ├── sessions/              # Session management
│   ├── files/                 # File upload and storage
│   ├── knowledge/             # Knowledge base and embeddings
│   ├── memories/              # Conversation memory
│   ├── preferences/           # User preferences
│   ├── projects/              # Project management
│   ├── tasks/                 # Background task management
│   ├── artifacts/             # Artifact parsing and extraction
│   └── streaming/             # SSE streaming encoder
├── apps/analyst/              # Domain-specific analyst features
│   ├── chat_routes.py         # AI chat with tool orchestration
│   ├── market_data/           # Market data retrieval
│   ├── backtest/              # Backtesting engine
│   ├── afl/                   # Analyst Formula Language
│   ├── researcher/            # Research engine
│   ├── skills/                # Quantitative skills
│   ├── tools/                 # Tool definitions for AI
│   └── prompts/               # System prompts
├── core/                      # Shared infrastructure
│   ├── anthropic_client.py    # Claude API client
│   ├── claude_engine.py       # AI conversation engine
│   ├── encryption.py          # Fernet encryption
│   ├── supabase_client.py     # Database client
│   ├── streaming.py           # Stream management
│   ├── file_store.py          # File storage abstraction
│   ├── storage.py             # Storage utilities
│   ├── context_manager.py     # Conversation context
│   ├── task_manager.py        # Task scheduling
│   └── ...                    # Additional core modules
├── db/                        # Database layer
│   ├── supabase_client.py     # Database connection
│   └── migrations/            # SQL migration files
└── docs/                      # Documentation
```

## Naming Conventions

Throughout the SDK codebase and API responses, the following naming conventions are used:

| Convention | Example | Usage |
|---|---|---|
| Route prefixes | `/auth/v2`, `/api/v1` | All API routes are versioned |
| Database tables | `user_profiles`, `chat_sessions` | Snake case for all tables |
| Environment variables | `SUPABASE_URL`, `ANTHROPIC_API_KEY` | Upper snake case |
| Python modules | `chat_routes.py`, `skill_gateway.py` | Snake case |
| API response fields | `access_token`, `created_at` | Snake case JSON |
| HTTP headers | `X-Request-ID`, `X-User-ID` | Standard HTTP header casing |

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
