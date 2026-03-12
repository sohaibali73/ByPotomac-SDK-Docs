# ByPotomac SDK — Authentication and Authorization

## Authentication Architecture

ByPotomac SDK implements a multi-layered authentication system that supports individual users, enterprise organizations, and API integrations. The authentication layer is the first security boundary that every request must pass through before accessing any protected resource.

The SDK supports the following authentication methods:

| Method | Use Case | Token Type | Expiry |
|---|---|---|---|
| Supabase Auth (Email/Password) | Individual users, web and native clients | JWT (HS256) | 1 hour |
| Microsoft Entra ID (OIDC + PKCE) | Enterprise single sign-on | JWT (RS256) | Configurable |
| SAML 2.0 | Enterprise federated identity | SAML assertion → JWT | Configurable |
| API Keys | Server-to-server, automated workflows | Encrypted key | No expiry (rotatable) |
| MFA (TOTP/WebAuthn) | Second factor for any method | One-time code / hardware key | 30 seconds (TOTP) |

## Supabase Auth — Primary Authentication

Supabase Auth is the primary authentication provider for ByPotomac SDK. It manages user registration, login, password hashing, token issuance, and session management.

### Token Format

Supabase issues JSON Web Tokens (JWT) signed with HMAC-SHA256. The token payload includes:

```json
{
  "aud": "authenticated",
  "exp": 1710244800,
  "iat": 1710241200,
  "iss": "https://vekcfcmstpnxubxsaano.supabase.co/auth/v1",
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "analyst@potomac.com",
  "role": "authenticated",
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

| Claim | Description |
|---|---|
| `aud` | Audience — always `authenticated` for logged-in users |
| `exp` | Expiration timestamp (Unix epoch) — 1 hour from issuance |
| `iat` | Issued-at timestamp (Unix epoch) |
| `iss` | Issuer — the Supabase project Auth URL |
| `sub` | Subject — the user's UUID, used as the primary identifier |
| `email` | User's email address |
| `role` | Supabase role — `authenticated` for all valid users |
| `session_id` | The Supabase session identifier |

### Token Validation

Every incoming request is validated through the following steps:

1. **Token extraction**: The SDK extracts the JWT from either the `potomac_session` cookie or the `Authorization: Bearer` header
2. **Signature verification**: The token signature is validated against the Supabase JWT secret (HS256)
3. **Expiration check**: The `exp` claim is compared against the current time
4. **Audience check**: The `aud` claim must be `authenticated`
5. **User resolution**: The `sub` claim is used to look up the user profile in the `user_profiles` table

If any validation step fails, the SDK returns a `401 Unauthorized` response.

### Registration Flow

```
Client                          SDK                         Supabase Auth
  │                               │                               │
  │  POST /auth/v2/register       │                               │
  │  {email, password, name}      │                               │
  │──────────────────────────────>│                               │
  │                               │  sign_up(email, password)     │
  │                               │──────────────────────────────>│
  │                               │                               │
  │                               │  {user, session, tokens}      │
  │                               │<──────────────────────────────│
  │                               │                               │
  │                               │  INSERT user_profiles         │
  │                               │  (id, email, full_name)       │
  │                               │──────────> DB                 │
  │                               │                               │
  │  {user, access_token,         │                               │
  │   refresh_token}              │                               │
  │<──────────────────────────────│                               │
```

### Login Flow

```
Client                          SDK                         Supabase Auth
  │                               │                               │
  │  POST /auth/v2/login          │                               │
  │  {email, password}            │                               │
  │──────────────────────────────>│                               │
  │                               │  sign_in_with_password        │
  │                               │  (email, password)            │
  │                               │──────────────────────────────>│
  │                               │                               │
  │                               │  {user, session, tokens}      │
  │                               │<──────────────────────────────│
  │                               │                               │
  │  Set-Cookie: potomac_session  │                               │
  │  {access_token, refresh_token}│                               │
  │<──────────────────────────────│                               │
```

### Token Refresh Flow

Access tokens expire after 1 hour. Clients must use the refresh token to obtain a new access token without requiring the user to re-authenticate.

```
Client                          SDK                         Supabase Auth
  │                               │                               │
  │  POST /auth/v2/refresh        │                               │
  │  {refresh_token}              │                               │
  │──────────────────────────────>│                               │
  │                               │  refresh_session              │
  │                               │  (refresh_token)              │
  │                               │──────────────────────────────>│
  │                               │                               │
  │                               │  {new_access_token,           │
  │                               │   new_refresh_token}          │
  │                               │<──────────────────────────────│
  │                               │                               │
  │  Set-Cookie: potomac_session  │                               │
  │  {access_token, refresh_token}│                               │
  │<──────────────────────────────│                               │
