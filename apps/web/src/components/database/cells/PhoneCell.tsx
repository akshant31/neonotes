'use client';

import { useState, useRef, useEffect } from 'react';
import { Phone } from 'lucide-react';

interface PhoneCellProps {
    value: string | null;
    onUpdate: (value: string) => void;
}

export function PhoneCell({ value, onUpdate }: PhoneCellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value || '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        onUpdate(editValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditValue(value || '');
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="tel"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                placeholder="+1 234 567 8900"
                className="w-full h-full px-2 py-1 text-sm bg-transparent outline-none border-none"
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className="w-full h-full px-2 py-1 text-sm cursor-pointer min-h-[32px] flex items-center gap-1"
        >
            {value ? (
                <a
                    href={`tel:${value}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 dark:text-blue-400 hover:underline truncate flex items-center gap-1"
                >
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    {value}
                </a>
            ) : (
                <span className="text-gray-400">Add phone</span>
            )}
        </div>
    );
}
