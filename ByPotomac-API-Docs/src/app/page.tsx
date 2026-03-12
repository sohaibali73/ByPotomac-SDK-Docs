'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      title: 'RESTful API',
      description: 'Complete REST API with comprehensive endpoints for all ByPotomac SDK functionality.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      title: 'Real-time Streaming',
      description: 'Server-Sent Events (SSE) for real-time chat responses and live updates.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Authentication',
      description: 'Multiple authentication methods including OAuth, API keys, and enterprise SSO.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: 'Multi-tenancy',
      description: 'Built-in organization isolation and role-based access control.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'AI Integration',
      description: 'Seamless integration with Anthropic Claude and OpenAI for intelligent features.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Compliance',
      description: 'SOC 2, GDPR, and enterprise-grade security and compliance features.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  const quickLinks = [
    {
      title: 'Authentication',
      description: 'Learn how to authenticate with the ByPotomac SDK API.',
      href: '/docs/authentication',
      gradient: 'from-primary/20 to-primary/5',
      borderColor: 'border-primary/30',
      iconColor: 'text-primary',
    },
    {
      title: 'API Reference',
      description: 'Complete API endpoint documentation with examples.',
      href: '/docs/api-reference',
      gradient: 'from-accent/20 to-accent/5',
      borderColor: 'border-accent/30',
      iconColor: 'text-accent',
    },
    {
      title: 'Streaming',
      description: 'Real-time data streaming and Server-Sent Events.',
      href: '/docs/streaming',
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Security',
      description: 'Enterprise-grade security and compliance features.',
      href: '/docs/security',
      gradient: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
  ];

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="text-primary-foreground font-bold text-sm">BP</span>
                </div>
                <div>
                  <span className="block text-lg font-heading font-bold text-foreground">
                    ByPotomac SDK
                  </span>
                  <p className="text-xs text-muted-foreground">API Documentation</p>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/docs" className="nav-link px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                Documentation
              </Link>
              <Link href="/api-reference" className="nav-link px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                API Reference
              </Link>
              <Link href="/guides" className="nav-link px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                Guides
              </Link>
              <Link href="/support" className="nav-link px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                Support
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/api-reference" className="btn-primary text-sm">
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-ring"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden bg-background border-t border-border">
            <div className="px-4 py-4 space-y-1">
              <Link href="/docs" onClick={closeMenu} className="block py-2.5 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Documentation
              </Link>
              <Link href="/api-reference" onClick={closeMenu} className="block py-2.5 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                API Reference
              </Link>
              <Link href="/guides" onClick={closeMenu} className="block py-2.5 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Guides
              </Link>
              <Link href="/support" onClick={closeMenu} className="block py-2.5 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Support
              </Link>
              <div className="pt-4 border-t border-border">
                <Link href="/api-reference" onClick={closeMenu} className="btn-primary w-full justify-center">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden py-20 lg:py-32">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-8 animate-fade-in-up">
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight text-balance">
                    ByPotomac SDK
                    <span className="gradient-text block"> API Documentation</span>
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                    Complete API documentation for building powerful financial analysis applications
                    with AI capabilities. Access comprehensive endpoints, real-time streaming,
                    authentication, and enterprise-grade security features.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link href="/api-reference" className="btn-primary text-base px-6 py-3">
                    Explore API
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link href="/docs/overview" className="btn-secondary text-base px-6 py-3">
                    Quick Start
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Production Ready</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <span>Real-time Streaming</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    <span>Enterprise Security</span>
                  </span>
                </div>
              </div>

              <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="card border-border/50 bg-card/50 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-foreground">API Status</h3>
                      <span className="badge badge-success">All Systems Operational</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 p-4 rounded-lg border border-border">
                        <span className="text-sm text-muted-foreground">Uptime</span>
                        <p className="text-xl font-bold text-foreground">99.9%</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg border border-border">
                        <span className="text-sm text-muted-foreground">Response Time</span>
                        <p className="text-xl font-bold text-foreground">{'< 200ms'}</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg border border-border">
                        <span className="text-sm text-muted-foreground">API Version</span>
                        <p className="text-xl font-bold text-foreground">v2.0</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg border border-border">
                        <span className="text-sm text-muted-foreground">Endpoints</span>
                        <p className="text-xl font-bold text-foreground">50+</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-28 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4 text-balance">
                Powerful Features
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to build sophisticated financial applications with AI capabilities
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="card-hover group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="py-20 lg:py-28 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4 text-balance">
                Get Started Quickly
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our comprehensive documentation to start building with the ByPotomac SDK
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {quickLinks.map((link, index) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className={`card group hover:border-muted-foreground/40 transition-all duration-300 bg-gradient-to-br ${link.gradient} border ${link.borderColor} animate-fade-in-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-background/50 ${link.iconColor}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-heading font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{link.description}</p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        <span>Explore</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Code Example Section */}
        <section className="py-20 lg:py-28 border-t border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <span className="badge badge-info mb-4">Code Example</span>
                  <h3 className="text-3xl font-heading font-bold text-foreground text-balance">
                    Make Your First API Call
                  </h3>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    Get started with a simple example that demonstrates how to authenticate
                    and make requests to the ByPotomac SDK API.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">curl</span>
                    <span className="text-border">|</span>
                    <span>Node.js</span>
                    <span className="text-border">|</span>
                    <span>Python</span>
                  </div>
                  <div className="card bg-card border-border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
                      <span className="text-emerald-400 font-mono text-sm">$ curl</span>
                      <span className="text-muted-foreground text-xs">bash</span>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm">
                      <code className="text-muted-foreground font-mono">{`curl -X POST https://api.bypotomac.com/auth/v2/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'`}</code>
                    </pre>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link href="/docs/authentication" className="btn-primary">
                    Authentication Guide
                  </Link>
                  <Link href="/api-reference" className="btn-secondary">
                    View All Endpoints
                  </Link>
                </div>
              </div>

              <div className="card bg-card border-border">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-heading font-bold text-foreground mb-3">Response</h4>
                    <div className="bg-muted rounded-lg p-4 border border-border overflow-x-auto">
                      <pre className="text-sm font-mono">
                        <code className="text-emerald-400">{`{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "analyst"
  }
}`}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground">Status Code</span>
                      <p className="font-bold text-foreground">200 OK</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground">Rate Limit</span>
                      <p className="font-bold text-foreground">120/min</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground">Auth Required</span>
                      <p className="font-bold text-foreground">Yes</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground">Response Time</span>
                      <p className="font-bold text-foreground">{'< 100ms'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28 border-t border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
          <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 text-balance">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Join developers building the future of financial analysis with AI.
              Get started with our comprehensive documentation and developer tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/api-reference" className="btn-primary text-base px-8 py-3">
                Explore API Documentation
              </Link>
              <Link href="/docs/overview" className="btn-secondary text-base px-8 py-3">
                Read Getting Started Guide
              </Link>
            </div>
            <div className="mt-10 text-sm text-muted-foreground">
              Built to Conquer Risk
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">BP</span>
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-foreground">ByPotomac SDK</h3>
                  <p className="text-sm text-muted-foreground">API Documentation</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md text-sm">
                Complete API documentation for the ByPotomac SDK. Build powerful financial
                analysis applications with AI capabilities, real-time streaming, and
                enterprise-grade security.
              </p>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Documentation</h4>
              <ul className="space-y-2.5">
                <li><Link href="/docs/overview" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Getting Started</Link></li>
                <li><Link href="/docs/authentication" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Authentication</Link></li>
                <li><Link href="/docs/api-reference" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Reference</Link></li>
                <li><Link href="/docs/streaming" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Streaming</Link></li>
                <li><Link href="/docs/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><Link href="/docs/deployment" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Deployment</Link></li>
                <li><Link href="/docs/platform-overview" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Platform SDKs</Link></li>
                <li><Link href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Support</Link></li>
                <li><Link href="/docs/observability" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Observability</Link></li>
                <li><Link href="/docs/testing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testing</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-muted-foreground text-sm">
              2026 Potomac Fund Management. Built to Conquer Risk
            </div>
            <div className="flex gap-6">
              <Link href="/docs/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</Link>
              <Link href="/docs/multitenancy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compliance</Link>
              <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
