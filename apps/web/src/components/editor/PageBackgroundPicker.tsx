'use client';

import { useState } from 'react';
import { X, Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageBackgroundPickerProps {
    isOpen: boolean;
    onClose: () => void;
    currentBackground?: string;
    onSelect: (background: string) => void;
}

// Background presets - solid colors
const SOLID_COLORS = [
    { value: '', label: 'Default', preview: 'bg-white dark:bg-gray-900' },
    { value: 'bg-gray-50', label: 'Gray', preview: 'bg-gray-100' },
    { value: 'bg-red-50', label: 'Red', preview: 'bg-red-100' },
    { value: 'bg-orange-50', label: 'Orange', preview: 'bg-orange-100' },
    { value: 'bg-amber-50', label: 'Amber', preview: 'bg-amber-100' },
    { value: 'bg-yellow-50', label: 'Yellow', preview: 'bg-yellow-100' },
    { value: 'bg-lime-50', label: 'Lime', preview: 'bg-lime-100' },
    { value: 'bg-green-50', label: 'Green', preview: 'bg-green-100' },
    { value: 'bg-emerald-50', label: 'Emerald', preview: 'bg-emerald-100' },
    { value: 'bg-teal-50', label: 'Teal', preview: 'bg-teal-100' },
    { value: 'bg-cyan-50', label: 'Cyan', preview: 'bg-cyan-100' },
    { value: 'bg-sky-50', label: 'Sky', preview: 'bg-sky-100' },
    { value: 'bg-blue-50', label: 'Blue', preview: 'bg-blue-100' },
    { value: 'bg-indigo-50', label: 'Indigo', preview: 'bg-indigo-100' },
    { value: 'bg-violet-50', label: 'Violet', preview: 'bg-violet-100' },
    { value: 'bg-purple-50', label: 'Purple', preview: 'bg-purple-100' },
    { value: 'bg-fuchsia-50', label: 'Fuchsia', preview: 'bg-fuchsia-100' },
    { value: 'bg-pink-50', label: 'Pink', preview: 'bg-pink-100' },
    { value: 'bg-rose-50', label: 'Rose', preview: 'bg-rose-100' },
];

// Gradient presets
const GRADIENTS = [
    { value: 'bg-gradient-to-br from-blue-50 to-indigo-100', label: 'Ocean', preview: 'bg-gradient-to-br from-blue-200 to-indigo-300' },
    { value: 'bg-gradient-to-br from-purple-50 to-pink-100', label: 'Sunset', preview: 'bg-gradient-to-br from-purple-200 to-pink-300' },
    { value: 'bg-gradient-to-br from-green-50 to-emerald-100', label: 'Forest', preview: 'bg-gradient-to-br from-green-200 to-emerald-300' },
    { value: 'bg-gradient-to-br from-amber-50 to-orange-100', label: 'Warmth', preview: 'bg-gradient-to-br from-amber-200 to-orange-300' },
    { value: 'bg-gradient-to-br from-rose-50 to-red-100', label: 'Blush', preview: 'bg-gradient-to-br from-rose-200 to-red-300' },
    { value: 'bg-gradient-to-br from-cyan-50 to-teal-100', label: 'Aqua', preview: 'bg-gradient-to-br from-cyan-200 to-teal-300' },
    { value: 'bg-gradient-to-br from-gray-50 to-slate-100', label: 'Slate', preview: 'bg-gradient-to-br from-gray-200 to-slate-300' },
    { value: 'bg-gradient-to-br from-yellow-50 to-lime-100', label: 'Sunshine', preview: 'bg-gradient-to-br from-yellow-200 to-lime-300' },
];

export function PageBackgroundPicker({ isOpen, onClose, currentBackground, onSelect }: PageBackgroundPickerProps) {
    const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>('solid');

    if (!isOpen) return null;

    const handleSelect = (value: string) => {
        onSelect(value);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[400px] max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Page Background</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('solid')}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium transition-colors",
                            activeTab === 'solid'
                                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        Solid Colors
                    </button>
                    <button
                        onClick={() => setActiveTab('gradient')}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium transition-colors",
                            activeTab === 'gradient'
                                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        Gradients
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[50vh] overflow-y-auto">
                    {activeTab === 'solid' && (
                        <div className="grid grid-cols-5 gap-2">
                            {SOLID_COLORS.map((color) => (
                                <button
                                    key={color.value || 'default'}
                                    onClick={() => handleSelect(color.value)}
                                    className={cn(
                                        "aspect-square rounded-lg border-2 transition-all relative",
                                        color.preview,
                                        currentBackground === color.value
                                            ? "border-blue-500 ring-2 ring-blue-200"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                                    )}
                                    title={color.label}
                                >
                                    {currentBackground === color.value && (
                                        <Check className="w-4 h-4 text-blue-600 absolute inset-0 m-auto" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'gradient' && (
                        <div className="grid grid-cols-4 gap-3">
                            {GRADIENTS.map((gradient) => (
                                <button
                                    key={gradient.value}
                                    onClick={() => handleSelect(gradient.value)}
                                    className={cn(
                                        "aspect-video rounded-lg border-2 transition-all relative",
                                        gradient.preview,
                                        currentBackground === gradient.value
                                            ? "border-blue-500 ring-2 ring-blue-200"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                                    )}
                                    title={gradient.label}
                                >
                                    {currentBackground === gradient.value && (
                                        <Check className="w-4 h-4 text-blue-600 absolute inset-0 m-auto" />
                                    )}
                                    <span className="absolute bottom-0.5 left-0 right-0 text-[9px] text-center text-gray-600 font-medium">
                                        {gradient.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
