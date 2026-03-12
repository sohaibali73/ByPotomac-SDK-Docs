# ByPotomac SDK — Frontend Platform Overview

## Multi-Platform Native Architecture

ByPotomac SDK powers a multi-platform product ecosystem where every client application is built as a 100% native application for its target platform. No cross-platform frameworks are used anywhere in the ecosystem. This is a deliberate, architectural decision that ensures every client delivers the best possible user experience by leveraging platform-native capabilities, performance characteristics, and design language.

The ByPotomac SDK backend is the single unified engine that all of these native clients connect to. Client applications are responsible for user interface rendering, local state management, and platform-specific interactions. All data persistence, AI orchestration, authentication, and business logic are handled by the SDK.

## Platform Client Matrix

| Platform | Technology Stack | Status | Description |
|---|---|---|---|
| **Web** | Next.js 16, React 19, TypeScript, Tailwind CSS | Production | Progressive web application for browser-based access |
| **Windows** | WinUI 3, .NET 8, C# 12 — 100% native, no cross-platform framework | Production | Native Windows desktop application with Mica material design |
| **iOS / macOS** | Swift 6.0, SwiftUI, UIKit/AppKit — 100% native, no cross-platform framework | Production | Universal Apple platform app for iPhone, iPad, Mac, and Vision Pro |
| **Android** | Kotlin, Jetpack Compose — 100% native, no cross-platform framework | Planned | Native Android application with Material 3 design |
| **Linux** | C++/Rust, GTK 4 or Qt 6 — 100% native, no cross-platform framework | Planned | Native Linux desktop application |
| **Tizen (Samsung TV)** | 100% native Tizen — no cross-platform framework | Planned | Native Samsung Smart TV application |
| **Roku TV** | BrightScript, SceneGraph — 100% native Roku, no cross-platform framework | Planned | Native Roku streaming device application |

## Shared Architecture Patterns

While each client is built with completely different technology stacks, all clients share the same architectural patterns for interacting with ByPotomac SDK:

### Authentication Flow
1. User provides credentials (email/password or SSO)
2. Client sends credentials to the SDK authentication endpoint
3. SDK returns JWT access token and refresh token
4. Client stores tokens securely using platform-native secure storage
5. Client includes the token in every subsequent request
6. Client handles token refresh transparently when tokens expire

### AI Chat Integration
1. Client sends user message to `POST /api/chat` with conversation history
2. SDK opens an SSE (Server-Sent Events) stream
3. Client parses the Vercel AI SDK Data Stream Protocol line by line
4. Text tokens are rendered incrementally as they arrive
5. Tool invocations and results are rendered as generative UI cards
6. Stream completion signals the end of the response

### Data Synchronization
- All data is server-authoritative — the SDK is the single source of truth
- Clients fetch data via REST API calls and cache locally for performance
- Real-time updates are received via Supabase Realtime subscriptions
- Optimistic updates are applied locally and confirmed by server responses

### Error Handling
- HTTP 401 triggers automatic token refresh and request retry
- HTTP 429 triggers exponential backoff with user notification
- HTTP 5xx errors display platform-appropriate error dialogs
- Network disconnection triggers reconnection with offline state indication

## Platform-Specific Documentation

Detailed documentation for each production client follows in dedicated sections:
- Web Frontend (Next.js) — `02-WEB-FRONTEND.md`
- Windows Frontend (WinUI 3) — `03-WINDOWS-FRONTEND.md`
- iOS / macOS Frontend (Swift) — `04-APPLE-FRONTEND.md`
- Planned Platforms — `05-PLANNED-PLATFORMS.md`

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
