# ByPotomac SDK — Full API Reference

## Base URL

All API endpoints are relative to the ByPotomac SDK base URL:

```
Production: https://potomac-analyst-workbench-production.up.railway.app
Local:      http://localhost:8000
```

## Authentication

Most endpoints require authentication. The SDK accepts two forms of authentication:

- **Cookie**: `potomac_session` httpOnly cookie containing the JWT access token (used by the web client)
- **Bearer Token**: `Authorization: Bearer <access_token>` header (used by native clients)

Endpoints that do not require authentication are marked with **Public** in their descriptions.

## Common Response Headers

| Header | Description |
|---|---|
| `Content-Type` | `application/json` for REST responses, `text/event-stream` for SSE |
| `X-Request-ID` | Unique request identifier for tracing |
| `Access-Control-Allow-Origin` | CORS origin from whitelist |
| `Access-Control-Allow-Credentials` | `true` for cookie-based auth |

## Common Error Response Format

All error responses follow this schema:

```json
{
  "detail": "Human-readable error message"
}
```

For validation errors (422):

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Error description",
      "type": "value_error"
    }
  ]
}
```

---

## Health and Status

### GET /

Returns the SDK status and version information. **Public.**

**Response 200:**

```json
{
  "name": "Potomac Analyst Workbench API",
  "version": "1.3.8",
  "status": "running",
  "loaded_routers": [
    "auth_v2",
    "platform_core",
    "analyst_chat",
    "market_data",
    "backtest",
    "afl",
    "researcher",
    "skills"
  ]
}
```

### GET /health

Health check endpoint. Returns 200 if the application is operational. **Public.**

**Response 200:**

```json
{
  "status": "healthy",
  "timestamp": "2026-03-12T10:00:00Z"
}
```

---

## Authentication Endpoints

All authentication endpoints are prefixed with `/auth/v2`.

### POST /auth/v2/register

Creates a new user account via Supabase Auth and provisions a user profile record.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | User email address |
| `password` | string | Yes | Password (minimum 8 characters) |
| `full_name` | string | No | User display name |

**Request Example:**

```http
POST /auth/v2/register
Content-Type: application/json

{
  "email": "analyst@potomac.com",
  "password": "SecurePass123!",
  "full_name": "Jane Smith"
}
```

**Response 200:**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "analyst@potomac.com",
    "full_name": "Jane Smith",
    "created_at": "2026-03-12T10:00:00Z"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.refresh-token-string",
    "expires_in": 3600,
    "token_type": "bearer"
  }
}
```

**Error Responses:**

| Status | Description |
|---|---|
| 400 | Email already registered |
| 422 | Validation error (missing or invalid fields) |
| 500 | Internal server error |

---

### POST /auth/v2/login

Authenticates a user with email and password. Sets the `potomac_session` httpOnly cookie for web clients and returns tokens in the response body for native clients.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | User email address |
| `password` | string | Yes | User password |

**Request Example:**

```http
POST /auth/v2/login
Content-Type: application/json

{
  "email": "analyst@potomac.com",
  "password": "SecurePass123!"
}
```

**Response 200:**

The response sets an httpOnly cookie:
```
Set-Cookie: potomac_session=<access_token>; HttpOnly; Secure; SameSite=None; Max-Age=604800; Path=/
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v1.refresh-token-string",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "analyst@potomac.com"
  }
}
```

**Error Responses:**

| Status | Description |
|---|---|
| 401 | Invalid credentials |
| 422 | Validation error |
| 500 | Internal server error |

---

### POST /auth/v2/logout

Signs out the current user. Invalidates the Supabase session server-side and clears the `potomac_session` cookie.

**Request Example:**

```http
POST /auth/v2/logout
Cookie: potomac_session=<access_token>
```

**Response 200:**

The response clears the cookie:
```
Set-Cookie: potomac_session=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/
```

```json
{
  "message": "Logged out successfully"
}
```

---

### GET /auth/v2/me

Returns the authenticated user's profile. If a profile record does not exist in the `user_profiles` table, one is created automatically.

**Request Example:**

