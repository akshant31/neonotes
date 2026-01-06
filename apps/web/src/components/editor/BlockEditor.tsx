'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useCallback, useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { SlashCommands } from './SlashCommands';
import { PageLinkSearch } from './PageLinkSearch';
import { DatabaseNode } from './extensions/DatabaseNode';
import { ChartNode } from './extensions/ChartNode';
import { ColumnsNode, ColumnNode } from './extensions/ColumnsNode';
import { PageLinkNode } from './extensions/PageLinkNode';

const lowlight = createLowlight(common);

interface BlockEditorProps {
    content?: Record<string, unknown>;
    onChange?: (content: Record<string, unknown>) => void;
    editable?: boolean;
    placeholder?: string;
    pageId?: string;
    workspaceId?: string;
}

export function BlockEditor({
    content,
    onChange,
    editable = true,
    placeholder = "Type '/' for commands...",
    pageId,
    workspaceId,
}: BlockEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // We use CodeBlockLowlight instead
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 hover:text-blue-600 underline cursor-pointer',
                },
            }),
            Image.configure({
                inline: false,
                allowBase64: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
            CodeBlockLowlight.configure({
                lowlight,
            }),
            DatabaseNode,
            ChartNode,
            ColumnsNode,
            ColumnNode,
            PageLinkNode,
        ],
        content: content || {
            type: 'doc',
            content: [{ type: 'paragraph' }],
        },
        editable,
        onUpdate: ({ editor }) => {
            if (onChange) {
                onChange(editor.getJSON());
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-2',
            },
        },
    });

    // Update content when prop changes
    useEffect(() => {
        if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
            editor.commands.setContent(content);
        }
    }, [editor, content]);

    // Update editable state when prop changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editor, editable]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            // Slash command trigger is handled by SlashCommands component
        },
        []
    );

    if (!editor) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
        );
    }

    return (
        <div className="block-editor" onKeyDown={handleKeyDown}>
            {editable && <EditorToolbar editor={editor} />}
            {editable && <SlashCommands editor={editor} pageId={pageId} workspaceId={workspaceId} />}
            {editable && workspaceId && <PageLinkSearch editor={editor} workspaceId={workspaceId} />}
            <EditorContent editor={editor} />
        </div>
    );
}