```

### Logout Flow

Logout invalidates the session on the Supabase server and clears the client-side cookie.

```
Client                          SDK                         Supabase Auth
  │                               │                               │
  │  POST /auth/v2/logout         │                               │
  │  Cookie: potomac_session      │                               │
  │──────────────────────────────>│                               │
  │                               │  sign_out(access_token)       │
  │                               │──────────────────────────────>│
  │                               │                               │
  │  Set-Cookie: potomac_session  │                               │
  │  (cleared, Max-Age=0)         │                               │
  │<──────────────────────────────│                               │
```

## Cookie-Based Authentication (Web Client)

The web client uses httpOnly cookies for authentication to prevent XSS-based token theft. The cookie configuration is:

| Attribute | Value | Purpose |
|---|---|---|
| Name | `potomac_session` | Cookie identifier |
| Value | JWT access token | Authentication credential |
| HttpOnly | `true` | Prevents JavaScript access (XSS protection) |
| Secure | `true` | Only sent over HTTPS |
| SameSite | `None` | Required for cross-origin requests (frontend on different domain) |
| Max-Age | `604800` (7 days) | Cookie expiration |
| Path | `/` | Available on all paths |

The web client's Next.js API routes proxy authentication requests to the SDK and manage cookie setting/clearing on the client's behalf.

## Bearer Token Authentication (Native Clients)

Native clients (Windows, iOS/macOS, and planned platforms) use Bearer token authentication. After login, the native client stores the access token securely using the platform's native secure storage:

| Platform | Secure Storage Mechanism |
|---|---|
| Windows (WinUI 3) | Windows Credential Manager via `PasswordVault` |
| iOS / macOS (Swift) | Keychain Services via `SecItemAdd` / `SecItemCopyMatching` |
| Android (Planned) | Android Keystore with `EncryptedSharedPreferences` |
| Linux (Planned) | libsecret / GNOME Keyring |

Native clients include the token in every request:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Microsoft Entra ID (Azure AD) — Enterprise SSO

The Enterprise Edition of ByPotomac SDK supports Microsoft Entra ID as an enterprise identity provider using OpenID Connect (OIDC) with Proof Key for Code Exchange (PKCE).

### OIDC Authorization Code Flow with PKCE

```
User                  Client App              SDK                    Entra ID
  │                       │                     │                        │
  │  Click "Sign in       │                     │                        │
  │   with Microsoft"     │                     │                        │
  │──────────────────────>│                     │                        │
  │                       │                     │                        │
  │                       │  Generate PKCE      │                        │
  │                       │  code_verifier +    │                        │
  │                       │  code_challenge     │                        │
  │                       │                     │                        │
  │  Redirect to Entra    │                     │                        │
  │  /authorize endpoint  │                     │                        │
  │<──────────────────────│                     │                        │
  │                       │                     │                        │
  │  Authenticate with    │                     │                        │
  │  Entra ID             │                     │                        │
  │─────────────────────────────────────────────────────────────────────>│
  │                       │                     │                        │
  │  Authorization code   │                     │                        │
  │  redirect callback    │                     │                        │
  │──────────────────────>│                     │                        │
  │                       │                     │                        │
  │                       │  POST /auth/v2/     │                        │
  │                       │  entra/callback     │                        │
  │                       │  {code, verifier}   │                        │
  │                       │────────────────────>│                        │
  │                       │                     │                        │
  │                       │                     │  POST /oauth2/v2.0/    │
  │                       │                     │  token                 │
  │                       │                     │  {code, verifier,      │
  │                       │                     │   client_id, secret}   │
  │                       │                     │───────────────────────>│
  │                       │                     │                        │
  │                       │                     │  {id_token,            │
  │                       │                     │   access_token}        │
  │                       │                     │<───────────────────────│
  │                       │                     │                        │
  │                       │                     │  Validate id_token     │
  │                       │                     │  (RS256 + JWKS)        │
  │                       │                     │                        │
  │                       │                     │  Map Entra groups      │
  │                       │                     │  to app roles          │
  │                       │                     │                        │
  │                       │                     │  JIT user provision    │
  │                       │                     │  if first login        │
  │                       │                     │                        │
  │                       │  {app_token, user}  │                        │
  │                       │<────────────────────│                        │
  │                       │                     │                        │
  │  Authenticated        │                     │                        │
  │<──────────────────────│                     │                        │
