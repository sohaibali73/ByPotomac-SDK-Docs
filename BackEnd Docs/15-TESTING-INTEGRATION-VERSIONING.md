# ByPotomac SDK — Testing, SDK Integration, and Versioning

## Testing Architecture

### Test Categories

| Category | Scope | Tools | Location |
|---|---|---|---|
| Unit Tests | Individual functions and modules | pytest, unittest.mock | `tests/unit/` |
| Integration Tests | Module interactions, database | pytest, httpx, test database | `tests/integration/` |
| API Tests | Full HTTP request/response cycle | pytest, httpx.AsyncClient | `tests/api/` |
| End-to-End Tests | Full user flows | pytest, httpx | `tests/e2e/` |
| Load Tests | Performance and scalability | locust | `tests/load/` |

### Unit Testing

Unit tests validate individual functions and classes in isolation. External dependencies (database, APIs, Redis) are mocked.

```python
import pytest
from unittest.mock import AsyncMock, patch
from core.encryption import encrypt_api_key, decrypt_api_key

def test_encrypt_decrypt_roundtrip():
    key = "sk-ant-api03-test-key"
    encrypted = encrypt_api_key(key)
    assert encrypted.startswith("enc:")
    decrypted = decrypt_api_key(encrypted)
    assert decrypted == key

def test_legacy_key_passthrough():
    legacy_key = "sk-ant-api03-legacy"
    result = decrypt_api_key(legacy_key)
    assert result == legacy_key
```

### Integration Testing

Integration tests validate interactions between modules and the database.

```python
import pytest
from httpx import AsyncClient
from main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_register_and_login(client):
    reg = await client.post("/auth/v2/register", json={
        "email": "test@example.com",
        "password": "TestPass123!"
    })
    assert reg.status_code == 200
    assert "access_token" in reg.json()["session"]
```

### Mocking Strategy

| Dependency | Mock Method | Purpose |
|---|---|---|
| Supabase client | `unittest.mock.patch` | Avoid real database calls |
| Anthropic API | `unittest.mock.AsyncMock` | Avoid real AI API calls and costs |
| OpenAI API | `unittest.mock.AsyncMock` | Avoid real embedding API calls |
| Redis | `fakeredis.aioredis` | In-memory Redis replacement |
| File storage | Mock Supabase Storage client | Avoid real storage operations |
| External HTTP | `respx` or `httpx.MockTransport` | Mock outbound HTTP calls |

### Coverage Requirements

| Category | Minimum Coverage |
|---|---|
| Core modules | 80% |
| Authentication | 90% |
| Encryption | 95% |
| API routes | 75% |
| Business logic | 80% |
| Overall | 75% |

### CI Test Configuration

Tests run in GitHub Actions on every pull request:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pip install pytest pytest-asyncio pytest-cov httpx
      - run: pytest --cov=. --cov-report=xml --cov-fail-under=75
      - uses: codecov/codecov-action@v4
