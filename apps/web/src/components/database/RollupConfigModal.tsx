'use client';

import { useState, useEffect } from 'react';
import { X, Sigma, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';

interface RollupConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: {
        relationColumnId?: string;
        rollupProperty?: string;
        calculation?: string;
    };
    columns: { id: string; name: string; type: string; options?: any }[];
    onSave: (config: { relationColumnId: string; rollupProperty: string; calculation: string }) => void;
}

const CALCULATIONS = [
    { value: 'count', label: 'Count all', desc: 'Count linked items' },
    { value: 'countValues', label: 'Count values', desc: 'Count non-empty values' },
    { value: 'countUnique', label: 'Count unique', desc: 'Count unique values' },
    { value: 'sum', label: 'Sum', desc: 'Add all numbers' },
    { value: 'average', label: 'Average', desc: 'Calculate average' },
    { value: 'min', label: 'Min', desc: 'Find minimum' },
    { value: 'max', label: 'Max', desc: 'Find maximum' },
    { value: 'showOriginal', label: 'Show original', desc: 'Display all values' },
];

export function RollupConfigModal({ isOpen, onClose, config: initialConfig, columns, onSave }: RollupConfigModalProps) {
    const [step, setStep] = useState(1);
    const [relationColumnId, setRelationColumnId] = useState(initialConfig?.relationColumnId || '');
    const [rollupProperty, setRollupProperty] = useState(initialConfig?.rollupProperty || '');
    const [calculation, setCalculation] = useState(initialConfig?.calculation || 'count');

    // Get relation columns from the current database
    const relationColumns = columns.filter(c => c.type === 'relation');

    // Get the selected relation column
    const selectedRelation = relationColumns.find(c => c.id === relationColumnId);
    const relatedDatabaseId = selectedRelation?.options?.relatedDatabaseId;

    // Fetch columns from the related database
    const { data: relatedDatabase } = trpc.database.getById.useQuery(
        { id: relatedDatabaseId || '' },
        { enabled: !!relatedDatabaseId && isOpen }
    );

    const relatedColumns = relatedDatabase?.columns || [];

    useEffect(() => {
        if (isOpen) {
            setRelationColumnId(initialConfig?.relationColumnId || '');
            setRollupProperty(initialConfig?.rollupProperty || '');
            setCalculation(initialConfig?.calculation || 'count');
            setStep(1);
        }
    }, [isOpen, initialConfig]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (relationColumnId && rollupProperty && calculation) {
            onSave({ relationColumnId, rollupProperty, calculation });
            onClose();
        }
    };

    const canProceed = step === 1 ? !!relationColumnId : step === 2 ? !!rollupProperty : true;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[500px] max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Sigma className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Configure Rollup</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium",
                                step >= s ? "bg-orange-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                            )}>
                                {s}
                            </div>
                            {s < 3 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
                        </div>
                    ))}
                    <div className="ml-4 text-sm text-gray-500">
                        {step === 1 && 'Select relation'}
                        {step === 2 && 'Select property'}
                        {step === 3 && 'Select calculation'}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[50vh] overflow-y-auto">
                    {step === 1 && (
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Choose which relation column to aggregate from:
                            </p>
                            {relationColumns.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Sigma className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No relation columns found</p>
                                    <p className="text-xs mt-1">Add a Relation column first to use Rollup</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {relationColumns.map((col) => (
                                        <button
                                            key={col.id}
                                            onClick={() => setRelationColumnId(col.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors",
                                                relationColumnId === col.id
                                                    ? "bg-orange-50 dark:bg-orange-900/30 border-2 border-orange-500"
                                                    : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent"
                                            )}
                                        >
                                            <span className="font-medium">{col.name}</span>
                                            <span className="text-xs text-gray-500">
                                                → {(col.options as any)?.relatedDatabaseName || 'Database'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Choose which property to aggregate:
                            </p>
                            <div className="space-y-2">
                                {relatedColumns.map((col: any) => (
                                    <button
                                        key={col.id}
                                        onClick={() => setRollupProperty(col.name)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors",
                                            rollupProperty === col.name
                                                ? "bg-orange-50 dark:bg-orange-900/30 border-2 border-orange-500"
                                                : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent"
                                        )}
                                    >
                                        <span className="font-medium">{col.name}</span>
                                        <span className="text-xs text-gray-500 capitalize">{col.type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Choose how to calculate:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {CALCULATIONS.map((calc) => (
                                    <button
                                        key={calc.value}
                                        onClick={() => setCalculation(calc.value)}
                                        className={cn(
                                            "flex flex-col items-start p-3 rounded-lg text-left transition-colors",
                                            calculation === calc.value
                                                ? "bg-orange-50 dark:bg-orange-900/30 border-2 border-orange-500"
                                                : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent"
                                        )}
                                    >
                                        <span className="font-medium text-sm">{calc.label}</span>
                                        <span className="text-xs text-gray-500">{calc.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </button>
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed}
                            className="px-4 py-2 text-sm bg-orange-500 text-white hover:bg-orange-600 rounded-lg disabled:opacity-50"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={!canProceed}
                            className="px-4 py-2 text-sm bg-orange-500 text-white hover:bg-orange-600 rounded-lg disabled:opacity-50"
                        >
                            Save Rollup
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
