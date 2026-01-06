import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { DatabaseView } from '@/components/database/DatabaseView';
import { Trash2, GripVertical } from 'lucide-react';

const DatabaseComponent = ({ node, deleteNode, selected }: NodeViewProps) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Directly delete without confirm to avoid dialog blocking issues
        deleteNode();
    };

    return (
        <NodeViewWrapper className="my-4 relative group" data-drag-handle>
            {/* Hover Controls */}
            <div
                className={`absolute -left-12 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${selected ? 'opacity-100' : ''}`}
                contentEditable={false}
            >
                <div
                    className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-grab"
                    data-drag-handle
                >
                    <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <button
                    type="button"
                    onClick={handleDelete}
                    onMouseDown={(e) => e.preventDefault()}
                    className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
            </div>

            <DatabaseView
                databaseId={node.attrs.databaseId}
                workspaceId={node.attrs.workspaceId}
            />
        </NodeViewWrapper>
    );
};

export const DatabaseNode = Node.create({
    name: 'database',

    group: 'block',

    atom: true,

    draggable: true,

    selectable: true,

    addAttributes() {
        return {
            databaseId: {
                default: null,
            },
            workspaceId: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="database"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'database' })];
    },

    addKeyboardShortcuts() {
        return {
            Backspace: () => {
                const { selection } = this.editor.state;
                const isNodeSelection = 'node' in selection;
                if (isNodeSelection && (selection as any).node?.type.name === 'database') {
                    return this.editor.commands.deleteSelection();
                }
                return false;
            },
            Delete: () => {
                const { selection } = this.editor.state;
                const isNodeSelection = 'node' in selection;
                if (isNodeSelection && (selection as any).node?.type.name === 'database') {
                    return this.editor.commands.deleteSelection();
                }
                return false;
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(DatabaseComponent);
    },
});

