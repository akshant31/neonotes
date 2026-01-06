'use client';

import { useState, useRef, useEffect } from 'react';
import type { DatabaseColumn } from '@prisma/client';
import { trpc } from '@/utils/trpc';
import {
    Type, Hash, List, Calendar, CheckSquare, Link2,
    MoreVertical, Trash, Database, Link, Mail, Phone,
    User, FileText, Clock, UserCircle, Calculator, Sigma, X, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const COLUMN_ICONS: Record<string, React.ReactNode> = {
    text: <Type className="w-3 h-3" />,
    number: <Hash className="w-3 h-3" />,
    select: <List className="w-3 h-3" />,
    multiSelect: <List className="w-3 h-3" />,
    date: <Calendar className="w-3 h-3" />,
    checkbox: <CheckSquare className="w-3 h-3" />,
    url: <Link className="w-3 h-3" />,
    email: <Mail className="w-3 h-3" />,
    phone: <Phone className="w-3 h-3" />,
    person: <User className="w-3 h-3" />,
    files: <FileText className="w-3 h-3" />,
    relation: <Link2 className="w-3 h-3" />,
    rollup: <Sigma className="w-3 h-3" />,
    formula: <Calculator className="w-3 h-3" />,
    createdTime: <Clock className="w-3 h-3" />,
    createdBy: <UserCircle className="w-3 h-3" />,
    lastEditedTime: <Clock className="w-3 h-3" />,
    lastEditedBy: <UserCircle className="w-3 h-3" />,
};

const COLUMN_TYPES = [
    { value: 'text', label: 'Text', icon: Type, desc: 'Plain text content' },
    { value: 'number', label: 'Number', icon: Hash, desc: 'Numbers and calculations' },
    { value: 'select', label: 'Select', icon: List, desc: 'Single choice from options' },
    { value: 'multiSelect', label: 'Multi-select', icon: List, desc: 'Multiple choices' },
    { value: 'date', label: 'Date', icon: Calendar, desc: 'Date and time' },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare, desc: 'True or false' },
    { value: 'url', label: 'URL', icon: Link, desc: 'Web links' },
    { value: 'email', label: 'Email', icon: Mail, desc: 'Email addresses' },
    { value: 'phone', label: 'Phone', icon: Phone, desc: 'Phone numbers' },
    { value: 'person', label: 'Person', icon: User, desc: 'Team members' },
    { value: 'files', label: 'Files & media', icon: FileText, desc: 'Attachments' },
    { value: 'relation', label: 'Relation', icon: Link2, desc: 'Link to another database' },
    { value: 'rollup', label: 'Rollup', icon: Sigma, desc: 'Aggregate related data' },
    { value: 'formula', label: 'Formula', icon: Calculator, desc: 'Calculate values' },
    { value: 'createdTime', label: 'Created time', icon: Clock, desc: 'Auto timestamp' },
    { value: 'createdBy', label: 'Created by', icon: UserCircle, desc: 'Auto creator' },
    { value: 'lastEditedTime', label: 'Last edited time', icon: Clock, desc: 'Auto updated' },
    { value: 'lastEditedBy', label: 'Last edited by', icon: UserCircle, desc: 'Auto editor' },
];

interface ColumnHeaderProps {
    column: DatabaseColumn;
    onUpdate: (updates: Partial<DatabaseColumn>) => void;
    onDelete: () => void;
    workspaceId?: string;
    currentDatabaseId?: string;
}

