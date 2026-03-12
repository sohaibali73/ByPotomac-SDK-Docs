# ByPotomac SDK — iOS / macOS Frontend (Swift)

## Overview

The ByPotomac Apple client is a 100% native Apple platform application built with Swift 6.0, SwiftUI, and UIKit/AppKit. No cross-platform framework of any kind is used. It is a universal app that runs natively on iOS 17+, macOS 14+, visionOS 1+, and watchOS 10+. The application uses Swift Package Manager for dependency management and Swift's structured concurrency (`async`/`await`, actors) throughout. It connects exclusively to the ByPotomac SDK backend for all data and AI operations.

## Technology Stack

| Component | Technology | Version |
|---|---|---|
| Language | Swift | 6.0 |
| UI Framework | SwiftUI (primary), UIKit/AppKit (supplementary) | Latest |
| Concurrency | Swift Structured Concurrency (async/await, actors) | Native |
| Package Manager | Swift Package Manager | Native |
| Minimum iOS | 17.0 | — |
| Minimum macOS | 14.0 (Sonoma) | — |
| Minimum visionOS | 1.0 | — |
| Minimum watchOS | 10.0 | — |
| Persistence | SwiftData | Native |
| Networking | URLSession | Native |

## Project Structure

```
Analyst/
├── Package.swift                          # SPM package definition
├── Info.plist                             # Bundle config, permissions
├── Sources/Analyst/
│   ├── AnalystApp.swift                   # @main entry point (adaptive per platform)
│   ├── Core/
│   │   ├── Constants/
│   │   │   └── APIEndpoints.swift         # 80+ API routes in nested enums
│   │   └── Utilities/
│   │       ├── KeychainManager.swift       # Keychain Services wrapper
│   │       ├── HapticManager.swift         # Haptic feedback (iOS)
│   │       ├── SpeechManager.swift         # Speech synthesis
│   │       ├── NotificationManager.swift   # Push/local notifications
│   │       ├── LocationManager.swift       # Core Location integration
│   │       ├── BiometricManager.swift      # Face ID / Touch ID
│   │       ├── ClipboardManager.swift      # Pasteboard operations
│   │       ├── ShareManager.swift          # Share sheet integration
│   │       └── ThemeManager.swift          # Appearance management
│   ├── Models/
│   │   ├── AuthModels.swift               # Login, registration, token models
│   │   ├── ChatModels.swift               # Session, message, parts models
│   │   ├── APIResponse.swift              # Generic API response wrappers
│   │   └── AnyCodable.swift               # Type-erased Codable for dynamic JSON
│   ├── Services/
│   │   ├── Network/
│   │   │   ├── APIClient.swift            # Actor-based HTTP client
│   │   │   └── APIClient+Extensions.swift  # Domain-specific API methods
│   │   ├── Streaming/
│   │   │   └── SSEClient.swift            # Vercel AI SDK Data Stream parser
│   │   ├── Cache/
│   │   │   └── CacheManager.swift         # In-memory TTL cache (actor)
│   │   └── Persistence/
│   │       └── PersistenceManager.swift   # SwiftData persistence
│   ├── ViewModels/
│   │   ├── AuthViewModel.swift            # Authentication state and flows
│   │   ├── ChatViewModel.swift            # Chat session and message management
│   │   ├── SessionListViewModel.swift     # Session list management
│   │   ├── KnowledgeViewModel.swift       # Knowledge base operations
│   │   ├── SettingsViewModel.swift        # User settings management
│   │   ├── ProjectsViewModel.swift        # Project management
│   │   └── ResearchViewModel.swift        # Research and EDGAR operations
│   ├── Views/
│   │   ├── Auth/
│   │   │   ├── LoginView.swift            # Login screen
│   │   │   └── RegisterView.swift         # Registration screen
│   │   ├── Chat/
│   │   │   ├── ChatView.swift             # Main chat interface
│   │   │   ├── MessageBubble.swift        # Individual message rendering
│   │   │   ├── MessageInputBar.swift      # Text input with attachments
│   │   │   ├── ToolInvocationView.swift   # Tool call/result display
│   │   │   └── GenUiCardView.swift        # Generative UI card renderer
│   │   ├── Sessions/
│   │   │   ├── SessionListView.swift      # Session sidebar/list
│   │   │   └── SessionRow.swift           # Individual session row
│   │   ├── Knowledge/
│   │   │   ├── KnowledgeView.swift        # Knowledge base main view
│   │   │   ├── DocumentRow.swift          # Document list row
│   │   │   └── SearchView.swift           # Semantic search interface
│   │   ├── Settings/
│   │   │   └── SettingsView.swift         # Settings and preferences
│   │   ├── Projects/
│   │   │   └── ProjectsView.swift         # Project management
│   │   ├── Research/
│   │   │   └── ResearchView.swift         # Research interface
│   │   ├── Components/
│   │   │   ├── LoadingView.swift          # Loading indicators
│   │   │   ├── ErrorView.swift            # Error display
│   │   │   ├── EmptyStateView.swift       # Empty state placeholders
│   │   │   └── MarkdownView.swift         # Markdown rendering
│   │   └── Navigation/
│   │       └── ContentView.swift          # Root navigation (TabView/NavigationSplitView)
│   └── Theme/
│       ├── Colors.swift                   # Brand color definitions
│       ├── Typography.swift               # Font styles
│       └── Spacing.swift                  # Layout spacing constants
```

