'use client';

import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Link, Check, Sparkles, Upload, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoverPickerProps {
    isOpen: boolean;
    onClose: () => void;
    currentCover?: string | null;
    currentOpacity?: number;
    onSelect: (cover: string | null, opacity?: number) => void;
}

// Beautiful gradient covers
const GRADIENT_COVERS = [
    { id: 'gradient-1', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Purple Dream' },
    { id: 'gradient-2', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Pink Sunset' },
    { id: 'gradient-3', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Ocean Blue' },
    { id: 'gradient-4', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Mint Fresh' },
    { id: 'gradient-5', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', label: 'Summer Glow' },
    { id: 'gradient-6', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', label: 'Soft Pastel' },
    { id: 'gradient-7', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', label: 'Rose Petal' },
    { id: 'gradient-8', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', label: 'Warm Sand' },
    { id: 'gradient-9', value: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', label: 'Sky Light' },
    { id: 'gradient-10', value: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', label: 'Lavender' },
    { id: 'gradient-11', value: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', label: 'Crystal' },
    { id: 'gradient-12', value: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)', label: 'Morning' },
];

// Solid color covers
const SOLID_COVERS = [
    { id: 'solid-1', value: '#ef4444', label: 'Red' },
    { id: 'solid-2', value: '#f97316', label: 'Orange' },
    { id: 'solid-3', value: '#eab308', label: 'Yellow' },
    { id: 'solid-4', value: '#22c55e', label: 'Green' },
    { id: 'solid-5', value: '#14b8a6', label: 'Teal' },
    { id: 'solid-6', value: '#3b82f6', label: 'Blue' },
    { id: 'solid-7', value: '#8b5cf6', label: 'Purple' },
    { id: 'solid-8', value: '#ec4899', label: 'Pink' },
    { id: 'solid-9', value: '#6b7280', label: 'Gray' },
    { id: 'solid-10', value: '#1f2937', label: 'Dark' },
];

export function CoverPicker({ isOpen, onClose, currentCover, currentOpacity = 100, onSelect }: CoverPickerProps) {
    const [activeTab, setActiveTab] = useState<'gradient' | 'solid' | 'upload' | 'link'>('gradient');
    const [customUrl, setCustomUrl] = useState('');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [opacity, setOpacity] = useState(currentOpacity);
    const [previewCover, setPreviewCover] = useState<string | null>(currentCover || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSelect = (value: string | null) => {
        onSelect(value, opacity);
        onClose();
    };

    const handleCustomUrl = () => {
        if (customUrl.trim()) {
            onSelect(customUrl.trim(), opacity);
            onClose();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setUploadedImage(dataUrl);
                setPreviewCover(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleApplyUpload = () => {
        if (uploadedImage) {
            onSelect(uploadedImage, opacity);
            onClose();
        }
    };

    const tabs = [
        { id: 'gradient', label: 'Gradients', icon: Sparkles },
        { id: 'solid', label: 'Colors', icon: null, customIcon: true },
        { id: 'upload', label: 'Upload', icon: Upload },
        { id: 'link', label: 'Link', icon: Link },
    ];

    return (
        <div
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[520px] max-h-[85vh] overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Cover Image</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {currentCover && (
                            <button
                                onClick={() => handleSelect(null)}
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
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                                activeTab === tab.id
                                    ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                        >
                            {tab.customIcon ? (
                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500" />
                            ) : tab.icon && (
                                <tab.icon className="w-4 h-4" />
                            )}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Opacity Slider - Always visible when there's a cover */}
                {(currentCover || previewCover || uploadedImage) && (
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
                                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px] text-right">
                                {opacity}%
                            </span>
                        </div>
                        {/* Preview with opacity */}
                        <div
                            className="mt-3 h-16 rounded-lg overflow-hidden"
                            style={{
                                background: previewCover?.startsWith('data:') || previewCover?.startsWith('http')
                                    ? `url(${previewCover}) center/cover`
                                    : previewCover || currentCover || '#e5e7eb',
                                opacity: opacity / 100
                            }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-4 max-h-[45vh] overflow-y-auto">
                    {activeTab === 'gradient' && (
                        <div className="grid grid-cols-3 gap-3">
                            {GRADIENT_COVERS.map((cover) => (
                                <button
                                    key={cover.id}
                                    onClick={() => {
                                        setPreviewCover(cover.value);
                                        handleSelect(cover.value);
                                    }}
                                    className={cn(
                                        "aspect-video rounded-lg border-2 transition-all relative overflow-hidden group",
                                        currentCover === cover.value
                                            ? "border-indigo-500 ring-2 ring-indigo-200"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-400 hover:scale-105"
                                    )}
                                    style={{ background: cover.value }}
                                    title={cover.label}
                                >
                                    {currentCover === cover.value && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Check className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                    <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity text-center drop-shadow-lg">
                                        {cover.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'solid' && (
                        <div className="grid grid-cols-5 gap-3">
                            {SOLID_COVERS.map((cover) => (
                                <button
                                    key={cover.id}
                                    onClick={() => {
                                        setPreviewCover(cover.value);
                                        handleSelect(cover.value);
                                    }}
                                    className={cn(
                                        "aspect-square rounded-lg border-2 transition-all relative",
                                        currentCover === cover.value
                                            ? "border-indigo-500 ring-2 ring-indigo-200 scale-110"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-400 hover:scale-110"
                                    )}
                                    style={{ backgroundColor: cover.value }}
                                    title={cover.label}
                                >
                                    {currentCover === cover.value && (
                                        <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-lg" />
                                    )}
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
                                    className="w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                                >
                                    <Upload className="w-10 h-10 text-gray-400" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Click to upload an image
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
                                                setPreviewCover(null);
                                            }}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            Change Image
                                        </button>
                                        <button
                                            onClick={handleApplyUpload}
                                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                        >
                                            Apply Cover
                                        </button>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                Images are stored locally in the page data
                            </p>
                        </div>
                    )}

                    {activeTab === 'link' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Paste an image URL to use as your cover
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={customUrl}
                                    onChange={(e) => {
                                        setCustomUrl(e.target.value);
                                        if (e.target.value) setPreviewCover(e.target.value);
                                    }}
                                    placeholder="https://example.com/image.jpg"
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleCustomUrl}
                                    disabled={!customUrl.trim()}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                            {customUrl && (
                                <div
                                    className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                                    style={{ opacity: opacity / 100 }}
                                >
                                    <img
                                        src={customUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
