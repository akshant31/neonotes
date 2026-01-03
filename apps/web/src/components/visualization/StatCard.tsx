'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: React.ReactNode;
    className?: string;
}

export function StatCard({
    title,
    value,
    change,
    changeLabel,
    icon,
    className,
}: StatCardProps) {
    const isPositive = change !== undefined && change > 0;
    const isNegative = change !== undefined && change < 0;
    const isNeutral = change === 0;

    return (
        <div
            className={cn(
                'p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                'hover:shadow-lg transition-shadow',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>

                    {change !== undefined && (
                        <div className="mt-2 flex items-center gap-1">
                            {isPositive && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {isNegative && <TrendingDown className="w-4 h-4 text-red-500" />}
                            {isNeutral && <Minus className="w-4 h-4 text-gray-500" />}
                            <span
                                className={cn(
                                    'text-sm font-medium',
                                    isPositive && 'text-green-500',
                                    isNegative && 'text-red-500',
                                    isNeutral && 'text-gray-500'
                                )}
                            >
                                {isPositive && '+'}
                                {change}%
                            </span>
                            {changeLabel && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {changeLabel}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {icon && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

interface StatGridProps {
    children: React.ReactNode;
    columns?: 2 | 3 | 4;
}

export function StatGrid({ children, columns = 4 }: StatGridProps) {
    return (
        <div
            className={cn(
                'grid gap-4',
                columns === 2 && 'grid-cols-1 md:grid-cols-2',
                columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
                columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            )}
        >
            {children}
        </div>
    );
}
