'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { trpc } from '@/utils/trpc';
import { FileText, Search } from 'lucide-react';

interface PageLinkSearchProps {
    editor: Editor;
    workspaceId: string;
}

export function PageLinkSearch({ editor, workspaceId }: PageLinkSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const inputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Search pages query
    const { data: pages = [] } = trpc.page.search.useQuery(
        { workspaceId, query: query || '' },
        { enabled: isOpen && !!workspaceId }
    );

    // Listen for [[ trigger
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === '[' && !isOpen) {
                // Check if the previous character was also [
                const { state } = editor;
                const { from } = state.selection;
                const textBefore = state.doc.textBetween(Math.max(0, from - 1), from, '');

                if (textBefore === '[') {
                    event.preventDefault();
                    // Delete the first [ and open the search
                    editor.commands.deleteRange({ from: from - 1, to: from });

                    // Get cursor position for popup placement
                    const coords = editor.view.coordsAtPos(from - 1);
                    setPosition({
                        top: coords.bottom + 5,
                        left: coords.left,
                    });

                    setIsOpen(true);
                    setQuery('');
                    setSelectedIndex(0);
                }
            }
        };

        const editorEl = editor.view.dom;
        editorEl.addEventListener('keydown', handleKeyDown);

        return () => {
            editorEl.removeEventListener('keydown', handleKeyDown);
        };
    }, [editor, isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Reset selected index when pages change
    useEffect(() => {
        setSelectedIndex(0);
    }, [pages]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, pages.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (event.key === 'Enter' && pages.length > 0) {
            event.preventDefault();
            insertPageLink(pages[selectedIndex]);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setIsOpen(false);
        }
    }, [pages, selectedIndex]);

    // Insert page link
    const insertPageLink = (page: { id: string; title: string; icon?: string | null }) => {
        editor.commands.setPageLink({
            pageId: page.id,
            pageTitle: page.title,
            pageIcon: page.icon || undefined,
        });
        setIsOpen(false);
        editor.commands.focus();
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{ top: position.top, left: position.left }}
        >
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search pages..."
                    className="flex-1 bg-transparent outline-none text-sm"
                />
            </div>

            {/* Results */}
            <div className="max-h-60 overflow-y-auto">
                {pages.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                        {query ? 'No pages found' : 'Type to search pages'}
                    </div>
                ) : (
                    pages.map((page, index) => (
                        <button
                            key={page.id}
                            onClick={() => insertPageLink(page)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${index === selectedIndex
                                    ? 'bg-blue-50 dark:bg-blue-900/30'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <span className="text-base">{page.icon || <FileText className="w-4 h-4 text-gray-400" />}</span>
                            <span className="truncate">{page.title}</span>
                        </button>
                    ))
                )}
            </div>

            {/* Hint */}
            <div className="px-3 py-1.5 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                ↑↓ Navigate • Enter Select • Esc Cancel
            </div>
        </div>
    );
}
