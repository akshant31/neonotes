'use client';

import { Sigma } from 'lucide-react';

interface RollupCellProps {
    value: string | number | null;
    config?: {
        relationColumnId?: string;
        rollupProperty?: string;
        calculation?: string;
    };
}

export function RollupCell({ value, config }: RollupCellProps) {
    const hasConfig = config?.relationColumnId && config?.rollupProperty && config?.calculation;

    const displayValue = value !== null && value !== undefined
        ? String(value)
        : hasConfig ? 'Computing...' : 'Configure rollup';

    return (
        <div className="w-full h-full px-2 py-1 text-sm flex items-center gap-1 min-h-[32px] text-orange-600 dark:text-orange-400">
            <Sigma className="w-3 h-3 flex-shrink-0 opacity-50" />
            <span className="truncate">{displayValue}</span>
        </div>
    );
}
