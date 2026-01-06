import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { DatabaseView } from '@/components/database/DatabaseView';

export const DatabaseNode = Node.create({
    name: 'database',

    group: 'block',

    atom: true,

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

    addNodeView() {
        return ReactNodeViewRenderer(({ node }) => {
            return (
                <NodeViewWrapper className="my-4">
                    <DatabaseView
                        databaseId={node.attrs.databaseId}
                        workspaceId={node.attrs.workspaceId}
                    />
                </NodeViewWrapper>
            );
        });
    },
});

