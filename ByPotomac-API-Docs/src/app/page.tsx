'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      title: 'RESTful API',
      description: 'Complete REST API with comprehensive endpoints for all ByPotomac SDK functionality.',
      icon: '🔗',
    },
    {
      title: 'Real-time Streaming',
      description: 'Server-Sent Events (SSE) for real-time chat responses and live updates.',
      icon: '⚡',
    },
    {
      title: 'Authentication',
      description: 'Multiple authentication methods including OAuth, API keys, and enterprise SSO.',
      icon: '🔐',
    },
    {
      title: 'Multi-tenancy',
      description: 'Built-in organization isolation and role-based access control.',
      icon: '🏢',
    },
    {
      title: 'AI Integration',
      description: 'Seamless integration with Anthropic Claude and OpenAI for intelligent features.',
      icon: '🤖',
    },
    {
      title: 'Compliance',
      description: 'SOC 2, GDPR, and enterprise-grade security and compliance features.',
      icon: '🛡️',
    },
  ];

  const quickLinks = [
    {
      title: 'Authentication',
      description: 'Learn how to authenticate with the ByPotomac SDK API.',
      href: '/docs/authentication',
      color: 'bg-potomac-yellow',
    },
    {
      title: 'API Reference',
      description: 'Complete API endpoint documentation with examples.',
      href: '/docs/api-reference',
      color: 'bg-potomac-turquoise',
    },
    {
      title: 'Streaming',
      description: 'Real-time data streaming and Server-Sent Events.',
      href: '/docs/streaming',
      color: 'bg-potomac-pink',
    },
    {
      title: 'Security',
      description: 'Enterprise-grade security and compliance features.',
      href: '/docs/security',
      color: 'bg-potomac-gray',
    },
  ];

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-potomac-yellow rounded-lg flex items-center justify-center">
                  <span className="text-potomac-gray font-bold text-sm">BP</span>
                </div>
                <div>
                  {/* FIX: was <h1>, conflicts with the hero <h1>. Use <span> in nav. */}
                  <span className="block text-xl font-rajdhani font-bold text-potomac-gray">
                    ByPotomac SDK
                  </span>
                  <p className="text-xs text-gray-500">API Documentation</p>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/docs" className="text-gray-700 hover:text-potomac-yellow transition-colors font-rajdhani">
                Documentation
              </Link>
              <Link href="/api-reference" className="text-gray-700 hover:text-potomac-yellow transition-colors font-rajdhani">
                API Reference
              </Link>
              <Link href="/guides" className="text-gray-700 hover:text-potomac-yellow transition-colors font-rajdhani">
                Guides
              </Link>
              <Link href="/support" className="text-gray-700 hover:text-potomac-yellow transition-colors font-rajdhani">
                Support
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/api-reference" className="btn-primary focus-ring">
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-potomac-yellow focus-ring"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? (
                  /* X icon when open */
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  /* Hamburger icon when closed */
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              {/* FIX: added onClick={closeMenu} so menu closes on navigation */}
              <Link href="/docs" onClick={closeMenu} className="block py-2 text-gray-700 hover:text-potomac-yellow font-rajdhani">
                Documentation
              </Link>
              <Link href="/api-reference" onClick={closeMenu} className="block py-2 text-gray-700 hover:text-potomac-yellow font-rajdhani">
                API Reference
              </Link>
              <Link href="/guides" onClick={closeMenu} className="block py-2 text-gray-700 hover:text-potomac-yellow font-rajdhani">
                Guides
              </Link>
              <Link href="/support" onClick={closeMenu} className="block py-2 text-gray-700 hover:text-potomac-yellow font-rajdhani">
                Support
              </Link>
              <div className="border-t border-gray-200 my-2"></div>
              <Link href="/api-reference" onClick={closeMenu} className="btn-primary w-full text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main>
        <section className="bg-gradient-to-br from-potomac-yellow via-white to-potomac-turquoise py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  {/* Correct: single <h1> on the page */}
                  <h1 className="text-5xl lg:text-6xl font-rajdhani font-bold text-potomac-gray leading-tight">
                    ByPotomac SDK
                    <span className="gradient-text"> API Documentation</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Complete API documentation for building powerful financial analysis applications
                    with AI capabilities. Access comprehensive endpoints, real-time streaming,
                    authentication, and enterprise-grade security features.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link href="/api-reference" className="btn-primary text-lg px-8 py-3 focus-ring">
                    Explore API
                  </Link>
                  <Link href="/docs/overview" className="btn-secondary text-lg px-8 py-3 focus-ring">
                    Quick Start
                  </Link>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Production Ready</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Real-time Streaming</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Enterprise Security</span>
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-rajdhani font-bold text-potomac-gray">API Status</h3>
                      <span className="badge badge-success">All Systems Operational</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-500">Uptime</span>
                        <p className="font-bold text-potomac-gray">99.9%</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-500">Response Time</span>
                        {/* FIX: raw `<` in JSX text → use &lt; */}
                        <p className="font-bold text-potomac-gray">&lt; 200ms</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-500">API Version</span>
                        <p className="font-bold text-potomac-gray">v2.0</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-500">Endpoints</span>
                        <p className="font-bold text-potomac-gray">50+</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-potomac-yellow rounded-full opacity-20 animate-pulse" aria-hidden="true"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-potomac-turquoise rounded-full opacity-20 animate-pulse delay-1000" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-rajdhani font-bold text-potomac-gray mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to build sophisticated financial applications with AI capabilities
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* FIX: removed inline animationDelay style — causes SSR/client hydration mismatch */}
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="card hover:shadow-md transition-shadow duration-300 animate-fade-in-up"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-3xl" role="img" aria-hidden="true">{feature.icon}</div>
                    <h3 className="text-xl font-rajdhani font-bold text-potomac-gray">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-rajdhani font-bold text-potomac-gray mb-4">
                Get Started Quickly
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore our comprehensive documentation to start building with the ByPotomac SDK
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* FIX: removed inline animationDelay style */}
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className={`card group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up ${link.color}`}
                >
                  <div className="text-white">
                    <h3 className="text-2xl font-rajdhani font-bold mb-2">{link.title}</h3>
                    <p className="text-white/90 leading-relaxed">{link.description}</p>
                    <div className="mt-4 flex items-center space-x-2 text-white/80 group-hover:text-white transition-colors">
                      <span>Explore</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Code Example Section */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <span className="badge badge-info text-white border border-white/20">Code Example</span>
                  <h3 className="text-3xl font-rajdhani font-bold mt-4 text-white">
                    Make Your First API Call
                  </h3>
                  <p className="text-gray-300 mt-4 leading-relaxed">
                    Get started with a simple example that demonstrates how to authenticate
                    and make requests to the ByPotomac SDK API.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>curl</span>
                    <span>•</span>
                    <span>Node.js</span>
                    <span>•</span>
                    <span>Python</span>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-green-400 font-mono text-sm">$ curl</span>
                      <span className="text-gray-500 text-sm">bash</span>
                    </div>
                    <pre className="text-sm overflow-x-auto">
                      <code>{`curl -X POST https://api.bypotomac.com/auth/v2/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'`}</code>
                    </pre>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link href="/docs/authentication" className="btn-primary bg-white text-potomac-gray hover:bg-gray-200 focus-ring">
                    Authentication Guide
                  </Link>
                  <Link href="/api-reference" className="btn-secondary border-2 border-white text-white hover:bg-white hover:text-potomac-gray focus-ring">
                    View All Endpoints
                  </Link>
                </div>
              </div>

              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-rajdhani font-bold text-white mb-2">Response</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-green-400 overflow-x-auto">
                        <code>{`{
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

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <span className="text-gray-400">Status Code</span>
                      <p className="font-bold text-white">200 OK</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <span className="text-gray-400">Rate Limit</span>
                      <p className="font-bold text-white">120/min</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <span className="text-gray-400">Auth Required</span>
                      <p className="font-bold text-white">Yes</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <span className="text-gray-400">Response Time</span>
                      {/* FIX: raw `<` in JSX text → use &lt; */}
                      <p className="font-bold text-white">&lt; 100ms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-potomac-yellow to-potomac-turquoise">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl lg:text-5xl font-rajdhani font-bold text-white mb-6">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join developers building the future of financial analysis with AI.
              Get started with our comprehensive documentation and developer tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/api-reference" className="btn-primary bg-white text-potomac-gray text-lg px-8 py-4 font-bold hover:bg-gray-100 focus-ring">
                Explore API Documentation
              </Link>
              <Link href="/docs/overview" className="btn-secondary bg-transparent border-2 border-white text-white text-lg px-8 py-4 font-bold hover:bg-white hover:text-potomac-gray focus-ring">
                Read Getting Started Guide
              </Link>
            </div>
            <div className="mt-8 text-white/80 text-sm">
              Built to Conquer Risk®
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-potomac-yellow rounded-lg flex items-center justify-center">
                  <span className="text-potomac-gray font-bold text-sm">BP</span>
                </div>
                <div>
                  <h3 className="text-lg font-rajdhani font-bold">ByPotomac SDK</h3>
                  <p className="text-gray-400 text-sm">API Documentation</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Complete API documentation for the ByPotomac SDK. Build powerful financial
                analysis applications with AI capabilities, real-time streaming, and
                enterprise-grade security.
              </p>
            </div>

            <div>
              <h4 className="font-rajdhani font-bold mb-4">Documentation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs/overview" className="hover:text-white transition-colors">Getting Started</Link></li>
                <li><Link href="/docs/authentication" className="hover:text-white transition-colors">Authentication</Link></li>
                <li><Link href="/docs/api-reference" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="/docs/streaming" className="hover:text-white transition-colors">Streaming</Link></li>
                <li><Link href="/docs/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-rajdhani font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs/deployment" className="hover:text-white transition-colors">Deployment</Link></li>
                <li><Link href="/docs/platform-overview" className="hover:text-white transition-colors">Platform SDKs</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Contact Support</Link></li>
                <li><Link href="/docs/observability" className="hover:text-white transition-colors">Observability</Link></li>
                <li><Link href="/docs/testing" className="hover:text-white transition-colors">Testing</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2026 Potomac Fund Management. Built to Conquer Risk®
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/docs/security" className="text-gray-400 hover:text-white text-sm transition-colors">Security</Link>
              <Link href="/docs/multitenancy" className="text-gray-400 hover:text-white text-sm transition-colors">Compliance</Link>
              <Link href="/support" className="text-gray-400 hover:text-white text-sm transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
