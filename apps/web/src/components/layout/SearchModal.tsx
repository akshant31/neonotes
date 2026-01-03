'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { useAppStore } from '@/stores/app-store';
import { cn, debounce } from '@/lib/utils';
import { Search, FileText, X, Clock, Loader2 } from 'lucide-react';
import type { Page } from '@/types';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { setCurrentPage, currentWorkspace, pages } = useAppStore();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Search query
    const { data: searchResults, isLoading, refetch } = trpc.page.search.useQuery(
        { workspaceId: currentWorkspace?.id ?? '', query },
        { enabled: !!currentWorkspace?.id && query.length > 0 }
    );

    // Recent pages
    const { data: recentPages } = trpc.page.recent.useQuery(
        { workspaceId: currentWorkspace?.id ?? '', limit: 5 },
        { enabled: !!currentWorkspace?.id && query.length === 0 }
    );

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            const results = query ? (searchResults || []) : (recentPages || []);
            const maxIndex = results.length - 1;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((i) => Math.min(i + 1, maxIndex));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((i) => Math.max(i - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (results[selectedIndex]) {
                        handleSelect(results[selectedIndex] as Page);
                    }
                    break;
                case 'Escape':
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, query, searchResults, recentPages]);

    // Global keyboard shortcut
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                } else {
                    // This will be handled by parent
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isOpen, onClose]);

    const handleSelect = (page: Page) => {
        setCurrentPage(page);
        onClose();
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setSelectedIndex(0);
    };

    if (!isOpen) return null;

    const displayResults = query ? (searchResults || []) : (recentPages || []);

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleQueryChange}
                        placeholder="Search pages..."
                        className="flex-1 bg-transparent outline-none text-gray-100 placeholder:text-gray-500"
                    />
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[300px] overflow-y-auto">
                    {displayResults.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                            {query ? (
                                <>
                                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No results found for &quot;{query}&quot;</p>
                                </>
                            ) : (
                                <>
                                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No recent pages</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {query ? 'Search Results' : 'Recent Pages'}
                            </div>
                            {displayResults.map((page: any, index: number) => (
                                <button
                                    key={page.id}
                                    onClick={() => handleSelect(page)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                                        index === selectedIndex
                                            ? 'bg-indigo-600/20 text-indigo-300'
                                            : 'hover:bg-gray-800'
                                    )}
                                >
                                    <span className="text-lg">{page.icon || '📄'}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{page.title || 'Untitled'}</p>
                                        <p className="text-sm text-gray-500 truncate">
                                            Updated {new Date(page.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                </button>
                            ))}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-800 flex items-center gap-4 text-xs text-gray-500">
                    <span>↑↓ Navigate</span>
                    <span>↵ Select</span>
                    <span>ESC Close</span>
                </div>
            </div>
        </div>
    );
}
