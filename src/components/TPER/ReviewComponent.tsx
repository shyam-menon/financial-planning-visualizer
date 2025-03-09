import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { AssetAllocationPlan } from './PlanComponent';
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
    targetCorpus: number;
    plan: AssetAllocationPlan;
    currentAssets: {
        fixedDeposits: number;
        bonds: number;
        hybridFunds: number;
        stocks: number;
        mutualFunds: number;
    };
}

const formatIndianCurrency = (amount: number): string => {
    const crore = Math.floor(amount / 10000000);
    const lakh = Math.floor((amount % 10000000) / 100000);
    if (crore > 0) {
        return `₹${crore} crore ${lakh > 0 ? `${lakh} lakh` : ''}`;
    }
    return `₹${lakh} lakh`;
};

export const ReviewComponent: React.FC<ReviewComponentProps> = ({
    targetCorpus,
    plan,
    currentAssets
}) => {
    const getTotalAssets = (): number => {
        return Object.values(currentAssets).reduce((sum, value) => sum + value, 0);
    };

    const getCurrentAllocation = () => {
        const total = getTotalAssets();
        return {
            lowRisk: ((currentAssets.fixedDeposits + currentAssets.bonds) / total * 100).toFixed(1),
            moderateRisk: (currentAssets.hybridFunds / total * 100).toFixed(1),
            highRisk: ((currentAssets.stocks + currentAssets.mutualFunds) / total * 100).toFixed(1)
        };
    };

    const expectedReturns = {
        lowRisk: 6, // FD, Bonds (~6%)
        moderateRisk: 10, // Hybrid Funds (~10%)
        highRisk: 12 // Equity (~12%)
    };

    const calculateWeightedReturn = (): number => {
        const allocation = getCurrentAllocation();
        return (
            (parseFloat(allocation.lowRisk) * expectedReturns.lowRisk +
            parseFloat(allocation.moderateRisk) * expectedReturns.moderateRisk +
            parseFloat(allocation.highRisk) * expectedReturns.highRisk) / 100
        );
    };

    // Project portfolio growth for next 10 years
    const projectGrowth = () => {
        const monthlyRate = calculateWeightedReturn() / 1200; // Convert annual % to monthly decimal
        const monthlySavings = plan.monthlySavings;
        const savingsGrowthRate = plan.savingsGrowthRate / 1200; // Monthly growth rate
        
        let currentSavings = monthlySavings;
        let total = getTotalAssets();
        const projections = [total];
        
        for (let month = 1; month <= 120; month++) { // 10 years
            total = total * (1 + monthlyRate) + currentSavings;
            currentSavings *= (1 + savingsGrowthRate);
            if (month % 12 === 0) {
                projections.push(total);
            }
        }
        
        return projections;
    };

    const getProgressStatus = (): { status: string; color: string } => {
        const total = getTotalAssets();
        const progressPercentage = (total / targetCorpus) * 100;
        
        if (progressPercentage >= 90) {
            return { status: 'Excellent', color: '#34d399' };
        } else if (progressPercentage >= 75) {
            return { status: 'Good', color: '#60a5fa' };
        } else if (progressPercentage >= 50) {
            return { status: 'Fair', color: '#fbbf24' };
        } else {
            return { status: 'Needs Attention', color: '#fb7185' };
        }
    };

    const getRecommendations = (): string[] => {
        const recommendations: string[] = [];
        const total = getTotalAssets();
        const progressPercentage = (total / targetCorpus) * 100;
        const currentAllocation = getCurrentAllocation();
        
        if (progressPercentage < 50) {
            recommendations.push('Consider increasing your monthly savings to accelerate wealth creation.');
        }
        
        if (Math.abs(parseFloat(currentAllocation.lowRisk) - plan.lowRisk) > 5) {
            recommendations.push('Your low-risk allocation needs rebalancing to match your target allocation.');
        }
        
        if (Math.abs(parseFloat(currentAllocation.highRisk) - plan.highRisk) > 5) {
            recommendations.push('Your high-risk allocation needs rebalancing to match your target allocation.');
        }
        
        if (plan.savingsGrowthRate < 10) {
            recommendations.push('Consider planning for higher savings growth to keep up with inflation.');
        }
        
        return recommendations;
    };

    const projectedData = projectGrowth();
    const progressStatus = getProgressStatus();
    const recommendations = getRecommendations();

    const chartData = {
        labels: Array.from({ length: 11 }, (_, i) => `Year ${i}`),
        datasets: [
            {
                label: 'Projected Portfolio Value',
                data: projectedData,
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.1
            },
            {
                label: 'Target Corpus',
                data: Array(11).fill(targetCorpus),
                borderColor: 'rgba(99, 102, 241, 0.4)',
                borderDash: [5, 5],
                tension: 0
            }
        ]
    };

    return (
        <div className={styles['review-component']}>
            <h2>Financial Progress Review</h2>

            <div className={styles['progress-summary']}>
                <div className={styles['progress-header']}>
                    <h3>Current Progress</h3>
                    <span 
                        className={styles['progress-status']}
                        style={{ color: progressStatus.color }}
                    >
                        {progressStatus.status}
                    </span>
                </div>

                <div className={styles['summary-stats']}>
                    <div className={styles['stat-item']}>
                        <span>Current Portfolio:</span>
                        <strong>{formatIndianCurrency(getTotalAssets())}</strong>
                    </div>
                    <div className={styles['stat-item']}>
                        <span>Target Corpus:</span>
                        <strong>{formatIndianCurrency(targetCorpus)}</strong>
                    </div>
                    <div className={styles['stat-item']}>
                        <span>Progress:</span>
                        <strong>{((getTotalAssets() / targetCorpus) * 100).toFixed(1)}%</strong>
                    </div>
                    <div className={styles['stat-item']}>
                        <span>Expected Return:</span>
                        <strong>{calculateWeightedReturn().toFixed(1)}%</strong>
                    </div>
                </div>
            </div>

            <div className={styles['chart-container']}>
                <Line 
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: '10-Year Portfolio Projection',
                                color: '#1e293b',
                                font: {
                                    size: 16,
                                    weight: 'bold'
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        const value = context.raw as number;
                                        return `${context.dataset.label}: ${formatIndianCurrency(value)}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                title: {
                                    display: true,
                                    text: 'Portfolio Value (₹)',
                                    color: '#64748b'
                                },
                                ticks: {
                                    callback: (value) => formatIndianCurrency(value as number)
                                }
                            }
                        }
                    }}
                />
            </div>

            <div className={styles['recommendations']}>
                <h3>Recommendations</h3>
                <div className={styles['recommendation-list']}>
                    {recommendations.map((recommendation, index) => (
                        <div key={index} className={styles['recommendation-item']}>
                            <span className={styles['recommendation-icon']}>•</span>
                            <p>{recommendation}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewComponent;
