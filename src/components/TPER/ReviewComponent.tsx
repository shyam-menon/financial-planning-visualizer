import React, { useState, useEffect } from 'react';
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
import { AssetAllocation } from './PlanComponent';
import styles from './TPER.module.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface ReviewComponentProps {
    plan: {
        targetCorpus: number;
        monthlySavings: number;
        timeHorizon: number;
        allocation: {
            lowRisk: number;
            moderateRisk: number;
            highRisk: number;
        };
        savingsGrowthRate: number;
    };
    currentAssets: {
        fixedDeposits: number;
        bonds: number;
        mutualFunds: number;
        stocks: number;
        gold: number;
        reits: number;
        currentNetWorth: number;
    };
}

export const ReviewComponent: React.FC<ReviewComponentProps> = ({
    plan,
    currentAssets
}) => {
    const [historicalData, setHistoricalData] = useState<{
        date: Date;
        value: number;
    }[]>([]);

    const formatIndianCurrency = (amount: number): string => {
        const crore = Math.floor(amount / 10000000);
        const lakh = Math.floor((amount % 10000000) / 100000);
        const croreStr = crore > 0 ? `${crore.toString()} crore` : '';
        const lakhStr = lakh > 0 ? `${lakh.toString()} lakh` : '';
        
        if (crore > 0) {
            return `₹${croreStr}${lakh > 0 ? ` ${lakhStr}` : ''}`;
        }
        return `₹${lakhStr || '0'}`;
    };

    useEffect(() => {
        // Generate historical data starting from current net worth
        const generateHistoricalData = () => {
            const data = [];
            let currentValue = currentAssets.currentNetWorth;
            const monthlyReturn = plan.savingsGrowthRate / 12 / 100;
            const monthlySavings = plan.monthlySavings;

            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                data.push({
                    date,
                    value: currentValue
                });
                // Project forward considering both returns and monthly savings
                currentValue = (currentValue * (1 + monthlyReturn)) + monthlySavings;
            }
            return data;
        };

        setHistoricalData(generateHistoricalData());
    }, [plan, currentAssets]);

    const getTotalAssets = (): number => {
        // Include all investments plus current net worth
        const { currentNetWorth, ...investments } = currentAssets;
        const totalInvestments = Object.values(investments).reduce((sum, value) => sum + value, 0);
        return totalInvestments + currentNetWorth;
    };

    const getCurrentAllocation = () => {
        const { currentNetWorth, ...investments } = currentAssets;
        const totalInvestments = Object.values(investments).reduce((sum, value) => sum + value, 0);
        if (totalInvestments === 0) return { lowRisk: "0", moderateRisk: "0", highRisk: "0" };

        return {
            lowRisk: ((currentAssets.fixedDeposits + currentAssets.bonds) / totalInvestments * 100).toFixed(1),
            moderateRisk: ((currentAssets.mutualFunds + currentAssets.gold) / totalInvestments * 100).toFixed(1),
            highRisk: ((currentAssets.stocks + currentAssets.reits) / totalInvestments * 100).toFixed(1)
        };
    };

    const analyzePlanExecution = () => {
        const total = getTotalAssets();
        const monthsSinceStart = historicalData.length;
        
        // Calculate expected growth based on current net worth and monthly savings
        const expectedSavings = (plan.monthlySavings * monthsSinceStart) + currentAssets.currentNetWorth;
        const expectedGrowth = expectedSavings * (1 + (plan.savingsGrowthRate / 12 / 100) * monthsSinceStart);
        
        // Compare actual vs expected
        const executionRatio = total / expectedGrowth;
        
        return {
            actual: total,
            expected: expectedGrowth,
            ratio: executionRatio,
            monthlySavingsStatus: total >= expectedSavings ? 'ahead' : 'behind',
            savingsShortfall: Math.max(0, expectedSavings - total)
        };
    };

    const getProgressStatus = () => {
        const total = getTotalAssets();
        const progressPercentage = (total / plan.targetCorpus) * 100;
        const execution = analyzePlanExecution();
        
        if (execution.ratio >= 1.1) {
            return {
                status: 'Excellent',
                message: `Congratulations! At ₹${formatIndianCurrency(total)}, you are ahead of your investment plan. Your disciplined approach is paying off.`,
                color: '#10b981'
            };
        } else if (execution.ratio >= 0.95) {
            return {
                status: 'On Track',
                message: `You are staying the course with your investment plan. Current net worth: ₹${formatIndianCurrency(total)}`,
                color: '#3b82f6'
            };
        } else if (execution.ratio >= 0.8) {
            return {
                status: 'Slightly Behind',
                message: `At ₹${formatIndianCurrency(total)}, you are slightly behind your plan. Consider increasing your monthly investment by ₹${Math.ceil(execution.savingsShortfall / 6000) * 1000} to catch up.`,
                color: '#f59e0b'
            };
        } else {
            return {
                status: 'Needs Attention',
                message: `Current net worth of ₹${formatIndianCurrency(total)} is significantly behind the plan. To catch up:\n1. Increase monthly savings by ₹${Math.ceil(execution.savingsShortfall / 6000) * 1000}\n2. Review your asset allocation\n3. Consider additional income sources`,
                color: '#ef4444'
            };
        }
    };

    const getAllocationDeviation = () => {
        const current = getCurrentAllocation();
        return {
            lowRisk: (parseFloat(current.lowRisk) - plan.allocation.lowRisk).toFixed(1),
            moderateRisk: (parseFloat(current.moderateRisk) - plan.allocation.moderateRisk).toFixed(1),
            highRisk: (parseFloat(current.highRisk) - plan.allocation.highRisk).toFixed(1)
        };
    };

    const getRecommendations = () => {
        const recommendations = [];
        const deviation = getAllocationDeviation();
        const execution = analyzePlanExecution();

        // Check monthly savings adherence
        if (execution.ratio < 0.95) {
            recommendations.push({
                type: 'Monthly Savings',
                message: `You need to increase your monthly investment by ₹${Math.ceil(execution.savingsShortfall / 6000) * 1000} to stay on track`,
                priority: 'High'
            });
        }

        // Check asset allocation
        if (Math.abs(parseFloat(deviation.lowRisk)) > 5) {
            const action = parseFloat(deviation.lowRisk) > 0 ? 'Decrease' : 'Increase';
            recommendations.push({
                type: 'Low Risk Assets',
                message: `${action} FDs and bonds by ₹${formatIndianCurrency(Math.abs(parseFloat(deviation.lowRisk)) * getTotalAssets() / 100)}`,
                priority: 'Medium'
            });
        }

        if (Math.abs(parseFloat(deviation.moderateRisk)) > 5) {
            const action = parseFloat(deviation.moderateRisk) > 0 ? 'Decrease' : 'Increase';
            recommendations.push({
                type: 'Moderate Risk Assets',
                message: `${action} mutual funds and gold by ₹${formatIndianCurrency(Math.abs(parseFloat(deviation.moderateRisk)) * getTotalAssets() / 100)}`,
                priority: 'Medium'
            });
        }

        if (Math.abs(parseFloat(deviation.highRisk)) > 5) {
            const action = parseFloat(deviation.highRisk) > 0 ? 'Decrease' : 'Increase';
            recommendations.push({
                type: 'High Risk Assets',
                message: `${action} stocks and REITs by ₹${formatIndianCurrency(Math.abs(parseFloat(deviation.highRisk)) * getTotalAssets() / 100)}`,
                priority: 'Medium'
            });
        }

        return recommendations;
    };

    const totalAssets = getTotalAssets();
    const currentAllocation = getCurrentAllocation();
    const progressStatus = getProgressStatus();
    const recommendations = getRecommendations();
    const execution = analyzePlanExecution();

    const chartData = {
        labels: historicalData.map(d => d.date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })),
        datasets: [
            {
                label: 'Actual Portfolio Value',
                data: historicalData.map(d => d.value),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Expected Portfolio Value',
                data: historicalData.map((_, index) => {
                    const months = index + 1;
                    return currentAssets.currentNetWorth + 
                           (plan.monthlySavings * months * (1 + (plan.savingsGrowthRate / 12 / 100) * months));
                }),
                borderColor: '#9ca3af',
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
            }
        ]
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: '12-Month Portfolio Performance',
                font: {
                    size: 16,
                    weight: 'bold' as const
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => `Value: ${formatIndianCurrency(context.raw as number)}`
                }
            }
        },
        scales: {
            y: {
                type: 'linear' as const,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Portfolio Value (₹)'
                },
                ticks: {
                    callback: function(value) {
                        return formatIndianCurrency(value as number);
                    }
                }
            }
        }
    };

    return (
        <div className={styles['review-component']}>
            <h2>Review Your Progress</h2>

            <div className={styles['progress-status']} style={{ borderColor: progressStatus.color }}>
                <div className={styles['status-header']}>
                    <h3>Progress Status: <span style={{ color: progressStatus.color }}>{progressStatus.status}</span></h3>
                    <div className={styles['progress-percentage']}>
                        {((totalAssets / plan.targetCorpus) * 100).toFixed(1)}%
                    </div>
                </div>
                <p>{progressStatus.message}</p>
            </div>

            <div className={styles['review-grid']}>
                <div className={styles['chart-container']}>
                    <Line data={chartData} options={chartOptions} />
                </div>

                <div className={styles['summary-container']}>
                    <div className={styles['summary-section']}>
                        <h3>Portfolio Summary</h3>
                        <div className={styles['summary-stats']}>
                            <div className={styles['stat-item']}>
                                <span>Current Value</span>
                                <strong>{formatIndianCurrency(totalAssets)}</strong>
                            </div>
                            <div className={styles['stat-item']}>
                                <span>Target Corpus</span>
                                <strong>{formatIndianCurrency(plan.targetCorpus)}</strong>
                            </div>
                            <div className={styles['stat-item']}>
                                <span>Monthly Investment</span>
                                <strong>{formatIndianCurrency(plan.monthlySavings)}</strong>
                            </div>
                        </div>
                    </div>

                    <div className={styles['allocation-section']}>
                        <h3>Current Allocation</h3>
                        <div className={styles['allocation-stats']}>
                            <div className={styles['allocation-item']}>
                                <span>Low Risk</span>
                                <div className={styles['allocation-bar']}>
                                    <div 
                                        className={styles['allocation-fill']}
                                        style={{ width: `${String(currentAllocation.lowRisk)}%`, backgroundColor: '#60a5fa' }}
                                    />
                                </div>
                                <strong>{currentAllocation.lowRisk}%</strong>
                            </div>
                            <div className={styles['allocation-item']}>
                                <span>Moderate Risk</span>
                                <div className={styles['allocation-bar']}>
                                    <div 
                                        className={styles['allocation-fill']}
                                        style={{ width: `${String(currentAllocation.moderateRisk)}%`, backgroundColor: '#fbbf24' }}
                                    />
                                </div>
                                <strong>{currentAllocation.moderateRisk}%</strong>
                            </div>
                            <div className={styles['allocation-item']}>
                                <span>High Risk</span>
                                <div className={styles['allocation-bar']}>
                                    <div 
                                        className={styles['allocation-fill']}
                                        style={{ width: `${String(currentAllocation.highRisk)}%`, backgroundColor: '#f43f5e' }}
                                    />
                                </div>
                                <strong>{currentAllocation.highRisk}%</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {recommendations.length > 0 && (
                <div className={styles['recommendations']}>
                    <h3>Recommendations</h3>
                    <div className={styles['recommendations-list']}>
                        {recommendations.map((rec, index) => (
                            <div 
                                key={index} 
                                className={`${styles['recommendation-item']} ${styles[`priority-${rec.priority.toLowerCase()}`]}`}
                            >
                                <div className={styles['recommendation-type']}>{rec.type}</div>
                                <div className={styles['recommendation-message']}>{rec.message}</div>
                                <div className={styles['recommendation-priority']}>{rec.priority}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewComponent;