## Architecture

The application uses the MVVM pattern with SwiftUI's `@Observable` macro (Swift 5.9+) for reactive state management:

- **Models**: `Codable` structs representing API DTOs
- **Views**: SwiftUI views that observe ViewModels
- **ViewModels**: `@Observable` classes that manage state and business logic
- **Services**: Actor-isolated services for network, caching, and persistence

### Actor-Based API Client

The `APIClient` is implemented as a Swift actor for thread-safe network operations:

```swift
actor APIClient {
    private let session: URLSession
    private var accessToken: String?
    private var refreshToken: String?

    func request<T: Decodable>(_ endpoint: APIEndpoint) async throws -> T {
        var request = endpoint.urlRequest
        if let token = accessToken {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        if httpResponse.statusCode == 401 {
            try await refreshAccessToken()
            return try await self.request(endpoint) // Retry
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(httpResponse.statusCode, data)
        }

        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

## Authentication

### Login Flow

1. User enters credentials on `LoginView`
2. `AuthViewModel` calls `APIClient.login(email:password:)`
3. SDK returns access token and refresh token
4. Tokens stored in iOS Keychain via `KeychainManager`
5. `AuthViewModel` updates `isAuthenticated` state
6. Root `ContentView` transitions from auth flow to main navigation

### Keychain Storage

Tokens are stored securely in Keychain Services:

```swift
class KeychainManager {
    static func save(key: String, value: String) throws {
        let data = value.data(using: .utf8)!
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else { throw KeychainError.saveFailed(status) }
    }

    static func load(key: String) throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }
}
```

### Biometric Authentication

The app supports Face ID and Touch ID for returning users:

```swift
class BiometricManager {
    func authenticate() async throws -> Bool {
        let context = LAContext()
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            return false
        }
        return try await context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: "Authenticate to access ByPotomac"
        )
    }
}
```

## SSE Streaming

The `SSEClient` actor parses the Vercel AI SDK Data Stream Protocol:

```swift
actor SSEClient {
    func stream(request: URLRequest) -> AsyncThrowingStream<StreamEvent, Error> {
        AsyncThrowingStream { continuation in
            let task = URLSession.shared.dataTask(with: request) { ... }
            // Parse lines, emit StreamEvent values
            // Handle type codes: 0 (text), 9/a/b/c (tools), e (finish), 3 (error)
        }
    }
}
```

### ChatViewModel Streaming

```swift
@Observable
class ChatViewModel {
    var messages: [Message] = []
    var isStreaming = false

