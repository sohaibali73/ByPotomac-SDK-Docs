# ByPotomac SDK — Database and Redis Architecture

## PostgreSQL Database

### Overview

ByPotomac SDK uses PostgreSQL 15 hosted on Supabase as its primary data store. All database access goes through the Supabase REST API client (standard edition) or asyncpg direct connections (Enterprise edition). The database uses the `pgvector` extension for vector similarity search and Row-Level Security (RLS) for data isolation.

### Connection Architecture

**Standard Edition:**
- Database access via Supabase Python client (REST API over HTTPS)
- Supabase service role key bypasses RLS for server-side operations
- Connection pooling managed by Supabase infrastructure (PgBouncer)
- No direct PostgreSQL connections from the application

**Enterprise Edition:**
- Direct async connections via asyncpg 0.29
- Connection pool: 10-20 connections (configurable)
- Pool management via asyncpg's built-in connection pool
- Automatic connection health checks and reconnection
- Prepared statements for frequently executed queries

### Enterprise Connection Pool Configuration

```python
pool = await asyncpg.create_pool(
    dsn=DATABASE_URL,
    min_size=5,
    max_size=20,
    max_inactive_connection_lifetime=300,
    command_timeout=30,
    statement_cache_size=100,
)
```

| Parameter | Value | Description |
|---|---|---|
| `min_size` | 5 | Minimum connections maintained |
| `max_size` | 20 | Maximum connections allowed |
| `max_inactive_connection_lifetime` | 300s | Close idle connections after 5 minutes |
| `command_timeout` | 30s | Query timeout |
| `statement_cache_size` | 100 | Prepared statement cache |

### pgvector Configuration

The `pgvector` extension enables vector similarity search for the knowledge base:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Index Strategy:**
- IVFFlat index on `knowledge_chunks.embedding` for approximate nearest neighbor search
- Cosine distance operator (`<=>`) for similarity measurement
- Index lists tuned based on dataset size (recommended: `sqrt(row_count)`)

```sql
CREATE INDEX idx_knowledge_chunks_embedding
ON knowledge_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Migration Strategy

Database migrations are stored as numbered SQL files in `db/migrations/`:

```
db/migrations/
├── 001_initial_schema.sql
├── 002_add_user_profiles.sql
├── 003_chat_sessions.sql
├── 004_messages_with_parts.sql
├── 005_knowledge_base.sql
├── 006_file_storage.sql
├── 007_memories.sql
├── 008_projects.sql
├── 009_tasks.sql
├── 010_user_preferences.sql
├── ...
├── 025_fix_messages_and_sessions.sql
```

Migrations are applied via Python scripts or the Supabase SQL editor. Each migration is idempotent (uses `IF NOT EXISTS` and `IF EXISTS` guards).

### Indexing Strategy

| Table | Index | Columns | Type | Purpose |
|---|---|---|---|---|
| `user_profiles` | `idx_user_profiles_email` | `email` | B-tree (unique) | Login lookup |
| `user_profiles` | `idx_user_profiles_org` | `organization_id` | B-tree | Organization member queries |
| `chat_sessions` | `idx_chat_sessions_user_id` | `user_id` | B-tree | User session listing |
| `chat_sessions` | `idx_chat_sessions_updated` | `updated_at DESC` | B-tree | Recent sessions |
| `messages` | `idx_messages_session_id` | `session_id` | B-tree | Session message listing |
| `messages` | `idx_messages_created` | `session_id, created_at` | B-tree | Ordered message retrieval |
| `knowledge_chunks` | `idx_knowledge_chunks_embedding` | `embedding` | IVFFlat | Vector similarity search |
| `knowledge_chunks` | `idx_knowledge_chunks_user` | `user_id` | B-tree | User document filtering |
| `audit_logs` | `idx_audit_logs_org` | `organization_id, created_at` | B-tree | Organization audit queries |
| `audit_logs` | `idx_audit_logs_action` | `action, created_at` | B-tree | Action-based filtering |

### Transaction Patterns

**Read Operations:** Single query, no explicit transaction needed. Supabase client handles atomicity.

**Write Operations:** Multi-step writes use the Supabase client's built-in transaction support or explicit SQL transactions via asyncpg:

```python
async with pool.acquire() as conn:
    async with conn.transaction():
        await conn.execute("INSERT INTO chat_sessions ...")
        await conn.execute("INSERT INTO messages ...")
```

---

## Redis Architecture (Enterprise)

### Overview

The Enterprise Edition uses Redis 7+ for four distinct purposes, each isolated to a separate logical database:

| Database | Purpose | Eviction Policy |
|---|---|---|
| DB 0 | Session storage | `volatile-lru` |
| DB 1 | Application cache | `allkeys-lru` |
| DB 2 | Task queue (Celery broker) | `noeviction` |
| DB 3 | Rate limiting counters | `volatile-ttl` |

### Session Storage (DB 0)

Stores server-side session data for authenticated users:

- **Key format**: `session:{user_id}:{session_id}`
- **Value**: JSON-serialized session data
- **TTL**: 3600 seconds (1 hour, matching JWT expiry)
- **Eviction**: `volatile-lru` — evicts least recently used keys with TTL set

### Application Cache (DB 1)

Caches frequently accessed data to reduce database load:

| Cache Key Pattern | Data | TTL | Description |
|---|---|---|---|
| `user:{user_id}` | User profile | 300s | User profile data |
| `org:{org_id}` | Organization settings | 600s | Organization configuration |
| `org:{org_id}:features` | Feature flags | 300s | Feature flag state |
| `quote:{symbol}` | Stock quote | 60s | Market data cache |
| `embedding:{hash}` | Vector embedding | 3600s | Computed embeddings |

**Cache-aside pattern:**
```python
async def get_user_profile(user_id: str):
    cached = await redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)
    profile = await db.fetch_user(user_id)
    await redis.setex(f"user:{user_id}", 300, json.dumps(profile))
    return profile
```

### Task Queue (DB 2)

Celery 5.4 uses Redis DB 2 as its message broker for background task processing:

- **Queue name**: `bypotomac-tasks`
- **Serializer**: JSON
- **Result backend**: Redis DB 2
- **Task acknowledgment**: Late acknowledgment (after execution)
- **Retry policy**: 3 retries with exponential backoff

### Rate Limiting (DB 3)

Redis DB 3 stores sliding window rate limit counters:

- **Key format**: `ratelimit:{scope}:{identifier}:{window}`
- **Value**: Request count (integer)
- **TTL**: Window duration (60 seconds)
- **Eviction**: `volatile-ttl` — evicts keys closest to expiration

### Redis Connection Configuration

```python
import redis.asyncio as aioredis

redis_sessions = aioredis.from_url(REDIS_URL, db=0, max_connections=20, socket_timeout=5)
redis_cache = aioredis.from_url(REDIS_URL, db=1, max_connections=20, socket_timeout=5)
redis_queue = aioredis.from_url(REDIS_URL, db=2, max_connections=10, socket_timeout=5)
redis_ratelimit = aioredis.from_url(REDIS_URL, db=3, max_connections=10, socket_timeout=5)
```

### Redis Production Configuration

| Parameter | Recommended Value | Description |
|---|---|---|
| `maxmemory` | 256MB - 4GB | Based on deployment size |
| `maxmemory-policy` | Per-database (see above) | Eviction behavior |
| `appendonly` | `yes` | Enable AOF persistence |
| `appendfsync` | `everysec` | Sync AOF every second |
| `tcp-keepalive` | `300` | TCP keepalive interval |
| `timeout` | `0` | No idle timeout |

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
