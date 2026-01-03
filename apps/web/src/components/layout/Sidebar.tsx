'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import {
    ChevronRight,
    ChevronDown,
    Plus,
    FileText,
    Home,
    Search,
    Settings,
    Trash2,
    Star,
    BarChart3,
    Network,
    PanelLeftClose,
    PanelLeft,
} from 'lucide-react';
import type { Page } from '@/types';

interface PageItemProps {
    page: Page;
    level?: number;
    onSelect: (page: Page) => void;
    selectedId?: string;
}

function PageItem({ page, level = 0, onSelect, selectedId }: PageItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = page.children && page.children.length > 0;

    return (
        <div>
            <button
                onClick={() => onSelect(page)}
                className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    selectedId === page.id && 'bg-gray-100 dark:bg-gray-800'
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                {hasChildren ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                        ) : (
                            <ChevronRight className="w-3 h-3" />
                        )}
                    </button>
                ) : (
                    <div className="w-4" />
                )}
                <span className="text-lg">{page.icon || '📄'}</span>
                <span className="flex-1 truncate text-left text-gray-700 dark:text-gray-300">
                    {page.title || 'Untitled'}
                </span>
                {page.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
            </button>
            {isExpanded && hasChildren && (
                <div>
                    {page.children?.map((child) => (
                        <PageItem
                            key={child.id}
                            page={child}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function Sidebar() {
    const { pages, currentPage, setCurrentPage, isSidebarOpen, toggleSidebar, setSearchOpen } = useAppStore();

    // Build page tree from flat list
    const rootPages = pages.filter((p) => !p.parentId);

    const handleNewPage = () => {
        // TODO: Implement page creation via API
        console.log('Create new page');
    };

    if (!isSidebarOpen) {
        return (
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 z-50"
            >
                <PanelLeft className="w-5 h-5" />
            </button>
        );
    }

    return (
        <aside className="w-64 h-screen flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">N</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">NeoNotes</span>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                    <PanelLeftClose className="w-4 h-4" />
                </button>
            </div>

            {/* Quick actions */}
            <div className="p-2 space-y-1">
                <button
                    onClick={() => setSearchOpen(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                    <span className="ml-auto text-xs text-gray-400">⌘K</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Network className="w-4 h-4" />
                    <span>Graph View</span>
                </button>
            </div>

            {/* Pages section */}
            <div className="flex-1 overflow-y-auto p-2">
                <div className="flex items-center justify-between px-2 py-1 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Pages
                    </span>
                    <button
                        onClick={handleNewPage}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>

                {rootPages.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No pages yet</p>
                        <button
                            onClick={handleNewPage}
                            className="mt-2 text-blue-500 hover:text-blue-600"
                        >
                            Create your first page
                        </button>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {rootPages.map((page) => (
                            <PageItem
                                key={page.id}
                                page={page}
                                onSelect={setCurrentPage}
                                selectedId={currentPage?.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span>Trash</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}
