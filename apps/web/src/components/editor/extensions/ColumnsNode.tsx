import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useState } from 'react';

// Column container that holds multiple column blocks
export const ColumnsNode = Node.create({
    name: 'columns',

    group: 'block',

    content: 'column+',

    defining: true,

    addAttributes() {
        return {
            columnCount: {
                default: 2,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="columns"]',
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const columnCount = node.attrs.columnCount || 2;
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'columns',
                'class': 'columns-layout',
                'style': `display: grid; grid-template-columns: repeat(${columnCount}, 1fr); gap: 1rem; margin: 1rem 0;`
            }),
            0
        ];
    },
});

// Individual column that can contain any block content
export const ColumnNode = Node.create({
    name: 'column',

    group: 'column',

    content: 'block+',

    defining: true,

    addAttributes() {
        return {
            showBorder: {
                default: true,
            },
            borderWidth: {
                default: 1, // 1, 2, or 3 px
            },
            borderStyle: {
                default: 'dashed', // 'dashed', 'solid', 'dotted', 'none'
            },
            borderColor: {
                default: '#4b5563',
            },
            backgroundColor: {
                default: 'transparent',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="column"]',
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const { showBorder, borderWidth, borderStyle, borderColor, backgroundColor } = node.attrs;
        const borderValue = showBorder ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none';

        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'column',
                'class': 'column-block',
                'style': `padding: 0.75rem; border: ${borderValue}; border-radius: 0.5rem; min-height: 100px; background-color: ${backgroundColor};`
            }),
            0
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(({ node, updateAttributes }) => {
            const [showConfig, setShowConfig] = useState(false);
            const { showBorder, borderWidth, borderStyle, borderColor, backgroundColor } = node.attrs;
            const borderValue = showBorder ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none';

            const bgOptions = [
                { label: 'None', value: 'transparent' },
                { label: 'Gray', value: '#1f2937' },
                { label: 'Blue', value: '#1e3a5f' },
                { label: 'Green', value: '#14532d' },
                { label: 'Purple', value: '#3b0764' },
                { label: 'Red', value: '#450a0a' },
                { label: 'Yellow', value: '#422006' },
            ];

            return (
                <NodeViewWrapper
                    className="column-block relative group"
                    style={{
                        padding: '0.75rem',
                        border: borderValue,
                        borderRadius: '0.5rem',
                        minHeight: '100px',
                        backgroundColor: backgroundColor,
                        transition: 'all 0.2s',
                    }}
                >
                    {/* Config button - shows on hover */}
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        contentEditable={false}
                    >
                        ⚙
                    </button>

                    {/* Config panel */}
                    {showConfig && (
                        <div
                            className="absolute top-6 right-0 bg-gray-800 border border-gray-700 rounded-lg p-3 z-20 shadow-xl min-w-48"
                            contentEditable={false}
                        >
                            <div className="text-xs font-medium text-gray-300 mb-3">Column Style</div>

                            {/* Border toggle */}
                            <label className="flex items-center gap-2 mb-2 text-sm text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={showBorder}
                                    onChange={(e) => updateAttributes({ showBorder: e.target.checked })}
                                    className="rounded"
                                />
                                Show Border
                            </label>

                            {/* Border width */}
                            {showBorder && (
                                <div className="mb-2">
                                    <div className="text-xs text-gray-400 mb-1">Border Width</div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map((w) => (
                                            <button
                                                key={w}
                                                onClick={() => updateAttributes({ borderWidth: w })}
                                                className={`px-2 py-1 text-xs rounded ${borderWidth === w ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                                            >
                                                {w}px
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Border style */}
                            {showBorder && (
                                <div className="mb-2">
                                    <div className="text-xs text-gray-400 mb-1">Border Style</div>
                                    <div className="flex gap-1">
                                        {['dashed', 'solid', 'dotted'].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => updateAttributes({ borderStyle: s })}
                                                className={`px-2 py-1 text-xs rounded capitalize ${borderStyle === s ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Background color */}
                            <div className="mb-2">
                                <div className="text-xs text-gray-400 mb-1">Background</div>
                                <div className="flex flex-wrap gap-1">
                                    {bgOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => updateAttributes({ backgroundColor: opt.value })}
                                            className={`w-6 h-6 rounded border-2 ${backgroundColor === opt.value ? 'border-blue-500' : 'border-gray-600'}`}
                                            style={{ backgroundColor: opt.value === 'transparent' ? '#111827' : opt.value }}
                                            title={opt.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowConfig(false)}
                                className="w-full mt-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                            >
                                Done
                            </button>
                        </div>
                    )}

                    <NodeViewContent />
                </NodeViewWrapper>
            );
        });
    },
});
