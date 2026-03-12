# ByPotomac SDK — Observability and Monitoring

## Observability Architecture

ByPotomac SDK implements a comprehensive observability stack built on three pillars: structured logging, distributed tracing, and metrics collection. Every request that flows through the system produces correlated telemetry data that can be used for debugging, performance analysis, and alerting.

## Health Check Endpoints

### GET /health

Basic health check that returns 200 when the application process is running. Used by load balancers and container orchestrators to determine if the process is alive.

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-12T10:00:00Z"
}
```

### GET /ready (Enterprise)

Readiness check that validates connectivity to all downstream dependencies. Returns 200 only when the application can serve requests successfully.

**Response 200:**
```json
{
  "status": "ready",
  "checks": {
    "database": {"status": "connected", "latency_ms": 12},
    "redis": {"status": "connected", "latency_ms": 3},
    "anthropic": {"status": "reachable"},
    "openai": {"status": "reachable"}
  },
  "timestamp": "2026-03-12T10:00:00Z"
}
```

**Response 503:**
```json
{
  "status": "not_ready",
  "checks": {
    "database": {"status": "connected", "latency_ms": 12},
    "redis": {"status": "error", "error": "Connection refused"}
  }
}
```

### GET /admin/health/system

Detailed system health information for administrators. Requires admin authentication.

**Response 200:**
```json
{
  "status": "healthy",
  "uptime_seconds": 86400,
  "version": "2.0.0",
  "environment": "production",
  "database": {
    "connected": true,
    "latency_ms": 12,
    "pool_size": 20,
    "active_connections": 5
  },
  "redis": {
    "connected": true,
    "latency_ms": 3,
    "memory_used_mb": 128,
    "connected_clients": 10
  },
  "services": {
    "anthropic": "reachable",
    "openai": "reachable",
    "supabase_storage": "reachable"
  },
  "process": {
    "memory_usage_mb": 256,
    "cpu_percent": 12.5,
    "active_requests": 42,
    "workers": 4
  }
}
```

## Structured Logging

All log entries are emitted as structured JSON using the `structlog` library (Enterprise) or Python's built-in `logging` module (Standard).

### Log Entry Schema

| Field | Type | Description |
|---|---|---|
| `timestamp` | string (ISO 8601) | Log entry timestamp |
| `level` | string | Log severity (debug, info, warning, error, critical) |
| `message` | string | Human-readable log message |
| `request_id` | string (UUID) | Request correlation ID |
| `user_id` | string (UUID) | Authenticated user ID (if available) |
| `organization_id` | string (UUID) | Organization context (Enterprise) |
| `method` | string | HTTP method |
| `path` | string | Request path |
| `status` | integer | HTTP response status code |
| `duration_ms` | float | Request processing duration |
| `client_ip` | string | Client IP address |
| `user_agent` | string | Client user agent |
| `error` | string | Error message (if applicable) |
| `trace_id` | string | OpenTelemetry trace ID (Enterprise) |
| `span_id` | string | OpenTelemetry span ID (Enterprise) |

### Example Log Entries

**Successful Request:**
```json
{
  "timestamp": "2026-03-12T10:00:00.123Z",
  "level": "info",
  "message": "Request completed",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "method": "POST",
  "path": "/api/chat",
  "status": 200,
  "duration_ms": 1250.5
}
```

**Error:**
```json
{
  "timestamp": "2026-03-12T10:00:01.456Z",
  "level": "error",
  "message": "Anthropic API error",
  "request_id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "method": "POST",
  "path": "/api/chat",
  "status": 502,
  "duration_ms": 5023.0,
  "error": "rate_limit_error: Request rate limit exceeded"
}
```

### Log Levels

| Level | Usage |
|---|---|
| `debug` | Detailed diagnostic information (disabled in production) |
| `info` | Normal operational events (request completion, session creation) |
| `warning` | Unusual but non-critical events (rate limit approaching, slow query) |
| `error` | Error events that require attention (API failures, database errors) |
| `critical` | System-level failures that require immediate action (database down, encryption failure) |

## OpenTelemetry Distributed Tracing (Enterprise)

The Enterprise Edition integrates OpenTelemetry for distributed tracing across all service boundaries.

### Instrumentation

| Component | Instrumentation Library | Spans Generated |
|---|---|---|
| FastAPI | `opentelemetry-instrumentation-fastapi` | HTTP request/response spans |
| asyncpg | `opentelemetry-instrumentation-asyncpg` | Database query spans |
| HTTP client | `opentelemetry-instrumentation-httpx` | Outbound API call spans |
| Redis | `opentelemetry-instrumentation-redis` | Cache operation spans |

### Trace Propagation

Traces are propagated using the W3C Trace Context standard (`traceparent` and `tracestate` headers). Client applications can pass trace context headers to enable end-to-end tracing from client to SDK to external services.

### Exporter Configuration

| Variable | Default | Description |
|---|---|---|
| `OTEL_EXPORTER_ENDPOINT` | — | OTLP gRPC or HTTP endpoint |
| `OTEL_SERVICE_NAME` | `bypotomac-sdk` | Service name in traces |
| `OTEL_TRACES_SAMPLER` | `parentbased_traceidratio` | Sampling strategy |
| `OTEL_TRACES_SAMPLER_ARG` | `0.1` | Sample 10% of traces |

## Prometheus Metrics (Enterprise)

The Enterprise Edition exposes Prometheus-compatible metrics at the `/metrics` endpoint.

### Exposed Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `http_requests_total` | Counter | method, path, status | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | method, path | Request duration distribution |
| `http_requests_in_progress` | Gauge | — | Currently active requests |
| `ai_tokens_total` | Counter | model, type (prompt/completion) | Total AI tokens consumed |
| `ai_request_duration_seconds` | Histogram | model | AI API call duration |
| `db_query_duration_seconds` | Histogram | operation | Database query duration |
| `db_connections_active` | Gauge | — | Active database connections |
| `redis_operations_total` | Counter | operation, status | Total Redis operations |
| `file_uploads_total` | Counter | status, mime_type | Total file uploads |
| `knowledge_chunks_total` | Gauge | — | Total knowledge base chunks |
| `rate_limit_exceeded_total` | Counter | scope (ip/user/org) | Rate limit violations |
| `auth_attempts_total` | Counter | method, status | Authentication attempts |

### Scrape Configuration

```yaml
scrape_configs:
  - job_name: 'bypotomac-sdk'
    scrape_interval: 15s
    metrics_path: '/metrics'
    static_configs:
      - targets: ['bypotomac-sdk:8000']
