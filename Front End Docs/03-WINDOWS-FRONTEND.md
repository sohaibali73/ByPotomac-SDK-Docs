# ByPotomac SDK — Windows Frontend (WinUI 3)

## Overview

The ByPotomac Windows client is a 100% native Windows desktop application built with WinUI 3, .NET 8, and C# 12. No cross-platform framework of any kind is used. The application leverages the Windows App SDK 1.8 for modern Windows UI capabilities including Mica material backdrop, NavigationView shell, and MSIX packaging. It connects exclusively to the ByPotomac SDK backend for all data and AI operations.

## Technology Stack

| Component | Technology | Version |
|---|---|---|
| UI Framework | WinUI 3 (Windows App SDK) | 1.8 |
| Runtime | .NET | 8.0 |
| Language | C# | 12 |
| Architecture Pattern | MVVM | CommunityToolkit.Mvvm 8.4.0 |
| Target Platform | Windows 10 (19041+) / Windows 11 | Min: 10.0.17763.0 |
| Packaging | MSIX | Desktop Bridge |
| Build Platforms | x86, x64, ARM64 | All supported |

## Project Structure

```
PotomacAnalyst/
├── PotomacAnalyst.slnx               # Visual Studio solution
├── PotomacAnalyst.csproj              # Project file (.NET 8, WinAppSDK 1.8)
├── Package.appxmanifest               # MSIX packaging manifest
├── App.xaml / App.xaml.cs             # Application entry, DI container, global error handling
├── GlobalUsings.cs                    # Global using directives
├── MainWindow.xaml / .cs              # Shell window: NavigationView + auth frame
├── Controls/
│   └── Attachments.cs                 # File attachment UI (Grid, Inline, List variants)
├── GenUi/
│   └── GenUiCardBuilder.cs            # 22-card generative UI framework
├── Models/
│   ├── ApiModels.cs                   # All API DTOs (chat, AFL, backtest, KB, skills)
│   └── AuthModels.cs                  # Authentication DTOs
├── Services/
│   ├── ApiService.cs                  # HTTP client with auth, token refresh, SSE parsing
│   └── AuthService.cs                 # Auth flows with Windows Credential Manager
├── ViewModels/
│   ├── ChatViewModel.cs               # Chat page logic, message management, streaming
│   ├── KnowledgeBaseViewModel.cs      # Knowledge base management
│   ├── LoginViewModel.cs              # Login and registration logic
│   ├── MemoriesViewModel.cs           # Memory management
│   ├── ProjectsViewModel.cs           # Project management
│   ├── ResearchViewModel.cs           # Research and EDGAR search
│   └── SettingsViewModel.cs           # User settings and API key config
├── Views/
│   ├── ChatPage.xaml / .cs            # Main chat interface
│   ├── KnowledgeBasePage.xaml / .cs   # Knowledge base UI
│   ├── LoginPage.xaml / .cs           # Login/register page
│   ├── MemoriesPage.xaml / .cs        # Memories management
│   ├── ProjectsPage.xaml / .cs        # Project management
│   ├── ResearchPage.xaml / .cs        # Research interface
│   └── SettingsPage.xaml / .cs        # Settings page
└── Assets/                            # App icons and resources
```

## Architecture (MVVM)

The application follows the Model-View-ViewModel pattern using the CommunityToolkit.Mvvm library:

- **Models**: Plain C# classes representing API DTOs and local data structures
- **Views**: XAML pages with code-behind for UI-specific logic; data-bound to ViewModels
- **ViewModels**: `ObservableObject` subclasses with `[ObservableProperty]` and `[RelayCommand]` attributes for reactive data binding and command handling
- **Services**: Injected via `Microsoft.Extensions.DependencyInjection` for HTTP communication, authentication, and platform services

### Dependency Injection

```csharp
// App.xaml.cs
var services = new ServiceCollection();
services.AddSingleton<AuthService>();
services.AddSingleton<ApiService>();
services.AddTransient<ChatViewModel>();
services.AddTransient<LoginViewModel>();
// ... additional registrations
ServiceProvider = services.BuildServiceProvider();
```

## Authentication

### Login Flow

The Windows client uses Bearer token authentication with the ByPotomac SDK.

1. User enters email and password on the `LoginPage`
2. `LoginViewModel` calls `AuthService.LoginAsync(email, password)`
3. `AuthService` sends `POST /auth/v2/login` to the SDK
4. On success, the access token and refresh token are stored in Windows Credential Manager
5. `ApiService` is initialized with the access token for all subsequent requests
6. `MainWindow` navigates to the authenticated shell with `NavigationView`

### Token Storage

Tokens are stored in the Windows Credential Manager via `PasswordVault`:

```csharp
var vault = new PasswordVault();
vault.Add(new PasswordCredential("ByPotomac", "access_token", accessToken));
vault.Add(new PasswordCredential("ByPotomac", "refresh_token", refreshToken));
```

### Automatic Token Refresh

`ApiService` intercepts 401 responses and automatically attempts token refresh:

```csharp
public async Task<T> AuthenticatedRequestAsync<T>(string path, HttpMethod method, ...)
{
    var response = await SendRequestAsync(path, method, ...);
    if (response.StatusCode == HttpStatusCode.Unauthorized)
    {
        await RefreshTokenAsync();
        response = await SendRequestAsync(path, method, ...);
    }
    return await DeserializeAsync<T>(response);
}
```

## AI Chat and SSE Streaming

### Stream Parsing

The Windows client implements a custom SSE parser that reads the Vercel AI SDK Data Stream Protocol:

