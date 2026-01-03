'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Search, X, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchModal() {
    const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery, pages } = useAppStore();

    // Filter pages based on search query
    const filteredPages = pages.filter(
        (page) =>
            page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (page.icon && page.icon.includes(searchQuery))
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(!isSearchOpen);
            }
            if (e.key === 'Escape') {
                setSearchOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSearchOpen, setSearchOpen]);

    if (!isSearchOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setSearchOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search pages..."
                        className="flex-1 bg-transparent text-lg outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    <button
                        onClick={() => setSearchOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto p-2">
                    {searchQuery === '' ? (
                        <div className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                <Clock className="w-4 h-4" />
                                <span>Recent pages</span>
                            </div>
                            {pages.slice(0, 5).map((page) => (
                                <SearchResultItem
                                    key={page.id}
                                    page={page}
                                    onSelect={() => setSearchOpen(false)}
                                />
                            ))}
                        </div>
                    ) : filteredPages.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No pages found for &quot;{searchQuery}&quot;</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {filteredPages.map((page) => (
                                <SearchResultItem
                                    key={page.id}
                                    page={page}
                                    query={searchQuery}
                                    onSelect={() => setSearchOpen(false)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        <span><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700">↵</kbd> to select</span>
                        <span><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700">↑↓</kbd> to navigate</span>
                    </div>
                    <span><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700">esc</kbd> to close</span>
                </div>
            </div>
        </div>
    );
}

interface SearchResultItemProps {
    page: { id: string; title: string; icon?: string | null; updatedAt: Date };
    query?: string;
    onSelect: () => void;
}

function SearchResultItem({ page, query, onSelect }: SearchResultItemProps) {
    const { setCurrentPage } = useAppStore();

    const handleClick = () => {
        // TODO: Fetch full page and set as current
        onSelect();
    };

    // Highlight matching text
    const highlightMatch = (text: string) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-inherit">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <button
            onClick={handleClick}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
        >
            <span className="text-xl">{page.icon || '📄'}</span>
            <span className="flex-1 text-gray-800 dark:text-gray-200">
                {highlightMatch(page.title || 'Untitled')}
            </span>
        </button>
    );
}
