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
      className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
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
            <h1 id={id} className="text-4xl font-rajdhani font-bold text-potomac-gray mb-6 mt-8 first:mt-0" {...props}>
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
              className="text-2xl font-rajdhani font-bold text-potomac-gray mb-4 mt-10 pt-6 border-t border-gray-200"
              {...props}
            >
              <a href={`#${id}`} className="hover:text-potomac-yellow transition-colors">
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
            <h3 id={id} className="text-xl font-rajdhani font-bold text-potomac-gray mb-3 mt-8" {...props}>
              <a href={`#${id}`} className="hover:text-potomac-yellow transition-colors">
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
            <h4 id={id} className="text-lg font-rajdhani font-bold text-potomac-gray mb-2 mt-6" {...props}>
              {children}
            </h4>
          );
        },
        // Paragraphs
        p: ({ children, ...props }) => (
          <p className="text-gray-700 leading-relaxed mb-4" {...props}>
            {children}
          </p>
        ),
        // Lists
        ul: ({ children, ...props }) => (
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1 ml-4" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1 ml-4" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li className="text-gray-700 leading-relaxed" {...props}>
            {children}
          </li>
        ),
        // Links
        a: ({ children, href, ...props }) => (
          <a
            href={href}
            className="text-potomac-yellow hover:text-potomac-turquoise underline transition-colors"
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
                className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed"
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
              <code className="bg-gray-100 text-potomac-gray px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          }
          // For code blocks, the className contains language info like "language-json"
          const language = className?.replace('language-', '') || '';
          return (
            <code className={`language-${language}`} {...props}>
              {children}
            </code>
          );
        },
        // Blockquotes
        blockquote: ({ children, ...props }) => (
          <blockquote
            className="border-l-4 border-potomac-yellow bg-gray-50 pl-4 py-2 my-4 italic text-gray-700"
            {...props}
          >
            {children}
          </blockquote>
        ),
        // Tables
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children, ...props }) => (
          <thead className="bg-gray-50" {...props}>
            {children}
          </thead>
        ),
        tbody: ({ children, ...props }) => (
          <tbody className="bg-white divide-y divide-gray-200" {...props}>
            {children}
          </tbody>
        ),
        tr: ({ children, ...props }) => (
          <tr className="hover:bg-gray-50 transition-colors" {...props}>
            {children}
          </tr>
        ),
        th: ({ children, ...props }) => (
          <th
            className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            {...props}
          >
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" {...props}>
            {children}
          </td>
        ),
        // Horizontal rule
        hr: () => <hr className="my-8 border-t border-gray-200" />,
        // Strong/Bold
        strong: ({ children, ...props }) => (
          <strong className="font-semibold text-potomac-gray" {...props}>
            {children}
          </strong>
        ),
        // Emphasis/Italic
        em: ({ children, ...props }) => (
          <em className="italic" {...props}>
            {children}
          </em>
        ),
        // Images
        img: ({ src, alt, ...props }) => (
          <img src={src} alt={alt || ''} className="max-w-full h-auto rounded-lg my-4 shadow-sm" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
