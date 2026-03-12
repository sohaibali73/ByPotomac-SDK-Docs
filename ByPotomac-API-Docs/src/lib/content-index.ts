// Content index for documentation structure
// This maps slugs to their source files and metadata

export interface DocEntry {
  slug: string;
  title: string;
  description: string;
  sourceFile: string;
  category: 'backend' | 'frontend' | 'branding';
  order: number;
  icon: string;
}

export const backendDocs: DocEntry[] = [
  {
    slug: 'overview',
    title: 'SDK Overview',
    description: 'Introduction to the ByPotomac SDK and its capabilities',
    sourceFile: 'BackEnd Docs/01-SDK-OVERVIEW.md',
    category: 'backend',
    order: 1,
    icon: 'BookOpen',
  },
  {
    slug: 'architecture',
    title: 'System Architecture',
    description: 'Understanding the SDK architecture and components',
    sourceFile: 'BackEnd Docs/02-SYSTEM-ARCHITECTURE.md',
    category: 'backend',
    order: 2,
    icon: 'Layers',
  },
  {
    slug: 'api-reference',
    title: 'API Reference',
    description: 'Complete API endpoint reference documentation',
    sourceFile: 'BackEnd Docs/03-API-REFERENCE.md',
    category: 'backend',
    order: 3,
    icon: 'Code',
  },
  {
    slug: 'authentication',
    title: 'Authentication',
    description: 'Authentication methods and security protocols',
    sourceFile: 'BackEnd Docs/04-AUTHENTICATION.md',
    category: 'backend',
    order: 4,
    icon: 'Lock',
  },
  {
    slug: 'data-models',
    title: 'Data Models',
    description: 'Database schemas and data structures',
    sourceFile: 'BackEnd Docs/05-DATA-MODELS.md',
    category: 'backend',
    order: 5,
    icon: 'Database',
  },
  {
    slug: 'security',
    title: 'Security',
    description: 'Security features and compliance',
    sourceFile: 'BackEnd Docs/06-SECURITY.md',
    category: 'backend',
    order: 6,
    icon: 'Shield',
  },
  {
    slug: 'streaming',
    title: 'Streaming and Real-time',
    description: 'Real-time data streaming and SSE implementation',
    sourceFile: 'BackEnd Docs/07-STREAMING-REALTIME.md',
    category: 'backend',
    order: 7,
    icon: 'Zap',
  },
  {
    slug: 'configuration',
    title: 'Configuration',
    description: 'SDK configuration and environment setup',
    sourceFile: 'BackEnd Docs/08-CONFIGURATION.md',
    category: 'backend',
    order: 8,
    icon: 'Settings',
  },
  {
    slug: 'middleware',
    title: 'Middleware',
    description: 'Request middleware and processing pipeline',
    sourceFile: 'BackEnd Docs/09-MIDDLEWARE.md',
    category: 'backend',
    order: 9,
    icon: 'GitBranch',
  },
  {
    slug: 'deployment',
    title: 'Deployment',
    description: 'Deployment guides and production setup',
    sourceFile: 'BackEnd Docs/10-DEPLOYMENT.md',
    category: 'backend',
    order: 10,
    icon: 'Cloud',
  },
  {
    slug: 'error-handling',
    title: 'Error Handling',
    description: 'Error codes, handling, and troubleshooting',
    sourceFile: 'BackEnd Docs/11-ERROR-HANDLING.md',
    category: 'backend',
    order: 11,
    icon: 'AlertTriangle',
  },
  {
    slug: 'observability',
    title: 'Observability',
    description: 'Logging, monitoring, and debugging',
    sourceFile: 'BackEnd Docs/12-OBSERVABILITY.md',
    category: 'backend',
    order: 12,
    icon: 'Activity',
  },
  {
    slug: 'database',
    title: 'Database and Redis',
    description: 'Database operations and caching',
    sourceFile: 'BackEnd Docs/13-DATABASE-REDIS.md',
    category: 'backend',
    order: 13,
    icon: 'Server',
  },
  {
    slug: 'multitenancy',
    title: 'Multi-tenancy and Compliance',
    description: 'Organization isolation and audit logging',
    sourceFile: 'BackEnd Docs/14-MULTITENANCY-COMPLIANCE-AUDIT.md',
    category: 'backend',
    order: 14,
    icon: 'Building',
  },
  {
    slug: 'testing',
    title: 'Testing and Versioning',
    description: 'Testing strategies and API versioning',
    sourceFile: 'BackEnd Docs/15-TESTING-INTEGRATION-VERSIONING.md',
    category: 'backend',
    order: 15,
    icon: 'CheckCircle',
  },
  {
    slug: 'infrastructure',
    title: 'Infrastructure Engine',
    description: 'Infrastructure components and engine details',
    sourceFile: 'BackEnd Docs/16-INFRASTRUCTURE-ENGINE.md',
    category: 'backend',
    order: 16,
    icon: 'Cpu',
  },
];

export const frontendDocs: DocEntry[] = [
  {
    slug: 'platform-overview',
    title: 'Platform Overview',
    description: 'Overview of all client platforms',
    sourceFile: 'Front End Docs/01-PLATFORM-OVERVIEW.md',
    category: 'frontend',
    order: 1,
    icon: 'Layout',
  },
  {
    slug: 'web',
    title: 'Web Frontend',
    description: 'Next.js web application implementation',
    sourceFile: 'Front End Docs/02-WEB-FRONTEND.md',
    category: 'frontend',
    order: 2,
    icon: 'Globe',
  },
  {
    slug: 'windows',
    title: 'Windows Frontend',
    description: 'WinUI 3 native Windows application',
    sourceFile: 'Front End Docs/03-WINDOWS-FRONTEND.md',
    category: 'frontend',
    order: 3,
    icon: 'Monitor',
  },
  {
    slug: 'apple',
    title: 'Apple Platforms',
    description: 'iOS and macOS SwiftUI applications',
    sourceFile: 'Front End Docs/04-APPLE-FRONTEND.md',
    category: 'frontend',
    order: 4,
    icon: 'Smartphone',
  },
  {
    slug: 'planned',
    title: 'Planned Platforms',
    description: 'Upcoming platform implementations',
    sourceFile: 'Front End Docs/05-PLANNED-PLATFORMS.md',
    category: 'frontend',
    order: 5,
    icon: 'Calendar',
  },
];

export const allDocs = [...backendDocs, ...frontendDocs];

export function getDocBySlug(slug: string): DocEntry | undefined {
  return allDocs.find((doc) => doc.slug === slug);
}

export function getAllSlugs(): string[] {
  return allDocs.map((doc) => doc.slug);
}