export function ColumnHeader({ column, onUpdate, onDelete, workspaceId: workspaceIdProp, currentDatabaseId }: ColumnHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [showDbPicker, setShowDbPicker] = useState(false);
    const [name, setName] = useState(column.name);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: defaultWorkspace } = trpc.workspace.getDefault.useQuery(undefined, {
        enabled: !workspaceIdProp && showDbPicker
    });

    const workspaceId = workspaceIdProp || defaultWorkspace?.id;

    const { data: databases = [] } = trpc.database.listAll.useQuery(
        { workspaceId: workspaceId || '' },
        { enabled: showDbPicker && !!workspaceId }
    );

    const availableDatabases = databases.filter(db => db.id !== currentDatabaseId);

    useEffect(() => {
        setName(column.name);
    }, [column.name]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNameBlur = () => {
        if (name !== column.name) {
            onUpdate({ name });
        }
    };

    const handleTypeSelect = (typeValue: string) => {
        if (typeValue === 'relation') {
            setShowTypePicker(false);
            setShowDbPicker(true);
        } else {
            onUpdate({ type: typeValue });
            setShowTypePicker(false);
            setIsOpen(false);
        }
    };

    const handleDatabaseSelect = (databaseId: string, databaseName: string) => {
        onUpdate({
            type: 'relation',
            options: { relatedDatabaseId: databaseId, relatedDatabaseName: databaseName } as unknown as DatabaseColumn['options'],
        });
        setShowDbPicker(false);
        setIsOpen(false);
    };

    const currentType = COLUMN_TYPES.find(t => t.value === column.type);
    const relatedDbName = (column.options as any)?.relatedDatabaseName;

    return (
        <>
            <div ref={containerRef} className="relative flex items-center justify-between w-full group">
                <div
                    className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="text-gray-400">
                        {COLUMN_ICONS[column.type] || <Type className="w-3 h-3" />}
                    </span>
                    <span className="truncate font-medium text-sm text-gray-700 dark:text-gray-300">
                        {column.name}
                        {relatedDbName && (
                            <span className="text-xs text-gray-400 ml-1">→ {relatedDbName}</span>
                        )}
                    </span>
                </div>

                <div
                    className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer",
                        isOpen && "opacity-100 bg-gray-100 dark:bg-gray-800"
                    )}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <MoreVertical className="w-3 h-3 text-gray-400" />
                </div>

                {/* Small Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full left-0 z-50 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-1 p-2">
                        {/* Rename Input */}
                        <div className="mb-3">
                            <input
                                autoFocus
                                type="text"
                                className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={handleNameBlur}
                                onKeyDown={(e) => e.key === 'Enter' && (handleNameBlur(), setIsOpen(false))}
                            />
                        </div>

                        {/* Type Button - Opens Modal */}
                        <button
                            className="w-full flex items-center justify-between px-2 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => setShowTypePicker(true)}
                        >
                            <div className="flex items-center gap-2">
                                {currentType && <currentType.icon className="w-4 h-4 text-gray-400" />}
                                <span>Type: {currentType?.label || column.type}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        <div className="border-t border-gray-100 dark:border-gray-800 my-1 pt-1">
                            <button
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                onClick={() => {
                                    if (confirm('Delete this column?')) {
                                        onDelete();
                                    }
                                }}
                            >
                                <Trash className="w-4 h-4" />
                                Delete property
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Type Picker Modal */}
            {showTypePicker && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center" onClick={() => setShowTypePicker(false)}>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Select Column Type</h3>
                            <button onClick={() => setShowTypePicker(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-3 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
                            {COLUMN_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    className={cn(
                                        "flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                                        column.type === type.value
                                            ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent"
                                    )}
                                    onClick={() => handleTypeSelect(type.value)}
                                >
                                    <type.icon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{type.label}</div>
                                        <div className="text-xs text-gray-500">{type.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Database Picker Modal for Relation */}
            {showDbPicker && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center" onClick={() => setShowDbPicker(false)}>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[400px] max-h-[80vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Select Database to Link</h3>
                            <button onClick={() => setShowDbPicker(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-3 max-h-[60vh] overflow-y-auto">
                            {availableDatabases.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">No other databases found. Create another database first.</p>
                            ) : (
                                <div className="space-y-1">
                                    {availableDatabases.map((db) => (
                                        <button
                                            key={db.id}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={() => handleDatabaseSelect(db.id, db.name)}
                                        >
                                            <Database className="w-5 h-5 text-gray-400" />
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{db.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
