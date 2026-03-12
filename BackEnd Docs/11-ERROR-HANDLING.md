# ByPotomac SDK — Error Handling and Error Code Reference

## Error Response Format

All API error responses from ByPotomac SDK follow a consistent JSON format. Non-streaming endpoints return errors as JSON objects. Streaming endpoints emit error events using the Data Stream Protocol type code `3`.

### Standard Error Response

```json
{
  "detail": "Human-readable error description"
}
```

### Validation Error Response (HTTP 422)

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

### Streaming Error

```
3:"Error message describing what went wrong"
```

## HTTP Status Code Reference

| Status Code | Meaning | When Returned |
|---|---|---|
| 200 | OK | Successful request |
| 201 | Created | Resource successfully created |
| 204 | No Content | Successful deletion with no response body |
| 400 | Bad Request | Invalid request format, missing required fields, or business logic violation |
| 401 | Unauthorized | Missing, expired, or invalid authentication token |
| 403 | Forbidden | Authenticated but insufficient permissions for the requested resource |
| 404 | Not Found | Requested resource does not exist or is not accessible to the user |
| 409 | Conflict | Resource already exists (e.g., duplicate email registration) |
| 413 | Payload Too Large | File upload exceeds 50MB limit |
| 415 | Unsupported Media Type | File type not in the allowed MIME type list |
| 422 | Unprocessable Entity | Request body fails Pydantic validation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled server-side exception |
| 502 | Bad Gateway | Upstream service (Anthropic, OpenAI, Supabase) is unreachable |
| 503 | Service Unavailable | Application is starting up or shutting down |

## Error Categories

### Authentication Errors

| Error | Status | Detail Message | Cause |
|---|---|---|---|
| Missing token | 401 | `Not authenticated` | No cookie or Bearer token provided |
| Expired token | 401 | `Token has expired` | JWT `exp` claim is in the past |
| Invalid token | 401 | `Invalid authentication credentials` | Token signature validation failed |
| Invalid credentials | 401 | `Invalid email or password` | Login with incorrect credentials |
| Account disabled | 401 | `Account has been deactivated` | User `is_active` is false |
| MFA required | 401 | `Multi-factor authentication required` | MFA is enabled but not provided |

### Authorization Errors

| Error | Status | Detail Message | Cause |
|---|---|---|---|
| Insufficient permissions | 403 | `Permission denied: {permission} required` | User role lacks the required permission |
| Organization access denied | 403 | `Access denied for this organization` | User is not a member of the target organization |
| Resource ownership | 403 | `You do not have access to this resource` | User is not the owner and lacks admin permissions |
| Feature not available | 403 | `This feature requires {subscription_tier} subscription` | Feature gated by subscription tier |

### Resource Errors

| Error | Status | Detail Message | Cause |
|---|---|---|---|
| Session not found | 404 | `Session not found` | Session ID does not exist or is not owned by user |
| File not found | 404 | `File not found` | File ID does not exist or is not owned by user |
| Document not found | 404 | `Document not found` | Knowledge base document not found |
| Project not found | 404 | `Project not found` | Project ID does not exist |
| Task not found | 404 | `Task not found` | Background task not found |

### Validation Errors

| Error | Status | Detail Message | Cause |
|---|---|---|---|
| Invalid email format | 422 | `value is not a valid email address` | Email field fails format validation |
| Missing required field | 422 | `field required` | Required field not provided in request body |
| Invalid UUID format | 422 | `value is not a valid uuid` | Path or body parameter is not a valid UUID |
| String too long | 422 | `ensure this value has at most {n} characters` | String exceeds maximum length |
| Invalid enum value | 422 | `value is not a valid enumeration member` | Value not in the allowed set |

### File and Upload Errors

| Error | Status | Detail Message | Cause |
|---|---|---|---|
| File too large | 413 | `File size exceeds maximum of 50MB` | Upload exceeds the 50MB size limit |
| Unsupported file type | 415 | `File type {mime_type} is not supported` | MIME type not in allowed list |
| Upload failed | 500 | `File upload failed` | Supabase Storage returned an error |
| Processing failed | 500 | `Document processing failed: {reason}` | Knowledge base ingestion error |

### AI and Streaming Errors

| Error | Status | Detail Message | Cause |
|---|---|---|---|
| AI rate limit | 429 | `Rate limit exceeded for AI requests` | Too many chat requests per user |
| Anthropic API error | 502 | `AI service temporarily unavailable` | Anthropic API returned an error |
| OpenAI API error | 502 | `Embedding service temporarily unavailable` | OpenAI API returned an error |
| Token limit exceeded | 200 | Stream finishes with `finish_reason: "length"` | Response reached max_tokens limit |
| Context too long | 400 | `Conversation context exceeds model limit` | Input tokens exceed model context window |
| Tool execution error | 500 | `Tool {tool_name} execution failed: {reason}` | Server-side tool returned an error |

### Rate Limiting Errors

| Error | Status | Detail Message | Headers |
|---|---|---|---|
| IP rate limit | 429 | `Rate limit exceeded. Try again in 60 seconds.` | `Retry-After: 60` |
| User rate limit | 429 | `User rate limit exceeded` | `Retry-After: 60`, `X-RateLimit-Reset: {timestamp}` |
| Organization rate limit | 429 | `Organization rate limit exceeded` | `Retry-After: 60`, `X-RateLimit-Reset: {timestamp}` |

## Exception Hierarchy

The SDK defines the following custom exception classes:

```
Exception
├── HTTPException (FastAPI)
│   ├── 400 - BadRequestError
│   ├── 401 - AuthenticationError
│   ├── 403 - AuthorizationError
│   ├── 404 - NotFoundError
│   ├── 409 - ConflictError
│   ├── 413 - PayloadTooLargeError
│   ├── 415 - UnsupportedMediaTypeError
│   ├── 422 - ValidationError
│   ├── 429 - RateLimitError
│   └── 500 - InternalError
├── RequestValidationError (Pydantic)
├── AIServiceError
│   ├── AnthropicError
│   └── OpenAIError
├── StorageError
│   ├── UploadError
│   └── DownloadError
├── DatabaseError
│   ├── ConnectionError
│   └── QueryError
└── EncryptionError
    ├── EncryptError
    └── DecryptError
```

## Client Error Handling Guidelines

### Web Client (Next.js)

- Intercept 401 responses and redirect to login
- Display 422 validation errors inline on form fields
- Show toast notifications for 429 rate limit errors with countdown
- Display error boundaries for 500 errors with retry option

### Native Clients (Windows, iOS/macOS)

- Store refresh token and automatically retry on 401
- Parse validation error arrays and display per-field errors
- Implement exponential backoff for 429 and 5xx errors
- Show platform-native error dialogs for unrecoverable errors

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
