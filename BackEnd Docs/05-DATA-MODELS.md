# ByPotomac SDK — Data Models and Schema Reference

## Overview

All data in ByPotomac SDK is stored in PostgreSQL 15 via Supabase. The database uses the `pgvector` extension (v0.5+) for vector similarity search. All tables are protected by Row-Level Security (RLS) policies that enforce user-level and organization-level data isolation. Every table uses UUID primary keys (v4) and includes `created_at` and `updated_at` timestamp columns.

## Entity Relationship Summary

```
user_profiles 1──* chat_sessions 1──* messages
user_profiles 1──* user_files
user_profiles 1──* knowledge_documents 1──* knowledge_chunks
user_profiles 1──* memories
user_profiles 1──* projects
user_profiles 1──* tasks
user_profiles 1──* user_preferences
organizations 1──* teams 1──* memberships *──1 user_profiles
organizations 1──* organization_settings
organizations 1──* api_keys
audit_logs (standalone, partitioned by month)
```

---

## Core Data Models

### user_profiles

Stores user account information. The `id` column references the Supabase Auth `auth.users.id` column. A profile record is automatically created on first login if one does not exist.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | — | PRIMARY KEY, FK → auth.users(id) | User identifier from Supabase Auth |
| `email` | text | No | — | UNIQUE, NOT NULL | User email address |
| `full_name` | text | Yes | NULL | — | User display name |
| `avatar_url` | text | Yes | NULL | — | URL to user avatar image |
| `role` | text | Yes | `'analyst'` | — | Application role (super_admin, org_admin, team_lead, analyst, viewer, auditor, api_service) |
| `anthropic_api_key` | text | Yes | NULL | — | Encrypted Anthropic API key (Fernet, prefixed with `enc:`) |
| `organization_id` | uuid | Yes | NULL | FK → organizations(id) | Associated organization (Enterprise) |
| `department` | text | Yes | NULL | — | User department within organization |
| `is_active` | boolean | No | `true` | — | Whether the account is active |
| `last_login_at` | timestamptz | Yes | NULL | — | Timestamp of last successful login |
| `mfa_enabled` | boolean | No | `false` | — | Whether MFA is enabled |
| `mfa_secret` | text | Yes | NULL | — | Encrypted TOTP secret |
| `preferences` | jsonb | No | `'{}'` | — | User preference key-value store |
| `created_at` | timestamptz | No | `now()` | — | Record creation timestamp |
| `updated_at` | timestamptz | No | `now()` | — | Last update timestamp |

**RLS Policy**: Users can only read and update their own profile. Organization admins can read profiles within their organization. Super admins can read all profiles.

**Indexes**:
- `idx_user_profiles_email` on `email` (unique)
- `idx_user_profiles_org` on `organization_id`

---

### chat_sessions

Stores chat conversation sessions. Each session belongs to a single user and contains an ordered sequence of messages.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | PRIMARY KEY | Session identifier |
| `user_id` | uuid | No | — | FK → user_profiles(id), NOT NULL | Owner user |
| `title` | text | Yes | NULL | — | Session title (auto-generated or user-set) |
| `model` | text | Yes | `'claude-sonnet-4-5-20241022'` | — | Claude model used for this session |
| `system_prompt` | text | Yes | NULL | — | Custom system prompt override |
| `metadata` | jsonb | No | `'{}'` | — | Additional session metadata |
| `is_archived` | boolean | No | `false` | — | Whether the session is archived |
| `created_at` | timestamptz | No | `now()` | — | Session creation timestamp |
| `updated_at` | timestamptz | No | `now()` | — | Last activity timestamp |

**RLS Policy**: Users can only access their own sessions.

**Indexes**:
- `idx_chat_sessions_user_id` on `user_id`
- `idx_chat_sessions_updated` on `updated_at DESC`

---

### messages

Stores individual messages within chat sessions. Messages follow the Vercel AI SDK message format with support for multi-part content.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | text | No | — | PRIMARY KEY | Message identifier (format: `msg-{uuid}`) |
| `session_id` | uuid | No | — | FK → chat_sessions(id) ON DELETE CASCADE, NOT NULL | Parent session |
| `role` | text | No | — | CHECK (role IN ('user', 'assistant', 'system', 'tool')), NOT NULL | Message author role |
| `content` | text | Yes | NULL | — | Plain text message content |
| `parts` | jsonb | No | `'[]'` | — | Structured message parts (text, tool-call, tool-result, file, etc.) |
| `attachments` | jsonb | No | `'[]'` | — | File attachment references |
| `tool_invocations` | jsonb | No | `'[]'` | — | Tool invocation records |
| `metadata` | jsonb | No | `'{}'` | — | Additional message metadata (token counts, model, timing) |
| `created_at` | timestamptz | No | `now()` | — | Message creation timestamp |

