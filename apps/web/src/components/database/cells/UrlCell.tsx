'use client';

import { useState, useRef, useEffect } from 'react';
import { Link, ExternalLink } from 'lucide-react';

interface UrlCellProps {
    value: string | null;
    onUpdate: (value: string) => void;
}

export function UrlCell({ value, onUpdate }: UrlCellProps) {
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
                type="url"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                placeholder="https://..."
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
                <>
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 dark:text-blue-400 hover:underline truncate flex items-center gap-1"
                    >
                        <Link className="w-3 h-3 flex-shrink-0" />
                        {value.replace(/^https?:\/\//, '').slice(0, 30)}
                        <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" />
                    </a>
                </>
            ) : (
                <span className="text-gray-400">Add URL</span>
            )}
        </div>
    );
}
