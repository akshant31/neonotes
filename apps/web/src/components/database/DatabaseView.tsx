'use client';

import { trpc } from '@/utils/trpc';
import { TableView } from './TableView';
import { Loader2, Database as DatabaseIcon } from 'lucide-react';

interface DatabaseViewProps {
    databaseId: string;
}

export function DatabaseView({ databaseId }: DatabaseViewProps) {
    const { data: database, isLoading } = trpc.database.getById.useQuery(
        { id: databaseId },
        { enabled: !!databaseId }
    );

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
                <div className="flex items-center gap-2">
                    <span className="text-lg">🗃️</span>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {database.name || 'Untitled Database'}
                    </h3>
                    {database.description && (
                        <span className="text-xs text-gray-400 border-l border-gray-300 dark:border-gray-700 pl-2">
                            {database.description}
                        </span>
                    )}
                </div>
            </div>

            {/* Database Content (Views) */}
            <div className="overflow-x-auto">
                <TableView database={database} />
            </div>
        </div>
    );
}