**RLS Policy**: Inherits session-level access — users can only access messages in their own sessions.

**Indexes**:
- `idx_messages_session_id` on `session_id`
- `idx_messages_created` on `session_id, created_at`

**Message Parts Schema:**

Each element in the `parts` array follows one of these schemas:

Text Part:
```json
{
  "type": "text",
  "text": "The response text content"
}
```

Tool Invocation Part:
```json
{
  "type": "tool-invocation",
  "toolInvocation": {
    "toolCallId": "tc_001",
    "toolName": "get_market_data",
    "args": {"symbol": "AAPL"},
    "result": {"price": 245.50},
    "state": "result"
  }
}
```

File Part:
```json
{
  "type": "file",
  "data": "base64-encoded-data",
  "mimeType": "application/pdf"
}
```

---

### user_files

Stores metadata for files uploaded by users. The actual file binary is stored in Supabase Storage (`analyst-files` bucket).

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | PRIMARY KEY | File record identifier |
| `user_id` | uuid | No | — | FK → user_profiles(id), NOT NULL | File owner |
| `session_id` | uuid | Yes | NULL | FK → chat_sessions(id) | Associated chat session |
| `name` | text | No | — | NOT NULL | Original filename |
| `size` | bigint | No | — | NOT NULL, CHECK (size > 0 AND size <= 52428800) | File size in bytes (max 50MB) |
| `mime_type` | text | No | — | NOT NULL | MIME type of the file |
| `storage_path` | text | No | — | NOT NULL | Path in Supabase Storage bucket |
| `url` | text | No | — | NOT NULL | Public or signed URL for access |
| `metadata` | jsonb | No | `'{}'` | — | Additional file metadata (dimensions, page count, etc.) |
| `created_at` | timestamptz | No | `now()` | — | Upload timestamp |

**RLS Policy**: Users can only access their own files.

**Indexes**:
- `idx_user_files_user_id` on `user_id`
- `idx_user_files_session` on `session_id`

---

### knowledge_documents

Stores metadata for documents ingested into the knowledge base.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | PRIMARY KEY | Document identifier |
| `user_id` | uuid | No | — | FK → user_profiles(id), NOT NULL | Document owner |
| `name` | text | No | — | NOT NULL | Original document filename |
| `mime_type` | text | No | — | NOT NULL | Document MIME type |
| `size` | bigint | No | — | NOT NULL | Document size in bytes |
| `chunk_count` | integer | No | `0` | — | Number of chunks generated |
| `status` | text | No | `'pending'` | CHECK (status IN ('pending', 'processing', 'processed', 'failed')) | Processing status |
| `embedding_model` | text | No | `'text-embedding-3-small'` | — | Embedding model used |
| `error_message` | text | Yes | NULL | — | Error details if processing failed |
| `metadata` | jsonb | No | `'{}'` | — | Document metadata (page count, language, etc.) |
| `created_at` | timestamptz | No | `now()` | — | Ingestion timestamp |
| `updated_at` | timestamptz | No | `now()` | — | Last status update |

**RLS Policy**: Users can only access their own documents.

**Indexes**:
- `idx_knowledge_docs_user` on `user_id`
- `idx_knowledge_docs_status` on `status`

---

### knowledge_chunks

Stores document chunks with vector embeddings for semantic search.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | PRIMARY KEY | Chunk identifier |
| `document_id` | uuid | No | — | FK → knowledge_documents(id) ON DELETE CASCADE, NOT NULL | Parent document |
| `user_id` | uuid | No | — | FK → user_profiles(id), NOT NULL | Chunk owner (denormalized for RLS) |
| `content` | text | No | — | NOT NULL | Chunk text content |
| `embedding` | vector(1536) | No | — | NOT NULL | OpenAI text-embedding-3-small vector |
| `chunk_index` | integer | No | — | NOT NULL | Position within the document |
| `metadata` | jsonb | No | `'{}'` | — | Chunk metadata (page number, section, etc.) |
| `created_at` | timestamptz | No | `now()` | — | Creation timestamp |

