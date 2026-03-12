# ByPotomac SDK — Multi-Tenancy, Compliance, and Audit Log Reference

## Multi-Tenancy Architecture

ByPotomac SDK Enterprise implements full multi-tenancy with organization-level data isolation. Every piece of data in the system belongs to a specific organization, and access is enforced at both the application layer (middleware) and the database layer (Row-Level Security).

### Organization Model

Organizations are the top-level tenant boundary. Each organization has:
- A unique identifier, name, and slug
- An optional email domain for automatic user association
- A subscription tier that controls available features
- Independent settings, feature flags, and storage quotas
- Optional SSO configuration (Entra ID or SAML)

### Team Model

Within each organization, users are organized into teams:
- Teams provide a second level of access scoping
- Users belong to one or more teams via the `memberships` table
- Each membership has a role that determines permissions within the team
- Team leads can manage their team members and resources

### Tenant Context Injection

The Tenant Context Middleware resolves the organization and team context for every authenticated request:

1. Reads the user's `organization_id` from their profile
2. Loads the organization record and validates it is active
3. Validates the user's membership status
4. Checks subscription tier against the requested feature
5. Attaches the organization context to the request state
6. All subsequent database queries are automatically scoped to the organization

### Data Isolation

| Layer | Mechanism | Enforcement |
|---|---|---|
| Application | Tenant Context Middleware | All queries include organization filter |
| Database | PostgreSQL Row-Level Security | Policies enforce `organization_id` match |
| Cache | Redis key namespacing | Keys prefixed with `org:{org_id}:` |
| Storage | Bucket path prefixing | Files stored under `org/{org_id}/user/{user_id}/` |
| Audit | Organization-scoped audit logs | Audit entries tagged with `organization_id` |

---

## Compliance Framework

### SOC 2 Type II

ByPotomac SDK implements controls aligned with SOC 2 Type II trust service criteria:

| Category | Control | Implementation |
|---|---|---|
| Security | Access Control | RBAC with 7 roles, 18 permissions, JWT authentication |
| Security | Encryption in Transit | TLS 1.2/1.3 on all connections |
| Security | Encryption at Rest | Fernet encryption for API keys, Azure Key Vault envelope encryption |
| Security | Network Security | CORS whitelist, rate limiting, IP-based controls |
| Security | Vulnerability Management | Dependency scanning, container scanning, static analysis |
| Availability | Uptime Monitoring | Health check endpoints, readiness probes |
| Availability | Disaster Recovery | Database backups, failover procedures |
| Availability | Capacity Planning | Horizontal scaling, auto-scaling policies |
| Confidentiality | Data Classification | PII identified and encrypted, API keys encrypted |
| Confidentiality | Data Retention | Configurable retention policies per organization |
| Processing Integrity | Input Validation | Pydantic schema validation on all inputs |
| Processing Integrity | Audit Trail | Immutable audit log with 7-year retention |
| Privacy | Consent Management | User consent tracking for data processing |
| Privacy | Data Minimization | Only necessary data collected and stored |
| Privacy | Right to Erasure | GDPR erasure endpoint with cascade deletion |

### GDPR Compliance

**Right to Erasure (Article 17):**
- Endpoint: `DELETE /api/v1/users/{user_id}/data`
- Deletes all user data: profile, sessions, messages, files, knowledge base, memories, preferences
- Cascading deletion across all related tables
- Audit log entry records the erasure event (the audit entry itself is retained for compliance)
- Organization admins can initiate erasure for users within their organization

**Data Portability (Article 20):**
- Endpoint: `GET /api/v1/users/{user_id}/export`
- Exports all user data in JSON format
- Includes: profile, sessions, messages, files metadata, memories, preferences
- File binaries available via separate download endpoints
- Export process is rate-limited and audited

**Consent Management:**
- Consent records stored in the `user_consent` table
- Consent types: data processing, marketing, analytics, third-party sharing
- Consent can be granted or revoked per type
- All consent changes are recorded in the audit log

**Data Processing Records (Article 30):**
- Maintained in the `data_processing_records` table
- Records purpose, legal basis, categories of data, retention period
- Available for export to supervisory authorities

### SEC 17a-4 Compliance

ByPotomac SDK implements immutable audit trails compliant with SEC Rule 17a-4 requirements for electronic record retention:

| Requirement | Implementation |
|---|---|
| Record Retention | 7-year retention on all audit log entries |
| Immutability | Append-only audit_logs table; no UPDATE or DELETE permissions |
| Indexing | Composite indexes on organization, user, action, and timestamp |
| Accessibility | Query API for authorized auditors and administrators |
| Tamper Protection | HMAC signatures on audit entries (Enterprise) |
| Write-Once | Monthly partitions detached and archived, never modified |
| Time Stamping | Server-side timestamptz with microsecond precision |

