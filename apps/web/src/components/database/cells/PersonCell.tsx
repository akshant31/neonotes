'use client';

import { UserCircle } from 'lucide-react';

interface PersonCellProps {
    value: string | null;
    type?: 'person' | 'createdBy' | 'lastEditedBy';
}

export function PersonCell({ value, type }: PersonCellProps) {
    // For createdBy/lastEditedBy, this would be auto-populated
    // For person type, this would allow selection
    const isAutoField = type === 'createdBy' || type === 'lastEditedBy';

    return (
        <div className="w-full h-full px-2 py-1 text-sm flex items-center gap-1 min-h-[32px]">
            {value ? (
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
                    <UserCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300 text-xs">{value}</span>
                </div>
            ) : (
                <span className="text-gray-400">
                    {isAutoField ? '-' : 'Add person'}
                </span>
            )}
        </div>
    );
}
