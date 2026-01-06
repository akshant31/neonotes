'use client';

import { useState, useEffect } from 'react';
import { X, Calculator, Plus, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormulaConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    formula: string;
    columns: { id: string; name: string; type: string }[];
    onSave: (formula: string) => void;
}

const FUNCTIONS = [
    { name: 'if', syntax: 'if(condition, then, else)', desc: 'Conditional logic' },
    { name: 'concat', syntax: 'concat(a, b, ...)', desc: 'Join text values' },
    { name: 'sum', syntax: 'sum(a, b, ...)', desc: 'Add numbers' },
    { name: 'now', syntax: 'now()', desc: 'Current date/time' },
    { name: 'length', syntax: 'length(text)', desc: 'Text length' },
    { name: 'round', syntax: 'round(number, decimals)', desc: 'Round number' },
    { name: 'abs', syntax: 'abs(number)', desc: 'Absolute value' },
    { name: 'min', syntax: 'min(a, b, ...)', desc: 'Minimum value' },
    { name: 'max', syntax: 'max(a, b, ...)', desc: 'Maximum value' },
    { name: 'empty', syntax: 'empty(value)', desc: 'Check if empty' },
];

export function FormulaConfigModal({ isOpen, onClose, formula: initialFormula, columns, onSave }: FormulaConfigModalProps) {
    const [formula, setFormula] = useState(initialFormula || '');
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        setFormula(initialFormula || '');
    }, [initialFormula, isOpen]);

    if (!isOpen) return null;

    const insertColumn = (columnName: string) => {
        setFormula(prev => prev + `prop("${columnName}")`);
    };

    const insertFunction = (funcName: string) => {
        setFormula(prev => prev + `${funcName}()`);
    };

    const handleSave = () => {
        onSave(formula);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[600px] max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Configure Formula</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowHelp(!showHelp)}
                            className={cn("p-1.5 rounded", showHelp ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-gray-100 dark:hover:bg-gray-800")}
                        >
                            <HelpCircle className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {/* Help Panel */}
                    {showHelp && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                            <p className="font-medium text-blue-800 dark:text-blue-300 mb-2">Formula Syntax</p>
                            <ul className="text-blue-700 dark:text-blue-400 space-y-1 text-xs">
                                <li>• Use <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">prop("Column Name")</code> to reference columns</li>
                                <li>• Math operators: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">+ - * /</code></li>
                                <li>• Comparison: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">== != &lt; &gt; &lt;= &gt;=</code></li>
                                <li>• Text: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">concat(a, b)</code></li>
                            </ul>
                        </div>
                    )}

                    {/* Formula Input */}
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Formula</label>
                        <textarea
                            value={formula}
                            onChange={(e) => setFormula(e.target.value)}
                            className="w-full h-24 px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder='prop("Price") * prop("Quantity")'
                        />
                    </div>

                    {/* Column References */}
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Insert Column</label>
                        <div className="flex flex-wrap gap-2">
                            {columns.filter(c => c.type !== 'formula' && c.type !== 'rollup').map((col) => (
                                <button
                                    key={col.id}
                                    onClick={() => insertColumn(col.name)}
                                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded border border-gray-200 dark:border-gray-700"
                                >
                                    {col.name}
                                </button>
                            ))}
                            {columns.length === 0 && (
                                <span className="text-xs text-gray-500">No columns available</span>
                            )}
                        </div>
                    </div>

                    {/* Functions */}
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Functions</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                            {FUNCTIONS.map((func) => (
                                <button
                                    key={func.name}
                                    onClick={() => insertFunction(func.name)}
                                    className="flex items-start gap-2 p-2 text-left text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded border border-gray-200 dark:border-gray-700"
                                >
                                    <Plus className="w-3 h-3 mt-0.5 text-purple-500" />
                                    <div>
                                        <div className="font-mono text-purple-600 dark:text-purple-400">{func.name}()</div>
                                        <div className="text-gray-500">{func.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-lg"
                    >
                        Save Formula
                    </button>
                </div>
            </div>
        </div>
    );
}
