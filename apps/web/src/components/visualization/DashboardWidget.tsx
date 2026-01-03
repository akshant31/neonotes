'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GripVertical, Maximize2, Minimize2, MoreHorizontal, X } from 'lucide-react';

interface DashboardWidgetProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    onRemove?: () => void;
    resizable?: boolean;
}

export function DashboardWidget({
    title,
    children,
    className,
    onRemove,
    resizable = true,
}: DashboardWidgetProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    if (isExpanded) {
        return (
            <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-8">
                <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Minimize2 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-4 h-[calc(100%-60px)]">{children}</div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'relative group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700',
                'shadow-sm hover:shadow-md transition-shadow',
                className
            )}
        >
            {/* Drag handle */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                <GripVertical className="w-4 h-4 text-gray-400" />
            </div>

            {/* Header */}
            {title && (
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            onRemove?.();
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <X className="w-4 h-4" />
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="p-4">{children}</div>
        </div>
    );
}

interface DashboardGridProps {
    children: React.ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
            {children}
        </div>
    );
}