```http
GET /auth/v2/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "analyst@potomac.com",
  "full_name": "Jane Smith",
  "avatar_url": null,
  "role": "analyst",
  "preferences": {},
  "api_key_configured": true,
  "created_at": "2026-03-12T10:00:00Z",
  "updated_at": "2026-03-12T10:00:00Z"
}
```

**Error Responses:**

| Status | Description |
|---|---|
| 401 | Not authenticated or token expired |
| 500 | Internal server error |

---

### PUT /auth/v2/api-key

Stores or updates the user's Anthropic API key. The key is encrypted with Fernet symmetric encryption before storage. The encrypted value is prefixed with `enc:` to indicate encryption at rest.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `api_key` | string | Yes | Anthropic API key starting with `sk-ant-` |

**Request Example:**

```http
PUT /auth/v2/api-key
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "api_key": "sk-ant-api03-abcdef..."
}
```

**Response 200:**

```json
{
  "message": "API key updated successfully"
}
```

**Error Responses:**

| Status | Description |
|---|---|
| 401 | Not authenticated |
| 422 | Invalid API key format |

---

### GET /auth/v2/api-key/status

Returns whether the user has a configured Anthropic API key. Does not return the key itself.

**Request Example:**

```http
GET /auth/v2/api-key/status
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "configured": true
}
```

---

### POST /auth/v2/refresh

Refreshes an expired access token using a valid refresh token.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `refresh_token` | string | Yes | The refresh token from login |

**Request Example:**

```http
POST /auth/v2/refresh
Content-Type: application/json

{
  "refresh_token": "v1.refresh-token-string"
}
```

**Response 200:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v1.new-refresh-token-string",
  "expires_in": 3600,
  "token_type": "bearer"
}
```

**Error Responses:**

| Status | Description |
|---|---|
| 401 | Invalid or expired refresh token |

---

## Session Endpoints

All session endpoints are under the platform router. Sessions represent chat conversations.

### GET /sessions

Returns all chat sessions for the authenticated user, ordered by most recently updated.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | integer | No | 50 | Maximum number of sessions to return |
| `offset` | integer | No | 0 | Pagination offset |

**Request Example:**

```http
GET /sessions?limit=20&offset=0
Authorization: Bearer <access_token>
```

**Response 200:**

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Q4 Earnings Analysis",
    "model": "claude-sonnet-4-5-20241022",
    "system_prompt": null,
    "created_at": "2026-03-12T10:00:00Z",
    "updated_at": "2026-03-12T11:30:00Z"
  }
]
```

---

### POST /sessions

Creates a new chat session.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | No | Session title (auto-generated if omitted) |
| `model` | string | No | Claude model identifier |
| `system_prompt` | string | No | Custom system prompt |

**Request Example:**

```http
POST /sessions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Portfolio Rebalancing Research"
}
```

**Response 200:**

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Portfolio Rebalancing Research",
  "model": "claude-sonnet-4-5-20241022",
  "system_prompt": null,
  "created_at": "2026-03-12T12:00:00Z",
  "updated_at": "2026-03-12T12:00:00Z"
}
```

---

### GET /sessions/{session_id}

Returns a specific session with its complete message history.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `session_id` | UUID | The session identifier |

**Request Example:**

```http
GET /sessions/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Q4 Earnings Analysis",
  "model": "claude-sonnet-4-5-20241022",
  "messages": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "Analyze AAPL Q4 2025 earnings",
      "parts": [],
      "created_at": "2026-03-12T10:00:00Z"
    },
    {
      "id": "msg-002",
      "role": "assistant",
      "content": "Based on the latest SEC filings...",
      "parts": [
        {
          "type": "text",
          "text": "Based on the latest SEC filings..."
        }
      ],
      "created_at": "2026-03-12T10:00:05Z"
    }
  ],
  "created_at": "2026-03-12T10:00:00Z",
  "updated_at": "2026-03-12T10:00:05Z"
}
```

**Error Responses:**

| Status | Description |
|---|---|
| 404 | Session not found or not owned by user |

---

### PUT /sessions/{session_id}

Updates session metadata (title, model, system prompt).

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `session_id` | UUID | The session identifier |

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | No | New session title |
| `model` | string | No | New model identifier |
| `system_prompt` | string | No | New system prompt |

**Request Example:**

```http
PUT /sessions/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Q4 2025 Earnings Deep Dive"
}
```

**Response 200:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Q4 2025 Earnings Deep Dive",
  "updated_at": "2026-03-12T12:30:00Z"
}
```

