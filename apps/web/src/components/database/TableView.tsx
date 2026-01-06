'use client';

import { useState, useEffect } from 'react';

import { trpc } from '@/utils/trpc';
import type { Database, DatabaseColumn, DatabaseRow, DatabaseCell } from '@prisma/client';
import { Plus } from 'lucide-react';
import { TextCell } from './cells/TextCell';
import { NumberCell } from './cells/NumberCell';
import { CheckboxCell } from './cells/CheckboxCell';
import { DateCell } from './cells/DateCell';
import { SelectCell, getRandomColor } from './cells/SelectCell';
import { RelationCell } from './cells/RelationCell';
import { UrlCell } from './cells/UrlCell';
import { EmailCell } from './cells/EmailCell';
import { PhoneCell } from './cells/PhoneCell';
import { TimestampCell } from './cells/TimestampCell';
import { PersonCell } from './cells/PersonCell';
import { FormulaCell, evaluateFormula } from './cells/FormulaCell';
import { RollupCell } from './cells/RollupCell';
import { ColumnHeader } from './ColumnHeader';
import { FormulaConfigModal } from './FormulaConfigModal';
import { RollupConfigModal } from './RollupConfigModal';

type FullDatabase = Database & {
    columns: DatabaseColumn[];
    rows: (DatabaseRow & { cells: DatabaseCell[] })[];
    views: unknown[];
};

interface TableViewProps {
    database: FullDatabase;
    workspaceId?: string;
}