    func sendMessage(_ text: String) async {
        messages.append(Message(role: .user, content: text))
        let assistantMessage = Message(role: .assistant, content: "")
        messages.append(assistantMessage)
        isStreaming = true

        do {
            for try await event in sseClient.stream(request: chatRequest) {
                await MainActor.run {
                    switch event {
                    case .text(let chunk):
                        messages[messages.count - 1].content += chunk
                    case .toolResult(let result):
                        messages[messages.count - 1].toolResults.append(result)
                    case .finish:
                        isStreaming = false
                    case .error(let message):
                        messages[messages.count - 1].error = message
                        isStreaming = false
                    }
                }
            }
        } catch {
            isStreaming = false
        }
    }
}
```

## Navigation

### Adaptive Navigation

The app uses platform-adaptive navigation:

- **iPhone**: `TabView` with bottom tab bar
- **iPad**: `NavigationSplitView` with sidebar
- **Mac**: `NavigationSplitView` with sidebar (Mac Catalyst / native macOS)
- **visionOS**: Ornament-based navigation

```swift
struct ContentView: View {
    var body: some View {
        #if os(iOS)
        if UIDevice.current.userInterfaceIdiom == .pad {
            NavigationSplitView { Sidebar() } detail: { ChatView() }
        } else {
            TabView {
                ChatView().tabItem { Label("Chat", systemImage: "message") }
                KnowledgeView().tabItem { Label("Knowledge", systemImage: "book") }
                SettingsView().tabItem { Label("Settings", systemImage: "gear") }
            }
        }
        #elseif os(macOS)
        NavigationSplitView { Sidebar() } detail: { ChatView() }
        #endif
    }
}
```

## Native Apple APIs Used

| API / Framework | Usage |
|---|---|
| Keychain Services | Secure token storage |
| LocalAuthentication (LAContext) | Face ID / Touch ID biometric auth |
| AVFoundation | Speech synthesis for reading responses |
| Core Location | Location context for queries |
| Core Haptics | Haptic feedback on interactions (iOS) |
| UserNotifications | Push and local notifications |
| UIActivityViewController | Share sheet for sharing content |
| SwiftData | Local persistence and caching |
| NaturalLanguage | Text analysis and language detection |
| SafariServices | In-app web browsing for links |

## Theming

- **System adaptive**: Follows iOS/macOS appearance (light/dark)
- **Custom palette**: Brand-specific colors defined in `Colors.swift`
- **Dynamic Type**: Full support for iOS Dynamic Type accessibility
- **Platform-specific**: Adapts visual density for iPhone, iPad, and Mac

## Error Handling

| Error | UI Treatment |
|---|---|
| Network offline | `EmptyStateView` with offline message and retry |
| Auth expired | Navigation reset to `LoginView` |
| API error | `Alert` with error description and retry option |
| Stream error | Error message in chat bubble |
| Biometric failure | Fallback to password entry |

## Accessibility

- **VoiceOver**: All views have accessibility labels and hints
- **Dynamic Type**: Text scales with system font size settings
- **Reduce Motion**: Animations respect `accessibilityReduceMotion`
- **Bold Text**: Supports `accessibilityBoldText` preference
- **High Contrast**: Adapts to increased contrast settings

## Build and Deployment

### Development

```bash
swift build
# Or open in Xcode and build for target device/simulator
```

### Distribution

- **TestFlight**: Beta distribution for testing
- **App Store**: Public distribution
- **Enterprise**: Enterprise distribution for organizations
- **Direct**: Developer ID signed for macOS direct distribution

### Entitlements

- **App Sandbox**: Enabled for macOS
- **Network Client**: Outgoing network connections
- **Keychain Access**: Secure credential storage
- **Camera**: For document scanning (iOS)
- **Microphone**: For voice input
- **Face ID**: Biometric authentication

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
