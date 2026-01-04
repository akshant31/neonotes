import { Node, mergeAttributes } from '@tiptap/core';

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

    parseHTML() {
        return [
            {
                tag: 'div[data-type="column"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'column',
                'class': 'column-block',
                'style': 'padding: 0.5rem; border: 1px dashed #4b5563; border-radius: 0.5rem; min-height: 100px;'
            }),
            0
        ];
    },
});

