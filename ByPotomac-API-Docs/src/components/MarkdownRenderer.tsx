'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
}

// Copy button component for code blocks
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 px-2.5 py-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md transition-colors border border-border"
      aria-label="Copy code"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings with anchor links
        h1: ({ children, ...props }) => {
          const id = children
            ?.toString()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          return (
            <h1 id={id} className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-6 mt-8 first:mt-0" {...props}>
              {children}
            </h1>
          );
        },
        h2: ({ children, ...props }) => {
          const id = children
            ?.toString()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          return (
            <h2
              id={id}
              className="text-2xl font-heading font-bold text-foreground mb-4 mt-12 pt-6 border-t border-border"
              {...props}
            >
              <a href={`#${id}`} className="hover:text-primary transition-colors">
                {children}
              </a>
            </h2>
          );
        },
        h3: ({ children, ...props }) => {
          const id = children
            ?.toString()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          return (
            <h3 id={id} className="text-xl font-heading font-bold text-foreground mb-3 mt-8" {...props}>
              <a href={`#${id}`} className="hover:text-primary transition-colors">
                {children}
              </a>
            </h3>
          );
        },
        h4: ({ children, ...props }) => {
          const id = children
            ?.toString()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          return (
            <h4 id={id} className="text-lg font-heading font-semibold text-foreground mb-2 mt-6" {...props}>
              {children}
            </h4>
          );
        },
        // Paragraphs
        p: ({ children, ...props }) => (
          <p className="text-muted-foreground leading-relaxed mb-4" {...props}>
            {children}
          </p>
        ),
        // Lists
        ul: ({ children, ...props }) => (
          <ul className="list-disc text-muted-foreground mb-4 space-y-2 ml-6" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal text-muted-foreground mb-4 space-y-2 ml-6" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li className="text-muted-foreground leading-relaxed" {...props}>
            {children}
          </li>
        ),
        // Links
        a: ({ children, href, ...props }) => (
          <a
            href={href}
            className="text-primary hover:text-accent underline underline-offset-2 transition-colors"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            {...props}
          >
            {children}
          </a>
        ),
        // Code blocks
        pre: ({ children, ...props }) => {
          // Extract text content from children for copy functionality
          const getTextContent = (node: React.ReactNode): string => {
            if (typeof node === 'string') return node;
            if (Array.isArray(node)) return node.map(getTextContent).join('');
            if (node && typeof node === 'object' && 'props' in node) {
              return getTextContent((node as React.ReactElement).props.children);
            }
            return '';
          };
          const codeText = getTextContent(children);

          return (
            <div className="relative group mb-6">
              <pre
                className="bg-card text-foreground p-4 rounded-xl overflow-x-auto text-sm leading-relaxed border border-border"
                {...props}
              >
                {children}
              </pre>
              <CopyButton text={codeText} />
            </div>
          );
        },
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-muted text-foreground px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          }
          // For code blocks, the className contains language info like "language-json"
          const language = className?.replace('language-', '') || '';
          return (
            <code className={`language-${language} font-mono`} {...props}>
              {children}
            </code>
          );
        },
        // Blockquotes
        blockquote: ({ children, ...props }) => (
          <blockquote
            className="border-l-2 border-primary bg-muted/50 pl-4 py-3 my-6 text-muted-foreground rounded-r-lg"
            {...props}
          >
            {children}
          </blockquote>
        ),
        // Tables
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-border border border-border rounded-xl overflow-hidden" {...props}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children, ...props }) => (
          <thead className="bg-muted" {...props}>
            {children}
          </thead>
        ),
        tbody: ({ children, ...props }) => (
          <tbody className="bg-card divide-y divide-border" {...props}>
            {children}
          </tbody>
        ),
        tr: ({ children, ...props }) => (
          <tr className="hover:bg-muted/50 transition-colors" {...props}>
            {children}
          </tr>
        ),
        th: ({ children, ...props }) => (
          <th
            className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider"
            {...props}
          >
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td className="px-4 py-3 text-sm text-muted-foreground" {...props}>
            {children}
          </td>
        ),
        // Horizontal rule
        hr: () => <hr className="my-10 border-t border-border" />,
        // Strong/Bold
        strong: ({ children, ...props }) => (
          <strong className="font-semibold text-foreground" {...props}>
            {children}
          </strong>
        ),
        // Emphasis/Italic
        em: ({ children, ...props }) => (
          <em className="italic text-muted-foreground" {...props}>
            {children}
          </em>
        ),
        // Images
        img: ({ src, alt, ...props }) => (
          <img src={src} alt={alt || ''} className="max-w-full h-auto rounded-xl my-6 border border-border" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
