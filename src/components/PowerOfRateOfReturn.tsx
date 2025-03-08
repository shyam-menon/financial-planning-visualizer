import React, { useState, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const PowerOfRateOfReturn: React.FC = () => {
    const [startingCapital, setStartingCapital] = useState<number>(1000000);
    const [currentAge, setCurrentAge] = useState<number>(30);
    const [targetAge, setTargetAge] = useState<number>(60);
    const [returnRate, setReturnRate] = useState<number>(12);

    const calculateProjection = useCallback(() => {
        const years = targetAge - currentAge;
        const yearlyData = Array.from({ length: years + 1 }, (_, index) => {
            const age = currentAge + index;
            const netWorth = startingCapital * Math.pow(1 + returnRate / 100, index);
            return {
                age,
                netWorth
            };
        });

        return yearlyData;
    }, [currentAge, targetAge, startingCapital, returnRate]);

    const yearlyData = calculateProjection();
    const finalAmount = yearlyData[yearlyData.length - 1].netWorth;
    const growthMultiple = finalAmount / startingCapital;
    const timePeriod = targetAge - currentAge;

    const formatCurrency = (value: number): string => {
        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(2)} Cr`;
        } else if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)} L`;
        }
        return `₹${value.toFixed(0)}`;
    };

    const chartData: ChartData<'line'> = {
        labels: yearlyData.map(data => data.age),
        datasets: [
            {
                label: 'Net Worth',
                data: yearlyData.map(data => data.netWorth),
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#4f46e5',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#4f46e5',
                pointHoverBorderColor: '#ffffff'
            }
        ]
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#1e293b',
                    font: {
                        size: 14,
                        weight: 500
                    },
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
                displayColors: false,
                callbacks: {
                    label: (context) => {
                        const value = context.parsed.y;
                        return ` Net Worth: ${formatCurrency(value)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Age',
                    color: '#1e293b',
                    font: {
                        size: 14,
                        weight: 600 as const
                    }
                },
                grid: {
                    color: '#e2e8f0'
                },
                ticks: {
                    color: '#1e293b',
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Net Worth (₹)',
                    color: '#1e293b',
                    font: {
                        size: 14,
                        weight: 600 as const
                    }
                },
                grid: {
                    color: '#e2e8f0'
                },
                ticks: {
                    color: '#1e293b',
                    font: {
                        size: 12
                    },
                    callback: (value) => formatCurrency(value as number)
                }
            }
        }
    };

    return (
        <div className="visualization-container" role="region" aria-label="Power of Rate of Return Calculator">
            <h2 className="visualization-title">Power of Rate of Return</h2>
            <p className="visualization-description">
                See how your wealth can grow exponentially through the power of compound returns. 
                A higher rate of return can dramatically impact your long-term wealth.
            </p>

            <div className="input-grid">
                <div className="input-group">
                    <label htmlFor="startingCapital">
                        Starting Capital (₹)
                        <span className="input-value" aria-label={`Current value: ${formatCurrency(startingCapital)}`}>
                            {formatCurrency(startingCapital)}
                        </span>
                    </label>
                    <input
                        type="number"
                        id="startingCapital"
                        value={startingCapital}
                        onChange={(e) => setStartingCapital(Math.max(0, Number(e.target.value)))}
                        min="0"
                        step="100000"
                        aria-label="Enter starting capital amount"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="currentAge">
                        Current Age
                        <span className="input-value" aria-label={`Current value: ${currentAge} years`}>
                            {currentAge} years
                        </span>
                    </label>
                    <input
                        type="range"
                        id="currentAge"
                        min="18"
                        max="80"
                        value={currentAge}
                        onChange={(e) => {
                            const newAge = parseInt(e.target.value);
                            setCurrentAge(newAge);
                            if (newAge >= targetAge) {
                                setTargetAge(newAge + 1);
                            }
                        }}
                        aria-label="Select current age"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="targetAge">
                        Target Age
                        <span className="input-value" aria-label={`Current value: ${targetAge} years`}>
                            {targetAge} years
                        </span>
                    </label>
                    <input
                        type="range"
                        id="targetAge"
                        min={currentAge + 1}
                        max="90"
                        value={targetAge}
                        onChange={(e) => setTargetAge(parseInt(e.target.value))}
                        aria-label="Select target age"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="returnRate">
                        Annual Return Rate
                        <span className="input-value" aria-label={`Current value: ${returnRate}%`}>
                            {returnRate}%
                        </span>
                    </label>
                    <input
                        type="range"
                        id="returnRate"
                        min="1"
                        max="30"
                        value={returnRate}
                        onChange={(e) => setReturnRate(parseInt(e.target.value))}
                        aria-label="Select annual return rate"
                    />
                </div>
            </div>

            <div className="chart-container" role="img" aria-label="Line chart showing net worth growth over time">
                <div className="chart-wrapper" style={{ height: '400px' }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            <div className="results-grid" role="region" aria-label="Calculation Results">
                <div className="result-card">
                    <h3>Final Amount</h3>
                    <div className="result-value" aria-label={`Final amount: ${formatCurrency(finalAmount)}`}>
                        {formatCurrency(finalAmount)}
                    </div>
                </div>
                <div className="result-card">
                    <h3>Growth Multiple</h3>
                    <div className="result-value" aria-label={`Growth multiple: ${growthMultiple.toFixed(1)} times`}>
                        {growthMultiple.toFixed(1)}x
                    </div>
                </div>
                <div className="result-card">
                    <h3>Time Period</h3>
                    <div className="result-value" aria-label={`Time period: ${timePeriod} years`}>
                        {timePeriod} years
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PowerOfRateOfReturn;
