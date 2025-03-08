import React, { useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface Dataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
    borderDash?: number[];
    order?: number;
}

interface FinancialChartProps {
    title: string;
    labels: (string | number)[];
    datasets: Dataset[];
    yAxisLabel: string;
    xAxisLabel: string;
    useLogScale?: boolean;
}

const FinancialChart: React.FC<FinancialChartProps> = ({
    title,
    labels,
    datasets,
    yAxisLabel,
    xAxisLabel,
    useLogScale = false
}) => {
    const chartRef = useRef<ChartJSOrUndefined<"line">>(null);

    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, []);

    const formatCurrency = (value: number) => {
        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(2)} Cr`;
        } else if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)} L`;
        }
        return `₹${Math.round(value).toLocaleString('en-IN')}`;
    };

    const defaultOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#1e293b',
                    font: {
                        size: 12,
                        weight: 500
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1e293b',
                bodyColor: '#1e293b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: '#e2e8f0',
                    tickColor: '#e2e8f0'
                },
                ticks: {
                    color: '#1e293b',
                    font: {
                        size: 12,
                        weight: 500
                    }
                },
                title: {
                    display: true,
                    text: xAxisLabel,
                    color: '#1e293b',
                    font: {
                        size: 14,
                        weight: 600
                    }
                }
            },
            y: {
                type: useLogScale ? 'logarithmic' : 'linear',
                grid: {
                    color: '#e2e8f0',
                    tickColor: '#e2e8f0'
                },
                ticks: {
                    color: '#1e293b',
                    font: {
                        size: 12,
                        weight: 500
                    },
                    callback: function(value) {
                        return formatCurrency(value as number);
                    }
                },
                title: {
                    display: true,
                    text: yAxisLabel,
                    color: '#1e293b',
                    font: {
                        size: 14,
                        weight: 600
                    }
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
            axis: 'x'
        },
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 2,
                fill: false,
                capBezierPoints: true
            },
            point: {
                radius: 2,
                hoverRadius: 4,
                borderWidth: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                hoverBackgroundColor: 'rgba(255, 255, 255, 1)',
                hitRadius: 6
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        },
        layout: {
            padding: {
                top: 4,
                right: 8,
                bottom: 4,
                left: 8
            }
        }
    };

    const stringLabels = labels.map(label => label.toString());

    const data: ChartData<'line'> = {
        labels: stringLabels,
        datasets
    };

    return (
        <div className="chart-container">
            <Line 
                ref={chartRef}
                options={defaultOptions} 
                data={data}
            />
        </div>
    );
};

export default FinancialChart;
