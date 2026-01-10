'use client';

import { useState, useRef } from 'react';
import { X, Palette, Check, Upload, SlidersHorizontal, Sparkles, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageBackgroundPickerProps {
    isOpen: boolean;
    onClose: () => void;
    currentBackground?: string;
    currentOpacity?: number;
    onSelect: (background: string, opacity?: number) => void;
}

// Background presets - solid colors
const SOLID_COLORS = [
    { value: '', label: 'Default', preview: 'bg-white dark:bg-gray-900' },
    { value: 'bg-gray-50 dark:bg-gray-800', label: 'Gray', preview: 'bg-gray-200' },
    { value: 'bg-red-50 dark:bg-red-950', label: 'Red', preview: 'bg-red-200' },
    { value: 'bg-orange-50 dark:bg-orange-950', label: 'Orange', preview: 'bg-orange-200' },
    { value: 'bg-amber-50 dark:bg-amber-950', label: 'Amber', preview: 'bg-amber-200' },
    { value: 'bg-yellow-50 dark:bg-yellow-950', label: 'Yellow', preview: 'bg-yellow-200' },
    { value: 'bg-lime-50 dark:bg-lime-950', label: 'Lime', preview: 'bg-lime-200' },
    { value: 'bg-green-50 dark:bg-green-950', label: 'Green', preview: 'bg-green-200' },
    { value: 'bg-emerald-50 dark:bg-emerald-950', label: 'Emerald', preview: 'bg-emerald-200' },
    { value: 'bg-teal-50 dark:bg-teal-950', label: 'Teal', preview: 'bg-teal-200' },
    { value: 'bg-cyan-50 dark:bg-cyan-950', label: 'Cyan', preview: 'bg-cyan-200' },
    { value: 'bg-sky-50 dark:bg-sky-950', label: 'Sky', preview: 'bg-sky-200' },
    { value: 'bg-blue-50 dark:bg-blue-950', label: 'Blue', preview: 'bg-blue-200' },
    { value: 'bg-indigo-50 dark:bg-indigo-950', label: 'Indigo', preview: 'bg-indigo-200' },
    { value: 'bg-violet-50 dark:bg-violet-950', label: 'Violet', preview: 'bg-violet-200' },
    { value: 'bg-purple-50 dark:bg-purple-950', label: 'Purple', preview: 'bg-purple-200' },
    { value: 'bg-fuchsia-50 dark:bg-fuchsia-950', label: 'Fuchsia', preview: 'bg-fuchsia-200' },
    { value: 'bg-pink-50 dark:bg-pink-950', label: 'Pink', preview: 'bg-pink-200' },
    { value: 'bg-rose-50 dark:bg-rose-950', label: 'Rose', preview: 'bg-rose-200' },
];

// Gradient presets
const GRADIENTS = [
    { value: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900', label: 'Ocean', preview: 'bg-gradient-to-br from-blue-200 to-indigo-300' },
    { value: 'bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-900', label: 'Sunset', preview: 'bg-gradient-to-br from-purple-200 to-pink-300' },
    { value: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900', label: 'Forest', preview: 'bg-gradient-to-br from-green-200 to-emerald-300' },
    { value: 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900', label: 'Warmth', preview: 'bg-gradient-to-br from-amber-200 to-orange-300' },
    { value: 'bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-950 dark:to-red-900', label: 'Blush', preview: 'bg-gradient-to-br from-rose-200 to-red-300' },
    { value: 'bg-gradient-to-br from-cyan-50 to-teal-100 dark:from-cyan-950 dark:to-teal-900', label: 'Aqua', preview: 'bg-gradient-to-br from-cyan-200 to-teal-300' },
    { value: 'bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-slate-800', label: 'Slate', preview: 'bg-gradient-to-br from-gray-200 to-slate-300' },
    { value: 'bg-gradient-to-br from-yellow-50 to-lime-100 dark:from-yellow-950 dark:to-lime-900', label: 'Sunshine', preview: 'bg-gradient-to-br from-yellow-200 to-lime-300' },
];

export function PageBackgroundPicker({ isOpen, onClose, currentBackground, currentOpacity = 100, onSelect }: PageBackgroundPickerProps) {
    const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'upload'>('solid');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [opacity, setOpacity] = useState(currentOpacity);
    const [previewBg, setPreviewBg] = useState<string>(currentBackground || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSelect = (value: string) => {
        onSelect(value, opacity);
        onClose();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setUploadedImage(dataUrl);
                setPreviewBg(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleApplyUpload = () => {
        if (uploadedImage) {
            // Store as inline style value for background-image
            onSelect(`url(${uploadedImage})`, opacity);
            onClose();
        }
    };

    const isImageBg = currentBackground?.startsWith('url(') || uploadedImage;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[480px] max-h-[85vh] overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Page Background</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {currentBackground && (
                            <button
                                onClick={() => handleSelect('')}
                                className="text-sm text-red-500 hover:text-red-600 px-2 py-1"
                            >
                                Remove
                            </button>
                        )}
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('solid')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                            activeTab === 'solid'
                                ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 via-green-400 to-blue-400" />
                        Colors
                    </button>
                    <button
                        onClick={() => setActiveTab('gradient')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                            activeTab === 'gradient'
                                ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        <Sparkles className="w-4 h-4" />
                        Gradients
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                            activeTab === 'upload'
                                ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        <Upload className="w-4 h-4" />
                        Upload
                    </button>
                </div>

                {/* Opacity Slider - Show for image backgrounds */}
                {isImageBg && (
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">Opacity</span>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={opacity}
                                onChange={(e) => setOpacity(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px] text-right">
                                {opacity}%
                            </span>
                        </div>
                    </div>
                )}

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
                                            ? "border-purple-500 ring-2 ring-purple-200"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-400 hover:scale-105"
                                    )}
                                    title={color.label}
                                >
                                    {currentBackground === color.value && (
                                        <Check className="w-4 h-4 text-purple-600 absolute inset-0 m-auto" />
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
                                            ? "border-purple-500 ring-2 ring-purple-200"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-400 hover:scale-105"
                                    )}
                                    title={gradient.label}
                                >
                                    {currentBackground === gradient.value && (
                                        <Check className="w-4 h-4 text-purple-600 absolute inset-0 m-auto" />
                                    )}
                                    <span className="absolute bottom-0.5 left-0 right-0 text-[9px] text-center text-gray-600 dark:text-gray-300 font-medium">
                                        {gradient.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="space-y-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                            />

                            {!uploadedImage ? (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors cursor-pointer"
                                >
                                    <ImageIcon className="w-10 h-10 text-gray-400" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Click to upload a background image
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </div>
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div
                                        className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                                        style={{ opacity: opacity / 100 }}
                                    >
                                        <img
                                            src={uploadedImage}
                                            alt="Uploaded preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setUploadedImage(null);
                                                setPreviewBg('');
                                            }}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            Change Image
                                        </button>
                                        <button
                                            onClick={handleApplyUpload}
                                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                                        >
                                            Apply Background
                                        </button>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                Images are stored locally in the page data
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
