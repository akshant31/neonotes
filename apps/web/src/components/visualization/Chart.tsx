'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ChartData {
    xAxis?: string[];
    series?: Array<{ name?: string; data: number[] }> | Array<{ name: string; value: number }>;
}

interface ChartProps {
    type: 'line' | 'bar' | 'pie' | 'gauge' | 'radar' | 'scatter';
    data: ChartData;
    className?: string;
    height?: number;
    loading?: boolean;
}

// Skeleton loader component
function ChartSkeleton({ height, type }: { height: number; type: string }) {
    return (
        <div
            className="flex items-center justify-center bg-gray-800/50 rounded-lg animate-pulse"
            style={{ height }}
        >
            <div className="flex flex-col items-center gap-3">
                <div className="flex gap-2">
                    {type === 'pie' ? (
                        <div className="w-24 h-24 rounded-full bg-gray-700/50" />
                    ) : (
                        <>
                            <div className="w-4 h-16 rounded bg-gray-700/50" />
                            <div className="w-4 h-24 rounded bg-gray-700/50" />
                            <div className="w-4 h-12 rounded bg-gray-700/50" />
                            <div className="w-4 h-20 rounded bg-gray-700/50" />
                            <div className="w-4 h-8 rounded bg-gray-700/50" />
                        </>
                    )}
                </div>
                <div className="text-gray-500 text-sm">Loading chart...</div>
            </div>
        </div>
    );
}

export function Chart({
    type,
    data,
    className,
    height = 300,
    loading = false,
}: ChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<any>(null);
    const [echartsLib, setEchartsLib] = useState<any>(null);

    // Load echarts on client
    useEffect(() => {
        import('echarts').then((mod) => {
            setEchartsLib(mod);
        }).catch(err => console.error('Failed to load echarts:', err));
    }, []);

    // Initialize chart when echarts is loaded and ref is ready
    useEffect(() => {
        if (!echartsLib || !chartRef.current) return;

        // Dispose existing instance
        if (chartInstance.current) {
            try {
                chartInstance.current.dispose();
            } catch (e) { }
        }

        try {
            chartInstance.current = echartsLib.init(chartRef.current, 'dark');
            const option = buildOption();
            if (option) {
                chartInstance.current.setOption(option, true);
            }
        } catch (e) {
            console.error('Failed to init chart:', e);
        }

        return () => {
            if (chartInstance.current) {
                try {
                    chartInstance.current.dispose();
                } catch (e) { }
                chartInstance.current = null;
            }
        };
    }, [echartsLib]);

    // Update chart when data changes
    useEffect(() => {
        if (chartInstance.current && echartsLib) {
            try {
                const option = buildOption();
                if (option) {
                    chartInstance.current.setOption(option, true);
                }
            } catch (e) {
                console.error('Failed to update chart:', e);
            }
        }
    }, [data, type, echartsLib]);



    const buildOption = () => {
        const baseOption = {
            backgroundColor: 'transparent',
            textStyle: { color: '#9ca3af' },
            tooltip: { trigger: type === 'pie' ? 'item' : 'axis' },
        };

        switch (type) {
            case 'line':
            case 'bar':
                return {
                    ...baseOption,
                    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                    xAxis: {
                        type: 'category',
                        data: data.xAxis || [],
                        axisLine: { lineStyle: { color: '#374151' } },
                        axisLabel: { color: '#9ca3af' },
                    },
                    yAxis: {
                        type: 'value',
                        axisLine: { lineStyle: { color: '#374151' } },
                        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
                        axisLabel: { color: '#9ca3af' },
                    },
                    series: Array.isArray(data.series) ? data.series.map((s: any, i: number) => ({
                        name: s.name || `Series ${i + 1}`,
                        type: type,
                        data: s.data || [],
                        smooth: type === 'line',
                        areaStyle: type === 'line' ? { opacity: 0.1 } : undefined,
                        itemStyle: {
                            color: i === 0 ? '#6366f1' : '#8b5cf6',
                            borderRadius: type === 'bar' ? [4, 4, 0, 0] : undefined,
                        },
                    })) : [],
                };

            case 'pie':
                return {
                    ...baseOption,
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        textStyle: { color: '#9ca3af' },
                    },
                    series: [{
                        type: 'pie',
                        radius: ['40%', '70%'],
                        center: ['60%', '50%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 8,
                            borderColor: '#111827',
                            borderWidth: 2
                        },
                        label: { show: false },
                        emphasis: {
                            label: { show: true, fontSize: 16, fontWeight: 'bold' }
                        },
                        data: Array.isArray(data.series) ? data.series : [],
                    }],
                    color: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
                };

            default:
                return baseOption;
        }
    };

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (chartInstance.current) {
                chartInstance.current.resize();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!echartsLib || loading) {
        return <ChartSkeleton height={height} type={type} />;
    }

    return (
        <div
            ref={chartRef}
            className={cn('w-full', className)}
            style={{ height }}
        />
    );
}

// Stat components
interface StatCardProps {
    title: string;
    value: string;
    icon?: React.ReactNode;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, icon, change, trend }: StatCardProps) {
    return (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">{title}</span>
                {icon && <div className="text-gray-500">{icon}</div>}
            </div>
            <div className="text-3xl font-bold text-white mb-2">{value}</div>
            {change !== undefined && (
                <div className={cn(
                    'text-sm flex items-center gap-1',
                    trend === 'up' && 'text-green-500',
                    trend === 'down' && 'text-red-500',
                    trend === 'neutral' && 'text-gray-500'
                )}>
                    {trend === 'up' && '↑'}
                    {trend === 'down' && '↓'}
                    {change}% from last week
                </div>
            )}
        </div>
    );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {children}
        </div>
    );
}
