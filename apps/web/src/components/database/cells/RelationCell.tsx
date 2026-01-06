'use client';

import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { Link2, X, Search, Loader2 } from 'lucide-react';

interface RelationCellProps {
    value: string[] | null; // Array of related row IDs
    relatedDatabaseId: string;
    onUpdate: (value: string[]) => void;
}

export function RelationCell({ value, relatedDatabaseId, onUpdate }: RelationCellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedIds = value || [];

    // Fetch rows from related database
    const { data: availableRows = [], isLoading } = trpc.database.getRowsForRelation.useQuery(
        { databaseId: relatedDatabaseId, searchQuery: searchQuery || undefined },
        { enabled: isOpen && !!relatedDatabaseId }
    );

    // Fetch display values for selected rows
    const { data: selectedRowsData = [] } = trpc.database.getRowsForRelation.useQuery(
        { databaseId: relatedDatabaseId },
        { enabled: selectedIds.length > 0 && !!relatedDatabaseId }
    );

    const selectedRows = selectedRowsData.filter(r => selectedIds.includes(r.id));

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const toggleRow = (rowId: string) => {
        if (selectedIds.includes(rowId)) {
            onUpdate(selectedIds.filter(id => id !== rowId));
        } else {
            onUpdate([...selectedIds, rowId]);
        }
    };

    const removeRow = (rowId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdate(selectedIds.filter(id => id !== rowId));
    };

    return (
        <div ref={containerRef} className="relative h-full">
            {/* Display selected rows */}
            <div
                onClick={() => setIsOpen(true)}
                className="flex flex-wrap gap-1 px-2 py-1 h-full items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 min-h-[36px]"
            >
                {selectedRows.length === 0 ? (
                    <span className="text-gray-400 text-sm">
                        <Link2 className="w-3.5 h-3.5 inline-block mr-1" />
                        Link...
                    </span>
                ) : (
                    selectedRows.map(row => (
                        <span
                            key={row.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-xs"
                        >
                            {row.displayValue}
                            <button
                                onClick={(e) => removeRow(row.id, e)}
                                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))
                )}
            </div>

            {/* Dropdown picker */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    {/* Search */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search rows..."
                            className="flex-1 bg-transparent outline-none text-sm"
                        />
                    </div>

                    {/* Rows list */}
                    <div className="max-h-48 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            </div>
                        ) : availableRows.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                {searchQuery ? 'No matching rows' : 'No rows in database'}
                            </div>
                        ) : (
                            availableRows.map(row => (
                                <button
                                    key={row.id}
                                    onClick={() => toggleRow(row.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedIds.includes(row.id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(row.id)}
                                        onChange={() => { }}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="truncate">{row.displayValue}</span>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="px-3 py-1.5 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        Click to select • Click outside to close
                    </div>
                </div>
            )}
        </div>
    );
}