**RLS Policy**: Users can only access chunks from their own documents.

**Indexes**:
- `idx_knowledge_chunks_document` on `document_id`
- `idx_knowledge_chunks_user` on `user_id`
- `idx_knowledge_chunks_embedding` on `embedding` using `ivfflat` with `vector_cosine_ops` (for similarity search)

**Vector Search Function:**

```sql
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    1 - (kc.embedding <=> query_embedding) as similarity,
    kc.metadata
  FROM knowledge_chunks kc
  WHERE (p_user_id IS NULL OR kc.user_id = p_user_id)
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

### memories

Stores persistent user memories extracted from conversations. Memories persist across sessions and are injected into the AI context for personalization.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | PRIMARY KEY | Memory identifier |
| `user_id` | uuid | No | — | FK → user_profiles(id), NOT NULL | Memory owner |
| `content` | text | No | — | NOT NULL | Memory content text |
| `category` | text | Yes | `'general'` | — | Memory category (preference, fact, instruction, general) |
| `source_session_id` | uuid | Yes | NULL | FK → chat_sessions(id) | Session where the memory was extracted |
| `importance` | float | No | `0.5` | CHECK (importance >= 0 AND importance <= 1) | Importance score (0-1) |
| `created_at` | timestamptz | No | `now()` | — | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | — | Last update timestamp |

**RLS Policy**: Users can only access their own memories.

**Indexes**:
- `idx_memories_user` on `user_id`
- `idx_memories_category` on `user_id, category`

---

### projects

Stores user-created projects for organizing research and analysis work.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | PRIMARY KEY | Project identifier |
| `user_id` | uuid | No | — | FK → user_profiles(id), NOT NULL | Project owner |
| `name` | text | No | — | NOT NULL | Project name |
| `description` | text | Yes | NULL | — | Project description |
| `status` | text | No | `'active'` | CHECK (status IN ('active', 'archived', 'completed')) | Project status |
| `metadata` | jsonb | No | `'{}'` | — | Additional project metadata |
| `created_at` | timestamptz | No | `now()` | — | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | — | Last update timestamp |

**RLS Policy**: Users can only access their own projects.

---

### tasks

Stores background task records for tracking async operations (document processing, backtests, etc.).

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | PRIMARY KEY | Task identifier |
| `user_id` | uuid | No | — | FK → user_profiles(id), NOT NULL | Task owner |
| `type` | text | No | — | NOT NULL | Task type (document_processing, backtest, research, export) |
| `status` | text | No | `'pending'` | CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')) | Task status |
| `progress` | integer | No | `0` | CHECK (progress >= 0 AND progress <= 100) | Progress percentage |
| `input` | jsonb | No | `'{}'` | — | Task input parameters |
| `result` | jsonb | Yes | NULL | — | Task result data |
| `error` | text | Yes | NULL | — | Error message if failed |
| `created_at` | timestamptz | No | `now()` | — | Task creation timestamp |
| `started_at` | timestamptz | Yes | NULL | — | Task start timestamp |
| `completed_at` | timestamptz | Yes | NULL | — | Task completion timestamp |

**RLS Policy**: Users can only access their own tasks.

---

### user_preferences

Stores user preference settings as a separate table from the main profile for cleaner separation of concerns.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `user_id` | uuid | No | — | PRIMARY KEY, FK → user_profiles(id) ON DELETE CASCADE | User identifier |
| `theme` | text | No | `'dark'` | CHECK (theme IN ('dark', 'light', 'system')) | UI theme preference |
| `default_model` | text | No | `'claude-sonnet-4-5-20241022'` | — | Default Claude model |
| `streaming_enabled` | boolean | No | `true` | — | Enable token streaming |
| `notifications_enabled` | boolean | No | `true` | — | Enable notifications |
| `language` | text | No | `'en'` | — | Preferred language code |
| `custom_settings` | jsonb | No | `'{}'` | — | Additional custom settings |
| `updated_at` | timestamptz | No | `now()` | — | Last update timestamp |

**RLS Policy**: Users can only access their own preferences.

---

## Enterprise Data Models

The following models are available in the Enterprise Edition of ByPotomac SDK.

### organizations

Stores organization (tenant) records for multi-tenancy.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | PRIMARY KEY | Organization identifier |
| `name` | text | No | — | NOT NULL | Organization display name |
| `slug` | text | No | — | UNIQUE, NOT NULL | URL-safe organization identifier |
| `domain` | text | Yes | NULL | UNIQUE | Organization email domain for auto-association |
| `subscription_tier` | text | No | `'free'` | CHECK (tier IN ('free', 'professional', 'enterprise')) | Subscription level |
| `settings` | jsonb | No | `'{}'` | — | Organization-level settings |
| `features` | jsonb | No | `'{}'` | — | Feature flag overrides |
| `max_users` | integer | No | `10` | — | Maximum allowed users |
| `max_storage_gb` | integer | No | `5` | — | Maximum storage quota |
| `entra_tenant_id` | text | Yes | NULL | UNIQUE | Microsoft Entra tenant ID for SSO |
| `saml_config` | jsonb | Yes | NULL | — | SAML IdP configuration |
| `is_active` | boolean | No | `true` | — | Whether the organization is active |
| `created_at` | timestamptz | No | `now()` | — | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | — | Last update timestamp |

---

### teams

Stores team records within organizations.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | PRIMARY KEY | Team identifier |
| `organization_id` | uuid | No | — | FK → organizations(id), NOT NULL | Parent organization |
| `name` | text | No | — | NOT NULL | Team name |
| `description` | text | Yes | NULL | — | Team description |
| `created_at` | timestamptz | No | `now()` | — | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | — | Last update timestamp |

---

### memberships

Stores user membership in teams with role assignments.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | PRIMARY KEY | Membership identifier |
| `user_id` | uuid | No | — | FK → user_profiles(id), NOT NULL | User |
| `team_id` | uuid | No | — | FK → teams(id), NOT NULL | Team |
| `role` | text | No | `'analyst'` | — | Role within the team |
| `joined_at` | timestamptz | No | `now()` | — | Membership start timestamp |

**Unique Constraint**: `UNIQUE (user_id, team_id)`

---

### audit_logs

Stores immutable audit trail records. Partitioned by month for performance and retention management.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | PRIMARY KEY | Audit log entry identifier |
| `organization_id` | uuid | Yes | NULL | — | Organization context |
| `user_id` | uuid | Yes | NULL | — | Acting user |
| `action` | text | No | — | NOT NULL | Action performed (see Audit Events) |
| `resource_type` | text | No | — | NOT NULL | Resource type affected |
| `resource_id` | text | Yes | NULL | — | Specific resource identifier |
| `details` | jsonb | No | `'{}'` | — | Action-specific details |
| `ip_address` | inet | Yes | NULL | — | Client IP address |
| `user_agent` | text | Yes | NULL | — | Client user agent string |
| `request_id` | text | Yes | NULL | — | Request correlation ID |
| `severity` | text | No | `'info'` | CHECK (severity IN ('info', 'warning', 'critical')) | Event severity |
| `created_at` | timestamptz | No | `now()` | — | Event timestamp |

**Partitioning**: Range partitioned on `created_at` with monthly partitions.

**Retention**: 7 years (84 monthly partitions). Old partitions are detached and archived, never deleted.

**Indexes**:
- `idx_audit_logs_org` on `organization_id, created_at`
- `idx_audit_logs_user` on `user_id, created_at`
- `idx_audit_logs_action` on `action, created_at`
- `idx_audit_logs_resource` on `resource_type, resource_id`

---

### api_keys

Stores API keys for machine-to-machine authentication (Enterprise).

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | PRIMARY KEY | API key record identifier |
| `organization_id` | uuid | No | — | FK → organizations(id), NOT NULL | Owning organization |
| `name` | text | No | — | NOT NULL | Descriptive key name |
| `key_hash` | text | No | — | NOT NULL | SHA-256 hash of the API key |
| `key_prefix` | text | No | — | NOT NULL | First 8 characters for identification |
| `scopes` | text[] | No | `'{}'` | — | Permitted permission scopes |
| `expires_at` | timestamptz | Yes | NULL | — | Key expiration (NULL = no expiry) |
| `last_used_at` | timestamptz | Yes | NULL | — | Last usage timestamp |
| `is_active` | boolean | No | `true` | — | Whether the key is active |
| `created_by` | uuid | No | — | FK → user_profiles(id) | User who created the key |
| `created_at` | timestamptz | No | `now()` | — | Creation timestamp |

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
