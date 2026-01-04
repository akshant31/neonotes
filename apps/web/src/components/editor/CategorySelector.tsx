'use client';

import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';
import { Tag, Plus, Check, ChevronDown } from 'lucide-react';

interface CategorySelectorProps {
    pageId: string;
    currentCategoryId: string | null;
    workspaceId: string;
    onCategoryChange?: (categoryId: string | null) => void;
}

export function CategorySelector({
    pageId,
    currentCategoryId,
    workspaceId,
    onCategoryChange,
}: CategorySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const utils = trpc.useUtils();

    // Fetch categories
    const { data: categories, isLoading } = trpc.category.list.useQuery(
        { workspaceId },
        { enabled: !!workspaceId }
    );

    // Update page mutation
    const updatePageMutation = trpc.page.update.useMutation({
        onSuccess: () => {
            utils.page.getById.invalidate({ id: pageId });
            utils.page.stats.invalidate({ workspaceId });
        },
    });

    // Create category mutation
    const createCategoryMutation = trpc.category.create.useMutation({
        onSuccess: (newCategory) => {
            utils.category.list.invalidate({ workspaceId });
            // Assign to current page
            handleSelectCategory(newCategory.id);
            setNewCategoryName('');
            setIsCreating(false);
        },
    });

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsCreating(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when creating
    useEffect(() => {
        if (isCreating && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isCreating]);

    const handleSelectCategory = (categoryId: string | null) => {
        updatePageMutation.mutate({
            id: pageId,
            categoryId,
        });
        onCategoryChange?.(categoryId);
        setIsOpen(false);
    };

    const handleCreateCategory = () => {
        if (newCategoryName.trim()) {
            createCategoryMutation.mutate({
                workspaceId,
                name: newCategoryName.trim(),
            });
        }
    };

    const currentCategory = categories?.find(c => c.id === currentCategoryId);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    currentCategory
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-400 dark:text-gray-500'
                )}
            >
                {currentCategory ? (
                    <>
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: currentCategory.color }}
                        />
                        <span>{currentCategory.name}</span>
                    </>
                ) : (
                    <>
                        <Tag className="w-4 h-4" />
                        <span>Add category</span>
                    </>
                )}
                <ChevronDown className="w-3 h-3" />
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-1 max-h-64 overflow-y-auto">
                        {/* None option */}
                        <button
                            onClick={() => handleSelectCategory(null)}
                            className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-left',
                                'hover:bg-gray-100 dark:hover:bg-gray-800',
                                !currentCategoryId && 'bg-gray-100 dark:bg-gray-800'
                            )}
                        >
                            <span className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600" />
                            <span className="text-gray-500">No category</span>
                            {!currentCategoryId && <Check className="w-4 h-4 ml-auto text-indigo-500" />}
                        </button>

                        {/* Category list */}
                        {isLoading ? (
                            <div className="px-3 py-2 text-sm text-gray-400">Loading...</div>
                        ) : (
                            categories?.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => handleSelectCategory(category.id)}
                                    className={cn(
                                        'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-left',
                                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                                        currentCategoryId === category.id && 'bg-gray-100 dark:bg-gray-800'
                                    )}
                                >
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <span>{category.name}</span>
                                    <span className="ml-auto text-xs text-gray-400">
                                        {category._count?.pages ?? 0}
                                    </span>
                                    {currentCategoryId === category.id && (
                                        <Check className="w-4 h-4 text-indigo-500" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Create new category */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-1">
                        {isCreating ? (
                            <div className="flex items-center gap-2 px-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateCategory();
                                        if (e.key === 'Escape') setIsCreating(false);
                                    }}
                                    placeholder="Category name..."
                                    className="flex-1 px-2 py-1.5 text-sm bg-transparent border-none outline-none"
                                />
                                <button
                                    onClick={handleCreateCategory}
                                    disabled={!newCategoryName.trim() || createCategoryMutation.isLoading}
                                    className="p-1 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                            >
                                <Plus className="w-4 h-4" />
                                Create category
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