### HIPAA (Partial)

| Control | Status | Implementation |
|---|---|---|
| Access Controls | Implemented | RBAC, MFA, session management |
| Audit Controls | Implemented | Comprehensive audit logging |
| Integrity Controls | Implemented | HMAC on audit entries, encrypted storage |
| Transmission Security | Implemented | TLS 1.2/1.3, encrypted connections |
| Business Associate Agreement | Required | BAA must be executed with Supabase and cloud providers |
| Physical Safeguards | Delegated | Managed by cloud infrastructure providers |

### ISO 27001 (Partial)

| Control Domain | Status | Coverage |
|---|---|---|
| A.5 Information Security Policies | Implemented | Security architecture documented |
| A.6 Organization of Information Security | Implemented | Role-based access, separation of duties |
| A.8 Asset Management | Implemented | Data classification, encryption |
| A.9 Access Control | Implemented | RBAC, ABAC, MFA, least privilege |
| A.10 Cryptography | Implemented | Fernet, AES, RSA, TLS |
| A.12 Operations Security | Implemented | Logging, monitoring, change management |
| A.14 System Acquisition | Implemented | Secure development, dependency management |
| A.16 Incident Management | Partial | Logging and alerting; runbook in progress |
| A.18 Compliance | Partial | GDPR and SOC 2 controls implemented |

---

## Audit Log Reference

### Audit Log Schema

The `audit_logs` table is partitioned by month and append-only. No application code has UPDATE or DELETE permissions on this table.

### Auditable Event Types

| Event | Action Value | Resource Type | Severity | Description |
|---|---|---|---|---|
| User login | `auth.login` | `user` | info | Successful authentication |
| Login failure | `auth.login_failed` | `user` | warning | Failed authentication attempt |
| User logout | `auth.logout` | `user` | info | User session terminated |
| Token refresh | `auth.token_refresh` | `session` | info | Access token refreshed |
| MFA enrollment | `auth.mfa_enroll` | `user` | info | MFA method registered |
| MFA verification | `auth.mfa_verify` | `user` | info | MFA challenge completed |
| User created | `user.create` | `user` | info | New user account created |
| User updated | `user.update` | `user` | info | User profile modified |
| User deactivated | `user.deactivate` | `user` | warning | User account disabled |
| User data erased | `user.erase` | `user` | critical | GDPR right to erasure executed |
| Role assigned | `rbac.role_assign` | `membership` | info | Role assigned to user |
| Role revoked | `rbac.role_revoke` | `membership` | warning | Role removed from user |
| Session created | `session.create` | `chat_session` | info | New chat session started |
| Session deleted | `session.delete` | `chat_session` | info | Chat session removed |
| Message sent | `chat.message` | `message` | info | User sent a message |
| File uploaded | `file.upload` | `file` | info | File uploaded to storage |
| File deleted | `file.delete` | `file` | info | File removed from storage |
| Document ingested | `knowledge.ingest` | `document` | info | Document added to knowledge base |
| Document deleted | `knowledge.delete` | `document` | info | Document removed from knowledge base |
| API key created | `apikey.create` | `api_key` | info | New API key generated |
| API key revoked | `apikey.revoke` | `api_key` | warning | API key deactivated |
| API key rotated | `apikey.rotate` | `api_key` | info | API key replaced |
| Org settings changed | `org.settings_update` | `organization` | info | Organization settings modified |
| Data exported | `compliance.export` | `user` | info | User data exported (GDPR) |
| Encryption key rotated | `security.key_rotate` | `system` | critical | Encryption key rotation |
| Rate limit exceeded | `security.rate_limit` | `system` | warning | Rate limit violation |
| Permission denied | `security.access_denied` | `resource` | warning | Unauthorized access attempt |

### Querying Audit Logs

**By organization and date range:**
```sql
SELECT * FROM audit_logs
WHERE organization_id = 'org-uuid'
  AND created_at BETWEEN '2026-01-01' AND '2026-03-31'
ORDER BY created_at DESC
LIMIT 100;
```

**By user activity:**
```sql
SELECT * FROM audit_logs
WHERE user_id = 'user-uuid'
  AND action LIKE 'auth.%'
ORDER BY created_at DESC;
```

**Security events:**
```sql
SELECT * FROM audit_logs
WHERE severity IN ('warning', 'critical')
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;
```

### Partition Management

Monthly partitions are created automatically:

```sql
CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

Partitions older than 7 years are detached (not dropped) and archived to cold storage:

```sql
ALTER TABLE audit_logs DETACH PARTITION audit_logs_2019_03;
```

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
