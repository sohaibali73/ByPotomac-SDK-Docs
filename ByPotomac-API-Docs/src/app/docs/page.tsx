'use client';

import Link from 'next/link';

export default function DocsPage() {
  const docsSections = [
    {
      title: 'Getting Started',
      description: 'Learn how to set up and start using the ByPotomac SDK API.',
      items: [
        { title: 'Introduction', href: '/docs/getting-started', icon: '🚀' },
        { title: 'Quick Start Guide', href: '/docs/quick-start', icon: '⚡' },
        { title: 'SDK Installation', href: '/docs/installation', icon: '📦' },
        { title: 'Environment Setup', href: '/docs/environment', icon: '⚙️' },
      ],
    },
    {
      title: 'Authentication',
      description: 'Secure your API calls with various authentication methods.',
      items: [
        { title: 'API Keys', href: '/docs/authentication/api-keys', icon: '🔑' },
        { title: 'OAuth 2.0', href: '/docs/authentication/oauth', icon: '🔐' },
        { title: 'JWT Tokens', href: '/docs/authentication/jwt', icon: '🎫' },
        { title: 'Enterprise SSO', href: '/docs/authentication/sso', icon: '🏢' },
      ],
    },
    {
      title: 'Core APIs',
      description: 'Explore the main API endpoints and their capabilities.',
      items: [
        { title: 'Chat API', href: '/docs/chat', icon: '💬' },
        { title: 'Knowledge Base API', href: '/docs/knowledge-base', icon: '📚' },
        { title: 'Files API', href: '/docs/files', icon: '📁' },
        { title: 'Projects API', href: '/docs/projects', icon: '📋' },
        { title: 'Tasks API', href: '/docs/tasks', icon: '✅' },
      ],
    },
    {
      title: 'Advanced Features',
      description: 'Learn about advanced capabilities and integrations.',
      items: [
        { title: 'Real-time Streaming', href: '/docs/streaming', icon: '⚡' },
        { title: 'Webhooks', href: '/docs/webhooks', icon: '🔗' },
        { title: 'Multi-tenancy', href: '/docs/multi-tenancy', icon: '🏢' },
        { title: 'Rate Limiting', href: '/docs/rate-limiting', icon: '⏱️' },
        { title: 'Error Handling', href: '/docs/error-handling', icon: '⚠️' },
      ],
    },
    {
      title: 'AI Integration',
      description: 'Integrate AI capabilities into your applications.',
      items: [
        { title: 'Anthropic Claude', href: '/docs/ai/anthropic', icon: '🤖' },
        { title: 'OpenAI Integration', href: '/docs/ai/openai', icon: '🧠' },
        { title: 'Custom Tools', href: '/docs/ai/tools', icon: '🛠️' },
        { title: 'Prompt Engineering', href: '/docs/ai/prompts', icon: '📝' },
      ],
    },
    {
      title: 'Security & Compliance',
      description: 'Understand security features and compliance requirements.',
      items: [
        { title: 'Data Encryption', href: '/docs/security/encryption', icon: '🔒' },
        { title: 'SOC 2 Compliance', href: '/docs/security/soc2', icon: '🛡️' },
        { title: 'GDPR Compliance', href: '/docs/security/gdpr', icon: '📋' },
        { title: 'Audit Logging', href: '/docs/security/audit', icon: '📝' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-rajdhani font-bold text-potomac-gray">
                Documentation
              </h1>
              <p className="text-gray-600 mt-1">
                Complete guides and references for the ByPotomac SDK API
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/api-reference" className="btn-primary focus-ring">
                API Reference
              </Link>
              <Link href="/guides" className="btn-secondary focus-ring">
                Developer Guides
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8">
          {docsSections.map((section, index) => (
            <div key={section.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="mb-6">
                <h2 className="text-2xl font-rajdhani font-bold text-potomac-gray mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-600">{section.description}</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item, itemIndex) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group p-4 border border-gray-200 rounded-lg hover:border-potomac-yellow hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-rajdhani font-bold text-potomac-gray group-hover:text-potomac-yellow transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-potomac-yellow transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-potomac-yellow to-potomac-turquoise rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-rajdhani font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-white/90 text-sm">
                Visit our support center for answers to common questions.
              </p>
              <Link href="/support" className="inline-block mt-4 text-sm font-rajdhani font-bold text-potomac-gray bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Contact Support
              </Link>
            </div>
            <div>
              <h3 className="font-rajdhani font-bold text-lg mb-2">API Status</h3>
              <p className="text-white/90 text-sm">
                Check the current status of our API and infrastructure.
              </p>
              <div className="mt-4 flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">All Systems Operational</span>
              </div>
            </div>
            <div>
              <h3 className="font-rajdhani font-bold text-lg mb-2">Latest Updates</h3>
              <p className="text-white/90 text-sm">
                Stay informed about new features and improvements.
              </p>
              <Link href="/changelog" className="inline-block mt-4 text-sm font-rajdhani font-bold text-potomac-gray bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                View Changelog
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}