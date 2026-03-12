# ByPotomac SDK — Infrastructure, Storage and Engine Architecture

## Overview

This document provides a comprehensive technical reference for the infrastructure, storage, and engine architecture that powers the ByPotomac SDK. The ByPotomac SDK is not merely a library or microservice—it is a complete, self-contained backend engine that exposes a unified API surface for any client application on any platform. This architecture enables product teams to build production applications without managing infrastructure, as the SDK abstracts authentication, multi-tenancy, permissions, data persistence, real-time communication, background processing, and AI integration into a single, versioned API contract.

## SECTION A — SECURITY ARCHITECTURE

### Authentication Security

The ByPotomac SDK implements a multi-layered authentication system that supports individual users, enterprise organizations, and API integrations. Every authentication method works at the protocol level with specific technical implementations:

#### Microsoft Entra ID (Azure AD) OIDC with PKCE

**Protocol Flow:**
```
Client → SDK → Entra ID Authorization Code Flow with PKCE
```

1. **Authorization Request**: Client generates PKCE code verifier and challenge, redirects to Entra ID `/authorize` endpoint with `code_challenge` and `code_challenge_method=S256`
2. **User Authentication**: Entra ID authenticates user via Azure AD credentials
3. **Authorization Code**: Entra ID redirects back to SDK with authorization code
4. **Token Exchange**: SDK exchanges code + verifier for tokens via Entra ID `/token` endpoint
5. **Token Validation**: SDK validates ID token using Entra ID JWKS endpoint (`https://login.microsoftonline.com/{tenant}/discovery/v2.0/keys`)
6. **User Provisioning**: SDK maps Entra claims to user profile and assigns roles based on Entra group membership

**Token Specifications:**
- **Algorithm**: RS256 (RSA with SHA-256)
- **Signing**: Public key infrastructure with automatic JWKS rotation
- **Claims**: `iss`, `aud`, `exp`, `nbf`, `oid` (user identifier), `tid` (tenant ID), `groups`
- **Validation**: Signature verification, expiration check, audience validation, nonce verification

#### SAML 2.0 Federation

**Configuration:**
- **Entity ID**: `https://api.bypotomac.com/saml/metadata`
- **ACS URL**: `https://api.bypotomac.com/auth/v2/saml/callback`
- **SLO URL**: `https://api.bypotomac.com/auth/v2/saml/logout`
- **NameID Format**: `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`
- **Binding**: HTTP-POST with signed assertions

**Attribute Mapping:**
- `NameID` → `email`
- `givenName` → `first_name`
- `surname` → `last_name`
- `displayName` → `full_name`
- `department` → `department`
- `groups` → Role mapping

#### Supabase Auth

**Implementation:**
- **Protocol**: JWT with HMAC-SHA256 signing
- **Token Structure**:
  ```json
  {
    "aud": "authenticated",
    "exp": 1710244800,
    "iat": 1710241200,
    "iss": "https://vekcfcmstpnxubxsaano.supabase.co/auth/v1",
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@potomac.com",
    "role": "authenticated",
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
  ```
- **Validation Pipeline**: Signature verification → expiration check → audience validation → user profile lookup

#### API Key Authentication

**Storage and Retrieval:**
- **Encryption**: Fernet symmetric encryption (AES-128-CBC + HMAC-SHA256)
- **Format**: `enc:gAAAAABm...base64-encoded-fernet-ciphertext...`
- **Storage**: Encrypted value stored in `user_profiles.anthropic_api_key` column
- **Legacy Support**: Keys without `enc:` prefix treated as unencrypted for backward compatibility

#### Multi-Factor Authentication

**TOTP Implementation:**
- **Algorithm**: HMAC-SHA1 with 30-second time steps
- **Code Length**: 6 digits
- **QR Code Generation**: Base32-encoded secret with issuer "ByPotomac"
- **Backup Codes**: 10 single-use codes generated at enrollment

**WebAuthn/FIDO2:**
- **Standard**: WebAuthn Level 2
- **Authenticators**: Hardware security keys (YubiKey), platform authenticators (Windows Hello, Touch ID, Face ID)
- **Registration**: Public key credential creation with attestation
- **Authentication**: Challenge-response with stored public key

### Encryption

#### Envelope Encryption Architecture

The Enterprise Edition implements envelope encryption for maximum security:

```
┌─────────────────────────────┐
│      Azure Key Vault         │
│                              │
│  Master Key (RSA-2048/4096)  │
│  HSM-backed, never exported  │
│                              │
│  Encrypts/Decrypts:         │
│  Data Encryption Keys        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Data Encryption Key (DEK)   │
│  Fernet key (AES-128)        │
│  Encrypted copy stored       │
│  alongside data              │
│  Plaintext copy in memory    │
│  only during operations      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Data (API keys, secrets,    │
│  PII, sensitive fields)      │
│  Encrypted with DEK          │
└─────────────────────────────┘
```

**Implementation Details:**
- **Master Key**: RSA-2048 or RSA-4096 stored in Azure Key Vault HSM
- **DEK Generation**: Random 256-bit key derived for each encryption operation
- **Envelope**: DEK encrypted with master key, stored with encrypted data
- **Key Rotation**: Master key rotation triggers re-encryption of all DEKs

#### Per-Record Data Encryption

**Fields Encrypted at Rest:**
- `user_profiles.anthropic_api_key` (Fernet encryption)
- `api_keys.key_hash` (SHA-256 hash)
- `user_profiles.mfa_secret` (Fernet encryption)
- `audit_logs.details` (sensitive fields only)
- `organization_settings` (subscription and billing data)

**Encryption Process:**
1. Generate random 256-bit DEK
2. Encrypt DEK with Azure Key Vault master key
3. Encrypt data with DEK using AES-256-GCM
4. Store encrypted DEK + encrypted data + authentication tag

#### Encryption in Transit

