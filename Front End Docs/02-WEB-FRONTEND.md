# ByPotomac SDK — Web Frontend (Next.js)

## Overview

The ByPotomac web client is a progressive web application built with Next.js 16, React 19, and TypeScript. It provides browser-based access to the full ByPotomac product experience including AI-powered financial analysis, real-time chat with streaming responses, knowledge base management, file handling, and session management. The web client connects exclusively to the ByPotomac SDK backend for all operations.

## Technology Stack

| Component | Technology | Version |
|---|---|---|
| Framework | Next.js | 16 |
| UI Library | React | 19 |
| Language | TypeScript | 5.7 |
| Styling | Tailwind CSS | 3.4 |
| Component Library | shadcn/ui (New York style) | Latest |
| AI Integration | Vercel AI SDK (`ai`, `@ai-sdk/react`) | 6.0+ |
| Realtime | Supabase JavaScript Client | Latest |
| Build Tool | Turbopack (Next.js dev) | Latest |
| Package Manager | pnpm | Latest |

## Project Structure

```
Abpfrontend/
├── next.config.ts              # Next.js configuration with API proxy rewrites
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS with custom theme
├── postcss.config.js           # PostCSS configuration
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Landing / redirect page
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   ├── register/
│   │   │   └── page.tsx        # Registration page
│   │   ├── chat/
│   │   │   ├── page.tsx        # Main chat interface
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Chat session by ID
│   │   ├── knowledge/
│   │   │   └── page.tsx        # Knowledge base management
│   │   ├── settings/
│   │   │   └── page.tsx        # User settings and preferences
│   │   ├── projects/
│   │   │   └── page.tsx        # Project management
│   │   └── api/                # Next.js API routes (proxy layer)
│   │       ├── auth/
│   │       │   ├── login/route.ts    # Auth proxy with cookie setting
│   │       │   ├── me/route.ts       # Session check proxy
│   │       │   └── logout/route.ts   # Logout proxy
│   │       └── chat/
│   │           └── route.ts          # Chat API proxy (SSE passthrough)
│   ├── components/             # React components
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx     # Main chat UI container
│   │   │   ├── MessageList.tsx       # Message display list
│   │   │   ├── MessageBubble.tsx     # Individual message rendering
│   │   │   ├── ChatInput.tsx         # Message input with attachments
│   │   │   ├── SessionSidebar.tsx    # Session list sidebar
│   │   │   ├── ToolInvocation.tsx    # Tool call/result rendering
│   │   │   └── GenUiCard.tsx         # Generative UI card renderer
│   │   ├── knowledge/
│   │   │   ├── DocumentList.tsx      # Knowledge base document list
│   │   │   ├── UploadDialog.tsx      # Document upload dialog
│   │   │   └── SearchInterface.tsx   # Semantic search interface
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx         # Login form component
│   │   │   ├── RegisterForm.tsx      # Registration form
│   │   │   └── AuthGuard.tsx         # Route protection wrapper
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Application header
│   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   └── Footer.tsx            # Application footer
│   │   └── ui/                       # shadcn/ui primitives (not documented)
│   ├── hooks/
│   │   ├── useAuth.ts               # Authentication hook
│   │   ├── useChat.ts               # AI chat hook wrapper
│   │   ├── useSessions.ts           # Session management hook
│   │   ├── useKnowledge.ts          # Knowledge base hook
│   │   └── useFiles.ts              # File management hook
│   ├── lib/
│   │   ├── api.ts                   # HTTP client configuration
│   │   ├── supabase.ts              # Supabase client initialization
│   │   ├── auth.ts                  # Auth utility functions
│   │   └── utils.ts                 # General utility functions
│   ├── providers/
│   │   ├── AuthProvider.tsx          # Authentication context provider
│   │   ├── ThemeProvider.tsx         # Theme context (dark/light)
│   │   └── RealtimeProvider.tsx      # Supabase Realtime provider
│   └── types/
│       ├── api.ts                   # API response type definitions
│       ├── chat.ts                  # Chat and message types
│       └── auth.ts                  # Authentication types
└── public/
    └── assets/                      # Static assets
```

## Authentication Flow

The web client implements a cookie-based authentication flow. JWT tokens are never exposed to client-side JavaScript. Authentication is proxied through Next.js API routes.

### Login Flow

```
User                    Next.js Client          Next.js API Route       ByPotomac SDK
  │                          │                        │                       │
  │  Enter credentials       │                        │                       │
  │─────────────────────────>│                        │                       │
  │                          │                        │                       │
  │                          │  POST /api/auth/login  │                       │
  │                          │  {email, password}     │                       │
  │                          │───────────────────────>│                       │
  │                          │                        │                       │
  │                          │                        │  POST /auth/v2/login  │
  │                          │                        │───────────────────────>│
  │                          │                        │                       │
  │                          │                        │  {access_token,       │
  │                          │                        │   refresh_token}      │
  │                          │                        │<───────────────────────│
  │                          │                        │                       │
  │                          │  Set-Cookie:           │                       │
  │                          │  potomac_session=token │                       │
  │                          │  (HttpOnly, Secure,    │                       │
  │                          │   7-day expiry)        │                       │
  │                          │<───────────────────────│                       │
  │                          │                        │                       │
  │                          │  Set window.__potomac  │                       │
  │                          │  _token for AI SDK     │                       │
  │                          │                        │                       │
  │  Redirect to /chat       │                        │                       │
  │<─────────────────────────│                        │                       │
```

### AuthProvider

The `AuthProvider` component wraps the entire application and manages authentication state:

- On mount, calls `GET /api/auth/me` to check for an existing session
- If authenticated, stores the user object in React context
- Sets `window.__potomac_token` synchronously for the AI SDK transport
- Provides `login()`, `logout()`, and `refreshToken()` functions to child components
- Redirects unauthenticated users to `/login` for protected routes

