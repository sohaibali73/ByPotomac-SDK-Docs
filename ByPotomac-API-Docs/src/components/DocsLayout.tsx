'use client';

import { useState, useEffect } from 'react';
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
  const [activeSection, setActiveSection] = useState<string>('');
  const pathname = usePathname();
  const currentSlug = pathname?.replace('/docs/', '') || '';

  // Track active section for table of contents
  useEffect(() => {
    if (tableOfContents.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    tableOfContents.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tableOfContents]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8 max-w-[1800px] mx-auto">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-ring"
              aria-label="Toggle navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-primary-foreground font-bold text-sm">BP</span>
              </div>
              <div className="hidden sm:block">
                <span className="block text-base font-heading font-bold text-foreground">ByPotomac SDK</span>
                <span className="text-xs text-muted-foreground">Documentation</span>
              </div>
            </Link>
          </div>

          {/* Header Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/docs/overview" className="nav-link px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
              Docs
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
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            <DocsSearch />
            <Link
              href="/api-reference"
              className="hidden sm:inline-flex btn-primary text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1800px] mx-auto">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-72 bg-background lg:bg-transparent border-r border-border overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="p-4 space-y-6">
            {navigationStructure.map((section, sectionIndex) => (
              <div key={section.title} className="animate-fade-in-up" style={{ animationDelay: `${sectionIndex * 50}ms` }}>
                <h3 className="section-header">
                  {section.title}
                </h3>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = currentSlug === item.slug;
                    return (
                      <li key={item.slug}>
                        <Link
                          href={`/docs/${item.slug}`}
                          onClick={() => setSidebarOpen(false)}
                          className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Breadcrumb */}
            <nav className="mb-8" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-muted-foreground">/</li>
                <li>
                  <Link href="/docs/overview" className="text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                {title && (
                  <>
                    <li className="text-muted-foreground">/</li>
                    <li className="text-foreground font-medium">{title}</li>
                  </>
                )}
              </ol>
            </nav>

            {/* Content */}
            <article className="doc-content animate-fade-in-up">{children}</article>

            {/* Page Navigation */}
            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Was this page helpful?
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Yes
                  </button>
                  <button className="btn-ghost text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Table of Contents - Desktop */}
        {tableOfContents.length > 0 && (
          <aside className="hidden xl:block w-64 shrink-0">
            <div className="sticky top-24 p-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <h4 className="text-sm font-semibold text-foreground mb-4">On this page</h4>
              <nav aria-label="Table of contents">
                <ul className="space-y-1">
                  {tableOfContents.map((item) => (
                    <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
                      <a
                        href={`#${item.id}`}
                        className={`toc-link ${activeSection === item.id ? 'toc-link-active' : ''}`}
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