**TLS Configuration:**
- **Minimum Version**: TLS 1.2
- **Preferred Version**: TLS 1.3
- **Certificate Management**: Automatic via Railway (Let's Encrypt)
- **HSTS**: Enabled with `max-age=31536000, includeSubDomains`
- **Certificate Pinning**: Not enforced (managed infrastructure)

**Service-to-Service Communication:**
- **Database**: HTTPS/TLS to Supabase API endpoints
- **AI Services**: HTTPS/TLS to Anthropic and OpenAI API endpoints
- **Storage**: HTTPS/TLS to Supabase Storage endpoints
- **Redis**: TLS 1.2+ for Enterprise Redis connections

### Network Security

#### Zero-Trust Network Model

Every request is authenticated and authorized regardless of origin:

**Implementation:**
- **Authentication Required**: All API endpoints require valid JWT or API key
- **No Trust Boundaries**: Internal and external requests treated identically
- **Service Identity**: Each service has unique identity and minimal permissions
- **Micro-segmentation**: Database-level isolation via Row-Level Security

#### IP Whitelisting

**Configuration:**
- **Per-Organization**: Organizations can configure allowed IP ranges
- **Enforcement**: Applied at middleware level before authentication
- **Override**: Admin users can bypass for maintenance
- **Logging**: All blocked requests logged to audit trail

#### VPC Peering and Private Endpoints

**Enterprise Configuration:**
- **Database**: Supabase private endpoint via VPC peering
- **Redis**: Private Redis cluster in same VPC
- **Storage**: Private bucket access via VPC endpoints
- **Load Balancer**: Private ALB with mutual TLS

#### Reverse Proxy and Ingress Security

**Railway Configuration:**
- **WAF**: Web Application Firewall with OWASP Top 10 rules
- **DDoS Protection**: Automatic rate limiting and traffic analysis
- **SSL Termination**: TLS termination at edge with certificate validation
- **Request Filtering**: Block malicious payloads and suspicious patterns

#### DDoS Mitigation

**Multi-Layer Defense:**
- **Edge**: Railway edge network with automatic scaling
- **Application**: Rate limiting middleware (120 req/min per IP)
- **Database**: Connection pooling and query timeouts
- **Monitoring**: Real-time traffic analysis and alerting

### Application Security

#### Security Headers

**Implementation:**
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; frame-ancestors 'none'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cache-Control: no-store, no-cache, must-revalidate
```

#### CSRF Protection

**Double-Submit Cookie Pattern:**
- **Cookie**: `potomac_session` with `SameSite=None; Secure; HttpOnly`
- **Header**: `X-CSRF-Token` required for state-changing requests
- **Validation**: Server compares cookie value with header value
- **Native Clients**: Bearer tokens exempt from CSRF protection

#### Rate Limiting

**Sliding Window Algorithm:**
- **Standard Edition**: In-memory counters with 120 req/min per IP
- **Enterprise Edition**: Redis-backed counters with per-user and per-organization limits
- **AI Endpoints**: Separate 30 req/min limit per user
- **Response Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

#### Input Validation

**Pydantic Schema Enforcement:**
- **Type Validation**: Strict type checking on all fields
- **Length Validation**: Maximum length constraints on all string fields
- **Format Validation**: Email format, UUID format, URL format
- **Enum Validation**: Enumerated fields restricted to allowed values
- **Sanitization**: HTML content stripped from text inputs
- **File Validation**: MIME type and file size validation on uploads

#### SQL Injection Prevention

**Parameterized Queries:**
- **Supabase Client**: All database operations use parameterized queries
- **No String Interpolation**: Raw SQL avoided in favor of ORM methods
- **Input Escaping**: Automatic escaping of special characters
- **Query Logging**: All queries logged for security analysis

#### Dependency Security

**Vulnerability Management:**
- **Scanning**: GitHub Dependabot for automatic dependency updates
- **Audit**: `pip audit` in CI pipeline for vulnerability detection
- **Container Scanning**: Base image vulnerability scanning
- **SBOM**: Software Bill of Materials generation for compliance

### Secrets Management

#### Environment Variable Management

**Development:**
- **Local**: `.env` file with development secrets
- **Version Control**: `.env` excluded via `.gitignore`
- **Sharing**: Encrypted secrets via secure channels

**Staging:**
- **Environment**: Railway environment variables
- **Rotation**: Manual rotation with deployment
- **Access**: Limited to development team

**Production:**
- **Environment**: Railway environment variables with encryption at rest
- **Rotation**: Automated rotation with zero-downtime deployment
- **Access**: Limited to DevOps and security teams

#### Azure Key Vault Integration

**Enterprise Configuration:**
- **Master Key**: RSA-2048/4096 HSM-backed key
- **Access Policies**: Role-based access with audit logging
- **Key Rotation**: Automatic rotation with key versioning
- **Backup**: Geo-redundant backup with recovery options

#### Secret Rotation Procedures

**Automated Rotation:**
- **JWT Secret**: Regenerated monthly with rolling deployment
- **Encryption Keys**: Rotated quarterly with data re-encryption
- **API Keys**: Rotated on compromise or quarterly schedule
- **Database Credentials**: Rotated via Supabase dashboard

**Manual Rotation:**
- **Emergency**: Immediate rotation on compromise detection
- **Compliance**: Rotation as required by regulatory frameworks
- **Audit**: All rotations logged and audited

### Threat Model

#### Primary Threat Actors

**External Threats:**
- **Script Kiddies**: Automated attacks, credential stuffing
- **Organized Crime**: Financially motivated attacks, ransomware
- **Nation States**: Advanced persistent threats, espionage
- **Competitors**: Corporate espionage, intellectual property theft

**Internal Threats:**
- **Malicious Insiders**: Privileged users with malicious intent
- **Negligent Users**: Accidental data exposure or misconfiguration
- **Compromised Accounts**: Stolen credentials used for unauthorized access

#### Defense-in-Depth Layers

**Network Layer:**
- Firewalls, intrusion detection, DDoS protection
- Network segmentation, VPN access controls

**Application Layer:**
- Authentication, authorization, input validation
- Rate limiting, security headers, CSRF protection

**Data Layer:**
- Encryption at rest and in transit
- Row-Level Security, access controls

**Monitoring Layer:**
- Audit logging, SIEM integration
- Real-time alerting, incident response

#### Known Limitations and Accepted Risks

**Risk Acceptance:**
- **Third-Party Dependencies**: Risk of vulnerabilities in external libraries
- **Cloud Provider**: Dependency on Supabase and Railway security
- **Supply Chain**: Risk of compromised dependencies or build tools

**Mitigation Strategies:**
- **Monitoring**: Continuous monitoring for anomalous behavior
- **Response**: Incident response plan with defined escalation
- **Testing**: Regular penetration testing and security assessments

## SECTION B — DATABASE ARCHITECTURE AND STORAGE

### PostgreSQL — Primary Data Store

#### Database Schema Reference

**Core Tables:**

| Table | Purpose | Key Columns | Constraints |
|-------|---------|-------------|-------------|
| `user_profiles` | User accounts | `id`, `email`, `role` | PRIMARY KEY, UNIQUE email |
| `chat_sessions` | Conversation sessions | `id`, `user_id`, `model` | FOREIGN KEY user_id |
| `messages` | Chat messages | `id`, `session_id`, `role` | FOREIGN KEY session_id |
| `user_files` | File metadata | `id`, `user_id`, `storage_path` | FOREIGN KEY user_id |
| `knowledge_documents` | Document metadata | `id`, `user_id`, `status` | FOREIGN KEY user_id |
| `knowledge_chunks` | Vector embeddings | `id`, `document_id`, `embedding` | FOREIGN KEY document_id |
| `memories` | User memories | `id`, `user_id`, `content` | FOREIGN KEY user_id |
| `projects` | User projects | `id`, `user_id`, `name` | FOREIGN KEY user_id |
| `tasks` | Background tasks | `id`, `user_id`, `status` | FOREIGN KEY user_id |
| `user_preferences` | User settings | `user_id` | PRIMARY KEY user_id |
| `organizations` | Multi-tenancy | `id`, `name`, `subscription_tier` | PRIMARY KEY |
| `teams` | Team organization | `id`, `organization_id` | FOREIGN KEY organization_id |
| `memberships` | User-team relationships | `id`, `user_id`, `team_id` | UNIQUE(user_id, team_id) |
| `api_keys` | API authentication | `id`, `organization_id`, `key_hash` | FOREIGN KEY organization_id |
| `audit_logs` | Compliance logging | `id`, `organization_id`, `action` | PARTITIONED BY created_at |

#### Environment Configuration

**Local Development:**
- **Database**: Local PostgreSQL 15 instance
- **Connection**: `postgresql://localhost:5432/bypotomac_dev`
- **Migration**: Python scripts with `psycopg2`
- **Data**: Sample data for development and testing

**Supabase Hosting (Production):**
- **Provider**: Supabase PostgreSQL cluster
- **Connection**: Managed connection string with SSL
- **Features**: pgvector extension, RLS policies, Realtime
- **Backup**: Automated daily backups with point-in-time recovery

#### Row-Level Security (RLS)

**Policy Implementation:**
```sql
-- User data isolation
CREATE POLICY "Users can access own data" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Organization data isolation (Enterprise)
CREATE POLICY "Org members can access org data" ON chat_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.organization_id = chat_sessions.organization_id
    )
  );

-- Admin override
CREATE POLICY "Admins can access all data" ON user_profiles
  FOR ALL USING (current_setting('app.current_user_role') = 'super_admin');
```

**Policy Categories:**
- **User-Level**: Users can only access their own data
- **Organization-Level**: Organization members can access organization data
- **Role-Based**: Different access levels based on user role
- **Admin Override**: Super admins can access all data

#### Connection Pooling

**Configuration:**
```python
# Enterprise Edition (asyncpg)
pool = await asyncpg.create_pool(
    dsn=DATABASE_URL,
    min_size=5,
    max_size=20,
    max_inactive_connection_lifetime=300,
    command_timeout=30,
    statement_cache_size=100,
)
```

**Pool Management:**
- **Min Connections**: 5 connections maintained
- **Max Connections**: 20 connections allowed
- **Timeout**: 30-second command timeout
- **Health Check**: Automatic connection validation
- **Reconnection**: Automatic reconnection on connection loss

#### Read Replica Strategy

**Enterprise Configuration:**
- **Primary**: Write operations to primary database
- **Replica**: Read operations distributed across read replicas
- **Routing**: Application-level read/write splitting
- **Consistency**: Eventual consistency with replication lag monitoring

#### Supabase Features Utilization

**Auth Integration:**
- User registration, login, password reset
- JWT token generation and validation
- Email verification and password recovery

**RLS Policies:**
- Automatic row-level security enforcement
- Policy inheritance and composition
- Service role bypass for server-side operations

**Realtime:**
- Database change notifications via WebSocket
- Client subscriptions to table changes
- Real-time UI updates for collaborative features

**Storage:**
- File upload and download via REST API
- Automatic virus scanning and MIME type validation
- CDN integration for global file access

#### Database Migrations

**File Naming Convention:**
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

**Migration Process:**
1. **Development**: Local migration testing with sample data
2. **Staging**: Migration validation in staging environment
3. **Production**: Zero-downtime deployment with rollback capability
4. **Verification**: Post-migration data integrity checks

**Rollback Strategy:**
- **Schema Rollback**: Reverse migration scripts for structural changes
- **Data Rollback**: Point-in-time recovery for data changes
- **Testing**: Rollback testing in staging environment

### What Is Stored in PostgreSQL — Complete Inventory

#### Organizations and Tenant Configuration

**Table**: `organizations`
- **Data**: Organization metadata, subscription tier, settings
- **Retention**: Indefinite (business relationship)
- **Encryption**: No (metadata only)
- **RLS**: Organization-level isolation

**Table**: `teams`
- **Data**: Team structure, team names, descriptions
- **Retention**: Indefinite (business relationship)
- **Encryption**: No
- **RLS**: Organization-level isolation

**Table**: `memberships`
- **Data**: User-team relationships, role assignments
- **Retention**: Indefinite (business relationship)
- **Encryption**: No
- **RLS**: Organization-level isolation

#### User Profiles and Identity Data

**Table**: `user_profiles`
- **Data**: User email, name, role, preferences, MFA settings
- **Retention**: 7 years after account deletion (compliance)
- **Encryption**: API keys (Fernet), MFA secrets (Fernet)
- **RLS**: User-level isolation

**Table**: `user_preferences`
- **Data**: UI preferences, default models, notification settings
- **Retention**: 7 years after account deletion
- **Encryption**: No
- **RLS**: User-level isolation

#### Team Structures and Memberships

**Table**: `teams`
- **Data**: Team names, descriptions, creation dates
- **Retention**: Indefinite
- **Encryption**: No
- **RLS**: Organization-level isolation

**Table**: `memberships`
- **Data**: User-team relationships, role assignments, join dates
- **Retention**: 7 years after membership termination
- **Encryption**: No
- **RLS**: Organization-level isolation

#### Role Assignments and Permission Mappings

**Table**: `user_profiles` (role column)
- **Data**: User roles (super_admin, org_admin, team_lead, analyst, viewer, auditor, api_service)
- **Retention**: 7 years after role change
- **Encryption**: No
- **RLS**: User-level isolation

**Table**: `memberships` (role column)
- **Data**: Team-specific role assignments
- **Retention**: 7 years after membership termination
- **Encryption**: No
- **RLS**: Organization-level isolation

#### Audit Log Records (7 Years, Partitioned by Month)

**Table**: `audit_logs` (partitioned)
- **Data**: All auditable events with full context
- **Retention**: 7 years (84 monthly partitions)
- **Encryption**: Sensitive fields only
- **RLS**: Organization-level isolation

**Partitioning Strategy:**
```sql
CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

#### API Key Records (Hashed, Never Plaintext)

**Table**: `api_keys`
- **Data**: API key metadata, scopes, usage statistics
- **Retention**: 7 years after key deletion
- **Encryption**: Key hash (SHA-256), key prefix for identification
- **RLS**: Organization-level isolation

**Table**: `user_profiles` (anthropic_api_key column)
- **Data**: User-specific Anthropic API keys
- **Retention**: 7 years after account deletion
- **Encryption**: Fernet encryption with `enc:` prefix
- **RLS**: User-level isolation

#### Session Metadata

**Table**: `chat_sessions`
- **Data**: Session titles, models, creation dates, metadata
- **Retention**: 2 years (configurable per organization)
- **Encryption**: No
- **RLS**: User-level isolation

**Table**: `messages`
- **Data**: Message content, parts, tool invocations, metadata
- **Retention**: 2 years (configurable per organization)
- **Encryption**: No
- **RLS**: User-level isolation

#### Application Domain Data (All Business Logic Entities)

**Table**: `projects`
- **Data**: Project names, descriptions, status, metadata
- **Retention**: 5 years after project completion
- **Encryption**: No
- **RLS**: User-level isolation

**Table**: `tasks`
- **Data**: Background task parameters, status, results, errors
- **Retention**: 1 year after task completion
- **Encryption**: Input/output data (configurable)
- **RLS**: User-level isolation

**Table**: `memories`
- **Data**: User memories, categories, importance scores
- **Retention**: 5 years (configurable)
- **Encryption**: No
- **RLS**: User-level isolation

#### Webhook Configurations and Delivery Records

**Table**: `webhook_configs`
- **Data**: Webhook URLs, events, authentication, retry settings
- **Retention**: Indefinite (business relationship)
- **Encryption**: Authentication secrets (Fernet)
- **RLS**: Organization-level isolation

**Table**: `webhook_deliveries`
- **Data**: Delivery attempts, responses, errors, timestamps
- **Retention**: 1 year
- **Encryption**: No
- **RLS**: Organization-level isolation

#### Feature Flag States per Organization

**Table**: `organization_settings`
- **Data**: Feature flags, custom settings, overrides
- **Retention**: Indefinite
- **Encryption**: No
- **RLS**: Organization-level isolation

### Redis — Cache, Session, Queue, and Rate Limit Store

#### Redis Instance Architecture

**Four Distinct Instances:**

| Instance | Purpose | Database | Eviction Policy |
|----------|---------|----------|-----------------|
| **Sessions** | User session storage | DB 0 | `volatile-lru` |
| **Cache** | Application cache | DB 1 | `allkeys-lru` |
| **Queue** | Celery task queue | DB 2 | `noeviction` |
| **Rate Limit** | Rate limiting counters | DB 3 | `volatile-ttl` |

#### Session Instance (DB 0)

**What Is Stored:**
- **Key Format**: `session:{user_id}:{session_id}`
- **Value**: JSON-serialized session data
- **TTL**: 3600 seconds (1 hour, matching JWT expiry)
- **Data**: User preferences, temporary state, CSRF tokens

**Eviction Policy**: `volatile-lru` - evicts least recently used keys with TTL set

**Persistence**: RDB snapshots every 15 minutes, AOF enabled for durability

#### Application Cache Instance (DB 1)

**What Is Stored:**
- **User Profiles**: `user:{user_id}` (TTL: 300s)
- **Organization Settings**: `org:{org_id}` (TTL: 600s)
- **Feature Flags**: `org:{org_id}:features` (TTL: 300s)
- **Market Data**: `quote:{symbol}` (TTL: 60s)
- **Embeddings**: `embedding:{hash}` (TTL: 3600s)

**Eviction Policy**: `allkeys-lru` - evicts least recently used keys regardless of TTL

**Cache Strategy**: Cache-aside pattern with automatic refresh on cache miss

#### Task Queue Instance (DB 2)

**What Is Stored:**
- **Queue Name**: `bypotomac-tasks`
- **Serializer**: JSON
- **Result Backend**: Redis DB 2
- **Task Data**: Background job parameters, status, results

**Configuration:**
```python
# Celery configuration
broker_url = f"{REDIS_URL}/2"
result_backend = f"{REDIS_URL}/2"
task_serializer = 'json'
result_serializer = 'json'
accept_content = ['json']
```

**Eviction Policy**: `noeviction` - never evicts data, fails on memory exhaustion

#### Rate Limit Instance (DB 3)

**What Is Stored:**
- **Key Format**: `ratelimit:{scope}:{identifier}:{window}`
- **Value**: Request count (integer)
- **TTL**: Window duration (60 seconds)
- **Scopes**: `ip`, `user`, `organization`

**Eviction Policy**: `volatile-ttl` - evicts keys closest to expiration

**Algorithm**: Sliding window counter with Redis Lua scripts for atomicity

#### TTL Policies per Instance

**Sessions (DB 0):**
- **TTL**: 3600 seconds (1 hour)
- **Refresh**: On each request
- **Cleanup**: Automatic expiration

**Cache (DB 1):**
- **User Data**: 300 seconds (5 minutes)
- **Org Data**: 600 seconds (10 minutes)
- **Market Data**: 60 seconds (1 minute)
- **Embeddings**: 3600 seconds (1 hour)

**Queue (DB 2):**
- **Task Results**: 86400 seconds (24 hours)
- **Task Metadata**: 3600 seconds (1 hour)
- **No Eviction**: Critical for task processing

**Rate Limit (DB 3):**
- **TTL**: 60 seconds (sliding window)
- **Cleanup**: Automatic expiration
- **Reset**: On window boundary

#### Persistence Configuration

**RDB Snapshots:**
- **Sessions**: Every 15 minutes
- **Cache**: Every 30 minutes
- **Queue**: Every 5 minutes
- **Rate Limit**: Disabled (ephemeral data)

**AOF (Append Only File):**
- **Sessions**: `everysec` (balanced durability/performance)
- **Cache**: `everysec`
- **Queue**: `always` (maximum durability)
- **Rate Limit**: `no` (ephemeral data)

#### Redis Cluster Configuration (Enterprise)

**Production Setup:**
- **Shards**: 3 primary shards with 3 replicas each
- **Replication**: Asynchronous replication with failover
- **Monitoring**: Redis Sentinel for high availability
- **Scaling**: Horizontal scaling via sharding

### What Is Stored in Redis — Complete Inventory

#### User Session Tokens and Session State

**Storage**: Redis DB 0
- **Format**: `session:{user_id}:{session_id}`
- **Content**: JSON with user preferences, CSRF tokens, temporary state
- **TTL**: 3600 seconds
- **Access Pattern**: Read on every authenticated request

#### Cached API Responses and Computed Results

**Storage**: Redis DB 1
- **User Profiles**: `user:{user_id}` (TTL: 300s)
- **Organization Settings**: `org:{org_id}` (TTL: 600s)
- **Feature Flags**: `org:{org_id}:features` (TTL: 300s)
- **Market Data**: `quote:{symbol}` (TTL: 60s)
- **Embeddings**: `embedding:{hash}` (TTL: 3600s)

**Cache Invalidation**: Time-based expiration with manual invalidation on updates

#### Celery Task Queue: Task Payloads, Task State, Result Backend

**Storage**: Redis DB 2
- **Task Queue**: Pending task payloads
- **Task State**: Running, completed, failed states
- **Results**: Task execution results and errors
- **Metadata**: Task timing, worker information

**Task Lifecycle**: Pending → Running → Completed/Failed → Result stored → Cleanup

#### Rate Limit Counters: Per-IP, Per-User, Per-Organization Sliding Windows

**Storage**: Redis DB 3
- **IP Counters**: `ratelimit:ip:{ip_address}:{window}`
- **User Counters**: `ratelimit:user:{user_id}:{window}`
- **Org Counters**: `ratelimit:org:{org_id}:{window}`
- **Window**: 60-second sliding window

**Algorithm**: Redis Lua script for atomic increment and expiration

#### Temporary Authentication State (PKCE Verifiers, SAML Relay State)

**Storage**: Redis DB 0
- **PKCE Verifiers**: `pkce:{code_challenge}` (TTL: 600s)
- **SAML State**: `saml:{relay_state}` (TTL: 300s)
- **CSRF Tokens**: `csrf:{token}` (TTL: 3600s)

**Security**: Short TTL, automatic cleanup, no persistence

#### Any Other Ephemeral State

**Storage**: Redis DB 1
- **Search Results**: Temporary search result caching
- **File Upload State**: Upload progress and metadata
- **WebSocket Connections**: Connection state for real-time features
- **Feature Flag Evaluation**: Cached flag evaluation results

### File and Object Storage

#### What Files and Binary Objects Are Stored

**User Uploads:**
- **Documents**: PDF, DOCX, XLSX, CSV, TXT, Markdown
- **Images**: PNG, JPG, JPEG, GIF, SVG
- **Analysis Results**: Generated reports, exported data packages
- **Media Assets**: Charts, screenshots, presentation materials

**System Generated:**
- **Knowledge Base**: Processed document chunks and embeddings
- **Backtest Results**: Performance reports and equity curves
- **Audit Logs**: Exported compliance reports
- **Backup Files**: Database and configuration backups

#### Storage Provider Configuration

**Supabase Storage (Primary):**
- **Provider**: Supabase Storage (built on top of cloud storage)
- **Bucket**: `analyst-files` (user-specific subdirectories)
- **Access**: Public URLs with signed tokens for private access
- **CDN**: Automatic CDN integration for global access

**AWS S3 (Alternative):**
- **Provider**: Amazon S3 with CloudFront CDN
- **Bucket**: `bypotomac-files-{environment}`
- **Access**: IAM-based access control with signed URLs
- **Region**: Configurable per deployment

**Azure Blob (Alternative):**
- **Provider**: Azure Blob Storage with CDN
- **Container**: `analyst-files`
- **Access**: Azure AD authentication with SAS tokens
- **Region**: Configurable per deployment

#### Bucket Structure and Access Control

**Directory Structure:**
```
analyst-files/
├── user/{user_id}/
│   ├── sessions/{session_id}/
│   │   ├── chat-transcripts/
│   │   └── analysis-results/
│   ├── knowledge-base/
│   │   ├── documents/
│   │   └── embeddings/
│   ├── projects/{project_id}/
│   │   └── reports/
│   └── uploads/
│       ├── 2026/
│       │   ├── 01/
│       │   ├── 02/
│       │   └── ...
│       └── temp/
└── org/{org_id}/
    ├── shared/
    ├── compliance/
    └── backups/
```

**Access Control:**
- **User Files**: User can access their own files
- **Organization Files**: Organization members can access shared files
- **Public Files**: Files with public URLs accessible to anyone with link
- **Private Files**: Files require authentication and authorization

#### File Reference from Database

**Storage Metadata:**
```sql
CREATE TABLE user_files (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    name TEXT NOT NULL,
    size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,  -- e.g., "user/uuid/uploads/2026/03/file.pdf"
    url TEXT NOT NULL,           -- Public or signed URL
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**URL Generation:**
- **Public Files**: Direct Supabase Storage URL
- **Private Files**: Signed URL with expiration
- **Temporary Files**: Short-lived signed URLs for uploads

#### CDN Integration and Cache Headers

**Cache Configuration:**
- **Static Assets**: 1 year cache with versioned filenames
- **User Files**: 1 hour cache with ETag validation
- **API Responses**: 5 minute cache for GET requests
- **Real-time Data**: No cache for streaming responses

**Headers:**
```http
Cache-Control: public, max-age=3600, immutable
ETag: "file-hash"
Content-Type: application/pdf
Content-Length: 1024000
```

#### File Size Limits, Allowed MIME Types, Virus Scanning

**Size Limits:**
- **Upload Limit**: 50MB per file
- **Total Storage**: Configurable per organization (5GB default)
- **Chunk Size**: 5MB chunks for large file uploads

**Allowed MIME Types:**
- **Documents**: `application/pdf`, `application/msword`, `application/vnd.ms-excel`, `text/csv`, `text/plain`, `text/markdown`
- **Images**: `image/png`, `image/jpeg`, `image/gif`, `image/svg+xml`
- **Archives**: `application/zip` (scanned)

**Virus Scanning:**
- **Integration**: ClamAV or cloud provider scanning
- **Real-time**: Scan on upload before storage
- **Quarantine**: Infected files quarantined and reported
- **Logging**: All scan results logged to audit trail

### Data Residency and Geographic Isolation

#### Data Residency by Default

**Default Region**: US East (Virginia) for all deployments
**Compliance**: All data stored within US borders by default
**Backup**: Cross-region backup to US West (Oregon)

#### Organization Data Residency Configuration

**Per-Organization Settings:**
- **Region Selection**: Organizations can select primary region
- **Available Regions**: US East, US West, EU (Frankfurt), EU (Ireland)
- **Migration**: Data migration between regions with minimal downtime
- **Compliance**: Region-specific compliance requirements

#### Cross-Region Replication

**Read Replicas:**
- **Primary**: Write operations in selected region
- **Replicas**: Read operations distributed globally
- **Consistency**: Eventual consistency with replication lag monitoring
- **Failover**: Automatic failover to nearest replica

#### Data Sovereignty Compliance

**GDPR Compliance:**
- **EU Data**: Stored in EU regions only
- **Transfer**: Explicit consent for cross-border data transfer
- **Deletion**: Right to erasure with complete data removal
- **Audit**: Data residency audit logs

**CCPA Compliance:**
- **California Data**: Stored in US regions with California-specific controls
- **Opt-out**: Right to opt-out of data sale and sharing
- **Access**: Right to access and portability
- **Deletion**: Right to deletion with verification

## SECTION C — HOSTING AND DEPLOYMENT ARCHITECTURE

### Environment Topology

#### Three-Environment Architecture

**Development Environment:**
- **Purpose**: Feature development and testing
- **Infrastructure**: Local development with Docker Compose
- **Database**: Local PostgreSQL with sample data
- **Redis**: Local Redis for caching and sessions
- **AI Services**: Mock services or development keys

**Staging Environment:**
- **Purpose**: Integration testing and pre-release validation
- **Infrastructure**: Railway staging deployment
- **Database**: Supabase staging project
- **Redis**: Railway Redis add-on
- **AI Services**: Staging API keys with rate limiting

**Production Environment:**
- **Purpose**: Live service for end users
- **Infrastructure**: Railway production deployment
- **Database**: Supabase production project with read replicas
- **Redis**: Enterprise Redis cluster
- **AI Services**: Production API keys with monitoring

#### Environment Promotion Flow

```
Development → Staging → Production
    ↓           ↓           ↓
Local      Railway     Railway
Docker     Staging     Production
Compose    Project     Project
```

**Promotion Criteria:**
1. All automated tests pass
2. API contract tests validate backward compatibility
3. Load testing confirms performance meets SLOs
4. Security scan reports no critical vulnerabilities
5. Database migrations reviewed and tested
6. Environment variables verified for production values
7. Rollback plan documented and tested

### Local Development

#### Complete Local Stack

**Docker Compose Configuration:**
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env.local
    depends_on:
      redis:
        condition: service_healthy
    volumes:
      - .:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

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

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: bypotomac_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql

  celery-worker:
    build: .
    command: celery -A backend_v2.app.infrastructure.celery_app worker --loglevel=info
    env_file:
      - .env.local
    depends_on:
      redis:
        condition: service_healthy

volumes:
  redis-data:
  postgres-data:
```

#### Development Environment Variables

**Required Variables:**
```env
# Database
SUPABASE_URL=postgresql://dev:dev@postgres:5432/bypotomac_dev
SUPABASE_SERVICE_ROLE_KEY=dev-key
SUPABASE_ANON_KEY=dev-anon-key

# AI Services
ANTHROPIC_API_KEY=sk-ant-dev-key
OPENAI_API_KEY=sk-dev-key

# Security
ENCRYPTION_KEY=base64-encoded-32-byte-key
SUPABASE_JWT_SECRET=dev-jwt-secret

# Development
DEBUG=true
LOG_LEVEL=debug
```

#### Local Environment Variable Configuration

**Environment File Structure:**
- **`.env.local`**: Local development variables (not committed)
- **`.env.example`**: Template with required variables
- **`.env.staging`**: Staging environment variables
- **`.env.production`**: Production environment variables (encrypted)

**Variable Management:**
- **Local**: Plain text in `.env.local`
- **CI/CD**: Encrypted in GitHub Actions secrets
- **Production**: Railway environment variables with encryption at rest

### Staging Environment

#### Infrastructure Mirror

**Railway Staging Project:**
- **Environment**: `staging` branch auto-deploy
- **Database**: Supabase staging project with production-like data
- **Redis**: Railway Redis add-on with persistence
- **Monitoring**: Basic monitoring and alerting
- **Access**: Development team with staging credentials

#### Staging-Specific Configuration

**Database Configuration:**
- **Data**: Anonymized production data for realistic testing
- **Size**: Smaller instance with production-like schema
- **Backups**: Daily backups with 7-day retention
- **Monitoring**: Query performance and connection monitoring

**Service Configuration:**
- **AI Services**: Staging API keys with reduced rate limits
- **Storage**: Staging bucket with limited capacity
- **Email**: Staging email service for testing notifications
- **Logging**: Full logging with log aggregation

#### Integration Testing

**Test Categories:**
- **API Contract Tests**: Validate backward compatibility
- **End-to-End Tests**: Full user workflow testing
- **Performance Tests**: Load testing with realistic data
- **Security Tests**: Vulnerability scanning and penetration testing

**Test Automation:**
- **CI/CD**: Automated testing on every staging deployment
- **Scheduled**: Nightly full test suite execution
- **Manual**: Manual testing for complex user scenarios

### Production Hosting — Application Layer

#### Containerization

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY . .

# Non-root user
RUN useradd -m -r appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### ASGI Server Configuration

**Uvicorn + Gunicorn:**
```python
# gunicorn.conf.py
bind = "0.0.0.0:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 50
```

**Worker Configuration:**
- **Workers**: 4 workers (CPU cores + 1)
- **Worker Class**: UvicornWorker for async support
- **Connections**: 1000 concurrent connections per worker
- **Timeout**: 30-second request timeout
- **Keepalive**: 2-second keepalive timeout

#### Kubernetes Deployment (Enterprise)

**Deployment Manifest:**
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
```

**Service and Ingress:**
```yaml
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

#### Container Registry and Image Management

**Registry Configuration:**
- **Primary**: Docker Hub with automated builds
- **Alternative**: GitHub Container Registry for private images
- **Tagging**: Semantic versioning with git commit SHA
- **Security**: Image scanning for vulnerabilities

**Image Lifecycle:**
- **Development**: `bypotomac-sdk:dev-{branch}`
- **Staging**: `bypotomac-sdk:staging-{commit}`
- **Production**: `bypotomac-sdk:v{version}`

### Production Hosting — Database Layer

#### Supabase PostgreSQL Configuration

**Production Cluster:**
- **Provider**: Supabase managed PostgreSQL
- **Version**: PostgreSQL 15 with pgvector extension
- **Size**: Production instance with auto-scaling
- **Backup**: Automated daily backups with point-in-time recovery
- **Monitoring**: Query performance and resource utilization

**Connection Pooling:**
- **PgBouncer**: Connection pooling with 100 max connections
- **Pool Mode**: Transaction pooling for maximum efficiency
- **Timeouts**: 30-second query timeout, 60-second idle timeout
- **Monitoring**: Connection pool metrics and alerting

#### Backup Strategy

**Automated Backups:**
- **Frequency**: Daily full backups at 2 AM UTC
- **Retention**: 30 days of daily backups, 12 months of monthly backups
- **Point-in-Time Recovery**: 7-day recovery window
- **Testing**: Monthly backup restoration testing

**Backup Verification:**
- **Checksums**: MD5 checksums for backup integrity
- **Restoration**: Automated restoration testing in staging
- **Alerting**: Backup failure notifications to on-call engineer

#### Read Replica Configuration

**Replica Setup:**
- **Primary**: Write operations only
- **Replicas**: Read operations distributed across 2-3 replicas
- **Replication**: Asynchronous replication with < 5 second lag
- **Routing**: Application-level read/write splitting

**Monitoring:**
- **Lag Monitoring**: Real-time replication lag tracking
- **Failover**: Automatic failover to primary on replica failure
- **Performance**: Query performance comparison between primary and replicas

### Production Hosting — Cache and Queue Layer

#### Redis Hosting Configuration

**Enterprise Redis:**
- **Provider**: Managed Redis cluster (Redis Cloud, AWS ElastiCache, or Azure Cache)
- **Size**: 4GB memory with 2 vCPUs
- **Replication**: 3-node cluster with automatic failover
- **Persistence**: AOF with everysec sync for durability

**Cluster Configuration:**
```yaml
# Redis Cluster
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes
appendfsync everysec
maxmemory 3gb
maxmemory-policy allkeys-lru
```

#### Celery Worker Deployment

**Worker Configuration:**
```python
# celery_app.py
from celery import Celery

app = Celery('bypotomac')
app.conf.update(
    broker_url=f"{REDIS_URL}/2",
    result_backend=f"{REDIS_URL}/2",
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    task_routes={
        'tasks.document_processing': {'queue': 'high_priority'},
        'tasks.backtest': {'queue': 'medium_priority'},
        'tasks.export': {'queue': 'low_priority'},
    },
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)
```

**Deployment:**
- **Workers**: 3 worker instances with 2 processes each
- **Queues**: High, medium, and low priority queues
- **Monitoring**: Flower for task monitoring and debugging
- **Scaling**: Auto-scaling based on queue length

### Production Hosting — Ingress and Networking

#### Reverse Proxy Configuration

**Nginx Configuration:**
```nginx
upstream bypotomac_backend {
    server api-1:8000;
    server api-2:8000;
    server api-3:8000;
}

server {
    listen 443 ssl http2;
    server_name api.bypotomac.com;

    ssl_certificate /etc/ssl/certs/bypotomac.crt;
    ssl_certificate_key /etc/ssl/private/bypotomac.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

    location / {
        proxy_pass http://bypotomac_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Streaming support
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

#### TLS Termination

**Certificate Management:**
- **Provider**: Let's Encrypt with automatic renewal
- **Validation**: HTTP-01 challenge with DNS verification
- **Renewal**: Automatic renewal 30 days before expiration
- **Monitoring**: Certificate expiration alerts

**TLS Configuration:**
- **Minimum Version**: TLS 1.2
- **Preferred Version**: TLS 1.3
- **Ciphers**: Modern cipher suites with forward secrecy
- **HSTS**: Enabled with 1-year max-age and includeSubDomains

#### DNS Configuration

**DNS Records:**
- **A Record**: `api.bypotomac.com` → Load balancer IP
- **CNAME**: `www.bypotomac.com` → `api.bypotomac.com`
- **MX Records**: Email routing to corporate mail servers
- **TXT Records**: SPF, DKIM, DMARC for email security

**Health Check Routing:**
- **Route 53**: Health checks with automatic failover
- **Latency-Based Routing**: Route to nearest healthy endpoint
- **Geographic Routing**: Region-specific routing for compliance

#### CDN Configuration

**CloudFront Distribution:**
- **Origin**: API endpoints and static assets
- **Caching**: Static assets cached at edge, API responses not cached
- **Compression**: Gzip compression for text responses
- **Security**: WAF integration with rate limiting

**Cache Behavior:**
- **Static Assets**: 1-year cache with versioned filenames
- **API Responses**: No caching for dynamic content
- **Streaming**: No caching for SSE responses
- **Invalidation**: Automatic cache invalidation on deployment

### CI/CD Pipeline

#### Pipeline Structure

**GitHub Actions Workflow:**
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, staging, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-python@v5
      with:
        python-version: '3.11'
    - run: pip install -r requirements.txt
    - run: pip install pytest pytest-asyncio pytest-cov
    - run: pytest --cov=. --cov-report=xml --cov-fail-under=75
    - uses: codecov/codecov-action@v4

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - run: docker build -t bypotomac-sdk:${{ github.sha }} .
    - run: docker push bypotomac-sdk:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/staging'
    steps:
    - run: railway deploy --service staging --token ${{ secrets.RAILWAY_TOKEN }}

  deploy-production:
    needs: [build, deploy-staging]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
    - run: railway deploy --service production --token ${{ secrets.RAILWAY_TOKEN }}
```

#### Stages and Responsibilities

**Lint Stage:**
- **Purpose**: Code quality and style validation
- **Tools**: Ruff, Black, isort, mypy
- **Fail Criteria**: Any linting errors or type checking failures

**Type Check Stage:**
- **Purpose**: Static type checking with Pydantic models
- **Tools**: mypy with strict mode
- **Fail Criteria**: Any type errors or violations

**Test Stage:**
- **Purpose**: Unit, integration, and API tests
- **Tools**: pytest with coverage reporting
- **Fail Criteria**: Any test failures or coverage below 75%

**Build Stage:**
- **Purpose**: Docker image building and security scanning
- **Tools**: Docker BuildKit, Trivy for vulnerability scanning
- **Fail Criteria**: Build failures or critical vulnerabilities

**Push Stage:**
- **Purpose**: Container registry push with tagging
- **Tools**: Docker CLI with registry authentication
- **Fail Criteria**: Registry push failures

**Deploy to Staging Stage:**
- **Purpose**: Staging environment deployment
- **Tools**: Railway CLI with staging service
- **Fail Criteria**: Deployment failures or health check failures

**Manual Approval Gate:**
- **Purpose**: Human approval for production deployment
- **Tools**: GitHub environment protection rules
- **Requirements**: All staging tests pass, manual review completed

**Deploy to Production Stage:**
- **Purpose**: Production environment deployment
- **Tools**: Railway CLI with production service
- **Fail Criteria**: Deployment failures or health check failures

#### Rollback Procedure

**Automatic Rollback:**
- **Trigger**: Health check failures or error rate spikes
- **Action**: Automatic rollback to previous version
- **Notification**: Alert to on-call engineer

**Manual Rollback:**
- **Trigger**: Manual request via Railway dashboard
- **Action**: Deploy previous version with rollback flag
- **Verification**: Health check confirmation before traffic routing

**Rollback Verification:**
- **Health Checks**: All health checks must pass
- **Smoke Tests**: Automated smoke tests on rolled-back version
- **Monitoring**: Error rate and performance monitoring
- **Documentation**: Rollback reason and steps documented

#### Database Migration Execution

**Migration Strategy:**
- **Backward Compatibility**: All migrations must be backward compatible
- **Zero Downtime**: Migrations executed without service interruption
- **Rollback**: Each migration has corresponding rollback script
- **Testing**: Migrations tested in staging before production

**Execution Process:**
1. **Pre-deployment**: Run migration in staging with production-like data
2. **Deployment**: Deploy application code first
3. **Migration**: Execute database migration via Railway CLI
4. **Verification**: Verify migration success and data integrity
5. **Post-deployment**: Monitor for any migration-related issues

### Infrastructure as Code

#### Terraform Configuration

**Provider Configuration:**
```hcl
provider "railway" {
  token = var.railway_token
}

provider "supabase" {
  api_key = var.supabase_api_key
  project_id = var.supabase_project_id
}
```

**Resource Definitions:**
```hcl
resource "railway_environment" "production" {
  name = "production"
  project_id = var.railway_project_id
}

resource "railway_service" "api" {
  name = "bypotomac-api"
  environment_id = railway_environment.production.id
  build_command = "pip install -r requirements.txt"
  start_command = "uvicorn main:app --host 0.0.0.0 --port $PORT"
  health_check_path = "/health"
}

resource "supabase_project" "production" {
  name = "bypotomac-production"
  region = "us-east-1"
  plan = "pro"
}
```

#### Helm Charts (Kubernetes)

**Chart Structure:**
```
charts/bypotomac/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   └── secret.yaml
└── crds/
    └── custom-resource-definitions.yaml
```

**Values Configuration:**
```yaml
replicaCount: 3

image:
  repository: bypotomac-sdk
  tag: "latest"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
  - host: api.bypotomac.com
    paths:
    - path: /
      pathType: Prefix
  tls:
  - secretName: bypotomac-tls
    hosts:
    - api.bypotomac.com

resources:
  limits:
    cpu: 1000m
    memory: 2Gi
  requests:
    cpu: 250m
    memory: 512Mi
```

#### Deployment Manifests

**Kubernetes Manifests:**
- **Deployment**: Application deployment with rolling updates
- **Service**: Internal service for load balancing
- **Ingress**: External access with TLS termination
- **ConfigMap**: Configuration without secrets
- **Secret**: Encrypted secrets and credentials
- **HPA**: Horizontal pod autoscaling based on CPU/memory

**Monitoring and Observability:**
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Dashboard and visualization
- **Jaeger**: Distributed tracing
- **ELK Stack**: Log aggregation and analysis

## SECTION D — HOW THE BYPOTOMAC SDK ENGINE POWERS OTHER APPLICATIONS

### The Engine Model

#### Architectural Philosophy

The ByPotomac SDK is not a library that ships inside client applications. It is a centralized, server-side platform that exposes a unified API surface for any client application on any platform. This architectural philosophy means product teams never build infrastructure—they only build product logic on top of a stable, maintained engine.

**Key Principles:**
1. **Centralized Backend**: Single source of truth for all data and business logic
2. **Platform Agnostic**: Any client platform can connect via HTTP/SSE
3. **Versioned API**: Stable API contracts with backward compatibility
4. **Infrastructure Abstraction**: All infrastructure concerns handled by SDK
5. **Multi-Tenancy**: Built-in organization and user isolation

#### API Contract Abstraction

The SDK abstracts complex infrastructure concerns into simple API endpoints:

**Authentication**: Single `/auth/v2/login` endpoint handles all auth methods
**Multi-Tenancy**: Automatic tenant context injection via middleware
**Permissions**: Role-based access control enforced at database level
**Data Persistence**: Standard CRUD operations with automatic validation
**Real-time Communication**: SSE streaming for live updates
**Background Processing**: Celery task queue with progress tracking
**AI Integration**: Unified chat endpoint with tool orchestration

#### Versioning and Backward Compatibility

**Semantic Versioning:**
- **MAJOR**: Breaking API changes (rare, requires migration)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

**Compatibility Guarantees:**
- **API Stability**: No breaking changes within major version
- **Deprecation Policy**: 6-month notice before removal
- **Migration Tools**: Automated migration scripts for breaking changes
- **Documentation**: Complete changelog and migration guides

### The API Contract

#### RESTful HTTP Endpoints

**Core Endpoints:**
- **Authentication**: `/auth/v2/login`, `/auth/v2/logout`, `/auth/v2/me`
- **Chat**: `/api/chat` (SSE streaming), `/sessions`, `/messages`
- **Knowledge**: `/knowledge/upload`, `/knowledge/search`, `/knowledge/documents`
- **Files**: `/files/upload`, `/files`, `/files/{id}`
- **Projects**: `/projects`, `/projects/{id}`
- **Tasks**: `/tasks`, `/tasks/{id}`

**HTTP Methods:**
- **GET**: Retrieve resources with optional filtering and pagination
- **POST**: Create resources or trigger operations
- **PUT**: Update entire resources
- **PATCH**: Partial resource updates
- **DELETE**: Remove resources

#### WebSocket Connections

**Real-time Features:**
- **Chat Updates**: Real-time message delivery via Supabase Realtime
- **Task Progress**: Background task progress updates
- **File Uploads**: Upload progress and completion notifications
- **Collaboration**: Multi-user session collaboration

**Connection Management:**
- **Authentication**: WebSocket connections require valid JWT
- **Reconnection**: Automatic reconnection with exponential backoff
- **Heartbeat**: Ping/pong messages to maintain connection
- **Cleanup**: Automatic cleanup of stale connections

#### Webhook Delivery

**Event Types:**
- **Chat Events**: New messages, session updates
- **File Events**: Upload completion, processing results
- **Task Events**: Task completion, errors
- **System Events**: Maintenance notifications, feature updates

**Delivery Configuration:**
- **URL**: Configurable webhook endpoint per organization
- **Authentication**: HMAC signature verification
- **Retry**: Exponential backoff with 5 retry attempts
- **Timeout**: 30-second delivery timeout

#### Client Authentication Flow

**Token-Based Authentication:**
1. **Login**: Client sends credentials to `/auth/v2/login`
2. **Token Response**: SDK returns access token and refresh token
3. **Storage**: Client stores tokens securely (platform-specific)
4. **Usage**: Client includes token in `Authorization: Bearer` header
5. **Refresh**: Client automatically refreshes expired tokens
6. **Logout**: Client calls `/auth/v2/logout` to invalidate session

**Platform-Specific Storage:**
- **Web**: HttpOnly cookies with secure flags
- **Windows**: Windows Credential Manager via `PasswordVault`
- **iOS/macOS**: Keychain Services via `SecItemAdd`/`SecItemCopyMatching`
- **Android**: Android Keystore with `EncryptedSharedPreferences`

#### Multi-Tenancy Transparency

**Automatic Tenant Context:**
1. **Authentication**: User logs in with organization context
2. **Context Resolution**: SDK resolves organization from user profile
3. **Query Filtering**: All database queries automatically include organization filter
4. **Access Control**: RLS policies enforce organization-level isolation
5. **Response Filtering**: API responses only include organization data

**Tenant Isolation:**
- **Data Isolation**: Separate database schemas or row-level security
- **Resource Isolation**: Separate Redis instances per organization (Enterprise)
- **Network Isolation**: VPC peering and private endpoints
- **Compliance**: Organization-specific compliance and audit requirements

### How Each Product Is Powered By the SDK

#### Analyst By Potomac

**Product Description:**
The professional-grade financial analysis platform for institutional investors and portfolio managers, delivering deep market intelligence through the ByPotomac SDK.

**SDK Modules Used:**
- **Authentication**: Entra ID SSO for institutional clients
- **Multi-Tenancy**: Per-firm data isolation with compliance requirements
- **RBAC**: Analyst role hierarchy with granular permissions
- **Real-time Streaming**: Live market data and AI analysis streams
- **AI Integration**: Anthropic SDK for intelligent analysis
- **Audit Logging**: SEC 17a-4 compliance for financial data access
- **Data Models**: Portfolio, position, and instrument entities

**Client Integration:**
- **Web Client**: Next.js application for browser access
- **Windows Client**: WinUI 3 native application for desktop
- **iOS/macOS Client**: Swift native application for mobile and desktop
- **Data Flow**: User action → SDK processing → AI analysis → real-time results

**Data Flow Example:**
1. **User Action**: Analyst requests portfolio performance analysis
2. **SDK Processing**: Retrieves portfolio data, market data, and historical prices
3. **AI Analysis**: Claude analyzes performance, risk metrics, and recommendations
4. **Real-time Results**: Streaming response with charts, tables, and insights
5. **Persistence**: Analysis results saved to knowledge base for future reference

#### Design Associate By Potomac

**Product Description:**
A native creative workflow tool for design professionals, powered by the ByPotomac SDK, enabling real-time collaboration and AI-assisted design operations.

**SDK Modules Used:**
- **Authentication**: Email/password and SSO for design teams
- **Real-time Collaboration**: WebSocket-based presence, cursors, and live edits
- **File and Object Storage**: Design assets, exports, and collaborative documents
- **AI Integration**: AI-assisted design suggestions and generation
- **Background Jobs**: Export rendering, asset processing, and optimization
- **RBAC**: Team-based access to projects and assets

**Real-time Collaboration Implementation:**
- **Presence**: Real-time user presence indicators in shared projects
- **Cursors**: Live cursor positions and selection states
- **Live Edits**: Real-time synchronization of design changes
- **Conflict Resolution**: Operational transformation for concurrent edits
- **Versioning**: Automatic version history and rollback capability

**Data Flow Example:**
1. **User Action**: Designer uploads mockup and requests AI enhancement
2. **SDK Processing**: Stores file, generates embeddings, processes with AI
3. **AI Enhancement**: Claude suggests improvements, generates variants
4. **Collaboration**: Team members review, comment, and approve changes
5. **Export**: High-quality assets generated and distributed to team

#### BizOps By Potomac

**Product Description:**
An enterprise operations platform for business intelligence, workflow automation, and organizational management, built natively on the ByPotomac SDK.

**SDK Modules Used:**
- **Multi-Tenancy**: Department and team isolation with enterprise controls
- **RBAC and ABAC**: Complex organizational permission hierarchies
- **Background Jobs and Queues**: Workflow automation and scheduled operations
- **Webhooks**: Integration with external enterprise systems
- **Audit Logging**: Full operational audit trail for compliance
- **Observability**: Operational dashboards and reporting
- **Data Models**: Organizational entities, workflow state machines

**ABAC Implementation:**
- **Attributes**: User department, location, clearance level
- **Resources**: Project sensitivity, data classification
- **Environment**: Time of day, IP address, device type
- **Policies**: Complex rules combining multiple attributes
- **Evaluation**: Real-time policy evaluation for every access request

**Data Flow Example:**
1. **Workflow Trigger**: Scheduled report generation or event-based trigger
2. **SDK Processing**: Retrieves data from multiple sources, applies transformations
3. **AI Analysis**: Generates insights, identifies anomalies, creates recommendations
4. **Distribution**: Reports distributed via email, dashboard, or API
5. **Integration**: Results pushed to external systems via webhooks

#### Sales By Potomac

**Product Description:**
A native sales intelligence and pipeline management platform that connects directly to the ByPotomac SDK for real-time data, reporting, and AI-powered insights.

**SDK Modules Used:**
- **Authentication**: SSO integration with enterprise identity providers
- **Real-time Data Streaming**: Live pipeline updates, notifications, and alerts
- **AI Integration**: Anthropic SDK for sales intelligence, lead scoring, and insights
- **Data Models**: Pipeline, deal, contact, and activity entities
- **Webhooks**: CRM integrations and external system notifications
- **Background Jobs**: Report generation, data enrichment, and lead nurturing
- **RBAC**: Sales team role hierarchy and territory-based access

**Sales Intelligence Features:**
- **Lead Scoring**: AI-powered lead qualification and prioritization
- **Pipeline Analysis**: Real-time pipeline health and forecasting
- **Competitive Intelligence**: Market analysis and competitor tracking
- **Personalization**: AI-generated personalized outreach content
- **Performance Analytics**: Sales team performance and activity analysis

**Data Flow Example:**
1. **Lead Ingestion**: New leads imported from CRM or marketing automation
2. **AI Enrichment**: Claude enriches lead data, assigns scores, generates insights
3. **Pipeline Management**: Real-time updates to sales pipeline with AI recommendations
4. **Outreach Automation**: Personalized content generated and distributed
5. **Performance Tracking**: Results tracked and analyzed for continuous improvement

### Building a New Product on the SDK

#### Step-by-Step Guide for Product Teams

**Step 1: Organization Provisioning**
1. **Create Organization**: Use admin interface to create new organization
2. **Configure Settings**: Set subscription tier, feature flags, and compliance settings
3. **User Management**: Add initial users and assign roles
4. **Integration Setup**: Configure SSO, webhooks, and external integrations

**Step 2: Authentication Configuration**
1. **Choose Method**: Select authentication method (email/password, SSO, API keys)
2. **Configure Providers**: Set up Entra ID, SAML, or other identity providers
3. **Test Integration**: Verify authentication flow with test users
4. **Deploy**: Roll out authentication to production users

**Step 3: Role and Permission Design**
1. **Identify Roles**: Define user roles specific to the product
2. **Map Permissions**: Assign permissions to roles based on product requirements
3. **Test Access**: Verify role-based access control works correctly
4. **Iterate**: Refine roles and permissions based on user feedback

**Step 4: Data Model Extension**
1. **Identify Entities**: Define product-specific data entities
2. **Design Schema**: Create database schema with proper relationships
3. **Implement APIs**: Create REST endpoints for entity operations
4. **Test Integration**: Verify data persistence and retrieval

**Step 5: AI Integration**
1. **Define Use Cases**: Identify where AI can enhance the product
2. **Design Prompts**: Create system prompts and tool definitions
3. **Implement Tools**: Build custom tools for product-specific operations
4. **Test Experience**: Verify AI responses are helpful and accurate

**Step 6: External Integration**
1. **Identify Systems**: List external systems that need integration
2. **Design Webhooks**: Create webhook configurations for event delivery
3. **Implement APIs**: Build API endpoints for external system access
4. **Test Integration**: Verify data flows correctly between systems

#### SDK Versioning and Stability

**Version Management:**
- **Stable Versions**: Production-ready versions with long-term support
- **Beta Versions**: New features available for testing
- **Deprecation Policy**: 6-month notice before removing features
- **Migration Tools**: Automated tools for upgrading between versions

**Upgrade Process:**
1. **Review Changelog**: Check for breaking changes and new features
2. **Test in Staging**: Deploy new version to staging environment
3. **Run Tests**: Execute full test suite with new version
4. **Monitor**: Monitor staging for any issues or performance problems
5. **Deploy**: Deploy to production with rollback plan ready

**Breaking Change Handling:**
- **Communication**: Advance notice of breaking changes
- **Migration Guides**: Detailed guides for updating client code
- **Compatibility Layer**: Temporary compatibility for smooth transition
- **Support**: Dedicated support during migration period

## SECTION E — COMPLIANCE AND DATA GOVERNANCE REFERENCE

### Data Classification

#### Complete Data Classification Table

| Data Category | Classification | Storage Location | Protection Level | Retention Period |
|---------------|----------------|------------------|------------------|------------------|
| **Public Data** | Public | Database, Cache | Encryption in transit only | Indefinite |
| **Internal Data** | Internal | Database, Files | Encryption at rest and transit | 3 years |
| **Confidential Data** | Confidential | Database, Files | FIPS 140-2 encryption | 7 years |
| **Restricted Data** | Restricted | Database, Files | AES-256 encryption + envelope | 7 years |

#### Detailed Classification Examples

**Public Data:**
- **Examples**: Product documentation, marketing materials, public APIs
- **Protection**: Standard security controls
- **Access**: Public access with rate limiting
- **Audit**: Basic access logging

**Internal Data:**
- **Examples**: Internal documentation, employee directories, operational data
- **Protection**: Authentication required, encryption in transit
- **Access**: Authenticated users only
- **Audit**: Full access logging and monitoring

**Confidential Data:**
- **Examples**: Customer data, financial information, business plans
- **Protection**: Encryption at rest and in transit, access controls
- **Access**: Role-based access with need-to-know principle
- **Audit**: Comprehensive audit logging with retention

**Restricted Data:**
- **Examples**: PII, payment card data, healthcare information
- **Protection**: AES-256 encryption, envelope encryption, strict access controls
- **Access**: Multi-factor authentication, least privilege access
- **Audit**: Immutable audit logs with extended retention

### Compliance Controls Reference

#### SOC 2 Type II Controls

**Security Controls:**
- **CC6.1**: Logical and physical access controls
- **CC6.2**: System access management
- **CC6.3**: Data transmission controls
- **CC6.6**: Network security management
- **CC6.7**: System monitoring
- **CC6.8**: Response to system events

**Availability Controls:**
- **CC3.1**: Availability objectives
- **CC3.2**: Environmental protections
- **CC3.3**: Information processing equipment
- **CC7.1**: System operations management
- **CC7.2**: Change management
- **CC7.3**: Risk mitigation

**Confidentiality Controls:**
- **CC4.1**: Confidentiality objectives
- **CC4.2**: Confidentiality agreements
- **CC4.3**: Data classification
- **CC5.1**: Control activities
- **CC5.2**: System-generated data
- **CC5.3**: Response to system deficiencies

#### GDPR Implementation

**Right to Erasure (Article 17):**
- **Implementation**: `DELETE /api/v1/users/{user_id}/data` endpoint
- **Scope**: All user data including profiles, sessions, messages, files, knowledge base, memories
- **Cascade**: Automatic deletion of related data across all tables
- **Audit**: Erasure event logged to audit trail (immutable)
- **Limitations**: Audit entries themselves are retained for compliance

**Data Portability (Article 20):**
- **Implementation**: `GET /api/v1/users/{user_id}/export` endpoint
- **Format**: JSON with standardized schema
- **Content**: All personal data in structured, commonly used format
- **Delivery**: Secure download link with expiration
- **Frequency**: Maximum 1 export per 30 days per user

**Consent Management:**
- **Storage**: `user_consent` table with consent type and timestamp
- **Types**: Data processing, marketing, analytics, third-party sharing
- **Revocation**: Real-time consent withdrawal with immediate effect
- **Audit**: All consent changes logged with user and timestamp
- **Default**: No processing without explicit consent

**Data Processing Records (Article 30):**
- **Storage**: `data_processing_records` table
- **Content**: Purpose, legal basis, data categories, retention, recipients
- **Access**: Available for supervisory authority inspection
- **Export**: CSV export for regulatory reporting
- **Retention**: 5 years after processing ends

#### SEC 17a-4 Compliance

**Immutable Audit Log Implementation:**
- **Table**: `audit_logs` with monthly partitions
- **Immutability**: No UPDATE or DELETE permissions on application level
- **WORM**: Write-once-read-many with database-level enforcement
- **Retention**: 7-year retention with monthly partition management
- **Indexing**: Composite indexes for efficient querying

**Tamper Detection:**
- **HMAC**: Each audit entry signed with HMAC-SHA256
- **Verification**: Periodic verification of audit log integrity
- **Alerting**: Immediate alerts on any tampering attempts
- **Recovery**: Automatic recovery from backup on corruption detection

**Access Controls:**
- **Read Access**: Limited to compliance officers and auditors
- **Write Access**: Automatic via application middleware only
- **Audit Access**: Separate audit interface with additional logging
- **Export**: Secure export with digital signatures

#### HIPAA Compliance (Partial)

**Current Implementation:**
- **Access Controls**: RBAC with MFA for all users
- **Audit Controls**: Comprehensive audit logging of all access
- **Integrity Controls**: HMAC signatures on sensitive data
- **Transmission Security**: TLS 1.2/1.3 for all data in transit

**Requirements for Full HIPAA:**
- **Business Associate Agreement**: Required with Supabase and cloud providers
- **Risk Analysis**: Comprehensive risk analysis and management plan
- **Workforce Training**: HIPAA-specific training for all personnel
- **Incident Response**: HIPAA-specific incident response procedures

#### ISO 27001 Controls

**Information Security Management:**
- **A.5**: Information security policies (implemented)
- **A.6**: Organization of information security (implemented)
- **A.8**: Asset management (implemented)
- **A.9**: Access control (implemented)
- **A.10**: Cryptography (implemented)
- **A.12**: Operations security (implemented)
- **A.14**: System acquisition (implemented)

**Planned Controls:**
- **A.16**: Incident management (in progress)
- **A.18**: Compliance (partial - GDPR, SOC 2)

### Audit Log Reference

#### Complete Audit Log Schema

**Core Fields:**
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    organization_id UUID,
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    severity TEXT DEFAULT 'info',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Partitioning:**
```sql
CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

#### Auditable Event Types

**Authentication Events:**
- `auth.login`: Successful authentication
- `auth.login_failed`: Failed authentication attempt
- `auth.logout`: User session termination
- `auth.token_refresh`: Access token refresh
- `auth.mfa_enroll`: MFA method registration
- `auth.mfa_verify`: MFA challenge completion

**User Management Events:**
- `user.create`: New user account created
- `user.update`: User profile modified
- `user.deactivate`: User account disabled
- `user.erase`: GDPR right to erasure executed
- `rbac.role_assign`: Role assigned to user
- `rbac.role_revoke`: Role removed from user

**Data Operations Events:**
- `session.create`: New chat session started
- `session.delete`: Chat session removed
- `message.send`: User sent a message
- `file.upload`: File uploaded to storage
- `file.delete`: File removed from storage
- `knowledge.ingest`: Document added to knowledge base
- `knowledge.delete`: Document removed from knowledge base

**System Events:**
- `api.key_create`: New API key generated
- `api.key_revoke`: API key deactivated
- `org.settings_update`: Organization settings modified
- `compliance.export`: User data exported (GDPR)
- `security.key_rotate`: Encryption key rotation
- `security.rate_limit`: Rate limit violation
- `security.access_denied`: Unauthorized access attempt

#### Querying Audit Logs

**Common Queries:**

**By Organization and Date Range:**
```sql
SELECT * FROM audit_logs
WHERE organization_id = 'org-uuid'
  AND created_at BETWEEN '2026-01-01' AND '2026-03-31'
ORDER BY created_at DESC
LIMIT 100;
```

**Security Events:**
```sql
SELECT * FROM audit_logs
WHERE severity IN ('warning', 'critical')
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;
```

**User Activity:**
```sql
SELECT action, COUNT(*) as count
FROM audit_logs
WHERE user_id = 'user-uuid'
  AND created_at > now() - interval '30 days'
GROUP BY action
ORDER BY count DESC;
```

**Performance Analysis:**
```sql
SELECT DATE(created_at) as date, 
       COUNT(*) as total_events,
       COUNT(*) FILTER (WHERE severity = 'critical') as critical_events
FROM audit_logs
WHERE created_at > now() - interval '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

#### Forensic Investigation Procedures

**Incident Response:**
1. **Preservation**: Secure audit log access and prevent tampering
2. **Collection**: Export relevant audit entries with digital signatures
3. **Analysis**: Timeline reconstruction using request IDs and timestamps
4. **Reporting**: Generate incident report with audit evidence
5. **Remediation**: Implement controls based on findings

**User Investigation:**
1. **Scope Definition**: Define investigation scope and time period
2. **Data Collection**: Export all user-related audit entries
3. **Pattern Analysis**: Identify unusual patterns or access violations
4. **Correlation**: Correlate with other security events
5. **Documentation**: Document findings and recommendations

**System Investigation:**
1. **Event Correlation**: Correlate system events across components
2. **Performance Analysis**: Analyze performance degradation patterns
3. **Security Analysis**: Identify security incidents and vulnerabilities
4. **Compliance Analysis**: Check for compliance violations
5. **Root Cause**: Identify root cause and implement fixes

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com