```

### Entra ID Token Validation

The SDK validates Entra ID tokens using:

1. **Algorithm**: RS256 (RSA with SHA-256)
2. **Public key source**: Microsoft JWKS endpoint (`https://login.microsoftonline.com/{tenant}/discovery/v2.0/keys`)
3. **Key rotation**: JWKS keys are cached and rotated automatically
4. **Claims validated**: `iss`, `aud`, `exp`, `nbf`, `oid`, `tid`

### Entra Group-to-Role Mapping

Entra ID groups are mapped to ByPotomac SDK roles during authentication:

| Entra Group | SDK Role | Description |
|---|---|---|
| `ByPotomac-SuperAdmins` | `super_admin` | Full system access |
| `ByPotomac-OrgAdmins` | `org_admin` | Organization management |
| `ByPotomac-TeamLeads` | `team_lead` | Team management |
| `ByPotomac-Analysts` | `analyst` | Standard analyst access |
| `ByPotomac-Viewers` | `viewer` | Read-only access |
| `ByPotomac-Auditors` | `auditor` | Audit log access |
| `ByPotomac-API` | `api_service` | Machine-to-machine access |

### Just-in-Time User Provisioning

When a user authenticates via Entra ID for the first time, the SDK automatically:

1. Creates a `user_profiles` record using the Entra `oid` as the user ID
2. Maps the user's email, display name, and department from Entra claims
3. Assigns roles based on Entra group membership
4. Associates the user with the correct organization based on the Entra tenant ID
5. Records the provisioning event in the audit log

## SAML 2.0 — Federated Enterprise Identity

ByPotomac SDK supports SAML 2.0 for organizations that use non-Microsoft identity providers (Okta, Ping Identity, OneLogin, etc.).

### SAML Configuration

| Parameter | Description |
|---|---|
| Entity ID | `https://api.bypotomac.com/saml/metadata` |
| ACS URL | `https://api.bypotomac.com/auth/v2/saml/callback` |
| SLO URL | `https://api.bypotomac.com/auth/v2/saml/logout` |
| NameID Format | `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` |
| Signed Assertions | Required |
| Encrypted Assertions | Supported |
| Binding | HTTP-POST |

### SAML Attribute Mapping

| SAML Attribute | SDK Field | Required |
|---|---|---|
| `NameID` | `email` | Yes |
| `givenName` | `first_name` | No |
| `surname` | `last_name` | No |
| `displayName` | `full_name` | No |
| `department` | `department` | No |
| `groups` | Role mapping | No |

## API Key Authentication

API keys provide machine-to-machine authentication for automated workflows, CI/CD pipelines, and third-party integrations.

### API Key Storage

API keys are encrypted at rest using Fernet symmetric encryption. The encryption process:

1. The plaintext API key is received via `PUT /auth/v2/api-key`
2. The key is encrypted using the Fernet cipher derived from the `ENCRYPTION_KEY` environment variable
3. The encrypted value is prefixed with `enc:` and stored in the `user_profiles.anthropic_api_key` column
4. On retrieval, keys with the `enc:` prefix are decrypted; keys without the prefix are treated as legacy unencrypted values

### API Key Format

```
enc:gAAAAABm...base64-encoded-fernet-ciphertext...
```

The Fernet encryption provides:
- AES-128-CBC encryption for confidentiality
- HMAC-SHA256 for integrity verification
- Timestamp-based token validation
- No key reuse due to unique IV per encryption

## Multi-Factor Authentication

The Enterprise Edition supports two MFA methods:

### TOTP (Time-Based One-Time Password)

- **Algorithm**: HMAC-SHA1 with 30-second time steps
- **Code length**: 6 digits
- **Library**: `pyotp` with QR code generation via `qrcode`
- **Enrollment**: User scans a QR code with an authenticator app (Google Authenticator, Authy, 1Password)
- **Verification**: User provides the current 6-digit code during login
- **Backup codes**: 10 single-use backup codes generated at enrollment

### WebAuthn / FIDO2

- **Standard**: WebAuthn Level 2
- **Supported authenticators**: Hardware security keys (YubiKey), platform authenticators (Windows Hello, Touch ID, Face ID)
- **Registration**: Public key credential creation with attestation
- **Authentication**: Challenge-response with stored public key

## Authorization — Role-Based Access Control

ByPotomac SDK implements Role-Based Access Control (RBAC) with 7 built-in roles and 18 granular permissions across 6 categories.

### Built-in Roles

