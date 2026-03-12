import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface DocMeta {
  slug: string;
  title: string;
  description?: string;
  order: number;
  category: 'backend' | 'frontend' | 'branding';
  filePath: string;
}

export interface DocContent extends DocMeta {
  content: string;
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

// Map file names to URL-friendly slugs and metadata
const backendDocsMap: Record<string, { slug: string; title: string; description: string }> = {
  '01-SDK-OVERVIEW.md': {
    slug: 'overview',
    title: 'SDK Overview',
    description: 'Introduction to the ByPotomac SDK and its capabilities',
  },
  '02-SYSTEM-ARCHITECTURE.md': {
    slug: 'architecture',
    title: 'System Architecture',
    description: 'Understanding the SDK architecture and components',
  },
  '03-API-REFERENCE.md': {
    slug: 'api-reference',
    title: 'API Reference',
    description: 'Complete API endpoint reference documentation',
  },
  '04-AUTHENTICATION.md': {
    slug: 'authentication',
    title: 'Authentication',
    description: 'Authentication methods and security protocols',
  },
  '05-DATA-MODELS.md': {
    slug: 'data-models',
    title: 'Data Models',
    description: 'Database schemas and data structures',
  },
  '06-SECURITY.md': {
    slug: 'security',
    title: 'Security',
    description: 'Security features and compliance',
  },
  '07-STREAMING-REALTIME.md': {
    slug: 'streaming',
    title: 'Streaming and Real-time',
    description: 'Real-time data streaming and SSE implementation',
  },
  '08-CONFIGURATION.md': {
    slug: 'configuration',
    title: 'Configuration',
    description: 'SDK configuration and environment setup',
  },
  '09-MIDDLEWARE.md': {
    slug: 'middleware',
    title: 'Middleware',
    description: 'Request middleware and processing pipeline',
  },
  '10-DEPLOYMENT.md': {
    slug: 'deployment',
    title: 'Deployment',
    description: 'Deployment guides and production setup',
  },
  '11-ERROR-HANDLING.md': {
    slug: 'error-handling',
    title: 'Error Handling',
    description: 'Error codes, handling, and troubleshooting',
  },
  '12-OBSERVABILITY.md': {
    slug: 'observability',
    title: 'Observability',
    description: 'Logging, monitoring, and debugging',
  },
  '13-DATABASE-REDIS.md': {
    slug: 'database',
    title: 'Database and Redis',
    description: 'Database operations and caching',
  },
  '14-MULTITENANCY-COMPLIANCE-AUDIT.md': {
    slug: 'multitenancy',
    title: 'Multi-tenancy and Compliance',
    description: 'Organization isolation and audit logging',
  },
  '15-TESTING-INTEGRATION-VERSIONING.md': {
    slug: 'testing',
    title: 'Testing and Versioning',
    description: 'Testing strategies and API versioning',
  },
  '16-INFRASTRUCTURE-ENGINE.md': {
    slug: 'infrastructure',
    title: 'Infrastructure Engine',
    description: 'Infrastructure components and engine details',
  },
};

const frontendDocsMap: Record<string, { slug: string; title: string; description: string }> = {
  '01-PLATFORM-OVERVIEW.md': {
    slug: 'platform-overview',
    title: 'Platform Overview',
    description: 'Overview of all client platforms',
  },
  '02-WEB-FRONTEND.md': {
    slug: 'web',
    title: 'Web Frontend',
    description: 'Next.js web application implementation',
  },
  '03-WINDOWS-FRONTEND.md': {
    slug: 'windows',
    title: 'Windows Frontend',
    description: 'WinUI 3 native Windows application',
  },
  '04-APPLE-FRONTEND.md': {
    slug: 'apple',
    title: 'Apple Platforms',
    description: 'iOS and macOS SwiftUI applications',
  },
  '05-PLANNED-PLATFORMS.md': {
    slug: 'planned',
    title: 'Planned Platforms',
    description: 'Upcoming platform implementations',
  },
};

// Get the docs directory path (relative to the project root)
function getDocsBasePath(): string {
  // In Next.js, process.cwd() returns the project root
  return process.cwd();
}

// Get all documentation metadata
export function getAllDocs(): DocMeta[] {
  const basePath = getDocsBasePath();
  const docs: DocMeta[] = [];

  // Backend docs
  const backendPath = path.join(basePath, '..', 'BackEnd Docs');
  if (fs.existsSync(backendPath)) {
    const files = fs.readdirSync(backendPath);
    files.forEach((file, index) => {
      if (file.endsWith('.md') && backendDocsMap[file]) {
        const meta = backendDocsMap[file];
        docs.push({
          slug: meta.slug,
          title: meta.title,
          description: meta.description,
          order: index,
          category: 'backend',
          filePath: path.join(backendPath, file),
        });
      }
    });
  }

  // Frontend docs
  const frontendPath = path.join(basePath, '..', 'Front End Docs');
  if (fs.existsSync(frontendPath)) {
    const files = fs.readdirSync(frontendPath);
    files.forEach((file, index) => {
      if (file.endsWith('.md') && frontendDocsMap[file]) {
        const meta = frontendDocsMap[file];
        docs.push({
          slug: meta.slug,
          title: meta.title,
          description: meta.description,
          order: index,
          category: 'frontend',
          filePath: path.join(frontendPath, file),
        });
      }
    });
  }

  return docs;
}

// Get documentation by slug
export function getDocBySlug(slug: string): DocContent | null {
  const docs = getAllDocs();
  const doc = docs.find((d) => d.slug === slug);

  if (!doc) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(doc.filePath, 'utf-8');
    const { content, data } = matter(fileContent);

    return {
      ...doc,
      title: (data.title as string) || doc.title,
      description: (data.description as string) || doc.description,
      content,
    };
  } catch {
    return null;
  }
}

