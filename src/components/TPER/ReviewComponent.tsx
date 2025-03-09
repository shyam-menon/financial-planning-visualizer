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

interface PortfolioAssets {
    fixedDeposits: number;
    bonds: number;
    mutualFunds: number;
    stocks: number;
    gold: number;
    reits: number;
    currentNetWorth: number;
    monthlyInvestments: {
        fixedDeposits: number;
        bonds: number;
        mutualFunds: number;
        stocks: number;
        gold: number;
        reits: number;
        total: number;
    };
}

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
    currentAssets: PortfolioAssets;
    executionStatus?: {
        isOnTrack: boolean;
        message: string;
        progress: number;
    };
    currentAge: number;
    retirementAge: number;
}

export const ReviewComponent: React.FC<ReviewComponentProps> = ({
    plan,
    currentAssets,
    executionStatus,
    currentAge,
    retirementAge
}) => {
    const [historicalData, setHistoricalData] = useState<{
        date: Date;
        value: number;
    }[]>([]);

    const formatIndianCurrency = (value: number): string => {
        const crore = 10000000;
        const lakh = 100000;

        if (value >= crore) {
            return `${(value / crore).toFixed(2)} Cr`;
        } else if (value >= lakh) {
            return `${(value / lakh).toFixed(2)} L`;
        } else {
            return value.toLocaleString('en-IN');
        }
    };

    const generateChartData = () => {
        return {
            labels: historicalData.map(d => d.date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })),
            datasets: [
                {
                    label: 'Portfolio Value',
                    data: historicalData.map(d => d.value),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        };
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const value = context.raw;
                        return `₹${formatIndianCurrency(value)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(this: any, tickValue: number | string): string {
                        const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                        return `₹${formatIndianCurrency(value)}`;
                    }
                }
            }
        }
    };

    useEffect(() => {
        // Generate historical data starting from current net worth
        const generateHistoricalData = () => {
            const data: {
                date: Date;
                value: number;
            }[] = [];

            let currentValue = currentAssets.currentNetWorth;
            const monthlyInvestment = currentAssets.monthlyInvestments.total;
            const monthlyRate = plan.savingsGrowthRate / 1200;

            // Generate data for the past 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                
                // Add monthly investment and apply growth rate
                currentValue = (currentValue * (1 + monthlyRate)) + monthlyInvestment;
                
                data.push({
                    date,
                    value: Math.round(currentValue)
                });
            }

            return data;
        };

        setHistoricalData(generateHistoricalData());
    }, [currentAssets.currentNetWorth, currentAssets.monthlyInvestments.total, plan.savingsGrowthRate]);

    const calculateExpectedNetWorth = (age: number): number => {
        const baseNetWorth = 10000000; // ₹1 crore at age 36 (from memory)
        
        if (age <= 36) {
            // Scale down by 10% per year for younger ages
            const scaleFactor = Math.pow(0.9, 36 - age);
            return baseNetWorth * scaleFactor;
        } else {
            // Scale up by 8% per year for older ages
            const scaleFactor = Math.pow(1.08, age - 36);
            return baseNetWorth * scaleFactor;
        }
    };

    const calculateProgress = () => {
        const currentValue = currentAssets.currentNetWorth;
        const targetValue = plan.targetCorpus;
        const progressPercentage = (currentValue / targetValue) * 100;
        const monthlyInvestmentProgress = executionStatus?.progress || 0;

        // Calculate expected net worth for current age
        const expectedNetWorth = calculateExpectedNetWorth(currentAge);
        const yearsToRetirement = retirementAge - currentAge;
        
        // Calculate if on track based on current vs expected net worth
        const netWorthProgress = (currentValue / expectedNetWorth) * 100;
        const isOnTrack = netWorthProgress >= 90;

        let status: string;
        let color: string;
        let message: string;
        let ageBasedMessage: string;

        if (progressPercentage >= 90) {
            status = 'Excellent';
            color = '#22c55e';
        } else if (progressPercentage >= 75) {
            status = 'Good';
            color = '#3b82f6';
        } else if (progressPercentage >= 50) {
            status = 'Moderate';
            color = '#f59e0b';
        } else {
            status = 'Getting Started';
            color = '#64748b';
        }

        // Age-based message considering Indian context
        if (netWorthProgress >= 90) {
            ageBasedMessage = `Your current net worth of ${formatIndianCurrency(currentValue)} is aligned with expectations for your age.`;
        } else if (netWorthProgress >= 75) {
            ageBasedMessage = `Your net worth is slightly below the expected ${formatIndianCurrency(expectedNetWorth)} for age ${currentAge}.`;
        } else {
            const shortfall = expectedNetWorth - currentValue;
            ageBasedMessage = `Alert: Your net worth is ₹${formatIndianCurrency(shortfall)} below the expected amount for your age. Consider increasing monthly investments.`;
        }

        // Combine messages based on both progress and age-based tracking
        message = executionStatus?.isOnTrack 
            ? `${ageBasedMessage} Your monthly investment discipline is strong at ₹${formatIndianCurrency(currentAssets.monthlyInvestments.total)}.`
            : `${ageBasedMessage} To catch up, try to increase monthly investments from ₹${formatIndianCurrency(currentAssets.monthlyInvestments.total)} towards the target of ₹${formatIndianCurrency(plan.monthlySavings)}.`;

        // If young with low progress, add encouraging message
        if (currentAge < 30 && progressPercentage < 50) {
            message += " Starting early gives you a significant advantage in building wealth.";
        }
        // If approaching retirement with low progress, add urgency
        else if (currentAge > 45 && progressPercentage < 75) {
            message += " Consider consulting a financial advisor to optimize your retirement strategy.";
        }

        return {
            percentage: progressPercentage,
            monthlyProgress: monthlyInvestmentProgress,
            netWorthProgress,
            status,
            color,
            message,
            expectedNetWorth,
            yearsToRetirement
        };
    };

    const progress = calculateProgress();

    const getTotalAssets = (): number => {
        const assets = {
            fixedDeposits: currentAssets.fixedDeposits,
            bonds: currentAssets.bonds,
            mutualFunds: currentAssets.mutualFunds,
            stocks: currentAssets.stocks,
            gold: currentAssets.gold,
            reits: currentAssets.reits
        };

        return Object.values(assets).reduce((sum, value) => sum + value, 0) + currentAssets.currentNetWorth;
    };

    const calculateAllocation = () => {
        const totalAssets = getTotalAssets();
        if (totalAssets === 0) return { lowRisk: 0, moderateRisk: 0, highRisk: 0 };

        const lowRiskAssets = currentAssets.fixedDeposits + currentAssets.bonds;
        const moderateRiskAssets = currentAssets.mutualFunds + currentAssets.gold;
        const highRiskAssets = currentAssets.stocks + currentAssets.reits;

        return {
            lowRisk: Math.round((lowRiskAssets / totalAssets) * 100),
            moderateRisk: Math.round((moderateRiskAssets / totalAssets) * 100),
            highRisk: Math.round((highRiskAssets / totalAssets) * 100)
        };
    };

    const totalAssets = getTotalAssets();
    const currentAllocation = calculateAllocation();

    return (
        <div className={styles.reviewContainer}>
            <h2>Portfolio Review</h2>
            
            <div className={styles['chart-container']}>
                <h2>Portfolio Performance</h2>
                <Line data={generateChartData()} options={chartOptions} />
            </div>
            
            <div className={styles['summary-container']}>
                <h2>Portfolio Summary</h2>
                <div className={styles['summary-grid']}>
                    <div className={styles['summary-section']}>
                        <div className={styles['summary-item']}>
                            <span>Current Portfolio Value</span>
                            <strong>{formatIndianCurrency(totalAssets)}</strong>
                        </div>
                        <div className={styles['summary-item']}>
                            <span>Target Corpus</span>
                            <strong>{formatIndianCurrency(plan.targetCorpus)}</strong>
                        </div>
                        <div className={styles['summary-item']}>
                            <span>Monthly Investment</span>
                            <strong>{formatIndianCurrency(currentAssets.monthlyInvestments.total)}</strong>
                        </div>
                        <div className={styles['progress-status']} style={{ borderColor: progress.color }}>
                            <div className={styles['status-header']}>
                                <span>Progress: <strong style={{ color: progress.color }}>{progress.status}</strong></span>
                                <span className={styles['progress-percentage']}>
                                    {progress.percentage.toFixed(1)}%
                                </span>
                            </div>
                            <p>{progress.message}</p>
                        </div>
                    </div>

                    <div className={styles['monthly-breakdown']}>
                        <h3>Monthly Investment Breakdown</h3>
                        <div className={styles['breakdown-grid']}>
                            <div className={styles['breakdown-item']}>
                                <span>Fixed Deposits</span>
                                <span>{formatIndianCurrency(currentAssets.monthlyInvestments.fixedDeposits)}</span>
                            </div>
                            <div className={styles['breakdown-item']}>
                                <span>Bonds</span>
                                <span>{formatIndianCurrency(currentAssets.monthlyInvestments.bonds)}</span>
                            </div>
                            <div className={styles['breakdown-item']}>
                                <span>Mutual Funds</span>
                                <span>{formatIndianCurrency(currentAssets.monthlyInvestments.mutualFunds)}</span>
                            </div>
                            <div className={styles['breakdown-item']}>
                                <span>Stocks</span>
                                <span>{formatIndianCurrency(currentAssets.monthlyInvestments.stocks)}</span>
                            </div>
                            <div className={styles['breakdown-item']}>
                                <span>Gold</span>
                                <span>{formatIndianCurrency(currentAssets.monthlyInvestments.gold)}</span>
                            </div>
                            <div className={styles['breakdown-item']}>
                                <span>REITs</span>
                                <span>{formatIndianCurrency(currentAssets.monthlyInvestments.reits)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.progressIndicator}>
                <div className={styles.progressStats}>
                    <div>
                        <h3>Overall Progress</h3>
                        <div className={styles.progressBar}>
                            <div 
                                className={styles.progressFill}
                                style={{ 
                                    width: `${progress.percentage}%`,
                                    backgroundColor: progress.color 
                                }}
                            />
                        </div>
                        <p>{progress.percentage.toFixed(1)}% of Target Corpus</p>
                    </div>
                    
                    <div>
                        <h3>Age-Based Progress</h3>
                        <div className={styles.progressBar}>
                            <div 
                                className={styles.progressFill}
                                style={{ 
                                    width: `${progress.netWorthProgress}%`,
                                    backgroundColor: progress.netWorthProgress >= 90 ? '#22c55e' : '#f59e0b'
                                }}
                            />
                        </div>
                        <p>{progress.netWorthProgress.toFixed(1)}% of Expected Net Worth for Age {currentAge}</p>
                    </div>
                    
                    {executionStatus && (
                        <div>
                            <h3>Monthly Investment Progress</h3>
                            <div className={styles.progressBar}>
                                <div 
                                    className={styles.progressFill}
                                    style={{ 
                                        width: `${progress.monthlyProgress}%`,
                                        backgroundColor: executionStatus.isOnTrack ? '#22c55e' : '#f59e0b'
                                    }}
                                />
                            </div>
                            <p>{progress.monthlyProgress.toFixed(1)}% of Target Monthly Investment</p>
                        </div>
                    )}
                </div>
                
                <div className={styles.statusCard} style={{ borderColor: progress.color }}>
                    <h3>Status: {progress.status}</h3>
                    <p>{progress.message}</p>
                    <div className={styles.timelineInfo}>
                        <p>Years to Retirement: {progress.yearsToRetirement}</p>
                        <p>Expected Net Worth at Current Age: ₹{formatIndianCurrency(progress.expectedNetWorth)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewComponent;