### Token Storage

| Storage | Content | Access |
|---|---|---|
| `potomac_session` cookie | JWT access token | HttpOnly — no JavaScript access |
| `window.__potomac_token` | Access token reference | Read by AI SDK transport layer |
| React context | User profile object | Application state |

## AI Chat Integration

### useChat Hook

The web client uses the Vercel AI SDK `useChat` hook for AI chat functionality:

```typescript
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

const transport = new DefaultChatTransport({
  api: `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
  headers: () => ({
    Authorization: `Bearer ${window.__potomac_token}`,
  }),
});

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    transport,
    id: sessionId,
    onFinish: (message) => {
      // Handle completed response
    },
    onError: (error) => {
      // Handle streaming error
    },
  });

  return (
    <div>
      <MessageList messages={messages} />
      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
```

### Message Rendering

Messages are rendered based on their `parts` array. Each part type has a dedicated renderer:

| Part Type | Renderer | Display |
|---|---|---|
| `text` | `TextPart` | Markdown-rendered text with syntax highlighting |
| `tool-invocation` | `ToolInvocation` | Tool call with loading state, then rendered result |
| `file` | `FilePart` | File preview or download link |
| `image` | `ImagePart` | Inline image display |

### Generative UI Cards

Tool results that include structured data are rendered as interactive generative UI cards:

- `stock_quote` — Real-time price display with sparkline
- `price_chart` — Interactive chart using Recharts
- `data_table` — Sortable, filterable data table
- `backtest_result` — Performance summary with equity curve
- `correlation_matrix` — Heatmap visualization
- Additional card types are rendered by the `GenUiCard` component based on the card `type` field

## State Management

The web client uses React Context for global state and local component state for UI-specific state:

| State | Storage | Scope |
|---|---|---|
| Authentication | `AuthProvider` (React Context) | Global |
| Theme | `ThemeProvider` (React Context) | Global |
| Chat messages | `useChat` hook (local) | Per chat session |
| Sessions list | `useSessions` hook (SWR/fetch) | Chat page |
| Knowledge base | `useKnowledge` hook (SWR/fetch) | Knowledge page |
| File uploads | `useFiles` hook (local) | Upload context |
| Form state | `useState` (local) | Per component |

## Routing and Navigation

The web client uses the Next.js App Router with the following route structure:

| Route | Page | Auth Required | Description |
|---|---|---|---|
| `/` | Landing | No | Redirects to `/chat` if authenticated, `/login` if not |
| `/login` | Login | No | Email/password login form |
| `/register` | Register | No | New account registration |
| `/chat` | Chat | Yes | Main chat interface with session list |
| `/chat/[id]` | Chat Session | Yes | Specific chat session |
| `/knowledge` | Knowledge Base | Yes | Document management and search |
| `/settings` | Settings | Yes | User preferences and API key configuration |
| `/projects` | Projects | Yes | Project management |

### Navigation Component

The sidebar provides navigation between major sections and displays the user's session list for quick access:

- Chat (with session list)
- Knowledge Base
- Projects
- Settings
- Logout

## API and Data Fetching

### HTTP Client

All API calls go through a centralized HTTP client in `lib/api.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include', // Send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Trigger token refresh
    await refreshToken();
    // Retry the request
    return fetch(`${API_BASE}${path}`, { ...options, credentials: 'include' });
  }

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(response.status, error.detail);
  }

  return response.json();
}
```

### Next.js API Route Proxy

The Next.js backend proxies certain API calls to handle cookie management:

```typescript
// src/app/api/auth/login/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${BACKEND_URL}/auth/v2/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (response.ok) {
    const res = NextResponse.json(data);
    res.cookies.set('potomac_session', data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return res;
  }

  return NextResponse.json(data, { status: response.status });
}
```

## Real-Time Updates

The web client subscribes to Supabase Realtime for live database updates:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Subscribe to new messages in a session
const channel = supabase
  .channel(`session-${sessionId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `session_id=eq.${sessionId}`,
  }, handleNewMessage)
  .subscribe();
```

## File Handling

### Upload Flow

1. User selects a file via the file input or drag-and-drop
2. Client validates file size (max 50MB) and MIME type
3. File is uploaded via `POST /files/upload` as multipart form data
4. Upload progress is displayed in the UI
5. On completion, the file reference is displayed in the chat or knowledge base

### Supported Formats

| Category | Formats |
|---|---|
| Documents | PDF, DOCX, XLSX, CSV, TXT, MD |
| Images | PNG, JPG, JPEG, GIF, SVG |

## Theming

The web client supports dark and light themes via Tailwind CSS and CSS custom properties:

- **Default theme**: Dark
- **Theme toggle**: Available in settings and header
- **System preference**: Follows `prefers-color-scheme` when set to "system"
- **Persistence**: Theme preference saved to user preferences via the SDK

## Error Handling

| Error State | UI Treatment |
|---|---|
| Authentication expired | Redirect to login with "Session expired" message |
| Network offline | Banner notification with reconnection indicator |
| API error (4xx) | Toast notification with error message |
| API error (5xx) | Full-page error with retry button |
| Stream error | Error message in chat with retry option |
| Validation error | Inline field-level error messages |
| Rate limited | Toast with countdown timer |

## Build and Deployment

### Development

```bash
pnpm install
pnpm dev          # Start with Turbopack on port 3000
```

### Production Build

```bash
pnpm build        # Create production build
pnpm start        # Start production server
```

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | ByPotomac SDK backend URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

### Deployment Target

The web client is deployed to Railway (production) with Vercel configuration available as an alternative. The Next.js configuration includes a proxy rewrite for `/api/backend/:path*` to route directly to the SDK backend.

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
