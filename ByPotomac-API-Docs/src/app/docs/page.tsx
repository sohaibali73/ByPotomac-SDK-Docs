import Link from 'next/link';
import DocsLayout from '@/components/DocsLayout';
import { backendDocs, frontendDocs } from '@/lib/content-index';

export const metadata = {
  title: 'Documentation - ByPotomac SDK',
  description: 'Complete documentation for the ByPotomac SDK API',
};

// Icon components
function BookIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export default function DocsLandingPage() {
  return (
    <DocsLayout title="Documentation">
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-rajdhani font-bold text-potomac-gray mb-4">ByPotomac SDK Documentation</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Complete documentation for building powerful financial analysis applications with AI capabilities. Explore
            our guides, API reference, and platform SDKs.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/docs/overview"
              className="inline-flex items-center gap-2 px-6 py-3 bg-potomac-yellow text-potomac-gray font-semibold rounded-lg hover:bg-potomac-turquoise transition-colors"
            >
              <BookIcon />
              Get Started
            </Link>
            <Link
              href="/docs/api-reference"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-potomac-gray font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              <CodeIcon />
              API Reference
            </Link>
          </div>
        </div>

        {/* Backend Documentation Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-potomac-yellow/10 rounded-lg">
              <LayersIcon />
            </div>
            <div>
              <h2 className="text-2xl font-rajdhani font-bold text-potomac-gray">Backend Documentation</h2>
              <p className="text-gray-600">Core SDK documentation, API reference, and infrastructure guides</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {backendDocs.map((doc) => (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                className="group p-4 bg-white border border-gray-200 rounded-lg hover:border-potomac-yellow hover:shadow-md transition-all"
              >
                <h3 className="font-rajdhani font-bold text-potomac-gray group-hover:text-potomac-yellow transition-colors">
                  {doc.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{doc.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Frontend Documentation Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-potomac-turquoise/10 rounded-lg">
              <MonitorIcon />
            </div>
            <div>
              <h2 className="text-2xl font-rajdhani font-bold text-potomac-gray">Platform SDKs</h2>
              <p className="text-gray-600">Native client implementations for Web, Windows, iOS, and macOS</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {frontendDocs.map((doc) => (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                className="group p-4 bg-white border border-gray-200 rounded-lg hover:border-potomac-turquoise hover:shadow-md transition-all"
              >
                <h3 className="font-rajdhani font-bold text-potomac-gray group-hover:text-potomac-turquoise transition-colors">
                  {doc.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{doc.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-xl font-rajdhani font-bold text-potomac-gray mb-6">Popular Topics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/docs/authentication"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-potomac-yellow transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-potomac-gray">Authentication</h3>
                <p className="text-sm text-gray-600">OAuth, API Keys, SSO</p>
              </div>
            </Link>
            <Link
              href="/docs/streaming"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-potomac-yellow transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-potomac-gray">Real-time Streaming</h3>
                <p className="text-sm text-gray-600">SSE and WebSockets</p>
              </div>
            </Link>
            <Link
              href="/docs/api-reference"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-potomac-yellow transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-potomac-gray">API Reference</h3>
                <p className="text-sm text-gray-600">All endpoints documented</p>
              </div>
            </Link>
            <Link
              href="/docs/deployment"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-potomac-yellow transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-potomac-gray">Deployment</h3>
                <p className="text-sm text-gray-600">Production setup guides</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
