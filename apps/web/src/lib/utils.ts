import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateId(): string {
    return crypto.randomUUID();
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

export function formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

// Color utilities for database select options
export const COLORS = [
    { name: 'default', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200' },
    { name: 'gray', bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' },
    { name: 'brown', bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-800 dark:text-amber-200' },
    { name: 'orange', bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200' },
    { name: 'yellow', bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
    { name: 'green', bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-800 dark:text-emerald-200' },
    { name: 'blue', bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
    { name: 'purple', bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200' },
    { name: 'pink', bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-800 dark:text-pink-200' },
    { name: 'red', bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
];

export function getColorClasses(colorName: string) {
    return COLORS.find(c => c.name === colorName) || COLORS[0];
}
