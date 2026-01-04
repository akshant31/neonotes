'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateCellProps {
    value: string | Date | null;
    onUpdate: (value: Date | null) => void;
}

export function DateCell({ value, onUpdate }: DateCellProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Parse the value carefully
    const dateValue = value ? new Date(value) : null;
    const formattedDate = dateValue && !isNaN(dateValue.getTime())
        ? format(dateValue, 'yyyy-MM-dd')
        : '';

    // For display
    const displayDate = dateValue && !isNaN(dateValue.getTime())
        ? format(dateValue, 'MMM d, yyyy')
        : null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.valueAsDate;
        onUpdate(val);
    };

    return (
        <div className="relative w-full h-full group">
            <input
                type="date"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                value={formattedDate}
                onChange={handleChange}
            />
            <div
                className={cn(
                    "w-full h-full px-2 py-1 text-sm truncate flex items-center",
                    !displayDate && "text-gray-400 italic"
                )}
            >
                {displayDate ?? <span className="opacity-0 group-hover:opacity-50">Empty</span>}
            </div>
        </div>
    );
}
