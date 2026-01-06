'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface DateCellProps {
    value: string | Date | null;
    onUpdate: (value: Date | null) => void;
}

export function DateCell({ value, onUpdate }: DateCellProps) {
    const [isEditing, setIsEditing] = useState(false);
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

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.showPicker?.();
        }
    }, [isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.valueAsDate;
        onUpdate(val);
        setIsEditing(false);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="w-full h-full px-1 py-0.5">
                <input
                    ref={inputRef}
                    type="date"
                    className="w-full h-full px-1 py-0.5 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 outline-none"
                    value={formattedDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setIsEditing(false);
                        }
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className="w-full h-full px-2 py-1 text-sm cursor-pointer min-h-[32px] flex items-center gap-1"
            onClick={() => setIsEditing(true)}
        >
            {displayDate ? (
                <>
                    <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span>{displayDate}</span>
                </>
            ) : (
                <span className="text-gray-400">Pick date</span>
            )}
        </div>
    );
}

