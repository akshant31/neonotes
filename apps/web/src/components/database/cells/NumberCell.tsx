'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface NumberCellProps {
    value: number | null;
    onUpdate: (value: number | null) => void;
}

export function NumberCell({ value, onUpdate }: NumberCellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value?.toString() ?? '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalValue(value?.toString() ?? '');
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        const numValue = localValue === '' ? null : parseFloat(localValue);
        if (numValue !== value) {
            onUpdate(isNaN(numValue as number) ? null : numValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="number"
                className="w-full h-full px-2 py-1 bg-white dark:bg-gray-800 border-none outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
        );
    }

    return (
        <div
            className={cn(
                "w-full h-full px-2 py-1 text-sm truncate cursor-text min-h-[24px]",
                !value && "text-gray-400 italic"
            )}
            onClick={() => setIsEditing(true)}
        >
            {value ?? <span className="opacity-0 group-hover:opacity-50">Empty</span>}
        </div>
    );
}
