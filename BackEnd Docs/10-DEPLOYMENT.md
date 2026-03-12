# ByPotomac SDK — Deployment Guide

## Deployment Overview

ByPotomac SDK is deployed as a containerized Python application. The primary production deployment runs on Railway with automatic builds, health checks, and zero-downtime deploys. The application supports Docker, Docker Compose, and Kubernetes for alternative deployment targets.

## Production Deployment (Railway)

### Railway Configuration

The production deployment uses Railway's Nixpacks builder with the following configuration in `railway.json`:

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

### Railway Deployment Flow

```
Developer pushes to main branch
        │
        ▼
GitHub webhook triggers Railway build
        │
        ▼
Nixpacks detects Python project
        │
        ▼
Install dependencies from requirements.txt
        │
        ▼
Build application container
        │
        ▼
Health check: GET /health
        │
        ▼
Rolling deployment (zero-downtime)
        │
        ▼
Old container drained and stopped
```

### Environment Variables on Railway

All environment variables are set in the Railway service dashboard. They are injected at runtime and never stored in the repository or container image.

### Production URL

```
https://potomac-analyst-workbench-production.up.railway.app
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -r appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Building and Running

```bash
# Build the image
docker build -t bypotomac-sdk:latest .

# Run with environment variables
docker run -d \
  --name bypotomac-sdk \
  -p 8000:8000 \
  --env-file .env \
  bypotomac-sdk:latest

# Run with individual environment variables
docker run -d \
  --name bypotomac-sdk \
  -p 8000:8000 \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  bypotomac-sdk:latest
```

## Docker Compose Deployment

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru

  celery-worker:
    build: .
    command: celery -A backend_v2.app.infrastructure.celery_app worker --loglevel=info
    env_file:
      - .env
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped

volumes:
  redis-data:
```

### Running with Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f api

# Scale workers
docker compose up -d --scale celery-worker=3

# Stop all services
docker compose down
```

## Kubernetes Deployment

### Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bypotomac-sdk
  labels:
    app: bypotomac-sdk
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bypotomac-sdk
  template:
    metadata:
      labels:
        app: bypotomac-sdk
    spec:
      containers:
        - name: api
          image: bypotomac-sdk:latest
          ports:
            - containerPort: 8000
          envFrom:
            - secretRef:
                name: bypotomac-secrets
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 2Gi
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /ready
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: bypotomac-sdk-service
spec:
  selector:
    app: bypotomac-sdk
  ports:
    - port: 80
      targetPort: 8000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: bypotomac-sdk-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - api.bypotomac.com
      secretName: bypotomac-tls
  rules:
    - host: api.bypotomac.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: bypotomac-sdk-service
                port:
                  number: 80
```

### Kubernetes Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: bypotomac-secrets
type: Opaque
stringData:
  SUPABASE_URL: "https://your-project.supabase.co"
  SUPABASE_SERVICE_ROLE_KEY: "your-key"
  ANTHROPIC_API_KEY: "sk-ant-..."
  OPENAI_API_KEY: "sk-..."
  ENCRYPTION_KEY: "your-fernet-key"
```

## Environment Promotion

ByPotomac SDK follows a three-stage promotion pipeline:

```
Development → Staging → Production
```

| Stage | Purpose | URL Pattern | Auto-Deploy |
|---|---|---|---|
| Development | Feature development and testing | `dev.api.bypotomac.com` | On push to `develop` branch |
| Staging | Pre-production validation | `staging.api.bypotomac.com` | On merge to `staging` branch |
| Production | Live service | `api.bypotomac.com` | On merge to `main` branch |

### Promotion Checklist

Before promoting from staging to production:

1. All automated tests pass (unit, integration, end-to-end)
2. API contract tests validate backward compatibility
3. Load testing confirms performance meets SLOs
4. Security scan reports no critical vulnerabilities
5. Database migrations reviewed and tested
6. Environment variables verified for production values
7. Rollback plan documented and tested

## Zero-Downtime Deployment Strategy

ByPotomac SDK achieves zero-downtime deployments through:

1. **Health check gates**: New containers must pass `/health` before receiving traffic
2. **Rolling updates**: Old containers continue serving traffic while new ones start
3. **Connection draining**: Active connections are completed before old containers stop
4. **Database migrations**: Backward-compatible migrations run before deployment
5. **Feature flags**: New features can be deployed but disabled until ready

## Horizontal Scaling

The SDK is designed for horizontal scaling:

- **Stateless application**: No in-memory state that requires session affinity
- **Database connection pooling**: Supabase manages connection limits
- **Redis for shared state**: Enterprise features use Redis for rate limits and caching
- **Independent workers**: Celery workers scale independently from API servers

### Recommended Sizing

| Component | Small (< 100 users) | Medium (100-1000 users) | Large (1000+ users) |
|---|---|---|---|
| API replicas | 1-2 | 3-5 | 5-10 |
| Celery workers | 1 | 2-3 | 5-10 |
| Redis memory | 256MB | 1GB | 4GB |
| CPU per replica | 0.5 vCPU | 1 vCPU | 2 vCPU |
| Memory per replica | 512MB | 1GB | 2GB |

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
