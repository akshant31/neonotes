'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TextCellProps {
    value: string | null;
    onUpdate: (value: string) => void;
    className?: string;
}

export function TextCell({ value, onUpdate, className }: TextCellProps) {
    const [localValue, setLocalValue] = useState(value || '');
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleBlur = () => {
        setIsEditing(false);
        if (localValue !== (value || '')) {
            onUpdate(localValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            inputRef.current?.blur();
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                autoFocus
                type="text"
                className={cn(
                    "w-full h-full bg-transparent outline-none px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100",
                    className
                )}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={cn(
                "w-full h-full px-2 py-1.5 text-sm min-h-[32px] cursor-text hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors truncate",
                !localValue && "text-gray-400 italic",
                className
            )}
        >
            {localValue || 'Empty'}
        </div>
    );
}
