'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

const guides = [
  {
    title: 'Getting Started with ByPotomac SDK',
    description: 'A comprehensive guide to setting up your development environment and making your first API calls.',
    category: 'Getting Started',
    categoryId: 'getting-started',
    duration: '15 min',
    level: 'Beginner',
    href: '/docs/overview',
    icon: '🚀',
  },
  {
    title: 'Authentication Best Practices',
    description: 'Learn how to securely authenticate your applications and manage API keys.',
    category: 'Security',
    categoryId: 'security',
    duration: '20 min',
    level: 'Intermediate',
    href: '/docs/authentication',
    icon: '🔐',
  },
  {
    title: 'Building Real-time Chat Applications',
    description: 'Create interactive chat interfaces with streaming responses and real-time updates.',
    category: 'Chat API',
    categoryId: 'chat-api',
    duration: '30 min',
    level: 'Intermediate',
    href: '/docs/streaming',
    icon: '💬',
  },
  {
    title: 'API Reference Documentation',
    description: 'Complete API endpoint documentation with request/response schemas.',
    category: 'API',
    categoryId: 'api',
    duration: '25 min',
    level: 'Intermediate',
    href: '/docs/api-reference',
    icon: '📚',
  },
  {
    title: 'Data Models and Schemas',
    description: 'Understanding the data models and database schemas used by the SDK.',
    category: 'Data',
    categoryId: 'data',
    duration: '20 min',
    level: 'Beginner',
    href: '/docs/data-models',
    icon: '📁',
  },
  {
    title: 'Multi-tenant Application Architecture',
    description: 'Design applications that support multiple organizations with proper data isolation.',
    category: 'Architecture',
    categoryId: 'architecture',
    duration: '35 min',
    level: 'Advanced',
    href: '/docs/multitenancy',
    icon: '🏢',
  },
  {
    title: 'System Architecture Overview',
    description: 'Understanding the overall architecture and components of the ByPotomac SDK.',
    category: 'Architecture',
    categoryId: 'architecture',
    duration: '40 min',
    level: 'Advanced',
    href: '/docs/architecture',
    icon: '🤖',
  },
  {
    title: 'Error Handling and Debugging',
    description: 'Implement robust error handling and debugging strategies for production applications.',
    category: 'Development',
    categoryId: 'development',
    duration: '25 min',
    level: 'Intermediate',
    href: '/docs/error-handling',
    icon: '🐛',
  },
  {
    title: 'Observability and Monitoring',
    description: 'Set up logging, monitoring, and debugging for your applications.',
    category: 'Operations',
    categoryId: 'operations',
    duration: '30 min',
    level: 'Advanced',
    href: '/docs/observability',
    icon: '⚡',
  },
  {
    title: 'Middleware and Request Pipeline',
    description: 'Understanding the middleware layer and request processing pipeline.',
    category: 'Infrastructure',
    categoryId: 'infrastructure',
    duration: '20 min',
    level: 'Intermediate',
    href: '/docs/middleware',
    icon: '🔗',
  },
  {
    title: 'Testing and Versioning',
    description: 'Learn how to test your API integration and manage API versions.',
    category: 'Testing',
    categoryId: 'testing',
    duration: '30 min',
    level: 'Intermediate',
    href: '/docs/testing',
    icon: '🧪',
  },
  {
    title: 'Deployment and Production Setup',
    description: 'Deploy your application to production with proper configuration and monitoring.',
    category: 'Deployment',
    categoryId: 'deployment',
    duration: '35 min',
    level: 'Advanced',
    href: '/docs/deployment',
    icon: '🚀',
  },
];

const categories = [
  { id: 'all', name: 'All Guides' },
  { id: 'getting-started', name: 'Getting Started' },
  { id: 'security', name: 'Security' },
  { id: 'chat-api', name: 'Chat API' },
  { id: 'knowledge-base', name: 'Knowledge Base' },
  { id: 'files', name: 'Files' },
  { id: 'architecture', name: 'Architecture' },
  { id: 'ai-integration', name: 'AI Integration' },
  { id: 'development', name: 'Development' },
  { id: 'performance', name: 'Performance' },
  { id: 'integration', name: 'Integration' },
  { id: 'testing', name: 'Testing' },
  { id: 'deployment', name: 'Deployment' },
];

