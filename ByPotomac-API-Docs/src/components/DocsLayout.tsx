'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DocsSearch from './DocsSearch';

interface NavItem {
  title: string;
  slug: string;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface DocsLayoutProps {
  children: React.ReactNode;
  tableOfContents?: TableOfContentsItem[];
  title?: string;
}

const navigationStructure: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'SDK Overview', slug: 'overview', description: 'Introduction to ByPotomac SDK' },
      { title: 'System Architecture', slug: 'architecture', description: 'Understanding the architecture' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { title: 'Authentication', slug: 'authentication', description: 'Auth methods and security' },
      { title: 'Data Models', slug: 'data-models', description: 'Schemas and structures' },
      { title: 'Security', slug: 'security', description: 'Security features' },
    ],
  },
  {
    title: 'API Documentation',
    items: [
      { title: 'API Reference', slug: 'api-reference', description: 'Complete endpoint reference' },
      { title: 'Streaming', slug: 'streaming', description: 'Real-time and SSE' },
      { title: 'Error Handling', slug: 'error-handling', description: 'Error codes and handling' },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { title: 'Configuration', slug: 'configuration', description: 'SDK configuration' },
      { title: 'Middleware', slug: 'middleware', description: 'Request pipeline' },
      { title: 'Database', slug: 'database', description: 'Database and Redis' },
      { title: 'Deployment', slug: 'deployment', description: 'Production deployment' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { title: 'Observability', slug: 'observability', description: 'Logging and monitoring' },
      { title: 'Multi-tenancy', slug: 'multitenancy', description: 'Isolation and compliance' },
      { title: 'Testing', slug: 'testing', description: 'Testing and versioning' },
      { title: 'Infrastructure Engine', slug: 'infrastructure', description: 'Engine details' },
    ],
  },
  {
    title: 'Platform SDKs',
    items: [
      { title: 'Platform Overview', slug: 'platform-overview', description: 'All client platforms' },
      { title: 'Web Frontend', slug: 'web', description: 'Next.js web app' },
      { title: 'Windows Frontend', slug: 'windows', description: 'WinUI 3 native app' },
      { title: 'Apple Platforms', slug: 'apple', description: 'iOS and macOS' },
      { title: 'Planned Platforms', slug: 'planned', description: 'Upcoming platforms' },
    ],
  },
];

export default function DocsLayout({ children, tableOfContents = [], title }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const currentSlug = pathname?.replace('/docs/', '') || '';

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-potomac-yellow"
              aria-label="Toggle navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-potomac-yellow rounded-lg flex items-center justify-center">
                <span className="text-potomac-gray font-bold text-sm">BP</span>
              </div>
              <div className="hidden sm:block">
                <span className="block text-lg font-rajdhani font-bold text-potomac-gray">ByPotomac SDK</span>
                <span className="text-xs text-gray-500">Documentation</span>
              </div>
            </Link>
          </div>

          {/* Header Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/docs/overview" className="text-sm text-gray-600 hover:text-potomac-gray transition-colors">
              Docs
            </Link>
            <Link href="/api-reference" className="text-sm text-gray-600 hover:text-potomac-gray transition-colors">
              API Reference
            </Link>
            <Link href="/guides" className="text-sm text-gray-600 hover:text-potomac-gray transition-colors">
              Guides
            </Link>
            <Link href="/support" className="text-sm text-gray-600 hover:text-potomac-gray transition-colors">
              Support
            </Link>
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center gap-4">
            <DocsSearch />
            <Link
              href="/api-reference"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-potomac-yellow text-potomac-gray rounded-lg hover:bg-potomac-turquoise transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-72 bg-white border-r border-gray-200 overflow-y-auto transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="p-4 space-y-6">
            {navigationStructure.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = currentSlug === item.slug;
                    return (
                      <li key={item.slug}>
                        <Link
                          href={`/docs/${item.slug}`}
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                            isActive
                              ? 'bg-potomac-yellow/10 text-potomac-gray font-medium border-l-2 border-potomac-yellow'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-potomac-gray'
                          }`}
                        >
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-gray-500">
                <li>
                  <Link href="/" className="hover:text-potomac-gray transition-colors">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/docs/overview" className="hover:text-potomac-gray transition-colors">
                    Documentation
                  </Link>
                </li>
                {title && (
                  <>
                    <li>/</li>
                    <li className="text-potomac-gray font-medium">{title}</li>
                  </>
                )}
              </ol>
            </nav>

            {/* Content */}
            <article className="prose prose-gray max-w-none">{children}</article>

            {/* Page Navigation */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex justify-between">
                <div>{/* Previous page link would go here */}</div>
                <div>{/* Next page link would go here */}</div>
              </div>
            </div>
          </div>
        </main>

        {/* Table of Contents - Desktop */}
        {tableOfContents.length > 0 && (
          <aside className="hidden xl:block w-64 shrink-0">
            <div className="sticky top-20 p-4 overflow-y-auto max-h-[calc(100vh-6rem)]">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">On this page</h4>
              <nav>
                <ul className="space-y-2 text-sm">
                  {tableOfContents.map((item) => (
                    <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
                      <a
                        href={`#${item.id}`}
                        className="block py-1 text-gray-600 hover:text-potomac-gray transition-colors"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
