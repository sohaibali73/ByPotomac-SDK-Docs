import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import DocsLayout from '@/components/DocsLayout';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { allDocs, getDocBySlug } from '@/lib/content-index';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all documentation pages
export async function generateStaticParams() {
  return allDocs.map((doc) => ({
    slug: doc.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const docEntry = getDocBySlug(slug);

  if (!docEntry) {
    return {
      title: 'Page Not Found - ByPotomac SDK',
    };
  }

  return {
    title: `${docEntry.title} - ByPotomac SDK Documentation`,
    description: docEntry.description,
    openGraph: {
      title: `${docEntry.title} - ByPotomac SDK`,
      description: docEntry.description,
      type: 'article',
    },
  };
}

// Extract table of contents from markdown
function extractTableOfContents(content: string) {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const items: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    items.push({ id, text, level });
  }

  return items;
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const docEntry = getDocBySlug(slug);

  if (!docEntry) {
    notFound();
  }

  // Read the markdown file
  const projectRoot = process.cwd();
  const filePath = path.join(projectRoot, '..', docEntry.sourceFile);
  
  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error);
    notFound();
  }

  const tableOfContents = extractTableOfContents(content);

  return (
    <DocsLayout tableOfContents={tableOfContents} title={docEntry.title}>
      <div className="doc-content">
        <MarkdownRenderer content={content} />
      </div>
    </DocsLayout>
  );
}