export function TableView({ database, workspaceId }: TableViewProps) {
    const utils = trpc.useUtils();
    const [colWidths, setColWidths] = useState<Record<string, number>>({});
    const [formulaModalCol, setFormulaModalCol] = useState<DatabaseColumn | null>(null);
    const [rollupModalCol, setRollupModalCol] = useState<DatabaseColumn | null>(null);

    useEffect(() => {
        const widths: Record<string, number> = {};
        database.columns.forEach(col => {
            if (col.width) widths[col.id] = col.width;
        });
        setColWidths(widths);
    }, [database.columns]);

    const addRowMutation = trpc.database.addRow.useMutation({
        onSuccess: () => utils.database.getById.invalidate({ id: database.id }),
    });

    const addColumnMutation = trpc.database.addColumn.useMutation({
        onSuccess: () => utils.database.getById.invalidate({ id: database.id }),
    });

    const updateCellMutation = trpc.database.updateCell.useMutation({
        onSuccess: () => {
            // Invalidate to refresh the UI after cell update
            utils.database.getById.invalidate({ id: database.id });
        },
    });

    const handleCellUpdate = (rowId: string, columnId: string, value: unknown) => {
        updateCellMutation.mutate({ rowId, columnId, value });
    };

    const updateColumnMutation = trpc.database.updateColumn.useMutation({
        onSuccess: () => utils.database.getById.invalidate({ id: database.id }),
    });

    const deleteColumnMutation = trpc.database.deleteColumn.useMutation({
        onSuccess: () => utils.database.getById.invalidate({ id: database.id }),
    });

    const handleColumnUpdate = (columnId: string, updates: Partial<DatabaseColumn>) => {
        updateColumnMutation.mutate({
            id: columnId,
            ...updates
        });
    };

    const handleColumnDelete = (columnId: string) => {
        deleteColumnMutation.mutate({
            id: columnId
        });
    };

    const handleOptionCreate = (column: DatabaseColumn, newLabel: string) => {
        const currentOptions = (column.options as any)?.options || [];
        const newOption = {
            id: crypto.randomUUID(),
            label: newLabel,
            color: getRandomColor(),
        };

        updateColumnMutation.mutate({
            id: column.id,
            options: {
                options: [...currentOptions, newOption]
            }
        });
    };

    const handleAddColumn = () => {
        addColumnMutation.mutate({
            databaseId: database.id,
            name: 'New Column',
            type: 'text',
        });
    };

    const renderCell = (row: DatabaseRow & { cells: DatabaseCell[] }, col: DatabaseColumn) => {
        const cell = row.cells.find((c) => c.columnId === col.id);

        switch (col.type) {
            case 'text':
                return (
                    <TextCell
                        value={cell?.value as string}
                        onUpdate={(val) => handleCellUpdate(row.id, col.id, val)}
                    />
                );
            case 'number':
                return (
                    <NumberCell
                        value={cell?.value as number | null}
                        onUpdate={(val) => handleCellUpdate(row.id, col.id, val)}
                    />
                );
            case 'checkbox':
                return (
                    <CheckboxCell
                        value={cell?.value as boolean | null}
                        onUpdate={(val) => handleCellUpdate(row.id, col.id, val)}
                    />
                );
            case 'date':
                return (
                    <DateCell
                        value={cell?.value as string | null}
                        onUpdate={(val) => handleCellUpdate(row.id, col.id, val)}
                    />
                );
            case 'select':
            case 'multiSelect':
                const options = (col.options as any)?.options || [];
                return (
                    <SelectCell
                        value={cell?.value as string | null}
                        options={options}
                        onUpdate={(val) => handleCellUpdate(row.id, col.id, val)}
                        onCreateOption={(label) => handleOptionCreate(col, label)}
                    />
                );
            case 'relation':
                const relatedDbId = (col.options as any)?.relatedDatabaseId;
                return (
                    <RelationCell
                        value={cell?.value as string[] | null}
                        relatedDatabaseId={relatedDbId || ''}
                        onUpdate={(val) => handleCellUpdate(row.id, col.id, val)}
                    />
                );
            case 'url':
                return (
                    <UrlCell
                        value={cell?.value as string | null}
                        onUpdate={(val) => handleCellUpdate(row.id, col.id, val)}
                    />
                );
            case 'email':
                return (
                    <EmailCell
                        value={cell?.value as string | null}
                        onUpdate={(val) => handleCellUpdate(row.id, col.id, val)}
                    />
                );
            case 'phone':
                return (
                    <PhoneCell
                        value={cell?.value as string | null}
                        onUpdate={(val) => handleCellUpdate(row.id, col.id, val)}
                    />
                );
            case 'createdTime':
                return <TimestampCell value={row.createdAt} type="createdTime" />;
            case 'lastEditedTime':
                return <TimestampCell value={row.updatedAt} type="lastEditedTime" />;
            case 'person':
                return <PersonCell value={cell?.value as string | null} type="person" />;
            case 'createdBy':
                return <PersonCell value="User" type="createdBy" />;
            case 'lastEditedBy':
                return <PersonCell value="User" type="lastEditedBy" />;
            case 'formula': {
                const formula = (col.options as any)?.formula || '';
                const columnsInfo = database.columns.map(c => ({ id: c.id, name: c.name, type: c.type }));
                const computedValue = formula ? evaluateFormula(formula, row, columnsInfo) : null;
                return (
                    <FormulaCell
                        value={cell?.value as string | null}
                        formula={formula}
                        computedValue={computedValue}
                        onConfigClick={() => setFormulaModalCol(col)}
                    />
                );
            }
            case 'rollup': {
                const rollupConfig = (col.options as any) || {};
                return (
                    <RollupCell
                        value={cell?.value as string | number | null}
                        config={rollupConfig}
                    />
                );
            }
            case 'files':
                return (
                    <TextCell
                        value={cell?.value as string || ''}
                        onUpdate={(val) => handleCellUpdate(row.id, col.id, val)}
                    />
                );
            default:
                return (
                    <TextCell
                        value={cell?.value as string}
                        onUpdate={(val) => handleCellUpdate(row.id, col.id, val)}
                    />
                );
        }
    };

    return (
        <div className="w-full overflow-x-auto pb-2">
            <table className="min-w-full border-collapse text-sm">
                <thead>
                    <tr>
                        {database.columns.map((col) => (
                            <th
                                key={col.id}
                                className="bg-gray-50 dark:bg-gray-900 border-y border-r border-gray-200 dark:border-gray-800 px-3 py-2 text-left font-normal min-w-[50px] whitespace-nowrap first:border-l relative group"
                                style={{ width: colWidths[col.id] || 150 }}
                            >
                                <ColumnHeader
                                    column={col}
                                    onUpdate={(updates) => handleColumnUpdate(col.id, updates)}
                                    onDelete={() => handleColumnDelete(col.id)}
                                    workspaceId={workspaceId}
                                    currentDatabaseId={database.id}
                                />
                                <div
                                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        const startX = e.pageX;
                                        const startWidth = colWidths[col.id] || col.width || 150;

                                        const handleMouseMove = (moveEvent: MouseEvent) => {
                                            const newWidth = Math.max(50, startWidth + (moveEvent.pageX - startX));
                                            setColWidths(prev => ({ ...prev, [col.id]: newWidth }));
                                        };

                                        const handleMouseUp = (upEvent: MouseEvent) => {
                                            const newWidth = Math.max(50, startWidth + (upEvent.pageX - startX));
                                            handleColumnUpdate(col.id, { width: newWidth });
                                            document.removeEventListener('mousemove', handleMouseMove);
                                            document.removeEventListener('mouseup', handleMouseUp);
                                        };

                                        document.addEventListener('mousemove', handleMouseMove);
                                        document.addEventListener('mouseup', handleMouseUp);
                                    }}
                                />
                            </th>
                        ))}
                        <th className="bg-gray-50 dark:bg-gray-900 border-y border-r border-gray-200 dark:border-gray-800 w-10 px-1 text-center min-w-[40px]">
                            <button
                                onClick={handleAddColumn}
                                disabled={addColumnMutation.isLoading}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors text-gray-500"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900">
                    {database.rows.map((row) => (
                        <tr key={row.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                            {database.columns.map((col) => (
                                <td
                                    key={`${row.id}-${col.id}`}
                                    className="border-b border-r border-gray-200 dark:border-gray-800 p-0 h-9 first:border-l relative"
                                >
                                    {renderCell(row, col)}
                                </td>
                            ))}
                            <td className="border-b border-r border-gray-200 dark:border-gray-800 p-0"></td>
                        </tr>
                    ))}
                    {/* Add Row Button Row */}
                    <tr>
                        <td
                            colSpan={database.columns.length + 1}
                            className="border-b border-x border-gray-200 dark:border-gray-800 p-1"
                        >
                            <button
                                onClick={() => addRowMutation.mutate({ databaseId: database.id })}
                                disabled={addRowMutation.isLoading}
                                className="flex items-center gap-2 px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm w-full text-left"
                            >
                                <Plus className="w-4 h-4" />
                                New
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Formula Config Modal */}
            <FormulaConfigModal
                isOpen={!!formulaModalCol}
                onClose={() => setFormulaModalCol(null)}
                formula={(formulaModalCol?.options as any)?.formula || ''}
                columns={database.columns.map(c => ({ id: c.id, name: c.name, type: c.type }))}
                onSave={(formula) => {
                    if (formulaModalCol) {
                        handleColumnUpdate(formulaModalCol.id, {
                            options: { ...((formulaModalCol.options as any) || {}), formula }
                        });
                    }
                    setFormulaModalCol(null);
                }}
            />

            {/* Rollup Config Modal */}
            <RollupConfigModal
                isOpen={!!rollupModalCol}
                onClose={() => setRollupModalCol(null)}
                config={(rollupModalCol?.options as any) || {}}
                columns={database.columns.map(c => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    options: c.options as any
                }))}
                onSave={(config) => {
                    if (rollupModalCol) {
                        handleColumnUpdate(rollupModalCol.id, {
                            options: { ...((rollupModalCol.options as any) || {}), ...config }
                        });
                    }
                    setRollupModalCol(null);
                }}
            />
        </div>
    );
}

