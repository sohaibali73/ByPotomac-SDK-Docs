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
    { id: 'all', name: 'All', count: apiEndpoints.length },
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
                  API Reference
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Complete reference for all ByPotomac SDK API endpoints
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/docs" className="btn-ghost text-sm">
                Documentation
              </Link>
              <Link href="/guides" className="btn-primary text-sm">
                Developer Guides
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="w-full lg:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  {category.name}
                  <span className="ml-1.5 opacity-70">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {filteredEndpoints.length} of {apiEndpoints.length} endpoints
          </p>
        </div>

        <div className="space-y-3">
          {filteredEndpoints.map((endpoint, index) => (
            <div
              key={`${endpoint.method}-${endpoint.path}`}
              className="card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`api-method ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm text-muted-foreground font-mono">{endpoint.path}</code>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <span className={`badge ${getStatusBadge(endpoint.status)}`}>
                    {endpoint.status}
                  </span>
                  <span className="badge badge-info">{endpoint.version}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-foreground mb-1">
                  {endpoint.title}
                </h3>
                <p className="text-muted-foreground text-sm">{endpoint.description}</p>
                <Link 
                  href="/docs/api-reference" 
                  className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:text-accent transition-colors group"
                >
                  View details
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredEndpoints.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-heading font-bold text-foreground mb-2">
              No endpoints found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters to find what you are looking for.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
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
      <section className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-4">Rate Limits</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Authentication</span>
                  <span className="text-foreground font-medium">60 req/min per IP</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Chat API</span>
                  <span className="text-foreground font-medium">30 req/min per user</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">General API</span>
                  <span className="text-foreground font-medium">120 req/min per user</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">File Upload</span>
                  <span className="text-foreground font-medium">10 uploads/min per user</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-4">Response Formats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Content-Type</span>
                  <code className="text-foreground font-mono text-xs bg-muted px-2 py-0.5 rounded">application/json</code>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Encoding</span>
                  <code className="text-foreground font-mono text-xs bg-muted px-2 py-0.5 rounded">UTF-8</code>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Time Format</span>
                  <code className="text-foreground font-mono text-xs bg-muted px-2 py-0.5 rounded">ISO 8601</code>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Timezone</span>
                  <code className="text-foreground font-mono text-xs bg-muted px-2 py-0.5 rounded">UTC</code>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-muted-foreground text-sm">
                Need help with the API? <Link href="/support" className="text-primary hover:text-accent transition-colors">Contact Support</Link>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/docs/authentication" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Authentication Guide</Link>
                <Link href="/docs/error-handling" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Error Handling</Link>
                <Link href="/docs/middleware" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Middleware</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
