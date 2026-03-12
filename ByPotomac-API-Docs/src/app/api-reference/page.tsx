'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ApiReferencePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const apiEndpoints = [
    // Authentication
    {
      method: 'POST',
      path: '/auth/v2/login',
      category: 'authentication',
      title: 'User Login',
      description: 'Authenticate a user and receive access tokens.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'POST',
      path: '/auth/v2/logout',
      category: 'authentication',
      title: 'User Logout',
      description: 'Invalidate user session and refresh tokens.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'GET',
      path: '/auth/v2/me',
      category: 'authentication',
      title: 'Get Current User',
      description: 'Retrieve current user information and permissions.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'POST',
      path: '/auth/v2/refresh',
      category: 'authentication',
      title: 'Refresh Token',
      description: 'Refresh access token using refresh token.',
      status: 'stable',
      version: 'v2',
    },

    // Chat
    {
      method: 'POST',
      path: '/api/chat',
      category: 'chat',
      title: 'Start Chat Session',
      description: 'Initiate a new chat session with AI model.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'GET',
      path: '/sessions',
      category: 'chat',
      title: 'List Chat Sessions',
      description: 'Retrieve list of user chat sessions.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'GET',
      path: '/sessions/{id}',
      category: 'chat',
      title: 'Get Session Details',
      description: 'Retrieve detailed information about a specific session.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'DELETE',
      path: '/sessions/{id}',
      category: 'chat',
      title: 'Delete Session',
      description: 'Delete a chat session and all associated messages.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'GET',
      path: '/messages',
      category: 'chat',
      title: 'List Messages',
      description: 'Retrieve messages from a specific session.',
      status: 'stable',
      version: 'v2',
    },

    // Knowledge Base
    {
      method: 'POST',
      path: '/knowledge/upload',
      category: 'knowledge-base',
      title: 'Upload Document',
      description: 'Upload and process a document for knowledge base.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'GET',
      path: '/knowledge/documents',
      category: 'knowledge-base',
      title: 'List Documents',
      description: 'Retrieve list of user documents in knowledge base.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'DELETE',
      path: '/knowledge/documents/{id}',
      category: 'knowledge-base',
      title: 'Delete Document',
      description: 'Remove a document from knowledge base.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'POST',
      path: '/knowledge/search',
      category: 'knowledge-base',
      title: 'Semantic Search',
      description: 'Perform semantic search across knowledge base documents.',
      status: 'stable',
      version: 'v2',
    },

    // Files
    {
      method: 'POST',
      path: '/files/upload',
      category: 'files',
      title: 'Upload File',
      description: 'Upload a file to user storage.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'GET',
      path: '/files',
      category: 'files',
      title: 'List Files',
      description: 'Retrieve list of user uploaded files.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'GET',
      path: '/files/{id}',
      category: 'files',
      title: 'Get File Details',
      description: 'Retrieve detailed information about a specific file.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'DELETE',
      path: '/files/{id}',
      category: 'files',
      title: 'Delete File',
      description: 'Delete a file from user storage.',
      status: 'stable',
      version: 'v2',
    },

    // Projects
    {
      method: 'GET',
      path: '/projects',
      category: 'projects',
      title: 'List Projects',
      description: 'Retrieve list of user projects.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'POST',
      path: '/projects',
      category: 'projects',
      title: 'Create Project',
      description: 'Create a new project.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'GET',
      path: '/projects/{id}',
      category: 'projects',
      title: 'Get Project Details',
      description: 'Retrieve detailed information about a specific project.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'PUT',
      path: '/projects/{id}',
      category: 'projects',
      title: 'Update Project',
      description: 'Update project information.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'DELETE',
      path: '/projects/{id}',
      category: 'projects',
      title: 'Delete Project',
      description: 'Delete a project and associated data.',
      status: 'stable',
      version: 'v2',
    },

    // Tasks
    {
      method: 'GET',
      path: '/tasks',
      category: 'tasks',
      title: 'List Tasks',
      description: 'Retrieve list of user background tasks.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'POST',
      path: '/tasks',
      category: 'tasks',
      title: 'Create Task',
      description: 'Create a new background task.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'GET',
      path: '/tasks/{id}',
      category: 'tasks',
      title: 'Get Task Status',
      description: 'Retrieve detailed information about a specific task.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'DELETE',
      path: '/tasks/{id}',
      category: 'tasks',
      title: 'Cancel Task',
      description: 'Cancel a running background task.',
      status: 'stable',
      version: 'v2',
    },

    // Organization
    {
      method: 'GET',
      path: '/organizations',
      category: 'organization',
      title: 'Get Organization',
      description: 'Retrieve organization information and settings.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'PUT',
      path: '/organizations',
      category: 'organization',
      title: 'Update Organization',
      description: 'Update organization settings and preferences.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'GET',
      path: '/teams',
      category: 'organization',
      title: 'List Teams',
      description: 'Retrieve list of teams within organization.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'POST',
      path: '/teams',
      category: 'organization',
      title: 'Create Team',
      description: 'Create a new team within organization.',
      status: 'stable',
      version: 'v2',
    },

    // API Keys
    {
      method: 'GET',
      path: '/api-keys',
      category: 'api-keys',
      title: 'List API Keys',
      description: 'Retrieve list of organization API keys.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'POST',
      path: '/api-keys',
      category: 'api-keys',
      title: 'Create API Key',
      description: 'Generate a new API key for organization.',
      status: 'stable',
      version: 'v2',
    },
    {
      method: 'DELETE',
      path: '/api-keys/{id}',
      category: 'api-keys',
      title: 'Revoke API Key',
      description: 'Revoke an API key and invalidate all tokens.',
      status: 'stable',
      version: 'v2',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Endpoints', count: apiEndpoints.length },
    { id: 'authentication', name: 'Authentication', count: 4 },
    { id: 'chat', name: 'Chat', count: 5 },
    { id: 'knowledge-base', name: 'Knowledge Base', count: 4 },
    { id: 'files', name: 'Files', count: 4 },
    { id: 'projects', name: 'Projects', count: 5 },
    { id: 'tasks', name: 'Tasks', count: 4 },
    { id: 'organization', name: 'Organization', count: 4 },
    { id: 'api-keys', name: 'API Keys', count: 3 },
  ];

  const filteredEndpoints = apiEndpoints.filter(endpoint => {
    const matchesSearch = endpoint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'method-get';
      case 'POST': return 'method-post';
      case 'PUT': return 'method-put';
      case 'PATCH': return 'method-patch';
      case 'DELETE': return 'method-delete';
      default: return 'method-get';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stable': return 'badge-success';
      case 'beta': return 'badge-warning';
      case 'deprecated': return 'badge-error';
      default: return 'badge-info';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-rajdhani font-bold text-potomac-gray">
                API Reference
              </h1>
              <p className="text-gray-600 mt-1">
                Complete reference for all ByPotomac SDK API endpoints
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/docs" className="btn-secondary focus-ring">
                Documentation
              </Link>
              <Link href="/guides" className="btn-primary focus-ring">
                Developer Guides
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-potomac-yellow focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-rajdhani border transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-potomac-yellow text-potomac-gray border-potomac-yellow'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-potomac-yellow'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredEndpoints.length} of {apiEndpoints.length} endpoints
          </p>
        </div>

        <div className="space-y-4">
          {filteredEndpoints.map((endpoint, index) => (
            <Link
              key={endpoint.path}
              href={`/api-reference${endpoint.path}`}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`api-method ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <span className="text-sm text-gray-500 font-mono">{endpoint.path}</span>
                  <span className={`badge ${getStatusBadge(endpoint.status)}`}>
                    {endpoint.status}
                  </span>
                  <span className="badge badge-info text-gray-700">{endpoint.version}</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-rajdhani font-bold text-potomac-gray mb-1">
                  {endpoint.title}
                </h3>
                <p className="text-gray-600">{endpoint.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {filteredEndpoints.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-rajdhani font-bold text-potomac-gray mb-2">
              No endpoints found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
              <Link href="/docs" className="btn-primary">
                View Documentation
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Quick Reference */}
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-rajdhani font-bold mb-4">Rate Limits</h3>
              <div className="space-y-2 text-gray-300">
                <p><strong>Authentication:</strong> 60 requests per minute per IP</p>
                <p><strong>Chat API:</strong> 30 requests per minute per user</p>
                <p><strong>General API:</strong> 120 requests per minute per user</p>
                <p><strong>File Upload:</strong> 10 uploads per minute per user</p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-rajdhani font-bold mb-4">Response Formats</h3>
              <div className="space-y-2 text-gray-300">
                <p><strong>Content-Type:</strong> application/json</p>
                <p><strong>Encoding:</strong> UTF-8</p>
                <p><strong>Time Format:</strong> ISO 8601</p>
                <p><strong>Timezone:</strong> UTC</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400">
                Need help with the API? <Link href="/support" className="text-white hover:text-potomac-yellow transition-colors">Contact Support</Link>
              </div>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <Link href="/docs/authentication" className="text-white hover:text-potomac-yellow transition-colors">Authentication Guide</Link>
                <Link href="/docs/error-handling" className="text-white hover:text-potomac-yellow transition-colors">Error Handling</Link>
                <Link href="/docs/rate-limiting" className="text-white hover:text-potomac-yellow transition-colors">Rate Limiting</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}