'use client';

import { Calculator, Settings } from 'lucide-react';

interface FormulaCellProps {
    value: string | number | null;
    formula?: string;
    computedValue?: string | number | null;
    onConfigClick?: () => void;
}

export function FormulaCell({ value, formula, computedValue, onConfigClick }: FormulaCellProps) {
    // Display computed value if available, otherwise the stored value
    const displayValue = computedValue ?? value;
    const hasFormula = !!formula;

    return (
        <div
            className="w-full h-full px-2 py-1 text-sm flex items-center gap-1 min-h-[32px] text-purple-600 dark:text-purple-400 group cursor-pointer"
            onClick={onConfigClick}
        >
            <Calculator className="w-3 h-3 flex-shrink-0 opacity-50" />
            <span className="truncate flex-1">
                {displayValue !== null && displayValue !== undefined
                    ? String(displayValue)
                    : hasFormula ? 'Computing...' : 'Click to configure'}
            </span>
            {onConfigClick && (
                <Settings className="w-3 h-3 opacity-0 group-hover:opacity-50 flex-shrink-0" />
            )}
        </div>
    );
}

// Simple formula evaluator
export function evaluateFormula(
    formula: string,
    row: { cells: { columnId: string; value: unknown }[] },
    columns: { id: string; name: string; type: string }[]
): string | number | null {
    if (!formula) return null;

    try {
        // Replace prop("ColumnName") with actual values
        let expression = formula.replace(/prop\s*\(\s*["']([^"']+)["']\s*\)/g, (_, colName) => {
            const col = columns.find(c => c.name === colName);
            if (!col) return '0';
            const cell = row.cells.find(c => c.columnId === col.id);
            const val = cell?.value;
            if (val === null || val === undefined) return '0';
            if (typeof val === 'number') return String(val);
            if (typeof val === 'string') {
                // If it's a number string, return it, else wrap in quotes
                const num = parseFloat(val);
                if (!isNaN(num)) return String(num);
                return `"${val}"`;
            }
            return '0';
        });

        // Handle simple math and functions
        // For safety, only allow basic operations
        expression = expression
            .replace(/concat\s*\(/g, '(function(...args){return args.join("")})(')
            .replace(/length\s*\(/g, '(function(s){return s?s.length:0})(')
            .replace(/abs\s*\(/g, 'Math.abs(')
            .replace(/round\s*\(/g, 'Math.round(')
            .replace(/min\s*\(/g, 'Math.min(')
            .replace(/max\s*\(/g, 'Math.max(')
            .replace(/now\s*\(\s*\)/g, `"${new Date().toLocaleDateString()}"`);

        // Handle if(condition, then, else)
        expression = expression.replace(
            /if\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/g,
            '(($1) ? ($2) : ($3))'
        );

        // Evaluate (with safety limits)
        // eslint-disable-next-line no-new-func
        const result = new Function(`return ${expression}`)();
        return result;
    } catch (e) {
        console.error('Formula evaluation error:', e);
        return 'Error';
    }
}

