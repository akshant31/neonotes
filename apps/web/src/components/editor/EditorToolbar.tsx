'use client';

import type { Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Link,
    Image,
    Table,
    CheckSquare,
    Minus,
    Undo,
    Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
    editor: Editor;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'p-2 rounded-lg transition-colors',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive && 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
            )}
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const insertTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
            {/* Undo/Redo */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo (Ctrl+Z)"
            >
                <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo (Ctrl+Shift+Z)"
            >
                <Redo className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Text formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
            >
                <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
            >
                <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
            >
                <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Inline Code"
            >
                <Code className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Headings */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
            >
                <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
            >
                <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
            >
                <Heading3 className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Lists */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
            >
                <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                isActive={editor.isActive('taskList')}
                title="Task List"
            >
                <CheckSquare className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Block elements */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
            >
                <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Divider"
            >
                <Minus className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Insert elements */}
            <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Add Link">
                <Link className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} title="Add Image">
                <Image className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={insertTable} title="Insert Table">
                <Table className="w-4 h-4" />
            </ToolbarButton>
        </div>
    );
}
