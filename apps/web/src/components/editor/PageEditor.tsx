'use client';

import { useEffect, useCallback, useState } from 'react';
import { trpc } from '@/utils/trpc';
import { BlockEditor } from '@/components/editor';
import { CategorySelector } from '@/components/editor/CategorySelector';
import { useAppStore } from '@/stores/app-store';
import { debounce } from '@/lib/utils';
import {
    Loader2,
    Star,
    MoreHorizontal,
    Trash2,
    Copy,
    ExternalLink,
    Image as ImageIcon,
    Smile,
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
        onSettled: () => setIsSaving(false),
    });

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

    // Update title when page changes
    useEffect(() => {
        setTitle(currentPage?.title || '');
    }, [currentPage?.id, currentPage?.title]);

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
            }
        }, 2000),
        [currentPage?.id]
    );

    // Handle content change
    const handleContentChange = (newContent: Record<string, unknown>) => {
        setContent(newContent);
        debouncedContentSave(newContent);
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

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Page header */}
            <div className="px-16 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    {/* Icon picker */}
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

                    <button className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <ImageIcon className="w-4 h-4" />
                        Add cover
                    </button>

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

                    {/* Category selector */}
                    {pageData && (
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

                {/* Title input */}
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Untitled"
                    className="w-full text-4xl font-bold bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />

                {/* Saving indicator */}
                {isSaving && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Saving...
                    </div>
                )}
            </div>

            {/* Editor */}
            <div className="px-12">
                <BlockEditor
                    content={content}
                    onChange={handleContentChange}
                    placeholder="Type '/' for commands, or just start writing..."
                    pageId={currentPage.id}
                />
            </div>
        </div>
    );
}
