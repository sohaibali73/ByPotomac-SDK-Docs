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
  },
  {
    title: 'Authentication Best Practices',
    description: 'Learn how to securely authenticate your applications and manage API keys.',
    category: 'Security',
    categoryId: 'security',
    duration: '20 min',
    level: 'Intermediate',
    href: '/docs/authentication',
  },
  {
    title: 'Building Real-time Chat Applications',
    description: 'Create interactive chat interfaces with streaming responses and real-time updates.',
    category: 'Chat API',
    categoryId: 'chat-api',
    duration: '30 min',
    level: 'Intermediate',
    href: '/docs/streaming',
  },
  {
    title: 'API Reference Documentation',
    description: 'Complete API endpoint documentation with request/response schemas.',
    category: 'API',
    categoryId: 'api',
    duration: '25 min',
    level: 'Intermediate',
    href: '/docs/api-reference',
  },
  {
    title: 'Data Models and Schemas',
    description: 'Understanding the data models and database schemas used by the SDK.',
    category: 'Data',
    categoryId: 'data',
    duration: '20 min',
    level: 'Beginner',
    href: '/docs/data-models',
  },
  {
    title: 'Multi-tenant Application Architecture',
    description: 'Design applications that support multiple organizations with proper data isolation.',
    category: 'Architecture',
    categoryId: 'architecture',
    duration: '35 min',
    level: 'Advanced',
    href: '/docs/multitenancy',
  },
  {
    title: 'System Architecture Overview',
    description: 'Understanding the overall architecture and components of the ByPotomac SDK.',
    category: 'Architecture',
    categoryId: 'architecture',
    duration: '40 min',
    level: 'Advanced',
    href: '/docs/architecture',
  },
  {
    title: 'Error Handling and Debugging',
    description: 'Implement robust error handling and debugging strategies for production applications.',
    category: 'Development',
    categoryId: 'development',
    duration: '25 min',
    level: 'Intermediate',
    href: '/docs/error-handling',
  },
  {
    title: 'Observability and Monitoring',
    description: 'Set up logging, monitoring, and debugging for your applications.',
    category: 'Operations',
    categoryId: 'operations',
    duration: '30 min',
    level: 'Advanced',
    href: '/docs/observability',
  },
  {
    title: 'Middleware and Request Pipeline',
    description: 'Understanding the middleware layer and request processing pipeline.',
    category: 'Infrastructure',
    categoryId: 'infrastructure',
    duration: '20 min',
    level: 'Intermediate',
    href: '/docs/middleware',
  },
  {
    title: 'Testing and Versioning',
    description: 'Learn how to test your API integration and manage API versions.',
    category: 'Testing',
    categoryId: 'testing',
    duration: '30 min',
    level: 'Intermediate',
    href: '/docs/testing',
  },
  {
    title: 'Deployment and Production Setup',
    description: 'Deploy your application to production with proper configuration and monitoring.',
    category: 'Deployment',
    categoryId: 'deployment',
    duration: '35 min',
    level: 'Advanced',
    href: '/docs/deployment',
  },
];

const categories = [
  { id: 'all', name: 'All Guides' },
  { id: 'getting-started', name: 'Getting Started' },
  { id: 'security', name: 'Security' },
  { id: 'chat-api', name: 'Chat API' },
  { id: 'architecture', name: 'Architecture' },
  { id: 'development', name: 'Development' },
  { id: 'testing', name: 'Testing' },
  { id: 'deployment', name: 'Deployment' },
];

function getLevelColor(level: string): string {
  switch (level) {
    case 'Beginner':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'Intermediate':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'Advanced':
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

// Inner component that reads search params
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
      <div className="bg-card border-b border-border">
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
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
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
          <p className="text-muted-foreground text-center py-16">No guides found for this category.</p>
        ) : (
          <div className="grid gap-4">
            {filteredGuides.map((guide, index) => (
              <Link
                key={guide.title}
                href={guide.href}
                className="group card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-heading font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{guide.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className={`badge border ${getLevelColor(guide.level)}`}>
                        {guide.level}
                      </span>
                      <span className="badge badge-info">
                        {guide.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{guide.duration}</span>
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Learning Path */}
        <div className="mt-16 card bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-primary/20">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Recommended Learning Path</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">Start Here</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Begin with our getting started guide to set up your environment and make your first API calls.
              </p>
              <Link
                href="/docs/overview"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors font-medium"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">Secure Your App</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Learn authentication best practices to keep your application and user data secure.
              </p>
              <Link
                href="/docs/authentication"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors font-medium"
              >
                Learn Security
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">Go Live</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Deploy your application to production with proper configuration and monitoring.
              </p>
              <Link
                href="/docs/deployment"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors font-medium"
              >
                Deploy Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-16">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Additional Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-hover">
              <h3 className="text-lg font-heading font-bold text-foreground mb-3">Code Examples</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Explore our collection of code examples and sample applications to see the ByPotomac SDK in action.
              </p>
              <Link href="/examples" className="text-primary hover:text-accent font-medium text-sm transition-colors inline-flex items-center gap-1">
                View Examples
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="card-hover">
              <h3 className="text-lg font-heading font-bold text-foreground mb-3">SDK Libraries</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Download and install our official SDK libraries for popular programming languages.
              </p>
              <Link href="/sdks" className="text-primary hover:text-accent font-medium text-sm transition-colors inline-flex items-center gap-1">
                Browse SDKs
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="bg-card border-t border-border py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-4">Ready to Build Something Amazing?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of developers building the future of financial analysis with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/api-reference"
              className="btn-primary text-base px-8 py-3"
            >
              Explore API Documentation
            </Link>
            <Link
              href="/support"
              className="btn-secondary text-base px-8 py-3"
            >
              Get Developer Support
            </Link>
          </div>
          <div className="mt-8 text-muted-foreground text-sm">Built to Conquer Risk</div>
        </div>
      </section>
    </>
  );
}

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                    <span className="text-primary-foreground font-bold text-xs">BP</span>
                  </div>
                </Link>
                <span className="text-border">/</span>
                <h1 className="text-2xl font-heading font-bold text-foreground">
                  Developer Guides
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Step-by-step guides to help you build amazing applications with the ByPotomac SDK
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/docs" className="btn-ghost text-sm">
                Documentation
              </Link>
              <Link href="/api-reference" className="btn-primary text-sm">
                API Reference
              </Link>
            </div>
          </div>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-muted-foreground">
            Loading guides...
          </div>
        }
      >
        <GuidesContent />
      </Suspense>
    </div>
  );
}