---

### DELETE /sessions/{session_id}

Deletes a session and all associated messages.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `session_id` | UUID | The session identifier |

**Request Example:**

```http
DELETE /sessions/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "message": "Session deleted"
}
```

---

## Chat and AI Endpoints

### POST /api/chat

The primary AI conversation endpoint. Sends a message to Claude and streams the response via Server-Sent Events. This endpoint handles tool orchestration, context injection, knowledge retrieval, and multi-turn conversation management.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `messages` | array | Yes | Array of message objects with `role` and `content` |
| `id` | string | No | Session ID to continue an existing conversation |
| `model` | string | No | Model override (default: `claude-sonnet-4-5-20241022`) |
| `config` | object | No | Configuration overrides |

Each message object:

| Field | Type | Required | Description |
|---|---|---|---|
| `role` | string | Yes | `user` or `assistant` |
| `content` | string | Yes | Message text content |
| `parts` | array | No | Structured content parts |
| `experimental_attachments` | array | No | File attachments |

**Request Example:**

```http
POST /api/chat
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "What were AAPL's revenue figures for Q4 2025?"
    }
  ],
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response: Server-Sent Events Stream (200)**

The response is a `text/event-stream` using the Vercel AI SDK Data Stream Protocol. Each line is prefixed with a type code:

| Prefix | Type | Description |
|---|---|---|
| `0:` | Text | Token text chunk |
| `2:` | Data | Structured data payload (JSON array) |
| `9:` | Tool Call Begin | Start of a tool invocation |
| `a:` | Tool Call Delta | Tool call argument streaming |
| `b:` | Tool Call End | Tool call completion |
| `c:` | Tool Result | Tool execution result |
| `e:` | Finish | Stream completion with reason and usage |
| `d:` | Finish Step | Step completion |
| `3:` | Error | Error message |

**Example SSE Stream:**

```
0:"Based on "
0:"Apple's Q4 2025 "
0:"earnings report, "
9:{"toolCallId":"tc_001","toolName":"get_market_data"}
a:{"toolCallId":"tc_001","argsTextDelta":"{\"symbol\":\"AAPL\"}"}
b:{"toolCallId":"tc_001"}
c:{"toolCallId":"tc_001","result":{"symbol":"AAPL","price":245.50,"revenue":"94.9B"}}
0:"Apple reported revenue of $94.9 billion..."
2:[{"session_id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","title":"AAPL Q4 Analysis"}]
d:{"finishReason":"stop","usage":{"promptTokens":1250,"completionTokens":340},"isContinued":false}
e:{"finishReason":"stop","usage":{"promptTokens":1250,"completionTokens":340}}
```

**Error Responses:**

| Status | Description |
|---|---|
| 401 | Not authenticated |
| 429 | Rate limit exceeded |
| 500 | AI engine error |

---

### POST /chat/messages

Platform-level chat message endpoint. Sends a message and receives a response with full message persistence.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `session_id` | string | Yes | Session ID |
| `content` | string | Yes | Message content |
| `role` | string | No | Message role (default: `user`) |
| `attachments` | array | No | File attachment references |

**Request Example:**

```http
POST /chat/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "content": "Summarize the portfolio performance"
}
```

**Response 200:**

```json
{
  "id": "msg-003",
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "role": "assistant",
  "content": "Based on the current portfolio allocation...",
  "parts": [
    {
      "type": "text",
      "text": "Based on the current portfolio allocation..."
    }
  ],
  "created_at": "2026-03-12T12:00:00Z"
}
```

---

## File Endpoints

### POST /files/upload

Uploads a file to Supabase Storage. Files are stored in the `analyst-files` bucket with a user-specific path prefix.

**Request: Multipart Form Data**

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | file | Yes | The file to upload (max 50MB) |
| `session_id` | string | No | Associate file with a session |

**Supported Formats:** PDF, DOCX, XLSX, CSV, TXT, MD, PNG, JPG, JPEG, GIF, SVG

**Request Example:**

```http
POST /files/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data; boundary=----FormBoundary

------FormBoundary
Content-Disposition: form-data; name="file"; filename="q4_report.pdf"
Content-Type: application/pdf