| Role | Description | Scope |
|---|---|---|
| `super_admin` | Full system access across all organizations | Global |
| `org_admin` | Full access within their organization | Organization |
| `team_lead` | Management access within their team | Team |
| `analyst` | Standard operational access | Team |
| `viewer` | Read-only access to assigned resources | Team |
| `auditor` | Read-only access to audit logs and compliance data | Organization |
| `api_service` | Machine-to-machine API access | Scoped per key |

### Permission Categories

Permissions are organized into 6 categories:

#### 1. Chat Permissions
| Permission | Description | super_admin | org_admin | team_lead | analyst | viewer | auditor | api_service |
|---|---|---|---|---|---|---|---|---|
| `chat:create` | Create new chat sessions | Yes | Yes | Yes | Yes | No | No | Yes |
| `chat:read` | Read chat sessions and messages | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `chat:delete` | Delete chat sessions | Yes | Yes | Yes | Yes | No | No | No |

#### 2. Knowledge Permissions
| Permission | Description | super_admin | org_admin | team_lead | analyst | viewer | auditor | api_service |
|---|---|---|---|---|---|---|---|---|
| `knowledge:upload` | Upload documents to knowledge base | Yes | Yes | Yes | Yes | No | No | Yes |
| `knowledge:search` | Search the knowledge base | Yes | Yes | Yes | Yes | Yes | No | Yes |
| `knowledge:delete` | Delete knowledge base documents | Yes | Yes | Yes | No | No | No | No |

#### 3. User Management Permissions
| Permission | Description | super_admin | org_admin | team_lead | analyst | viewer | auditor | api_service |
|---|---|---|---|---|---|---|---|---|
| `users:read` | View user profiles | Yes | Yes | Yes | No | No | No | No |
| `users:manage` | Create, update, deactivate users | Yes | Yes | No | No | No | No | No |
| `users:assign_roles` | Assign roles to users | Yes | Yes | No | No | No | No | No |

#### 4. Organization Permissions
| Permission | Description | super_admin | org_admin | team_lead | analyst | viewer | auditor | api_service |
|---|---|---|---|---|---|---|---|---|
| `org:read` | View organization details | Yes | Yes | Yes | Yes | Yes | Yes | No |
| `org:manage` | Update organization settings | Yes | Yes | No | No | No | No | No |
| `org:billing` | Manage billing and subscriptions | Yes | Yes | No | No | No | No | No |

#### 5. Audit Permissions
| Permission | Description | super_admin | org_admin | team_lead | analyst | viewer | auditor | api_service |
|---|---|---|---|---|---|---|---|---|
| `audit:read` | View audit logs | Yes | Yes | No | No | No | Yes | No |
| `audit:export` | Export audit log data | Yes | Yes | No | No | No | Yes | No |
| `audit:configure` | Configure audit log settings | Yes | No | No | No | No | No | No |

#### 6. System Permissions
| Permission | Description | super_admin | org_admin | team_lead | analyst | viewer | auditor | api_service |
|---|---|---|---|---|---|---|---|---|
| `system:configure` | Modify system configuration | Yes | No | No | No | No | No | No |
| `system:monitor` | Access system health and metrics | Yes | Yes | No | No | No | No | No |
| `system:manage_keys` | Manage API keys and secrets | Yes | Yes | No | No | No | No | No |

### Permission Enforcement

Permissions are enforced at the route handler level through dependency injection. Each protected endpoint declares its required permission, and the authorization middleware validates the user's role against the permission before executing the handler.

```python
@router.get("/admin/users")
async def list_users(user: User = Depends(require_permission("users:read"))):
    ...
```

### Attribute-Based Access Control (ABAC)

In addition to role-based permissions, the Enterprise Edition supports attribute-based access control for fine-grained resource-level authorization. ABAC rules can be defined based on:

- **User attributes**: Department, location, clearance level
- **Resource attributes**: Classification, owner, creation date
- **Environmental attributes**: Time of day, IP address, device type
- **Action attributes**: Read, write, delete, export

ABAC rules are evaluated after RBAC checks and can further restrict access based on the specific resource being accessed.

## Session Security

| Property | Value |
|---|---|
| Session storage | Server-side via Supabase Auth |
| Session identifier | UUID v4 |
| Access token lifetime | 1 hour |
| Refresh token lifetime | 7 days (web cookie), 30 days (native) |
| Concurrent sessions | Unlimited per user |
| Session invalidation | Explicit logout or admin revocation |
| Token type | JWT (JSON Web Token) |
| Signing algorithm | HS256 (Supabase), RS256 (Entra ID) |

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
