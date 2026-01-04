'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react';
import React from 'react';
import { FileText } from 'lucide-react';

// Define the page link attributes
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        pageLink: {
            setPageLink: (attributes: { pageId: string; pageTitle: string; pageIcon?: string }) => ReturnType;
        };
    }
}

// React component for rendering the page link
const PageLinkComponent = ({ node }: ReactNodeViewProps) => {
    const pageId = node.attrs.pageId as string;
    const pageTitle = (node.attrs.pageTitle as string) || 'Untitled';
    const pageIcon = node.attrs.pageIcon as string | undefined;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Dispatch a custom event for navigation
        const event = new CustomEvent('navigate-to-page', { detail: { pageId } });
        window.dispatchEvent(event);
    };

    return (
        <NodeViewWrapper as="span" className="inline">
            <button
                onClick={handleClick}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer border-0 font-normal text-base"
                contentEditable={false}
            >
                <span className="text-sm">{pageIcon || <FileText className="w-3.5 h-3.5" />}</span>
                <span className="underline decoration-blue-400/50">{pageTitle}</span>
            </button>
        </NodeViewWrapper>
    );
};

// TipTap extension for page links
export const PageLinkNode = Node.create({
    name: 'pageLink',

    group: 'inline',

    inline: true,

    atom: true, // Cannot be edited directly

    addAttributes() {
        return {
            pageId: {
                default: null,
            },
            pageTitle: {
                default: 'Untitled',
            },
            pageIcon: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-type="page-link"]',
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'page-link',
                'data-page-id': node.attrs.pageId,
                'class': 'page-link',
            }),
            `[[${node.attrs.pageTitle}]]`,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(PageLinkComponent);
    },

    addCommands() {
        return {
            setPageLink:
                (attributes) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: attributes,
                        });
                    },
        };
    },
});

// Helper function to extract page link IDs from TipTap JSON content
export function extractPageLinkIds(content: Record<string, unknown>): string[] {
    const ids: string[] = [];

    function traverse(node: Record<string, unknown>) {
        if (node.type === 'pageLink' && (node.attrs as Record<string, unknown>)?.pageId) {
            ids.push((node.attrs as Record<string, unknown>).pageId as string);
        }
        if (Array.isArray(node.content)) {
            node.content.forEach((child) => traverse(child as Record<string, unknown>));
        }
    }

    traverse(content);
    return ids;
}