```

---

## SDK Integration Guide

ByPotomac SDK is the single backend that all client applications connect to. Each client platform integrates with the SDK through HTTP REST APIs and SSE streaming. This section documents how each platform connects.

### Integration Pattern

Every client follows the same integration pattern:

1. **Authentication**: POST to `/auth/v2/login` with credentials; store the returned tokens securely
2. **Session Management**: Include the access token in every request (cookie for web, Bearer header for native)
3. **Token Refresh**: When receiving 401, use the refresh token to obtain a new access token
4. **Data Operations**: Call REST endpoints for CRUD operations
5. **AI Chat**: POST to `/api/chat` and parse the SSE stream using the Vercel AI SDK Data Stream Protocol
6. **Real-Time**: Subscribe to Supabase Realtime channels for live database updates

### Web Client (Next.js) Integration

**Authentication**: Proxied through Next.js API routes. The backend sets the `potomac_session` httpOnly cookie directly. The web client never sees or stores JWT tokens in JavaScript. A `window.__potomac_token` variable is set by the auth provider for the AI SDK to use.

**AI Chat**: Uses the `@ai-sdk/react` `useChat` hook with `DefaultChatTransport` pointing to the backend `/api/chat` endpoint.

**Real-Time**: Uses the Supabase JavaScript client for Realtime subscriptions.

### Windows Client (WinUI 3) Integration

100% native Windows application built with WinUI 3, .NET 8, and C# 12. No cross-platform framework of any kind.

**Authentication**: Bearer token stored in Windows Credential Manager (`PasswordVault`). Token refresh handled automatically by the `ApiService` class.

**AI Chat**: Custom SSE parser in C# that reads the `text/event-stream` response line by line and dispatches events to the `ChatViewModel`.

**Real-Time**: Direct HTTP polling or Supabase Realtime via WebSocket.

### iOS / macOS Client (Swift) Integration

100% native Apple platform application built with Swift 6.0, SwiftUI, and UIKit/AppKit. No cross-platform framework of any kind.

**Authentication**: Bearer token stored in Keychain Services. Actor-based `APIClient` handles all HTTP communication with automatic token refresh.

**AI Chat**: Custom `SSEClient` actor that parses the Vercel AI SDK Data Stream Protocol. Uses `URLSession` data tasks with async/await streaming.

**Real-Time**: Supabase Swift client for Realtime subscriptions.

### Android Client (Planned) Integration

Will be 100% native Android built with Kotlin and Jetpack Compose. No cross-platform framework of any kind.

**Authentication**: Bearer token stored in Android Keystore with `EncryptedSharedPreferences`. OkHttp interceptor for automatic token injection and refresh.

**AI Chat**: OkHttp SSE client with custom Data Stream Protocol parser. Flow-based streaming to Compose UI.

### Linux Client (Planned) Integration

Will be 100% native Linux built with C++/Rust and GTK 4 or Qt 6. No cross-platform framework of any kind.

**Authentication**: Bearer token stored in libsecret/GNOME Keyring. libcurl or reqwest for HTTP communication.

### Tizen Client (Planned) Integration

Will be 100% native Tizen. No cross-platform framework of any kind.

### Roku TV Client (Planned) Integration

Will be 100% native Roku built with BrightScript and SceneGraph. No cross-platform framework of any kind.

---

## Versioning and Changelog

### Versioning Policy

ByPotomac SDK follows Semantic Versioning (SemVer):

```
MAJOR.MINOR.PATCH
```

| Component | When Incremented | Example |
|---|---|---|
| MAJOR | Breaking API changes | 1.x.x → 2.0.0 |
| MINOR | New features (backward compatible) | 2.0.x → 2.1.0 |
| PATCH | Bug fixes (backward compatible) | 2.1.0 → 2.1.1 |

### API Versioning

API endpoints are versioned via URL path prefixes:

| Prefix | Version | Status |
|---|---|---|
| `/auth/v2` | Version 2 | Current |
| `/api/v1` | Version 1 | Current |
| `/api/chat` | Unversioned | Current (single endpoint) |

### Version History

| Version | Codename | Date | Highlights |
|---|---|---|---|
| 2.0.0 | Aventino | 2026-03 | Enterprise Edition, multi-tenancy, RBAC, envelope encryption, audit logging, compliance framework |
| 1.3.8 | — | 2026-02 | Message parts format, generative UI cards, knowledge base improvements |
| 1.3.0 | — | 2026-01 | Knowledge base with vector search, file uploads, memories |
| 1.2.0 | — | 2025-12 | Backtesting engine, AFL validation, skills framework |
| 1.1.0 | — | 2025-11 | Streaming protocol upgrade to Vercel AI SDK Data Stream |
| 1.0.0 | — | 2025-10 | Initial release: auth, chat, sessions, market data, EDGAR |

### Breaking Changes (V1 to V2)

| Change | V1 Behavior | V2 Behavior | Migration |
|---|---|---|---|
| Message format | `content` as plain text | `parts` array with typed elements | Parse `parts` array; fall back to `content` |
| Session model | Flat session object | Session with metadata and archiving | Add `metadata` and `is_archived` handling |
| Auth endpoints | `/auth/` prefix | `/auth/v2/` prefix | Update all auth endpoint URLs |
| Cookie name | `session_token` | `potomac_session` | Update cookie reading code |
| Tool results | Embedded in message text | Structured `tool-invocation` parts | Parse tool invocation parts |

### Migration Guide (V1 to V2)

1. Update all authentication endpoints from `/auth/` to `/auth/v2/`
2. Update cookie name from `session_token` to `potomac_session`
3. Update message parsing to handle the `parts` array format
4. Update tool invocation handling to parse structured tool result parts
5. Add support for the `metadata` field on sessions
6. Test all streaming integration with the updated Data Stream Protocol
7. Verify token refresh flow works with the new refresh endpoint

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
