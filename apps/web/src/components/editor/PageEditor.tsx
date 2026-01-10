'use client';

import { useEffect, useCallback, useState } from 'react';
import { trpc } from '@/utils/trpc';
import { BlockEditor } from '@/components/editor';
import { CategorySelector } from '@/components/editor/CategorySelector';
import { BacklinksPanel } from '@/components/editor/BacklinksPanel';
import { PageBackgroundPicker } from '@/components/editor/PageBackgroundPicker';
import { CoverPicker } from '@/components/editor/CoverPicker';
import { extractPageLinkIds } from '@/components/editor/extensions/PageLinkNode';
import { useAppStore } from '@/stores/app-store';
import { debounce, cn } from '@/lib/utils';
import {
    Loader2,
    Star,
    MoreHorizontal,
    Trash2,
    Copy,
    ExternalLink,
    Image as ImageIcon,
    Smile,
    Pencil,
    Check,
    Save,
    Palette,
    X,
} from 'lucide-react';

// Emoji picker simple implementation
const EMOJIS = ['📄', '📝', '📋', '📌', '📎', '🔖', '📚', '💡', '🎯', '🚀', '⭐', '💻', '🔬', '🎨', '📊', '📈', '🗺️', '🏠', '💼', '🎓'];

export function PageEditor() {
    const { currentPage, updatePage, setCurrentPage } = useAppStore();
    const [title, setTitle] = useState(currentPage?.title || '');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [content, setContent] = useState<Record<string, unknown> | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
    const [showCoverPicker, setShowCoverPicker] = useState(false);
    const [pageBackground, setPageBackground] = useState<string>((currentPage as any)?.background || '');
    const [backgroundOpacity, setBackgroundOpacity] = useState<number>(100);
    const [pageCover, setPageCover] = useState<string | null>((currentPage as any)?.coverImage || null);
    const [coverOpacity, setCoverOpacity] = useState<number>(100);

    // Fetch full page data with blocks
    const { data: pageData, isLoading, refetch } = trpc.page.getById.useQuery(
        { id: currentPage?.id ?? '' },
        { enabled: !!currentPage?.id }
    );

    // TRPC utils for cache invalidation
    const utils = trpc.useUtils();

    // Update page mutation
    const updatePageMutation = trpc.page.update.useMutation({
        onSuccess: (updatedPage) => {
            updatePage(updatedPage.id, updatedPage);
            // Invalidate page list so sidebar updates
            utils.page.list.invalidate();
        },
    });

    // Save blocks mutation
    const saveBlocksMutation = trpc.block.savePageBlocks.useMutation({
        onMutate: () => setIsSaving(true),
        onSuccess: () => {
            setLastSaved(new Date());
        },
        onSettled: () => setIsSaving(false),
    });

    // Sync page links mutation
    const syncLinksMutation = trpc.pageLink.syncLinks.useMutation();

    // Delete page mutation
    const deletePageMutation = trpc.page.delete.useMutation({
        onSuccess: () => {
            setCurrentPage(null);
            utils.page.list.invalidate();
        },
    });

    // Toggle favorite mutation
    const toggleFavorite = () => {
        if (currentPage) {
            updatePageMutation.mutate({
                id: currentPage.id,
                isFavorite: !currentPage.isFavorite,
            });
        }
    };

    // Update title, background, cover and opacity when page changes
    useEffect(() => {
        setTitle(currentPage?.title || '');
        setPageBackground((pageData as any)?.background || '');
        setBackgroundOpacity((pageData as any)?.backgroundOpacity ?? 100);
        setPageCover((pageData as any)?.coverImage || null);
        setCoverOpacity((pageData as any)?.coverOpacity ?? 100);
        setIsEditMode(false); // Reset to read mode when page changes
    }, [currentPage?.id, currentPage?.title, pageData]);

    // Listen for page link navigation events
    useEffect(() => {
        const handleNavigateToPage = async (event: Event) => {
            const customEvent = event as CustomEvent<{ pageId: string }>;
            const { pageId } = customEvent.detail;
            // Fetch the page details and navigate
            try {
                const page = await utils.page.getById.fetch({ id: pageId });
                if (page) {
                    setCurrentPage({
                        id: page.id,
                        title: page.title,
                        icon: page.icon,
                        workspaceId: currentPage?.workspaceId || '',
                        isFavorite: page.isFavorite,
                        isArchived: page.isArchived,
                        createdAt: page.createdAt,
                        updatedAt: page.updatedAt,
                    });
                }
            } catch (error) {
                console.error('Failed to navigate to page:', error);
            }
        };

        window.addEventListener('navigate-to-page', handleNavigateToPage);
        return () => {
            window.removeEventListener('navigate-to-page', handleNavigateToPage);
        };
    }, [currentPage?.workspaceId, setCurrentPage, utils]);

    // Load content from page data
    useEffect(() => {
        if (pageData?.blocks && pageData.blocks.length > 0) {
            // Convert blocks to TipTap content
            const tipTapContent = {
                type: 'doc',
                content: pageData.blocks.map((block) => block.content),
            };
            setContent(tipTapContent as Record<string, unknown>);
        } else {
            setContent(undefined);
        }
    }, [pageData]);

    // Debounced title save
    const debouncedTitleSave = useCallback(
        debounce((newTitle: string) => {
            if (currentPage) {
                updatePageMutation.mutate({ id: currentPage.id, title: newTitle });
            }
        }, 1000),
        [currentPage?.id]
    );

    // Handle title change
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        debouncedTitleSave(newTitle);
    };

    // Handle icon change
    const handleIconChange = (emoji: string) => {
        if (currentPage) {
            updatePageMutation.mutate({ id: currentPage.id, icon: emoji });
            setShowEmojiPicker(false);
        }
    };

    // Debounced content save
    const debouncedContentSave = useCallback(
        debounce((newContent: Record<string, unknown>) => {
            if (currentPage && newContent.content) {
                const blocks = (newContent.content as unknown[]).map((block, index) => ({
                    type: 'paragraph',
                    content: block as Record<string, unknown>,
                    order: index,
                }));
                saveBlocksMutation.mutate({ pageId: currentPage.id, blocks });

                // Extract and sync page links for backlinks
                const linkedPageIds = extractPageLinkIds(newContent);
                syncLinksMutation.mutate({
                    sourcePageId: currentPage.id,
                    targetPageIds: linkedPageIds,
                });
            }
        }, 2000),
        [currentPage?.id]
    );

    // Handle content change
    const handleContentChange = (newContent: Record<string, unknown>) => {
        setContent(newContent);
        debouncedContentSave(newContent);
    };

    // Manual save function
    const handleManualSave = () => {
        if (currentPage && content?.content) {
            const blocks = (content.content as unknown[]).map((block, index) => ({
                type: 'paragraph',
                content: block as Record<string, unknown>,
                order: index,
            }));
            saveBlocksMutation.mutate({ pageId: currentPage.id, blocks });
        }
    };

    // Format last saved time
    const formatLastSaved = () => {
        if (!lastSaved) return null;
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
        if (diff < 60) return 'Saved just now';
        if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
        return `Saved at ${lastSaved.toLocaleTimeString()}`;
    };

    if (!currentPage) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Check if background is a URL (uploaded image) or a CSS class
    const isImageBackground = pageBackground?.startsWith('url(');

    return (
        <div className="min-h-full relative">
            {/* Background layer - only this gets opacity */}
            {isImageBackground ? (
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: pageBackground,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: backgroundOpacity / 100
                    }}
                />
            ) : null}

            {/* Content wrapper */}
            <div className={cn("min-h-full relative z-10", isImageBackground ? '' : (pageBackground || 'bg-white dark:bg-gray-900'))}>
                {/* Cover Image */}
                {pageCover && (
                    <div className="page-cover group relative">
                        <div
                            className="page-cover-inner"
                            style={{
                                background: pageCover.startsWith('data:') || pageCover.startsWith('http')
                                    ? `url(${pageCover}) center/cover no-repeat`
                                    : pageCover,
                                opacity: coverOpacity / 100
                            }}
                        />
                        {isEditMode && (
                            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <button
                                    onClick={() => setShowCoverPicker(true)}
                                    className="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                >
                                    Change cover
                                </button>
                                <button
                                    onClick={() => {
                                        setPageCover(null);
                                        if (currentPage) {
                                            updatePageMutation.mutate({ id: currentPage.id, coverImage: undefined });
                                        }
                                    }}
                                    className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="max-w-4xl mx-auto py-8">
                    {/* Page header */}
                    <div className="px-16 mb-8">
                        {/* Edit mode bar - only shown when editing */}
                        {isEditMode && (
                            <div className="flex items-center justify-between mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2">
                                    <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Editing mode</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Save status */}
                                    <div className="text-sm text-gray-500">
                                        {isSaving ? (
                                            <span className="flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Saving...
                                            </span>
                                        ) : (
                                            formatLastSaved()
                                        )}
                                    </div>
                                    {/* Manual save button */}
                                    <button
                                        onClick={handleManualSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save
                                    </button>
                                    {/* Done button */}
                                    <button
                                        onClick={() => setIsEditMode(false)}
                                        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                                    >
                                        <Check className="w-4 h-4" />
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                            {/* Icon picker - only in edit mode */}
                            {isEditMode && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="p-2 text-2xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        {currentPage.icon || '📄'}
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 grid grid-cols-5 gap-1">
                                            {EMOJIS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleIconChange(emoji)}
                                                    className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Read-only icon display */}
                            {!isEditMode && (
                                <span className="p-2 text-2xl">{currentPage.icon || '📄'}</span>
                            )}

                            {/* Cover button - only in edit mode and when no cover */}
                            {isEditMode && !pageCover && (
                                <button
                                    onClick={() => setShowCoverPicker(true)}
                                    className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    Add cover
                                </button>
                            )}

                            {/* Background button - only in edit mode */}
                            {isEditMode && (
                                <button
                                    onClick={() => setShowBackgroundPicker(true)}
                                    className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    <Palette className="w-4 h-4" />
                                    Background
                                </button>
                            )}

                            {/* Favorite button */}
                            <button
                                onClick={toggleFavorite}
                                className={`flex items-center gap-1 px-2 py-1 text-sm rounded-lg transition-colors ${currentPage.isFavorite
                                    ? 'text-yellow-500'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Star className={`w-4 h-4 ${currentPage.isFavorite ? 'fill-yellow-500' : ''}`} />
                            </button>

                            {/* Category selector - only in edit mode */}
                            {isEditMode && pageData && (
                                <CategorySelector
                                    pageId={currentPage.id}
                                    currentCategoryId={(pageData as any).categoryId ?? null}
                                    workspaceId={currentPage.workspaceId}
                                />
                            )}

                            {/* More menu */}
                            <div className="relative ml-auto">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20">
                                        {/* Edit option - only when not in edit mode */}
                                        {!isEditMode && (
                                            <button
                                                onClick={() => {
                                                    setIsEditMode(true);
                                                    setShowMenu(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Pencil className="w-4 h-4" />
                                                Edit page
                                            </button>
                                        )}
                                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <Copy className="w-4 h-4" />
                                            Duplicate
                                        </button>
                                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <ExternalLink className="w-4 h-4" />
                                            Open in new tab
                                        </button>
                                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                        <button
                                            onClick={() => {
                                                deletePageMutation.mutate({ id: currentPage.id });
                                                setShowMenu(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title - editable only in edit mode */}
                        {isEditMode ? (
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="Untitled"
                                className="w-full text-4xl font-bold bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                            />
                        ) : (
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                                {title || 'Untitled'}
                            </h1>
                        )}
                    </div>

                    {/* Editor */}
                    <div className="px-12">
                        <BlockEditor
                            content={content}
                            onChange={handleContentChange}
                            placeholder="Type '/' for commands, or just start writing..."
                            pageId={currentPage.id}
                            workspaceId={currentPage.workspaceId}
                            editable={isEditMode}
                        />

                        {/* Backlinks panel */}
                        <BacklinksPanel pageId={currentPage.id} />
                    </div>
                </div>

                {/* Background Picker Modal */}
                <PageBackgroundPicker
                    isOpen={showBackgroundPicker}
                    onClose={() => setShowBackgroundPicker(false)}
                    currentBackground={pageBackground}
                    currentOpacity={backgroundOpacity}
                    onSelect={(bg, opacity) => {
                        setPageBackground(bg);
                        const newOpacity = opacity ?? 100;
                        setBackgroundOpacity(newOpacity);
                        // Save to database
                        if (currentPage) {
                            updatePageMutation.mutate({
                                id: currentPage.id,
                                background: bg || null,
                                backgroundOpacity: newOpacity
                            });
                        }
                    }}
                />

                {/* Cover Picker Modal */}
                <CoverPicker
                    isOpen={showCoverPicker}
                    onClose={() => setShowCoverPicker(false)}
                    currentCover={pageCover}
                    currentOpacity={coverOpacity}
                    onSelect={(cover, opacity) => {
                        setPageCover(cover);
                        const newOpacity = opacity ?? 100;
                        setCoverOpacity(newOpacity);
                        // Save to database
                        if (currentPage) {
                            updatePageMutation.mutate({
                                id: currentPage.id,
                                coverImage: cover ?? undefined,
                                coverOpacity: newOpacity
                            });
                        }
                    }}
                />
            </div>
        </div>
    );
}

