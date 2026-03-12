# ByPotomac SDK — Planned Platform Clients

## Platform Roadmap

ByPotomac SDK is designed to serve every major computing platform. The following platforms are planned for future development. Each will be built as a 100% native application with no cross-platform frameworks of any kind. The ByPotomac SDK backend is the single unified engine that all of these native clients will connect to.

---

## Android

**Status**: Planned

**Technology Stack:**
- Language: Kotlin
- UI Framework: Jetpack Compose
- Architecture: MVVM with Hilt dependency injection
- Networking: OkHttp + Retrofit
- Streaming: OkHttp SSE client with custom Data Stream Protocol parser
- Authentication: Android Keystore with `EncryptedSharedPreferences`
- Minimum SDK: Android 10 (API 29)

100% native Android. Built with Kotlin and Jetpack Compose. No cross-platform framework of any kind.

**Integration Plan:**
- Bearer token auth with Android Keystore for secure storage
- OkHttp interceptor for automatic token injection and refresh
- Kotlin Flow-based SSE streaming to Compose UI
- Material 3 (Material You) design system
- WorkManager for background task scheduling
- Firebase Cloud Messaging for push notifications

---

## Linux

**Status**: Planned

**Technology Stack:**
- Language: C++ or Rust
- UI Framework: GTK 4 or Qt 6
- Networking: libcurl (C++) or reqwest (Rust)
- Authentication: libsecret / GNOME Keyring for secure storage

100% native Linux. Built with C++/Rust and GTK 4 or Qt 6. No cross-platform framework of any kind.

**Integration Plan:**
- Bearer token auth with libsecret credential storage
- Custom SSE parser for the Data Stream Protocol
- GLib async I/O (GTK) or Tokio async runtime (Rust)
- Native desktop integration (DBus, file manager, notifications)
- Flatpak and/or Snap packaging for distribution

---

## Tizen (Samsung Smart TV)

**Status**: Planned

**Technology Stack:**
- Platform: Tizen OS
- Framework: Native Tizen APIs

100% native Tizen. No cross-platform framework of any kind.

**Integration Plan:**
- Optimized for TV remote navigation and large screen display
- Simplified chat interface adapted for 10-foot viewing distance
- Bearer token auth with Tizen security framework
- Custom SSE parser for streaming AI responses

---

## Roku TV

**Status**: Planned

**Technology Stack:**
- Language: BrightScript
- UI Framework: SceneGraph

100% native Roku. Built with BrightScript and SceneGraph. No cross-platform framework of any kind.

**Integration Plan:**
- SceneGraph-based UI optimized for TV display
- BrightScript HTTP client for SDK communication
- Custom Data Stream Protocol parser in BrightScript
- Roku Channel Store distribution

---

## Cross-Platform Disclaimer

Every planned platform will be built with its native technology stack. The ByPotomac ecosystem does not use and will never use cross-platform frameworks such as React Native, Flutter, Xamarin, .NET MAUI, Electron, or any similar technology for any client application. This is a core architectural principle that ensures maximum performance, full platform API access, and native user experience on every platform.

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
