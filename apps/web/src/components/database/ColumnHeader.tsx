'use client';

import { useState, useRef, useEffect } from 'react';
import type { DatabaseColumn } from '@prisma/client';
import {
    Type, Hash, List, Calendar, CheckSquare,
    MoreVertical, Trash, ArrowUp, ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const COLUMN_ICONS: Record<string, React.ReactNode> = {
    text: <Type className="w-3 h-3" />,
    number: <Hash className="w-3 h-3" />,
    select: <List className="w-3 h-3" />,
    multiSelect: <List className="w-3 h-3" />,
    date: <Calendar className="w-3 h-3" />,
    checkbox: <CheckSquare className="w-3 h-3" />,
};

const COLUMN_TYPES = [
    { value: 'text', label: 'Text', icon: Type },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'select', label: 'Select', icon: List },
    { value: 'multiSelect', label: 'Multi-select', icon: List },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
];

interface ColumnHeaderProps {
    column: DatabaseColumn;
    onUpdate: (updates: Partial<DatabaseColumn>) => void;
    onDelete: () => void;
}

export function ColumnHeader({ column, onUpdate, onDelete }: ColumnHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(column.name);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setName(column.name);
    }, [column.name]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleNameBlur = () => {
        if (name !== column.name) {
            onUpdate({ name });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleNameBlur();
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative flex items-center justify-between w-full group">
            <div
                className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-gray-400">
                    {COLUMN_ICONS[column.type] || <Type className="w-3 h-3" />}
                </span>
                <span className="truncate font-medium text-sm text-gray-700 dark:text-gray-300">
                    {column.name}
                </span>
            </div>

            {/* Hover Menu Trigger */}
            <div
                className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer",
                    isOpen && "opacity-100 bg-gray-100 dark:bg-gray-800"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <MoreVertical className="w-3 h-3 text-gray-400" />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 z-50 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-1 p-2">

                    {/* Rename Input */}
                    <div className="mb-3">
                        <input
                            autoFocus
                            type="text"
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={name}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {/* Column Type Select */}
                    <div className="mb-3">
                        <div className="text-xs font-medium text-gray-500 mb-1 px-1">Type</div>
                        <div className="space-y-0.5">
                            {COLUMN_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors",
                                        column.type === type.value
                                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    )}
                                    onClick={() => {
                                        onUpdate({ type: type.value });
                                        setIsOpen(false);
                                    }}
                                >
                                    <type.icon className="w-4 h-4" />
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 my-1 pt-1">
                        <button
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            onClick={() => {
                                if (confirm('Delete this column?')) {
                                    onDelete();
                                }
                            }}
                        >
                            <Trash className="w-4 h-4" />
                            Delete property
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
