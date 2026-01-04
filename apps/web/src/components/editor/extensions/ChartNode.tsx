import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { ChartBlock } from '@/components/editor/blocks/ChartBlock';

export const ChartNode = Node.create({
    name: 'chart',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            chartType: {
                default: 'bar',
            },
            chartData: {
                default: null,
            },
            title: {
                default: '',
            },
            dataSourceId: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="chart"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'chart' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(({ node, updateAttributes }) => {
            return (
                <NodeViewWrapper className="my-4">
                    <ChartBlock
                        chartType={node.attrs.chartType}
                        chartData={node.attrs.chartData}
                        title={node.attrs.title}
                        onUpdate={(attrs) => updateAttributes(attrs)}
                    />
                </NodeViewWrapper>
            );
        });
    },
});
