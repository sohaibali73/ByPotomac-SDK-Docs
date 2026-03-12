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
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 hover:text-foreground transition-colors border border-border"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-background rounded border border-border ml-2">
          <span className="text-[10px]">Cmd</span>K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Modal */}
          <div className="relative min-h-screen flex items-start justify-center pt-20 px-4">
            <div className="relative w-full max-w-xl bg-card rounded-xl shadow-2xl border border-border animate-fade-in-up">
              {/* Search Input */}
              <div className="flex items-center border-b border-border">
                <svg className="w-5 h-5 ml-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documentation..."
                  className="w-full px-4 py-4 text-base bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="mr-4 px-2 py-1 text-xs text-muted-foreground bg-muted rounded hover:bg-muted/80 hover:text-foreground transition-colors border border-border"
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
                          className="flex items-center gap-4 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0 border border-border">
                            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">{result.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                          </div>
                          <span className="text-xs text-muted-foreground capitalize shrink-0 bg-muted px-2 py-1 rounded">
                            {result.category}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : query ? (
                  <div className="px-4 py-12 text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground">No results found for &ldquo;{query}&rdquo;</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Try searching for a different term</p>
                  </div>
                ) : (
                  <div className="px-4 py-6">
                    <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider font-medium">Quick Links</p>
                    <ul className="space-y-1">
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
                            className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="border-t border-border px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">Enter</kbd>
                    <span>to select</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">Esc</kbd>
                    <span>to close</span>
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
