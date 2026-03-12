# ByPotomac SDK — Configuration and Environment Variables

## Configuration Architecture

ByPotomac SDK uses environment variables for all configuration. The configuration is loaded at application startup through the `config.py` module, which provides typed access to all settings. No configuration is hardcoded in the application source code. Secrets are never committed to version control or included in Docker images.

## Environment Variable Reference

### Required Variables

These variables must be set for the SDK to start. The application will fail to initialize if any required variable is missing.

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `SUPABASE_URL` | string | Yes | — | Full URL of the Supabase project (e.g., `https://vekcfcmstpnxubxsaano.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | string | Yes | — | Supabase service role key with full database access (bypasses RLS) |
| `SUPABASE_ANON_KEY` | string | Yes | — | Supabase anonymous key for client-facing operations |
| `ANTHROPIC_API_KEY` | string | Yes | — | Default Anthropic API key for Claude (used when user has no personal key) |
| `OPENAI_API_KEY` | string | Yes | — | OpenAI API key for text-embedding-3-small embeddings |

### Authentication Variables

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `SUPABASE_JWT_SECRET` | string | Yes | — | JWT secret for token verification (from Supabase project settings) |
| `ENCRYPTION_KEY` | string | Yes | — | Base64-encoded 32-byte Fernet key for encrypting API keys at rest |
| `SESSION_COOKIE_NAME` | string | No | `potomac_session` | Name of the httpOnly authentication cookie |
| `SESSION_COOKIE_MAX_AGE` | integer | No | `604800` | Cookie max age in seconds (default: 7 days) |
| `SESSION_COOKIE_SECURE` | boolean | No | `true` | Whether the cookie requires HTTPS |
| `SESSION_COOKIE_SAMESITE` | string | No | `None` | SameSite attribute (None, Lax, Strict) |

### Enterprise Authentication Variables

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `ENTRA_CLIENT_ID` | string | No | — | Microsoft Entra ID application (client) ID |
| `ENTRA_CLIENT_SECRET` | string | No | — | Microsoft Entra ID client secret |
| `ENTRA_TENANT_ID` | string | No | — | Microsoft Entra ID tenant ID |
| `ENTRA_REDIRECT_URI` | string | No | — | OAuth callback URL for Entra ID |
| `SAML_SP_ENTITY_ID` | string | No | — | SAML Service Provider entity ID |
| `SAML_SP_ACS_URL` | string | No | — | SAML Assertion Consumer Service URL |
| `SAML_IDP_METADATA_URL` | string | No | — | SAML Identity Provider metadata URL |

### Server Variables

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `PORT` | integer | No | `8000` | HTTP server port (automatically set by Railway) |
| `HOST` | string | No | `0.0.0.0` | HTTP server bind address |
| `WORKERS` | integer | No | `1` | Number of Uvicorn worker processes |
| `ENVIRONMENT` | string | No | `development` | Runtime environment (development, staging, production) |
| `DEBUG` | boolean | No | `false` | Enable debug mode (disables in production) |
| `LOG_LEVEL` | string | No | `info` | Logging level (debug, info, warning, error, critical) |
| `CORS_ORIGINS` | string | No | See CORS config | Comma-separated list of allowed CORS origins |

### AI and Model Variables

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `DEFAULT_MODEL` | string | No | `claude-sonnet-4-5-20241022` | Default Claude model for conversations |
| `FAST_MODEL` | string | No | `claude-haiku-4-5-20241022` | Fast model for lightweight tasks |
| `MAX_TOKENS` | integer | No | `8192` | Maximum token output for AI responses |
| `TEMPERATURE` | float | No | `0.7` | Default temperature for AI generation |
| `EMBEDDING_MODEL` | string | No | `text-embedding-3-small` | OpenAI embedding model name |
| `EMBEDDING_DIMENSIONS` | integer | No | `1536` | Embedding vector dimensions |

### Storage Variables

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `STORAGE_BUCKET` | string | No | `analyst-files` | Supabase Storage bucket name |
| `MAX_UPLOAD_SIZE` | integer | No | `52428800` | Maximum file upload size in bytes (50MB) |
| `ALLOWED_MIME_TYPES` | string | No | See file config | Comma-separated list of allowed MIME types |

### Redis Variables (Enterprise)

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `REDIS_URL` | string | No | — | Redis connection URL (enables Enterprise caching) |
| `REDIS_SESSION_DB` | integer | No | `0` | Redis database number for sessions |
| `REDIS_CACHE_DB` | integer | No | `1` | Redis database number for application cache |
| `REDIS_QUEUE_DB` | integer | No | `2` | Redis database number for task queue |
| `REDIS_RATELIMIT_DB` | integer | No | `3` | Redis database number for rate limiting |
| `REDIS_MAX_CONNECTIONS` | integer | No | `20` | Maximum connections per Redis pool |
| `REDIS_SOCKET_TIMEOUT` | integer | No | `5` | Socket timeout in seconds |

### Enterprise Infrastructure Variables

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `AZURE_KEYVAULT_URL` | string | No | — | Azure Key Vault URL for envelope encryption |
| `AZURE_KEYVAULT_KEY_NAME` | string | No | `bypotomac-master-key` | Name of the master encryption key in Key Vault |
| `CELERY_BROKER_URL` | string | No | — | Celery broker URL (typically Redis) |
| `CELERY_RESULT_BACKEND` | string | No | — | Celery result backend URL |
| `SENTRY_DSN` | string | No | — | Sentry error tracking DSN |
| `OTEL_EXPORTER_ENDPOINT` | string | No | — | OpenTelemetry OTLP exporter endpoint |
| `PROMETHEUS_ENABLED` | boolean | No | `false` | Enable Prometheus metrics endpoint |

### Rate Limiting Variables

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `RATE_LIMIT_PER_IP` | integer | No | `120` | Requests per minute per IP address |
| `RATE_LIMIT_PER_USER` | integer | No | `600` | Requests per minute per authenticated user (Enterprise) |
| `RATE_LIMIT_PER_ORG` | integer | No | `6000` | Requests per minute per organization (Enterprise) |
| `RATE_LIMIT_CHAT` | integer | No | `30` | Chat requests per minute per user |

## Configuration Loading

The `config.py` module loads configuration at import time using `os.environ.get()` with fallback defaults:

```python
import os

# Core
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# Server
PORT = int(os.environ.get("PORT", "8000"))
HOST = os.environ.get("HOST", "0.0.0.0")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

# Encryption
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY")
```

## Environment File

For local development, create a `.env` file in the project root. This file is listed in `.gitignore` and must never be committed.

```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
ENCRYPTION_KEY=base64-encoded-32-byte-key

# Optional
PORT=8000
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=debug
```

## Railway Configuration

The `railway.json` file configures deployment-specific settings:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

## Docker Configuration

The `Dockerfile` builds the application container:

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Environment variables are injected at runtime, never baked into the image.

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
