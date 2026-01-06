'use client';

import { useState, useRef, useEffect } from 'react';
import { Calculator } from 'lucide-react';

interface FormulaCellProps {
    value: string | null;
    formula?: string;
    onUpdate?: (value: string) => void;
}

export function FormulaCell({ value, formula }: FormulaCellProps) {
    // Formula cells are read-only - they display computed values
    // The formula configuration would be in column options

    return (
        <div className="w-full h-full px-2 py-1 text-sm flex items-center gap-1 min-h-[32px] text-purple-600 dark:text-purple-400">
            <Calculator className="w-3 h-3 flex-shrink-0 opacity-50" />
            <span className="truncate">
                {value ?? (formula ? 'Computing...' : 'No formula')}
            </span>
        </div>
    );
}
