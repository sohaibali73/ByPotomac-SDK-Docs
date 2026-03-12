# ByPotomac SDK — Security Architecture

## Security Design Philosophy

ByPotomac SDK implements a defense-in-depth security architecture with eight distinct encryption and protection layers. The system is designed under the principle that no single security control should be the sole barrier between an attacker and sensitive data. Every layer operates independently so that the compromise of any single layer does not expose the system.

## Security Layers

| Layer | Protection | Technology |
|---|---|---|
| Layer 1 | Transport encryption | TLS 1.2/1.3 (HTTPS) for all client-to-server communication |
| Layer 2 | Authentication tokens | JWT signed with HMAC-SHA256 (Supabase) or RS256 (Entra ID) |
| Layer 3 | API key encryption at rest | Fernet (AES-128-CBC + HMAC-SHA256) with `enc:` prefix |
| Layer 4 | Password storage | bcrypt with cost factor 10 (managed by Supabase Auth) |
| Layer 5 | Backend-to-Supabase transport | HTTPS/TLS to Supabase API endpoints |
| Layer 6 | Backend-to-Anthropic transport | HTTPS/TLS to Anthropic API endpoints |
| Layer 7 | Row-Level Security | PostgreSQL RLS policies on all user-data tables |
| Layer 8 | Environment variable isolation | Secrets stored in environment variables, never in code or Docker images |

## Transport Layer Security

All communication between clients and ByPotomac SDK is encrypted using TLS 1.2 or TLS 1.3. TLS termination is handled at the Railway infrastructure layer for the production deployment.

| Property | Value |
|---|---|
| Minimum TLS version | 1.2 |
| Preferred TLS version | 1.3 |
| Certificate management | Automatic via Railway (Let's Encrypt) |
| HSTS | Enabled (max-age=31536000, includeSubDomains) |
| Certificate pinning | Not enforced (managed infrastructure) |

## Encryption at Rest

### Fernet Symmetric Encryption

ByPotomac SDK uses Fernet symmetric encryption for encrypting sensitive data at rest, primarily API keys stored in the `user_profiles` table.

**Fernet Specification:**
- **Cipher**: AES-128-CBC
- **MAC**: HMAC-SHA256
- **IV**: Random 128-bit IV per encryption operation
- **Key derivation**: Base64-encoded 256-bit key (128 bits for AES, 128 bits for HMAC)
- **Format**: Version (1 byte) + Timestamp (8 bytes) + IV (16 bytes) + Ciphertext (variable) + HMAC (32 bytes)

**Encryption Flow:**

```
Plaintext API Key: sk-ant-api03-abcdef...
        │
        ▼
┌──────────────────────────────┐
│  Fernet.encrypt(plaintext)   │
│  Using ENCRYPTION_KEY env    │
│  Generate random IV          │
│  AES-128-CBC encrypt         │
│  HMAC-SHA256 sign            │
└──────────────────────────────┘
        │
        ▼
Stored Value: enc:gAAAAABm...base64...
```

**Decryption Flow:**

```
Stored Value: enc:gAAAAABm...base64...
        │
        ▼
┌──────────────────────────────┐
│  Check enc: prefix           │
│  Strip prefix                │
│  Fernet.decrypt(ciphertext)  │
│  Verify HMAC-SHA256          │
│  AES-128-CBC decrypt         │
└──────────────────────────────┘
        │
        ▼
Plaintext API Key: sk-ant-api03-abcdef...
```

**Legacy Support:** Keys stored without the `enc:` prefix are treated as unencrypted legacy values and are returned as-is. The system will encrypt them on the next update.

### Enterprise Envelope Encryption

The Enterprise Edition extends encryption with Azure Key Vault envelope encryption:

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

## CORS Configuration

Cross-Origin Resource Sharing is configured with an explicit origin whitelist. Only the following origins are permitted to make cross-origin requests to the SDK:

| Origin | Purpose |
|---|---|
| `https://analystbypotomac.vercel.app` | Production web frontend |
| `http://localhost:3000` | Local web frontend development |
| `http://localhost:3001` | Local web frontend alternate port |
| `http://localhost:8000` | Local backend development |

**CORS Headers:**

| Header | Value |
|---|---|
| `Access-Control-Allow-Origin` | Matched origin from whitelist |
| `Access-Control-Allow-Methods` | `GET, POST, PUT, DELETE, OPTIONS, PATCH` |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization, X-Request-ID` |
| `Access-Control-Allow-Credentials` | `true` |
| `Access-Control-Max-Age` | `86400` (24 hours) |

## Rate Limiting

The SDK implements in-memory per-IP rate limiting to prevent abuse and denial-of-service attacks.

| Parameter | Value |
|---|---|
| Algorithm | Sliding window counter |
| Limit | 120 requests per minute per IP |
| Storage | In-memory (standard), Redis-backed (Enterprise) |
| Response on limit | HTTP 429 Too Many Requests |
| `Retry-After` header | `60` seconds |

**Enterprise Rate Limiting:**

| Scope | Limit | Window |
|---|---|---|
| Per IP | 120 requests | 1 minute |
| Per user | 600 requests | 1 minute |
| Per organization | 6000 requests | 1 minute |
| AI chat endpoints | 30 requests | 1 minute per user |
| File upload endpoints | 10 requests | 1 minute per user |

## Security Headers

The SDK sets the following security headers on all responses:

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Enforce HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS filter (legacy browsers) |
| `Content-Security-Policy` | `default-src 'self'; frame-ancestors 'none'` | CSP enforcement |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restrict browser APIs |
| `Cache-Control` | `no-store, no-cache, must-revalidate` | Prevent response caching |

## CSRF Protection

Cross-Site Request Forgery protection is implemented through:

1. **SameSite cookie attribute**: Set to `None` with `Secure` flag, which requires explicit cross-origin consent
2. **Origin validation**: All mutation requests validate the `Origin` header against the CORS whitelist
3. **Token-based protection**: Native clients use Bearer tokens which are not automatically sent by browsers
4. **Double-submit cookie pattern**: Available in Enterprise Edition for additional protection

## Row-Level Security

Every user-data table in the database has Row-Level Security (RLS) policies enabled. RLS ensures that:

- Users can only read their own data (enforced at the database level, not application level)
- Organization members can only access data within their organization
- Super admins can access all data (via explicit policy)
- Service role connections bypass RLS (used only by the backend server)

**Standard RLS Policy Pattern:**

```sql
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own files"
  ON user_files
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Org admins can access org files"
  ON user_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'org_admin'
        AND user_profiles.organization_id = (
          SELECT organization_id FROM user_profiles WHERE id = user_files.user_id
        )
    )
  );
