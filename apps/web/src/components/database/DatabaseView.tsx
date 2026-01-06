'use client';

import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { TableView } from './TableView';
import { Loader2, Database as DatabaseIcon, Pencil } from 'lucide-react';

interface DatabaseViewProps {
    databaseId: string;
    workspaceId?: string;
}

export function DatabaseView({ databaseId, workspaceId }: DatabaseViewProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');
    const nameInputRef = useRef<HTMLInputElement>(null);
    const utils = trpc.useUtils();

    const { data: database, isLoading } = trpc.database.getById.useQuery(
        { id: databaseId },
        { enabled: !!databaseId }
    );

    const updateDatabaseMutation = trpc.database.update.useMutation({
        onSuccess: () => {
            utils.database.getById.invalidate({ id: databaseId });
        },
    });

    useEffect(() => {
        if (database?.name) {
            setEditName(database.name);
        }
    }, [database?.name]);

    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    const handleNameSave = () => {
        if (editName.trim() && editName !== database?.name) {
            updateDatabaseMutation.mutate({ id: databaseId, name: editName.trim() });
        }
        setIsEditingName(false);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNameSave();
        } else if (e.key === 'Escape') {
            setEditName(database?.name || '');
            setIsEditingName(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-gray-800 rounded-lg my-4">
                <Loader2 className="animate-spin text-gray-400 w-5 h-5" />
            </div>
        );
    }

    if (!database) {
        return (
            <div className="flex items-center gap-2 p-4 text-gray-500 border border-gray-200 dark:border-gray-800 rounded-lg my-4 bg-gray-50 dark:bg-gray-900/50">
                <DatabaseIcon className="w-4 h-4" />
                <span className="text-sm">Database not found</span>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden my-6 bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md">
            {/* Database Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2 group">
                    <span className="text-lg">🗃️</span>
                    {isEditingName ? (
                        <input
                            ref={nameInputRef}
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleNameSave}
                            onKeyDown={handleNameKeyDown}
                            className="font-semibold text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-blue-500 rounded px-1 py-0.5 outline-none"
                        />
                    ) : (
                        <button
                            onClick={() => setIsEditingName(true)}
                            className="flex items-center gap-1.5 font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            {database.name || 'Untitled Database'}
                            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                        </button>
                    )}
                    {database.description && (
                        <span className="text-xs text-gray-400 border-l border-gray-300 dark:border-gray-700 pl-2">
                            {database.description}
                        </span>
                    )}
                </div>
            </div>

            {/* Database Content (Views) */}
            <div className="overflow-x-auto">
                <TableView database={database} workspaceId={workspaceId} />
            </div>
        </div>
    );
}