```csharp
public async IAsyncEnumerable<StreamEvent> StreamChatAsync(ChatRequest request)
{
    var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
    using var stream = await response.Content.ReadAsStreamAsync();
    using var reader = new StreamReader(stream);

    while (!reader.EndOfStream)
    {
        var line = await reader.ReadLineAsync();
        if (string.IsNullOrEmpty(line)) continue;

        var typeCode = line[0];
        var payload = line.Substring(2); // Skip "X:"

        yield return typeCode switch
        {
            '0' => new TextEvent(JsonSerializer.Deserialize<string>(payload)),
            '9' => new ToolCallBeginEvent(JsonSerializer.Deserialize<ToolCallBegin>(payload)),
            'a' => new ToolCallDeltaEvent(JsonSerializer.Deserialize<ToolCallDelta>(payload)),
            'b' => new ToolCallEndEvent(JsonSerializer.Deserialize<ToolCallEnd>(payload)),
            'c' => new ToolResultEvent(JsonSerializer.Deserialize<ToolResult>(payload)),
            'e' => new FinishEvent(JsonSerializer.Deserialize<FinishPayload>(payload)),
            '3' => new ErrorEvent(JsonSerializer.Deserialize<string>(payload)),
            _ => new UnknownEvent(line),
        };
    }
}
```

### ChatViewModel Streaming

The `ChatViewModel` consumes the stream and updates the UI on the dispatcher thread:

```csharp
[RelayCommand]
private async Task SendMessageAsync()
{
    var userMessage = new Message { Role = "user", Content = InputText };
    Messages.Add(userMessage);
    InputText = "";

    var assistantMessage = new Message { Role = "assistant", Content = "" };
    Messages.Add(assistantMessage);

    await foreach (var evt in _apiService.StreamChatAsync(request))
    {
        DispatcherQueue.TryEnqueue(() =>
        {
            switch (evt)
            {
                case TextEvent text:
                    assistantMessage.Content += text.Text;
                    break;
                case ToolResultEvent tool:
                    assistantMessage.ToolResults.Add(tool.Result);
                    break;
                case ErrorEvent error:
                    assistantMessage.Error = error.Message;
                    break;
            }
        });
    }
}
```

## Generative UI Card System

The `GenUiCardBuilder` renders 22 distinct card types as native WinUI 3 controls:

| Card Type | WinUI Control | Description |
|---|---|---|
| `stock_quote` | Custom `Grid` with `TextBlock` | Stock price with change indicator |
| `price_chart` | `Canvas` or third-party chart control | OHLCV price chart |
| `data_table` | `DataGrid` | Sortable data table |
| `comparison` | `Grid` with columns | Side-by-side metric comparison |
| `risk_summary` | `StackPanel` with `ProgressBar` | Risk metrics dashboard |
| `backtest_result` | Custom chart + metrics | Backtest performance summary |
| `alert` | `InfoBar` | Warning or information alert |
| `code_block` | `RichEditBox` with syntax highlighting | Code or formula display |
| `markdown` | `RichTextBlock` | Formatted text content |
| `loading` | `ProgressRing` | Loading indicator |

## Navigation

The `MainWindow` uses a `NavigationView` shell for primary navigation:

| NavigationViewItem | Page | Icon |
|---|---|---|
| Chat | `ChatPage` | `ChatRegular` |
| Research | `ResearchPage` | `SearchRegular` |
| Knowledge Base | `KnowledgeBasePage` | `BookRegular` |
| Projects | `ProjectsPage` | `FolderRegular` |
| Memories | `MemoriesPage` | `BrainRegular` |
| Settings | `SettingsPage` | `SettingsRegular` |

Navigation is handled by the `MainWindow.NavigationView_SelectionChanged` event handler which navigates the content frame to the selected page.

## Native Windows APIs Used

| API | Usage |
|---|---|
| `PasswordVault` (Credential Manager) | Secure token storage |
| `Windows.ApplicationModel.DataTransfer` | Clipboard operations |
| `Windows.Storage.Pickers` | File open/save dialogs |
| `Microsoft.UI.Composition` | Mica backdrop, animations |
| `Microsoft.UI.Dispatching` | UI thread dispatching for async updates |
| `Windows.UI.Notifications` | Toast notifications |
| `SystemBackdropController` | Mica material (BaseAlt) |

## Theming

- **Default theme**: Dark (`RequestedTheme="Dark"` in App.xaml)
- **Backdrop**: Mica BaseAlt (`MicaKind.BaseAlt`)
- **Color scheme**: Custom brand colors via `ThemeResources`
- **System theme follow**: Can follow Windows system theme setting

## Error Handling

| Error | UI Treatment |
|---|---|
| Network offline | `InfoBar` with reconnection message |
| Auth expired | Navigation to `LoginPage` with session expired message |
| API error (4xx) | `ContentDialog` with error details |
| API error (5xx) | `ContentDialog` with retry option |
| Stream error | Error message appended to chat |
| Unhandled exception | Global handler in `App.xaml.cs` with crash report dialog |

## Build and Deployment

### Development

```bash
dotnet build PotomacAnalyst.csproj
```

### MSIX Packaging

The application is packaged as an MSIX installer for distribution:
- Self-signed certificate for development
- Microsoft Store or enterprise sideloading for production
- Auto-update via MSIX App Installer

### Requirements

- Windows 10 version 1809 (build 17763) or later
- .NET 8.0 Runtime
- Windows App SDK 1.8 Runtime

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