```

## Secret Management

All secrets are stored as environment variables, never in source code, configuration files, or Docker images.

| Secret | Environment Variable | Purpose |
|---|---|---|
| Supabase URL | `SUPABASE_URL` | Database and API endpoint |
| Supabase service key | `SUPABASE_SERVICE_ROLE_KEY` | Backend database access (bypasses RLS) |
| Supabase anon key | `SUPABASE_ANON_KEY` | Client-facing operations |
| JWT secret | `SUPABASE_JWT_SECRET` | JWT token verification |
| Anthropic API key | `ANTHROPIC_API_KEY` | Default AI API key |
| OpenAI API key | `OPENAI_API_KEY` | Embedding generation |
| Encryption key | `ENCRYPTION_KEY` | Fernet encryption master key |
| Entra client ID | `ENTRA_CLIENT_ID` | Microsoft SSO (Enterprise) |
| Entra client secret | `ENTRA_CLIENT_SECRET` | Microsoft SSO (Enterprise) |
| Entra tenant ID | `ENTRA_TENANT_ID` | Microsoft SSO (Enterprise) |
| Azure Key Vault URL | `AZURE_KEYVAULT_URL` | Envelope encryption (Enterprise) |
| Redis URL | `REDIS_URL` | Cache and session store (Enterprise) |

**Secret Rotation:**

| Secret | Rotation Frequency | Method |
|---|---|---|
| Supabase service key | On compromise | Regenerate in Supabase dashboard |
| Encryption key | Quarterly | Re-encrypt all stored values |
| API keys | On compromise or quarterly | Regenerate and redistribute |
| Entra client secret | Before expiration (2 years) | Rotate in Azure portal |
| JWT secret | On compromise | Regenerate in Supabase (invalidates all sessions) |

## Input Validation

All API inputs are validated using Pydantic 2.9.2 models:

- **Type validation**: Strict type checking on all fields
- **Length validation**: Maximum length constraints on all string fields
- **Format validation**: Email format, UUID format, URL format
- **Enum validation**: Enumerated fields restricted to allowed values
- **Sanitization**: HTML content is stripped from text inputs
- **File validation**: MIME type and file size validation on uploads
- **SQL injection**: Prevented by parameterized queries (Supabase client)
- **Path traversal**: File paths are sanitized before storage operations

## Vulnerability Management

| Control | Implementation |
|---|---|
| Dependency scanning | GitHub Dependabot, `pip audit` in CI |
| Static analysis | Pyright strict mode, Ruff linting |
| Container scanning | Base image vulnerability scanning |
| Penetration testing | Periodic third-party testing (Enterprise) |
| Bug bounty | Responsible disclosure program (Enterprise) |

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
