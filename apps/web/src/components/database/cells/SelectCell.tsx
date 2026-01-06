'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Plus, X, Tag } from 'lucide-react';

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
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => opt.id === value || opt.label === value);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

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
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearch('');
        }
    };

    return (
        <>
            <div
                className="w-full h-full px-2 py-1 flex items-center cursor-pointer group min-h-[32px]"
                onClick={() => setIsOpen(true)}
            >
                {selectedOption ? (
                    <span className={cn("px-2 py-0.5 rounded text-xs truncate", selectedOption.color)}>
                        {selectedOption.label}
                    </span>
                ) : (
                    <span className="text-gray-400 text-sm">Select option</span>
                )}
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center"
                    onClick={() => { setIsOpen(false); setSearch(''); }}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[400px] max-h-[80vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <Tag className="w-5 h-5 text-gray-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Select Option</h3>
                            </div>
                            <button
                                onClick={() => { setIsOpen(false); setSearch(''); }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none focus:border-blue-500"
                                placeholder="Search or type to create..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        {/* Options List */}
                        <div className="p-3 max-h-[50vh] overflow-y-auto">
                            {/* Current Selection */}
                            {selectedOption && (
                                <div className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <div className="text-xs font-medium text-gray-500 mb-2 px-1">Current</div>
                                    <div className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                        <span className={cn("px-2 py-0.5 rounded text-xs", selectedOption.color)}>
                                            {selectedOption.label}
                                        </span>
                                        <button
                                            onClick={() => handleSelect('')}
                                            className="text-xs text-gray-500 hover:text-red-500"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Options */}
                            {filteredOptions.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            className={cn(
                                                "w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors",
                                                option.id === value
                                                    ? "bg-blue-50 dark:bg-blue-900/20"
                                                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                            )}
                                            onClick={() => handleSelect(option.id)}
                                        >
                                            <span className={cn("px-3 py-1 rounded text-sm", option.color)}>
                                                {option.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : search ? (
                                <button
                                    className="w-full flex items-center justify-center gap-2 px-3 py-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                    onClick={handleCreate}
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Create "{search}"</span>
                                </button>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Tag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No options yet</p>
                                    <p className="text-xs mt-1">Type to create a new option</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

