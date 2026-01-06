'use client';

import { Clock } from 'lucide-react';

interface TimestampCellProps {
    value: string | Date | null;
    type: 'createdTime' | 'lastEditedTime';
}

export function TimestampCell({ value }: TimestampCellProps) {
    const formatDate = (date: string | Date | null) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <div className="w-full h-full px-2 py-1 text-sm flex items-center gap-1 text-gray-500 dark:text-gray-400 min-h-[32px]">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{formatDate(value)}</span>
        </div>
    );
}
