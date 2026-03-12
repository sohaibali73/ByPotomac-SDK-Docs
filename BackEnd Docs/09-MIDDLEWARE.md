# ByPotomac SDK — Middleware Pipeline

## Middleware Architecture

ByPotomac SDK processes every HTTP request through an ordered middleware pipeline. Each middleware in the pipeline performs a specific function — from security enforcement to request tracking to tenant context resolution. Middleware executes in a defined order on the request path and in reverse order on the response path.

## Pipeline Execution Order

The middleware pipeline executes in the following order for every incoming request:

```
Incoming Request
      │
      ▼
┌─────────────────────┐
│  1. CORS Middleware  │  Validates Origin header, sets CORS response headers
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────┐
│  2. Security Headers    │  Sets HSTS, CSP, X-Frame-Options, X-Content-Type-Options
└──────────┬──────────────┘
           │
           ▼
┌──────────────────────────┐
│  3. Request ID Middleware │  Generates X-Request-ID, attaches to request state
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  4. Rate Limit Middleware │  Checks per-IP request rate, returns 429 if exceeded
└──────────┬───────────────┘
           │
           ▼
┌────────────────────────────────┐
│  5. Authentication Middleware  │  Extracts JWT from cookie/header, validates token
└──────────┬─────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  6. Tenant Context Middleware    │  Resolves organization and team from user (Enterprise)
└──────────┬───────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  7. Audit Logging Middleware │  Records request metadata for audit trail (Enterprise)
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────┐
│  8. Request Logging      │  Logs request method, path, duration, status code
└──────────┬───────────────┘
           │
           ▼
      Route Handler
```

## Middleware Details

### 1. CORS Middleware

**Purpose**: Enforces Cross-Origin Resource Sharing policy by validating request origins and setting appropriate response headers.

**Configuration:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://analystbypotomac.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
    max_age=86400,
)
```

**Behavior:**
- Preflight `OPTIONS` requests are handled automatically
- Non-matching origins receive no CORS headers (browser blocks the request)
- `allow_credentials=True` enables cookie-based authentication across origins

### 2. Security Headers Middleware

**Purpose**: Injects security headers into every HTTP response to protect against common web vulnerabilities.

**Headers Set:**

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Content-Security-Policy` | `default-src 'self'; frame-ancestors 'none'` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Cache-Control` | `no-store, no-cache, must-revalidate` |

### 3. Request ID Middleware

**Purpose**: Generates a unique identifier for every request to enable distributed tracing and log correlation.

**Behavior:**
- Generates a UUID v4 for each incoming request
- Attaches the ID to `request.state.request_id`
- Sets the `X-Request-ID` response header
- If the client provides an `X-Request-ID` header, the server-generated ID takes precedence
- The request ID is included in all log entries for the request lifecycle

### 4. Rate Limit Middleware

**Purpose**: Prevents abuse by limiting the number of requests per IP address within a sliding time window.

**Standard Edition:**
- In-memory sliding window counter
- 120 requests per minute per IP
- Returns HTTP 429 with `Retry-After: 60` header when exceeded

**Enterprise Edition:**
- Redis-backed sliding window counter
- Per-IP, per-user, and per-organization limits
- Configurable limits per endpoint category
- Rate limit headers on every response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### 5. Authentication Middleware

**Purpose**: Extracts and validates the JWT token from either the `potomac_session` cookie or the `Authorization: Bearer` header.

**Token Extraction Priority:**
1. `potomac_session` cookie (web clients)
2. `Authorization: Bearer <token>` header (native clients)
3. If neither is present, the request proceeds as unauthenticated

**Validation Steps:**
1. Decode the JWT using the Supabase JWT secret (HS256) or Entra ID JWKS (RS256)
2. Validate the `exp` claim (token expiration)
3. Validate the `aud` claim (audience)
4. Look up the user in `user_profiles` by the `sub` claim
5. Attach the authenticated user to `request.state.user`

**Public Endpoints:** The following endpoints bypass authentication:
- `GET /` (root status)
- `GET /health` (health check)
- `GET /ready` (readiness check)
- `POST /auth/v2/register` (user registration)
- `POST /auth/v2/login` (user login)
- `POST /auth/v2/refresh` (token refresh)

### 6. Tenant Context Middleware (Enterprise)

**Purpose**: Resolves the organization and team context for the authenticated user, enabling multi-tenancy enforcement.

**Behavior:**
1. Reads the `organization_id` from the authenticated user's profile
2. Loads the organization record and its settings
3. Validates that the organization is active and the user's membership is valid
4. Attaches the tenant context to `request.state.organization`
5. Validates feature flags and subscription tier for the requested operation

### 7. Audit Logging Middleware (Enterprise)

**Purpose**: Records metadata about every request for compliance and forensic purposes.

**Captured Data:**
- Request method and path
- Authenticated user ID
- Organization ID
- Client IP address
- User agent string
- Request ID (correlation)
- Response status code
- Request duration in milliseconds
- Timestamp

**Storage:** Audit entries are written asynchronously to the `audit_logs` table to avoid adding latency to the request path.

### 8. Request Logging Middleware

**Purpose**: Logs structured information about every request for operational monitoring.

**Log Format (JSON):**
```json
{
  "timestamp": "2026-03-12T10:00:00.000Z",
  "level": "info",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/api/chat",
  "status": 200,
  "duration_ms": 1250,
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "client_ip": "203.0.113.42",
  "user_agent": "Next.js Middleware"
}
```

## Exception Handling Middleware

In addition to the ordered pipeline, a global exception handler catches all unhandled exceptions:

- **HTTPException**: Returns the appropriate status code and detail message
- **RequestValidationError**: Returns HTTP 422 with field-level error details
- **Unhandled exceptions**: Returns HTTP 500 with a generic error message (details logged server-side, not exposed to clients)

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
