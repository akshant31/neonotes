'use client';

import { useState, useEffect } from 'react';
import { Chart } from '@/components/visualization/Chart';
import { cn } from '@/lib/utils';
import { Settings, BarChart2, LineChart, PieChart, X, Check, Database } from 'lucide-react';

interface ChartBlockProps {
    chartType: 'line' | 'bar' | 'pie';
    chartData?: {
        xAxis?: string[];
        series?: Array<{ name?: string; data: number[] }> | Array<{ name: string; value: number }>;
    };
    title?: string;
    onUpdate: (attrs: Record<string, unknown>) => void;
}

const CHART_TYPES = [
    { type: 'line', icon: LineChart, label: 'Line Chart' },
    { type: 'bar', icon: BarChart2, label: 'Bar Chart' },
    { type: 'pie', icon: PieChart, label: 'Pie Chart' },
] as const;

// Sample data for different chart types
const SAMPLE_DATA: Record<'line' | 'bar' | 'pie', ChartBlockProps['chartData']> = {
    line: {
        xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [{ name: 'Series 1', data: [150, 230, 224, 218, 135, 147] }],
    },
    bar: {
        xAxis: ['Category A', 'Category B', 'Category C', 'Category D'],
        series: [{ name: 'Values', data: [43, 53, 32, 62] }],
    },
    pie: {
        series: [
            { name: 'Item A', value: 335 },
            { name: 'Item B', value: 310 },
            { name: 'Item C', value: 234 },
            { name: 'Item D', value: 135 },
        ],
    },
};

export function ChartBlock({ chartType, chartData, title, onUpdate }: ChartBlockProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempType, setTempType] = useState<'line' | 'bar' | 'pie'>(chartType);
    const [tempTitle, setTempTitle] = useState(title || '');

    // Sync internal state with props when they change (from TipTap)
    useEffect(() => {
        setTempType(chartType);
    }, [chartType]);

    useEffect(() => {
        setTempTitle(title || '');
    }, [title]);

    // Use provided data or sample data based on CURRENT chart type
    const data = chartData || SAMPLE_DATA[chartType];

    const handleSave = () => {
        const newType = tempType;
        const newTitle = tempTitle;
        const newData = SAMPLE_DATA[newType];

        // Update TipTap node attributes
        onUpdate({
            chartType: newType,
            title: newTitle,
            chartData: newData,
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempType(chartType);
        setTempTitle(title || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="border border-indigo-500 rounded-xl p-4 bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-300">Configure Chart</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleSave}
                            className="p-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Title input */}
                <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-1 block">Chart Title</label>
                    <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        placeholder="Enter chart title..."
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                </div>

                {/* Chart type selector */}
                <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">Chart Type</label>
                    <div className="flex gap-2">
                        {CHART_TYPES.map(({ type, icon: Icon, label }) => (
                            <button
                                key={type}
                                onClick={() => setTempType(type)}
                                className={cn(
                                    'flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors',
                                    tempType === type
                                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                        : 'border-gray-700 hover:border-gray-600 text-gray-400'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-xs">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data source info */}
                <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">Data Source</label>
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Database className="w-4 h-4" />
                            <span>Using sample data</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Tip: Create an inline database on this page to use real data
                        </p>
                    </div>
                </div>

                {/* Preview */}
                <div className="mt-4">
                    <label className="text-xs text-gray-400 mb-2 block">Preview</label>
                    <Chart
                        type={tempType}
                        data={SAMPLE_DATA[tempType]!}
                        height={200}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="group relative border border-gray-700 rounded-xl p-4 bg-gray-900/50 hover:border-gray-600 transition-colors">
            {/* Edit button */}
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-2 right-2 p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <Settings className="w-4 h-4 text-gray-400" />
            </button>

            {/* Title */}
            {title && (
                <h4 className="text-sm font-medium text-gray-300 mb-2">{title}</h4>
            )}

            {/* Chart */}
            <Chart type={chartType} data={data || SAMPLE_DATA[chartType]!} height={250} />
        </div>
    );
}