function getLevelColor(level: string): string {
  switch (level) {
    case 'Beginner':
      return 'bg-green-100 text-green-800';
    case 'Intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'Advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Inner component that reads search params — must be wrapped in Suspense
function GuidesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get('category') ?? 'all';

  const filteredGuides =
    activeCategory === 'all'
      ? guides
      : guides.filter((g) => g.categoryId === activeCategory);

  function handleCategoryClick(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'all') {
      params.delete('category');
    } else {
      params.set('category', id);
    }
    router.push(`/guides?${params.toString()}`);
  }

  return (
    <>
      {/* Categories */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const count =
                category.id === 'all'
                  ? guides.length
                  : guides.filter((g) => g.categoryId === category.id).length;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-rajdhani border transition-colors ${
                    isActive
                      ? 'border-potomac-yellow text-potomac-yellow bg-yellow-50'
                      : 'border-gray-300 text-gray-700 hover:border-potomac-yellow hover:text-potomac-yellow'
                  }`}
                >
                  {category.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Guide List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredGuides.length === 0 ? (
          <p className="text-gray-500 text-center py-16">No guides found for this category.</p>
        ) : (
          <div className="grid gap-6">
            {filteredGuides.map((guide) => (
              <Link
                key={guide.title}
                href={guide.href}
                className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-3xl" role="img" aria-hidden="true">
                        {guide.icon}
                      </span>
                      <div>
                        <h3 className="text-xl font-rajdhani font-bold text-potomac-gray group-hover:text-potomac-yellow transition-colors">
                          {guide.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{guide.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full font-medium ${getLevelColor(guide.level)}`}>
                        {guide.level}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                        {guide.category}
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{guide.duration}</span>
                      </span>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-potomac-yellow transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Learning Path */}
        <div className="mt-16 bg-gradient-to-r from-potomac-yellow to-potomac-turquoise rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-rajdhani font-bold mb-6">Recommended Learning Path</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="font-rajdhani font-bold text-lg mb-2">🚀 Start Here</h3>
              <p className="text-white/90 mb-4">
                Begin with our getting started guide to set up your environment and make your first API calls.
              </p>
              <Link
                href="/docs/overview"
                className="inline-block bg-white text-potomac-gray px-4 py-2 rounded-lg font-rajdhani font-bold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            </div>
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="font-rajdhani font-bold text-lg mb-2">🔒 Secure Your App</h3>
              <p className="text-white/90 mb-4">
                Learn authentication best practices to keep your application and user data secure.
              </p>
              <Link
                href="/docs/authentication"
                className="inline-block bg-white text-potomac-gray px-4 py-2 rounded-lg font-rajdhani font-bold hover:bg-gray-100 transition-colors"
              >
                Learn Security
              </Link>
            </div>
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="font-rajdhani font-bold text-lg mb-2">🚀 Go Live</h3>
              <p className="text-white/90 mb-4">
                Deploy your application to production with proper configuration and monitoring.
              </p>
              <Link
                href="/docs/deployment"
                className="inline-block bg-white text-potomac-gray px-4 py-2 rounded-lg font-rajdhani font-bold hover:bg-gray-100 transition-colors"
              >
                Deploy Now
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-16">
          <h2 className="text-2xl font-rajdhani font-bold text-potomac-gray mb-6">Additional Resources</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-rajdhani font-bold text-potomac-gray mb-4">Code Examples</h3>
              <p className="text-gray-600 mb-4">
                Explore our collection of code examples and sample applications to see the ByPotomac SDK in action.
              </p>
              <Link href="/examples" className="text-potomac-yellow hover:text-potomac-turquoise font-rajdhani font-bold transition-colors">
                View Examples →
              </Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-rajdhani font-bold text-potomac-gray mb-4">SDK Libraries</h3>
              <p className="text-gray-600 mb-4">
                Download and install our official SDK libraries for popular programming languages.
              </p>
              <Link href="/sdks" className="text-potomac-yellow hover:text-potomac-turquoise font-rajdhani font-bold transition-colors">
                Browse SDKs →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-rajdhani font-bold mb-4">Ready to Build Something Amazing?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers building the future of financial analysis with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/api-reference"
              className="btn-primary bg-white text-potomac-gray text-lg px-8 py-4 font-bold hover:bg-gray-100 focus-ring"
            >
              Explore API Documentation
            </Link>
            <Link
              href="/support"
              className="btn-secondary border-2 border-white text-white text-lg px-8 py-4 font-bold hover:bg-white hover:text-potomac-gray focus-ring"
            >
              Get Developer Support
            </Link>
          </div>
          <div className="mt-8 text-gray-400 text-sm">Built to Conquer Risk®</div>
        </div>
      </section>
    </>
  );
}

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-rajdhani font-bold text-potomac-gray">Developer Guides</h1>
              <p className="text-gray-600 mt-1">
                Step-by-step guides to help you build amazing applications with the ByPotomac SDK
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/docs" className="btn-secondary focus-ring">
                Documentation
              </Link>
              <Link href="/api-reference" className="btn-primary focus-ring">
                API Reference
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Suspense boundary required for useSearchParams in Next.js App Router */}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-500">
            Loading guides…
          </div>
        }
      >
        <GuidesContent />
      </Suspense>
    </div>
  );
}
