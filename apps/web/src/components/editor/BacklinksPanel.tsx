'use client';

import React, { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { ChevronRight, Link2, FileText } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';

interface BacklinksPanelProps {
    pageId: string;
}

export function BacklinksPanel({ pageId }: BacklinksPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { setCurrentPage } = useAppStore();

    // Fetch backlinks
    const { data: backlinks = [], isLoading } = trpc.pageLink.getBacklinks.useQuery(
        { pageId },
        { enabled: !!pageId }
    );

    // Handle navigation to a linked page
    const handleNavigate = (page: { id: string; title: string; icon: string | null }) => {
        setCurrentPage({
            id: page.id,
            title: page.title,
            icon: page.icon,
            workspaceId: '', // Will be fetched when page loads
            isFavorite: false,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    };

    if (isLoading) {
        return (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="animate-pulse">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
            </div>
        );
    }

    if (backlinks.length === 0) {
        return null; // Don't show panel if no backlinks
    }

    return (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
                <ChevronRight
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
                <Link2 className="w-4 h-4" />
                <span>{backlinks.length} Backlink{backlinks.length !== 1 ? 's' : ''}</span>
            </button>

            {/* Backlinks list */}
            {isExpanded && (
                <div className="mt-3 space-y-1 pl-6">
                    {backlinks.map((page: { id: string; title: string; icon: string | null }) => (
                        <button
                            key={page.id}
                            onClick={() => handleNavigate(page)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="text-base">
                                {page.icon || <FileText className="w-4 h-4 text-gray-400" />}
                            </span>
                            <span className="truncate text-gray-700 dark:text-gray-300">
                                {page.title}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
