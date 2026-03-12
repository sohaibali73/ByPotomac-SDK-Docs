'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { allDocs, DocEntry } from '@/lib/content-index';

interface SearchResult extends DocEntry {
  matchType: 'title' | 'description' | 'slug';
}

export default function DocsSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const search = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const matched: SearchResult[] = [];

    allDocs.forEach((doc) => {
      if (doc.title.toLowerCase().includes(lowerQuery)) {
        matched.push({ ...doc, matchType: 'title' });
      } else if (doc.description.toLowerCase().includes(lowerQuery)) {
        matched.push({ ...doc, matchType: 'description' });
      } else if (doc.slug.toLowerCase().includes(lowerQuery)) {
        matched.push({ ...doc, matchType: 'slug' });
      }
    });

    setResults(matched.slice(0, 8));
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Search docs...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-white rounded border border-gray-300">
          <span className="text-xs">Cmd</span>K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />

          {/* Modal */}
          <div className="relative min-h-screen flex items-start justify-center pt-16 px-4">
            <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center border-b border-gray-200">
                <svg className="w-5 h-5 ml-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documentation..."
                  className="w-full px-4 py-4 text-lg focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="mr-4 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded hover:bg-gray-200"
                >
                  ESC
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  <ul className="py-2">
                    {results.map((result) => (
                      <li key={result.slug}>
                        <Link
                          href={`/docs/${result.slug}`}
                          onClick={handleSelect}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-potomac-gray truncate">{result.title}</h4>
                            <p className="text-sm text-gray-500 truncate">{result.description}</p>
                          </div>
                          <span className="text-xs text-gray-400 capitalize shrink-0">
                            {result.category}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : query ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-gray-500">No results found for "{query}"</p>
                    <p className="text-sm text-gray-400 mt-1">Try searching for a different term</p>
                  </div>
                ) : (
                  <div className="px-4 py-6">
                    <p className="text-sm text-gray-500 mb-4">Quick Links</p>
                    <ul className="space-y-2">
                      {[
                        { title: 'SDK Overview', slug: 'overview' },
                        { title: 'Authentication', slug: 'authentication' },
                        { title: 'API Reference', slug: 'api-reference' },
                        { title: 'Streaming', slug: 'streaming' },
                      ].map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`/docs/${item.slug}`}
                            onClick={handleSelect}
                            className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:text-potomac-gray hover:bg-gray-50 rounded transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">Enter</kbd>
                    to select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">Esc</kbd>
                    to close
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