```

## Alerting Rules

### Recommended Alert Rules

| Alert | Condition | Severity | Description |
|---|---|---|---|
| High Error Rate | `rate(http_requests_total{status=~"5.."}[5m]) > 0.05` | Critical | More than 5% of requests returning 5xx |
| High Latency | `histogram_quantile(0.95, http_request_duration_seconds) > 5` | Warning | P95 latency exceeds 5 seconds |
| AI Service Down | `rate(ai_request_duration_seconds_count[5m]) == 0` | Critical | No AI requests in 5 minutes |
| Database Slow | `histogram_quantile(0.95, db_query_duration_seconds) > 1` | Warning | P95 database query exceeds 1 second |
| Rate Limit Spike | `rate(rate_limit_exceeded_total[5m]) > 10` | Warning | Sustained rate limiting |
| Auth Failures | `rate(auth_attempts_total{status="failed"}[5m]) > 5` | Warning | High rate of failed authentications |

## SLO and SLI Definitions

| Indicator | Target | Measurement |
|---|---|---|
| Availability | 99.9% uptime | Successful `/health` checks over total checks |
| Latency (API) | P95 < 500ms | 95th percentile of `http_request_duration_seconds` (excluding chat) |
| Latency (Chat) | P95 < 5s (time to first token) | 95th percentile of chat first-token latency |
| Error Rate | < 0.1% of requests | 5xx responses / total responses |
| Throughput | > 100 req/sec per instance | `rate(http_requests_total[1m])` |

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
