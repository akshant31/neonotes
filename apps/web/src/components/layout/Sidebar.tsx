'use client';

import { useState, useEffect, useMemo } from 'react';
import { trpc } from '@/utils/trpc';
import { useAppStore } from '@/stores/app-store';
import { useTheme } from '@/components/ThemeProvider';
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
    Loader2,
    Sun,
    Moon,
    Monitor,
} from 'lucide-react';
import type { Page } from '@/types';

interface PageItemProps {
    page: Page;
    level?: number;
    onSelect: (page: Page) => void;
    selectedId?: string;
}

interface PageItemProps {
    page: Page;
    level?: number;
    onSelect: (page: Page) => void;
    onCreateSubPage?: (parentId: string) => void;
    selectedId?: string;
}

function PageItem({ page, level = 0, onSelect, onCreateSubPage, selectedId }: PageItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const hasChildren = page.children && page.children.length > 0;

    return (
        <div>
            <button
                onClick={() => onSelect(page)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors group',
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
                {/* Add sub-page button on hover */}
                {isHovered && onCreateSubPage && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCreateSubPage(page.id);
                            setIsExpanded(true);
                        }}
                        className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Add sub-page"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                )}
            </button>
            {isExpanded && hasChildren && (
                <div>
                    {page.children?.map((child) => (
                        <PageItem
                            key={child.id}
                            page={child as Page}
                            level={level + 1}
                            onSelect={onSelect}
                            onCreateSubPage={onCreateSubPage}
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function Sidebar() {
    const {
        currentPage,
        setCurrentPage,
        isSidebarOpen,
        toggleSidebar,
        setSearchOpen,
        setCurrentWorkspace,
        setPages,
        pages,
    } = useAppStore();

    // Fetch default workspace
    const workspaceQuery = trpc.workspace.getDefault.useQuery(undefined, {
        staleTime: Infinity,
    });

    // Get workspace ID for dependent queries
    const workspaceId = workspaceQuery.data?.id;

    // Fetch pages for workspace - only when we have a workspace ID
    const pagesQuery = trpc.page.list.useQuery(
        { workspaceId: workspaceId! },
        {
            enabled: !!workspaceId,
            staleTime: 5000,
        }
    );

    // Create page mutation
    const createPageMutation = trpc.page.create.useMutation({
        onSuccess: (newPage) => {
            pagesQuery.refetch();
            setCurrentPage(newPage as Page);
        },
    });

    // Update store when workspace changes
    useEffect(() => {
        if (workspaceQuery.data) {
            setCurrentWorkspace(workspaceQuery.data);
        }
    }, [workspaceQuery.data, setCurrentWorkspace]);

    // Update store when pages change
    useEffect(() => {
        if (pagesQuery.data) {
            setPages(pagesQuery.data as Page[]);
        }
    }, [pagesQuery.data, setPages]);

    // Build page tree from store
    const rootPages = useMemo(() =>
        pages.filter((p) => !p.parentId),
        [pages]
    );

    const handleNewPage = () => {
        if (workspaceId) {
            createPageMutation.mutate({
                workspaceId,
                title: 'Untitled',
                icon: '📄',
            });
        }
    };

    const handleCreateSubPage = (parentId: string) => {
        if (workspaceId) {
            createPageMutation.mutate({
                workspaceId,
                title: 'Untitled',
                icon: '📄',
                parentId,
            });
        }
    };

    // Determine loading state
    const isLoading = workspaceQuery.isLoading || (!!workspaceId && pagesQuery.isLoading);

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
                <button
                    onClick={() => setCurrentPage(null)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">N</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">NeoNotes</span>
                </button>
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
                <button
                    onClick={() => setCurrentPage(null)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
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
                        disabled={createPageMutation.isLoading || !workspaceId}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        {createPageMutation.isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Plus className="w-3 h-3" />
                        )}
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : rootPages.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No pages yet</p>
                        <button
                            onClick={handleNewPage}
                            disabled={createPageMutation.isLoading || !workspaceId}
                            className="mt-2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
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
                                onCreateSubPage={handleCreateSubPage}
                                selectedId={currentPage?.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Density Toggle */}
                <DensityToggle />

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

function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
            <button
                onClick={() => setTheme('light')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors",
                    theme === 'light'
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
            >
                <Sun className="w-3.5 h-3.5" />
                Light
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors",
                    theme === 'dark'
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
            >
                <Moon className="w-3.5 h-3.5" />
                Dark
            </button>
            <button
                onClick={() => setTheme('system')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors",
                    theme === 'system'
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
            >
                <Monitor className="w-3.5 h-3.5" />
                Auto
            </button>
        </div>
    );
}

function DensityToggle() {
    const { displayDensity, setDisplayDensity } = useAppStore();

    return (
        <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
            <button
                onClick={() => setDisplayDensity('compact')}
                className={cn(
                    "flex-1 flex items-center justify-center px-2 py-1.5 rounded text-xs transition-colors",
                    displayDensity === 'compact'
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
                title="Smaller fonts, more content visible"
            >
                Compact
            </button>
            <button
                onClick={() => setDisplayDensity('default')}
                className={cn(
                    "flex-1 flex items-center justify-center px-2 py-1.5 rounded text-xs transition-colors",
                    displayDensity === 'default'
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
                title="Balanced sizing"
            >
                Default
            </button>
            <button
                onClick={() => setDisplayDensity('comfortable')}
                className={cn(
                    "flex-1 flex items-center justify-center px-2 py-1.5 rounded text-xs transition-colors",
                    displayDensity === 'comfortable'
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
                title="Larger fonts, easier reading"
            >
                Cozy
            </button>
        </div>
    );
}

