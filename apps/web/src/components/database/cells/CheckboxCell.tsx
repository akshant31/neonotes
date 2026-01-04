'use client';

import { cn } from '@/lib/utils';

interface CheckboxCellProps {
    value: boolean | null;
    onUpdate: (value: boolean) => void;
}

export function CheckboxCell({ value, onUpdate }: CheckboxCellProps) {
    return (
        <div className="w-full h-full flex items-center justify-center p-1">
            <input
                type="checkbox"
                checked={value ?? false}
                onChange={(e) => onUpdate(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
        </div>
    );
}