// Get all slugs for static generation
export function getAllDocSlugs(): string[] {
  const docs = getAllDocs();
  return docs.map((doc) => doc.slug);
}

// Get docs by category
export function getDocsByCategory(category: 'backend' | 'frontend' | 'branding'): DocMeta[] {
  return getAllDocs()
    .filter((doc) => doc.category === category)
    .sort((a, b) => a.order - b.order);
}

// Extract table of contents from markdown content
export function extractTableOfContents(content: string): TableOfContentsItem[] {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const items: TableOfContentsItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Create a URL-friendly ID
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    items.push({ id, text, level });
  }

  return items;
}

// Navigation structure for the sidebar
export interface NavSection {
  title: string;
  items: {
    title: string;
    slug: string;
    description?: string;
  }[];
}

export function getNavigationStructure(): NavSection[] {
  const backendDocs = getDocsByCategory('backend');
  const frontendDocs = getDocsByCategory('frontend');

  return [
    {
      title: 'Getting Started',
      items: [
        {
          title: 'SDK Overview',
          slug: 'overview',
          description: 'Introduction to ByPotomac SDK',
        },
        {
          title: 'System Architecture',
          slug: 'architecture',
          description: 'Understanding the architecture',
        },
      ],
    },
    {
      title: 'Core Concepts',
      items: [
        {
          title: 'Authentication',
          slug: 'authentication',
          description: 'Auth methods and security',
        },
        {
          title: 'Data Models',
          slug: 'data-models',
          description: 'Schemas and structures',
        },
        {
          title: 'Security',
          slug: 'security',
          description: 'Security features',
        },
      ],
    },
    {
      title: 'API Documentation',
      items: [
        {
          title: 'API Reference',
          slug: 'api-reference',
          description: 'Complete endpoint reference',
        },
        {
          title: 'Streaming',
          slug: 'streaming',
          description: 'Real-time and SSE',
        },
        {
          title: 'Error Handling',
          slug: 'error-handling',
          description: 'Error codes and handling',
        },
      ],
    },
    {
      title: 'Infrastructure',
      items: [
        {
          title: 'Configuration',
          slug: 'configuration',
          description: 'SDK configuration',
        },
        {
          title: 'Middleware',
          slug: 'middleware',
          description: 'Request pipeline',
        },
        {
          title: 'Database',
          slug: 'database',
          description: 'Database and Redis',
        },
        {
          title: 'Deployment',
          slug: 'deployment',
          description: 'Production deployment',
        },
      ],
    },
    {
      title: 'Advanced',
      items: [
        {
          title: 'Observability',
          slug: 'observability',
          description: 'Logging and monitoring',
        },
        {
          title: 'Multi-tenancy',
          slug: 'multitenancy',
          description: 'Isolation and compliance',
        },
        {
          title: 'Testing',
          slug: 'testing',
          description: 'Testing and versioning',
        },
        {
          title: 'Infrastructure Engine',
          slug: 'infrastructure',
          description: 'Engine details',
        },
      ],
    },
    {
      title: 'Platform SDKs',
      items: frontendDocs.map((doc) => ({
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
      })),
    },
  ];
}
