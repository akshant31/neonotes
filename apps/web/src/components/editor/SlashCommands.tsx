'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import {
    Type,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    Code,
    Quote,
    Minus,
    Image,
    Table,
    LayoutDashboard,
    BarChart2,
    LineChart,
    PieChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';

interface SlashCommandsProps {
    editor: Editor;
}

interface Command {
    name: string;
    description: string;
    icon: React.ReactNode;
    action: (editor: Editor) => void;
}



export function SlashCommands({ editor, pageId }: SlashCommandsProps & { pageId?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const createDatabaseMutation = trpc.database.create.useMutation();

    const commands: Command[] = [
        {
            name: 'Text',
            description: 'Just start writing with plain text',
            icon: <Type className="w-5 h-5" />,
            action: (editor) => editor.chain().focus().setParagraph().run(),
        },
        {
            name: 'Heading 1',
            description: 'Large section heading',
            icon: <Heading1 className="w-5 h-5" />,
            action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
            name: 'Heading 2',
            description: 'Medium section heading',
            icon: <Heading2 className="w-5 h-5" />,
            action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
            name: 'Heading 3',
            description: 'Small section heading',
            icon: <Heading3 className="w-5 h-5" />,
            action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
            name: 'Bullet List',
            description: 'Create a simple bullet list',
            icon: <List className="w-5 h-5" />,
            action: (editor) => editor.chain().focus().toggleBulletList().run(),
        },
        {
            name: 'Numbered List',
            description: 'Create a numbered list',
            icon: <ListOrdered className="w-5 h-5" />,
            action: (editor) => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            name: 'To-do List',
            description: 'Create a checklist',
            icon: <CheckSquare className="w-5 h-5" />,
            action: (editor) => editor.chain().focus().toggleTaskList().run(),
        },
        {
            name: 'Code Block',
            description: 'Add a code snippet',
            icon: <Code className="w-5 h-5" />,
            action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
        },
        {
            name: 'Quote',
            description: 'Add a quote block',
            icon: <Quote className="w-5 h-5" />,
            action: (editor) => editor.chain().focus().toggleBlockquote().run(),
        },
        {
            name: 'Divider',
            description: 'Add a horizontal divider',
            icon: <Minus className="w-5 h-5" />,
            action: (editor) => editor.chain().focus().setHorizontalRule().run(),
        },
        {
            name: 'Image',
            description: 'Add an image',
            icon: <Image className="w-5 h-5" />,
            action: (editor) => {
                const url = window.prompt('Enter image URL:');
                if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
            },
        },
        {
            name: 'Table',
            description: 'Add a simple table',
            icon: <Table className="w-5 h-5" />,
            action: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        },
        {
            name: 'Database',
            description: 'Add an inline database',
            icon: <LayoutDashboard className="w-5 h-5" />,
            action: (editor) => {
                if (!pageId) {
                    alert('Save the page first to add a database.');
                    return;
                }

                createDatabaseMutation.mutate({
                    pageId,
                    name: 'Inline Database',
                }, {
                    onSuccess: (database) => {
                        editor.chain().focus().insertContent({
                            type: 'database',
                            attrs: {
                                databaseId: database.id
                            }
                        }).run();
                    }
                });
            },
        },
        {
            name: 'Bar Chart',
            description: 'Add a bar chart visualization',
            icon: <BarChart2 className="w-5 h-5" />,
            action: (editor) => {
                editor.chain().focus().insertContent({
                    type: 'chart',
                    attrs: { chartType: 'bar' }
                }).run();
            },
        },
        {
            name: 'Line Chart',
            description: 'Add a line chart visualization',
            icon: <LineChart className="w-5 h-5" />,
            action: (editor) => {
                editor.chain().focus().insertContent({
                    type: 'chart',
                    attrs: { chartType: 'line' }
                }).run();
            },
        },
        {
            name: 'Pie Chart',
            description: 'Add a pie chart visualization',
            icon: <PieChart className="w-5 h-5" />,
            action: (editor) => {
                editor.chain().focus().insertContent({
                    type: 'chart',
                    attrs: { chartType: 'pie' }
                }).run();
            },
        },
    ];

    const filteredCommands = commands.filter(
        (command) =>
            command.name.toLowerCase().includes(query.toLowerCase()) ||
            command.description.toLowerCase().includes(query.toLowerCase())
    );

    const executeCommand = useCallback(
        (command: Command) => {
            // Delete the slash and query
            const { from } = editor.state.selection;
            const textBefore = editor.state.doc.textBetween(Math.max(0, from - query.length - 1), from);

            if (textBefore.startsWith('/')) {
                editor.chain().focus().deleteRange({ from: from - query.length - 1, to: from }).run();
            }

            command.action(editor);
            setIsOpen(false);
            setQuery('');
        },
        [editor, query]
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) {
                if (event.key === '/') {
                    const { from } = editor.state.selection;
                    const coords = editor.view.coordsAtPos(from);
                    setPosition({ top: coords.bottom + 8, left: coords.left });
                    setIsOpen(true);
                    setQuery('');
                    setSelectedIndex(0);
                }
                return;
            }

            if (event.key === 'Escape') {
                setIsOpen(false);
                setQuery('');
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
                return;
            }

            if (event.key === 'Enter' && filteredCommands[selectedIndex]) {
                event.preventDefault();
                executeCommand(filteredCommands[selectedIndex]);
                return;
            }

            if (event.key === 'Backspace' && query === '') {
                setIsOpen(false);
                return;
            }

            // Update query based on typed characters
            if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
                setQuery((q) => q + event.key);
                setSelectedIndex(0);
            } else if (event.key === 'Backspace') {
                setQuery((q) => q.slice(0, -1));
                setSelectedIndex(0);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, query, filteredCommands, selectedIndex, executeCommand, editor]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden w-80"
            style={{ top: position.top, left: position.left }}
        >
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Filter commands</div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    /{query}
                    <span className="animate-pulse">|</span>
                </div>
            </div>
            <div className="max-h-80 overflow-y-auto p-1">
                {filteredCommands.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No commands found
                    </div>
                ) : (
                    filteredCommands.map((command, index) => (
                        <button
                            key={command.name}
                            onClick={() => executeCommand(command)}
                            className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                                index === selectedIndex
                                    ? 'bg-blue-50 dark:bg-blue-900/30'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            )}
                        >
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-lg flex items-center justify-center',
                                    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                )}
                            >
                                {command.icon}
                            </div>
                            <div>
                                <div className="font-medium text-gray-800 dark:text-gray-200">
                                    {command.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {command.description}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
