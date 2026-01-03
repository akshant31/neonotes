'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption, ECharts } from 'echarts';
import { cn } from '@/lib/utils';

interface ChartProps {
    option: EChartsOption;
    className?: string;
    style?: React.CSSProperties;
    theme?: 'light' | 'dark';
    loading?: boolean;
    onChartReady?: (chart: ECharts) => void;
}

export function Chart({
    option,
    className,
    style,
    theme = 'dark',
    loading = false,
    onChartReady,
}: ChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<ECharts | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        // Initialize chart
        chartInstance.current = echarts.init(chartRef.current, theme);

        if (onChartReady) {
            onChartReady(chartInstance.current);
        }

        // Handle resize
        const handleResize = () => {
            chartInstance.current?.resize();
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            chartInstance.current?.dispose();
        };
    }, [theme, onChartReady]);

    // Update options
    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.setOption(option, true);
        }
    }, [option]);

    // Handle loading state
    useEffect(() => {
        if (chartInstance.current) {
            if (loading) {
                chartInstance.current.showLoading('default', {
                    text: 'Loading...',
                    color: '#6366f1',
                    maskColor: 'rgba(0, 0, 0, 0.1)',
                });
            } else {
                chartInstance.current.hideLoading();
            }
        }
    }, [loading]);

    return (
        <div
            ref={chartRef}
            className={cn('w-full h-full min-h-[300px]', className)}
            style={style}
        />
    );
}

// Pre-built chart configurations
export const chartPresets = {
    line: (data: { x: string[]; y: number[]; name?: string }): EChartsOption => ({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: data.x, boundaryGap: false },
        yAxis: { type: 'value' },
        series: [{
            name: data.name || 'Value',
            type: 'line',
            data: data.y,
            smooth: true,
            areaStyle: {
                opacity: 0.3,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(99, 102, 241, 0.5)' },
                    { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
                ])
            },
            lineStyle: { width: 3, color: '#6366f1' },
            itemStyle: { color: '#6366f1' },
        }],
    }),

    bar: (data: { categories: string[]; values: number[]; name?: string }): EChartsOption => ({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: data.categories },
        yAxis: { type: 'value' },
        series: [{
            name: data.name || 'Value',
            type: 'bar',
            data: data.values,
            itemStyle: {
                borderRadius: [4, 4, 0, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#6366f1' },
                    { offset: 1, color: '#8b5cf6' }
                ])
            },
        }],
    }),

    pie: (data: { name: string; value: number }[]): EChartsOption => ({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#1f2937', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: {
                label: { show: true, fontSize: 20, fontWeight: 'bold' }
            },
            data: data,
        }],
    }),

    gauge: (value: number, max: number = 100, name: string = 'Progress'): EChartsOption => ({
        series: [{
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: max,
            splitNumber: 5,
            axisLine: {
                lineStyle: {
                    width: 20,
                    color: [
                        [0.3, '#ef4444'],
                        [0.7, '#f59e0b'],
                        [1, '#22c55e']
                    ]
                }
            },
            pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '50%', width: 8 },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            detail: {
                fontSize: 24,
                offsetCenter: [0, '60%'],
                formatter: value.toString(),
            },
            title: {
                offsetCenter: [0, '90%'],
                fontSize: 14,
            },
            data: [{ value: value, name: name }]
        }]
    }),

    radar: (data: { indicator: { name: string; max: number }[]; values: number[] }): EChartsOption => ({
        radar: {
            indicator: data.indicator,
            shape: 'polygon',
            splitNumber: 5,
        },
        series: [{
            type: 'radar',
            data: [{
                value: data.values,
                areaStyle: { opacity: 0.3 },
            }],
        }],
    }),

    heatmap: (data: { x: string[]; y: string[]; values: [number, number, number][] }): EChartsOption => ({
        tooltip: { position: 'top' },
        grid: { height: '50%', top: '10%' },
        xAxis: { type: 'category', data: data.x, splitArea: { show: true } },
        yAxis: { type: 'category', data: data.y, splitArea: { show: true } },
        visualMap: {
            min: 0,
            max: 10,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '15%',
        },
        series: [{
            type: 'heatmap',
            data: data.values,
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
        }],
    }),

    scatter: (data: [number, number][]): EChartsOption => ({
        xAxis: {},
        yAxis: {},
        series: [{
            type: 'scatter',
            data: data,
            symbolSize: 10,
            itemStyle: { color: '#6366f1' },
        }],
    }),

    treemap: (data: { name: string; value: number; children?: { name: string; value: number }[] }[]): EChartsOption => ({
        series: [{
            type: 'treemap',
            data: data,
            roam: false,
            label: { show: true, formatter: '{b}' },
        }],
    }),
};