<binary file data>
------FormBoundary--
```

**Response 200:**

```json
{
  "id": "file-001",
  "name": "q4_report.pdf",
  "size": 2048576,
  "mime_type": "application/pdf",
  "url": "https://vekcfcmstpnxubxsaano.supabase.co/storage/v1/object/public/analyst-files/user_id/q4_report.pdf",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-03-12T12:00:00Z"
}
```

**Error Responses:**

| Status | Description |
|---|---|
| 400 | File too large (>50MB) or unsupported format |
| 401 | Not authenticated |

---

### GET /files

Returns all files uploaded by the authenticated user.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `session_id` | string | No | None | Filter files by session |
| `limit` | integer | No | 50 | Maximum results |
| `offset` | integer | No | 0 | Pagination offset |

**Request Example:**

```http
GET /files?session_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <access_token>
```

**Response 200:**

```json
[
  {
    "id": "file-001",
    "name": "q4_report.pdf",
    "size": 2048576,
    "mime_type": "application/pdf",
    "url": "https://vekcfcmstpnxubxsaano.supabase.co/storage/v1/object/public/analyst-files/user_id/q4_report.pdf",
    "created_at": "2026-03-12T12:00:00Z"
  }
]
```

---

### DELETE /files/{file_id}

Deletes a file from storage and removes its database record.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `file_id` | string | The file identifier |

**Request Example:**

```http
DELETE /files/file-001
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "message": "File deleted"
}
```

---

## Knowledge Base Endpoints

### POST /knowledge/upload

Ingests a document into the knowledge base. The document is parsed, chunked, embedded using OpenAI text-embedding-3-small, and stored as vectors in pgvector for semantic search.

**Request: Multipart Form Data**

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | file | Yes | Document to ingest |
| `session_id` | string | No | Associate with a session |
| `metadata` | string | No | JSON metadata string |

**Request Example:**

```http
POST /knowledge/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file=@annual_report_2025.pdf
```

**Response 200:**

```json
{
  "id": "kb-001",
  "name": "annual_report_2025.pdf",
  "chunks": 47,
  "status": "processed",
  "embedding_model": "text-embedding-3-small",
  "dimensions": 1536,
  "created_at": "2026-03-12T12:00:00Z"
}
```

---

### POST /knowledge/search

Performs semantic search across the knowledge base using vector similarity.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `query` | string | Yes | Natural language search query |
| `limit` | integer | No | Maximum results (default: 5) |
| `threshold` | float | No | Minimum similarity threshold (default: 0.7) |
| `session_id` | string | No | Restrict search to session documents |

**Request Example:**

```http
POST /knowledge/search
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "query": "What was the revenue growth rate in 2025?",
  "limit": 5,
  "threshold": 0.75
}
```

**Response 200:**

```json
{
  "results": [
    {
      "id": "chunk-001",
      "content": "Revenue grew 12.3% year-over-year to $94.9 billion in fiscal Q4 2025...",
      "similarity": 0.92,
      "metadata": {
        "source": "annual_report_2025.pdf",
        "page": 15,
        "chunk_index": 23
      }
    }
  ],
  "query": "What was the revenue growth rate in 2025?",
  "total_results": 1
}
```

---

### GET /knowledge/documents

Returns all documents in the user's knowledge base.

**Request Example:**

```http
GET /knowledge/documents
Authorization: Bearer <access_token>
```

**Response 200:**

```json
[
  {
    "id": "kb-001",
    "name": "annual_report_2025.pdf",
    "chunks": 47,
    "status": "processed",
    "created_at": "2026-03-12T12:00:00Z"
  }
]
```

---

### DELETE /knowledge/documents/{document_id}

Deletes a document and all its vector embeddings from the knowledge base.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `document_id` | string | The knowledge base document identifier |

**Response 200:**

```json
{
  "message": "Document and embeddings deleted"
}
```

---

## Memory Endpoints

### GET /memories

Returns conversation memories for the authenticated user. Memories are extracted insights and facts from conversations that persist across sessions.

**Request Example:**

```http
GET /memories
Authorization: Bearer <access_token>
```

**Response 200:**

```json
[
  {
    "id": "mem-001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "User tracks a concentrated portfolio of 15-20 large-cap technology stocks",
    "category": "preference",
    "created_at": "2026-03-10T08:00:00Z"
  }
]
```

---

### POST /memories

Creates a new memory entry.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | string | Yes | Memory content text |
| `category` | string | No | Memory category (preference, fact, instruction) |

**Response 200:**

```json
{
  "id": "mem-002",
  "content": "User prefers analysis in bullet-point format",
  "category": "preference",
  "created_at": "2026-03-12T12:00:00Z"
}
```

---

### DELETE /memories/{memory_id}

Deletes a specific memory.

**Response 200:**

```json
{
  "message": "Memory deleted"
}
```

---

## Preference Endpoints

### GET /preferences

Returns user preferences for the authenticated user.

**Request Example:**

```http
GET /preferences
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "theme": "dark",
  "default_model": "claude-sonnet-4-5-20241022",
  "streaming_enabled": true,
  "notifications_enabled": true,
  "language": "en"
}
```

---

### PUT /preferences

Updates user preferences.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `theme` | string | No | UI theme (dark, light, system) |
| `default_model` | string | No | Default Claude model |
| `streaming_enabled` | boolean | No | Enable streaming responses |
| `notifications_enabled` | boolean | No | Enable notifications |
| `language` | string | No | Language code |

**Response 200:**

```json
{
  "message": "Preferences updated",
  "preferences": {
    "theme": "dark",
    "default_model": "claude-sonnet-4-5-20241022",
    "streaming_enabled": true
  }
}
```

---

## Project Endpoints

### GET /projects

Returns all projects for the authenticated user.

**Request Example:**

```http
GET /projects
Authorization: Bearer <access_token>
```

**Response 200:**

```json
[
  {
    "id": "proj-001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Q1 2026 Research",
    "description": "Quarterly research project for portfolio review",
    "status": "active",
    "created_at": "2026-01-15T08:00:00Z",
    "updated_at": "2026-03-12T12:00:00Z"
  }
]
```

---

### POST /projects

Creates a new project.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Project name |
| `description` | string | No | Project description |

**Response 200:**

```json
{
  "id": "proj-002",
  "name": "Sector Rotation Study",
  "description": "Analysis of sector rotation patterns for 2026",
  "status": "active",
  "created_at": "2026-03-12T12:00:00Z"
}
```

---

### PUT /projects/{project_id}

Updates a project.

**Response 200:**

```json
{
  "id": "proj-002",
  "name": "Sector Rotation Study - Updated",
  "updated_at": "2026-03-12T13:00:00Z"
}
```

---

### DELETE /projects/{project_id}

Deletes a project.

**Response 200:**

```json
{
  "message": "Project deleted"
}
```

---

## Task Endpoints

### GET /tasks

Returns background tasks for the authenticated user.

**Request Example:**

```http
GET /tasks
Authorization: Bearer <access_token>
```

**Response 200:**

```json
[
  {
    "id": "task-001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "document_processing",
    "status": "completed",
    "progress": 100,
    "result": {"chunks": 47, "document_id": "kb-001"},
    "created_at": "2026-03-12T12:00:00Z",
    "completed_at": "2026-03-12T12:01:30Z"
  }
]
```

---

### GET /tasks/{task_id}

Returns the status and result of a specific task.

**Response 200:**

```json
{
  "id": "task-001",
  "type": "document_processing",
  "status": "completed",
  "progress": 100,
  "result": {"chunks": 47},
  "created_at": "2026-03-12T12:00:00Z",
  "completed_at": "2026-03-12T12:01:30Z"
}
```

---

## Artifact Endpoints

### POST /artifacts/parse

Parses structured data from text or documents. Extracts tables, code blocks, charts, and other structured content.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | string | Yes | Raw content to parse |
| `type` | string | No | Expected artifact type (table, code, chart) |

**Request Example:**

```http
POST /artifacts/parse
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "| Symbol | Price | Change |\n|--------|-------|--------|\n| AAPL | 245.50 | +2.3% |",
  "type": "table"
}
```

**Response 200:**

```json
{
  "artifacts": [
    {
      "type": "table",
      "data": {
        "headers": ["Symbol", "Price", "Change"],
        "rows": [
          ["AAPL", "245.50", "+2.3%"]
        ]
      },
      "raw": "| Symbol | Price | Change |..."
    }
  ]
}
```

---

## Market Data Endpoints

All market data endpoints are under `/api/v1/market-data`.

### GET /api/v1/market-data/quote/{symbol}

Returns real-time quote data for a stock symbol.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `symbol` | string | Stock ticker symbol (e.g., AAPL, MSFT) |

**Request Example:**

```http
GET /api/v1/market-data/quote/AAPL
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "symbol": "AAPL",
  "price": 245.50,
  "change": 5.23,
  "change_percent": 2.18,
  "volume": 52340000,
  "market_cap": 3780000000000,
  "pe_ratio": 32.5,
  "high_52w": 260.10,
  "low_52w": 168.49,
  "timestamp": "2026-03-12T16:00:00Z"
}
```

---

### GET /api/v1/market-data/historical/{symbol}

Returns historical price data for a stock symbol.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `symbol` | string | Stock ticker symbol |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `period` | string | No | 1y | Time period (1d, 5d, 1m, 3m, 6m, 1y, 5y) |
| `interval` | string | No | 1d | Data interval (1m, 5m, 15m, 1h, 1d, 1w, 1mo) |

**Request Example:**

```http
GET /api/v1/market-data/historical/AAPL?period=3m&interval=1d
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "symbol": "AAPL",
  "period": "3m",
  "interval": "1d",
  "data": [
    {
      "date": "2026-01-02",
      "open": 220.50,
      "high": 225.30,
      "low": 219.80,
      "close": 224.90,
      "volume": 45230000
    }
  ]
}
```

---

### GET /api/v1/market-data/search

Searches for stock symbols by name or ticker.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `q` | string | Yes | Search query |
| `limit` | integer | No | Maximum results (default: 10) |

**Request Example:**

```http
GET /api/v1/market-data/search?q=Apple&limit=5
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "results": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "exchange": "NASDAQ",
      "type": "equity"
    }
  ]
}
```

---

## Backtest Endpoints

### POST /api/v1/backtest/run

Executes a portfolio backtest with specified parameters.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `portfolio` | array | Yes | Array of position objects with symbol and weight |
| `start_date` | string | Yes | Backtest start date (ISO format) |
| `end_date` | string | Yes | Backtest end date (ISO format) |
| `initial_capital` | number | No | Starting capital (default: 100000) |
| `benchmark` | string | No | Benchmark symbol (default: SPY) |
| `rebalance_frequency` | string | No | Rebalance period (daily, weekly, monthly, quarterly) |

**Request Example:**

```http
POST /api/v1/backtest/run
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "portfolio": [
    {"symbol": "AAPL", "weight": 0.30},
    {"symbol": "MSFT", "weight": 0.30},
    {"symbol": "GOOGL", "weight": 0.20},
    {"symbol": "AMZN", "weight": 0.20}
  ],
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "initial_capital": 1000000,
  "benchmark": "SPY",
  "rebalance_frequency": "quarterly"
}
```

**Response 200:**

```json
{
  "id": "bt-001",
  "status": "completed",
  "portfolio_return": 0.2834,
  "benchmark_return": 0.2105,
  "alpha": 0.0729,
  "sharpe_ratio": 1.45,
  "max_drawdown": -0.0823,
  "volatility": 0.1952,
  "daily_returns": [...],
  "equity_curve": [...],
  "created_at": "2026-03-12T12:00:00Z"
}
```

---

### GET /api/v1/backtest/results/{backtest_id}

Returns the results of a previously executed backtest.

**Response 200:**

Returns the same structure as the backtest run response.

---

## AFL (Analyst Formula Language) Endpoints

### POST /api/v1/afl/validate

Validates an AFL expression without executing it.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `expression` | string | Yes | AFL expression to validate |

**Request Example:**

```http
POST /api/v1/afl/validate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "expression": "SMA(CLOSE, 20) > SMA(CLOSE, 50)"
}
```

**Response 200:**

```json
{
  "valid": true,
  "expression": "SMA(CLOSE, 20) > SMA(CLOSE, 50)",
  "parsed_functions": ["SMA"],
  "parsed_variables": ["CLOSE"],
  "warnings": []
}
```

---

### POST /api/v1/afl/execute

Executes an AFL expression against market data.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `expression` | string | Yes | AFL expression to execute |
| `symbol` | string | Yes | Target symbol |
| `period` | string | No | Data period (default: 1y) |

**Response 200:**

```json
{
  "expression": "SMA(CLOSE, 20) > SMA(CLOSE, 50)",
  "symbol": "AAPL",
  "result": true,
  "series_data": [...],
  "execution_time_ms": 45
}
```

---

## Research Endpoints

### POST /api/v1/researcher/search

Performs a comprehensive research search using SEC EDGAR filings and other data sources.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `query` | string | Yes | Research query |
| `sources` | array | No | Data sources to search (edgar, market_data, knowledge_base) |
| `filing_types` | array | No | SEC filing types (10-K, 10-Q, 8-K, etc.) |
| `date_range` | object | No | Start and end dates for search |

**Request Example:**

```http
POST /api/v1/researcher/search
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "query": "Apple Inc capital expenditure trends",
  "sources": ["edgar"],
  "filing_types": ["10-K", "10-Q"],
  "date_range": {
    "start": "2024-01-01",
    "end": "2025-12-31"
  }
}
```

**Response 200:**

```json
{
  "query": "Apple Inc capital expenditure trends",
  "results": [
    {
      "source": "edgar",
      "filing_type": "10-K",
      "company": "Apple Inc",
      "cik": "0000320193",
      "filing_date": "2025-10-31",
      "excerpt": "Capital expenditures were $10.7 billion...",
      "url": "https://www.sec.gov/Archives/edgar/data/320193/..."
    }
  ],
  "total_results": 12
}
```

---

## Skills Endpoints

### GET /api/v1/skills

Returns the list of available computational skills.

**Request Example:**

```http
GET /api/v1/skills
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "skills": [
    {
      "id": "risk_metrics",
      "name": "Risk Metrics Calculator",
      "description": "Calculates VaR, CVaR, beta, and other risk metrics",
      "parameters": [
        {"name": "portfolio", "type": "array", "required": true},
        {"name": "confidence_level", "type": "float", "required": false, "default": 0.95}
      ]
    },
    {
      "id": "correlation_matrix",
      "name": "Correlation Matrix",
      "description": "Computes pairwise correlation between assets",
      "parameters": [
        {"name": "symbols", "type": "array", "required": true},
        {"name": "period", "type": "string", "required": false, "default": "1y"}
      ]
    }
  ]
}
```

---

### POST /api/v1/skills/{skill_id}/execute

Executes a specific computational skill.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `skill_id` | string | The skill identifier |

**Request Body:**

Varies by skill. Parameters are defined in the skill's parameter list.

**Request Example:**

```http
POST /api/v1/skills/risk_metrics/execute
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "portfolio": [
    {"symbol": "AAPL", "weight": 0.5},
    {"symbol": "MSFT", "weight": 0.5}
  ],
  "confidence_level": 0.99
}
```

**Response 200:**

```json
{
  "skill_id": "risk_metrics",
  "result": {
    "var_99": -0.0312,
    "cvar_99": -0.0456,
    "beta": 1.12,
    "sharpe_ratio": 1.34,
    "sortino_ratio": 1.89
  },
  "execution_time_ms": 230
}
```

---

## Admin and Diagnostic Endpoints

### GET /admin/health/system

Returns detailed system health information including database connectivity, external service status, and resource utilization. Requires admin authentication.

**Request Example:**

```http
GET /admin/health/system
Authorization: Bearer <admin_access_token>
```

**Response 200:**

```json
{
  "status": "healthy",
  "uptime_seconds": 86400,
  "database": {
    "connected": true,
    "latency_ms": 12
  },
  "services": {
    "anthropic": "reachable",
    "openai": "reachable",
    "supabase_storage": "reachable"
  },
  "memory_usage_mb": 256,
  "active_connections": 42
}
```

---

## Rate Limiting

All API endpoints are subject to rate limiting:

| Scope | Limit | Window |
|---|---|---|
| Per IP | 120 requests | 1 minute |

When rate limited, the API returns:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "detail": "Rate limit exceeded. Try again in 60 seconds."
}
```

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
