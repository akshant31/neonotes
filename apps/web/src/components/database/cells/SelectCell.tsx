'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Plus } from 'lucide-react';

export interface SelectOption {
    id: string;
    label: string;
    color: string;
}

interface SelectCellProps {
    value: string | null;
    options: SelectOption[];
    onUpdate: (value: string | null) => void;
    onCreateOption?: (option: string) => void;
}

const COLORS = [
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
];

export function SelectCell({ value, options = [], onUpdate, onCreateOption }: SelectCellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.id === value || opt.label === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (optionValue: string) => {
        onUpdate(optionValue);
        setIsOpen(false);
        setSearch('');
    };

    const handleCreate = () => {
        if (onCreateOption && search) {
            onCreateOption(search);
            setSearch('');
            // The parent should handle selecting the new option after creation if desired
            // For now we just close or keep open? Let's keep open to see the new option.
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[0].id);
            } else if (search && onCreateOption) {
                handleCreate();
            }
        }
    };

    return (
        <div ref={containerRef} className="relative w-full h-full">
            <div
                className="w-full h-full px-2 py-1 flex items-center cursor-pointer group"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOption ? (
                    <span className={cn("px-2 py-0.5 rounded text-xs truncate", selectedOption.color)}>
                        {selectedOption.label}
                    </span>
                ) : (
                    <span className="text-gray-400 italic text-sm opacity-0 group-hover:opacity-50">Empty</span>
                )}
                {/* <ChevronDown className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50" /> */}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 z-50 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-1 overflow-hidden">
                    <input
                        autoFocus
                        type="text"
                        className="w-full px-3 py-2 text-sm border-b border-gray-100 dark:border-gray-700 bg-transparent outline-none"
                        placeholder="Search or create..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="max-h-48 overflow-y-auto p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm cursor-pointer flex items-center"
                                    onClick={() => handleSelect(option.id)}
                                >
                                    <span className={cn("px-2 py-0.5 rounded text-xs", option.color)}>
                                        {option.label}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="px-2 py-3 text-xs text-center text-gray-500">
                                {search ? (
                                    <button
                                        className="flex items-center justify-center gap-1 w-full hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded text-blue-500"
                                        onClick={handleCreate}
                                    >
                                        <Plus className="w-3 h-3" />
                                        Create &quot;{search}&quot;
                                    </button>
                                ) : (
                                    "No options found"
                                )}
                            </div>
                        )}
                        {/* Allow clearing selection */}
                        {value && (
                            <div
                                className="mt-1 border-t border-gray-100 dark:border-gray-700 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs cursor-pointer text-gray-500"
                                onClick={() => handleSelect('')} // Empty string or null to clear
                            >
                                Clear selection
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}

export function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}
