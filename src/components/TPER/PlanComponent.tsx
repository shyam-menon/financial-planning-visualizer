import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from './TPER.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface AssetAllocationPlan {
    lowRisk: number;
    moderateRisk: number;
    highRisk: number;
    monthlySavings: number;
    savingsGrowthRate: number;
}

interface PlanComponentProps {
    targetCorpus: number;
    onPlanSet: (plan: AssetAllocationPlan) => void;
}

const formatIndianCurrency = (amount: number): string => {
    const crore = Math.floor(amount / 10000000);
    const lakh = Math.floor((amount % 10000000) / 100000);
    if (crore > 0) {
        return `₹${crore} crore ${lakh > 0 ? `${lakh} lakh` : ''}`;
    }
    return `₹${lakh} lakh`;
};

export const PlanComponent: React.FC<PlanComponentProps> = ({ targetCorpus, onPlanSet }) => {
    const [allocation, setAllocation] = useState<AssetAllocationPlan>({
        lowRisk: 30, // Conservative allocation
        moderateRisk: 40,
        highRisk: 30,
        monthlySavings: 50000, // ₹50,000 default
        savingsGrowthRate: 10 // 10% annual increase
    });

    const expectedReturns = {
        lowRisk: 6, // FD, Bonds (~6%)
        moderateRisk: 10, // Hybrid Funds (~10%)
        highRisk: 12 // Equity (~12%)
    };

    const calculateWeightedReturn = (): number => {
        return (
            (allocation.lowRisk * expectedReturns.lowRisk +
            allocation.moderateRisk * expectedReturns.moderateRisk +
            allocation.highRisk * expectedReturns.highRisk) / 100
        );
    };

    const yearsToTarget = (): number => {
        const monthlyRate = calculateWeightedReturn() / 1200; // Convert annual % to monthly decimal
        let currentSavings = allocation.monthlySavings;
        let totalSavings = 0;
        let months = 0;

        while (totalSavings < targetCorpus && months < 600) { // Cap at 50 years
            totalSavings = totalSavings * (1 + monthlyRate) + currentSavings;
            currentSavings *= (1 + allocation.savingsGrowthRate / 1200); // Monthly savings growth
            months++;
        }

        return Math.ceil(months / 12);
    };

    const handleAllocationChange = (type: keyof Pick<AssetAllocationPlan, 'lowRisk' | 'moderateRisk' | 'highRisk'>, value: number) => {
        const newAllocation = { ...allocation };
        const diff = value - allocation[type];
        
        // Adjust other allocations proportionally
        const otherTypes = ['lowRisk', 'moderateRisk', 'highRisk'].filter(t => t !== type) as Array<keyof Pick<AssetAllocationPlan, 'lowRisk' | 'moderateRisk' | 'highRisk'>>;
        const totalOther = otherTypes.reduce((sum, t) => sum + allocation[t], 0);
        
        otherTypes.forEach(t => {
            newAllocation[t] = Math.max(0, Math.min(100, allocation[t] - (diff * allocation[t] / totalOther)));
        });
        
        newAllocation[type] = value;
        setAllocation(newAllocation);
    };

    const pieChartData = {
        labels: [
            'Low Risk (FD, Bonds)',
            'Moderate Risk (Hybrid Funds)',
            'High Risk (Stocks, Equity MF)'
        ],
        datasets: [{
            data: [allocation.lowRisk, allocation.moderateRisk, allocation.highRisk],
            backgroundColor: [
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(255, 99, 132, 0.8)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        }]
    };

    return (
        <div className={styles['plan-component']}>
            <h2>Plan Your Asset Allocation</h2>
            
            <div className={styles['allocation-section']}>
                <div className={styles['input-group']}>
                    <label>
                        Low Risk Assets (FD, Bonds)
                        <div className={styles['input-wrapper']}>
                            <input
                                type="number"
                                value={allocation.lowRisk}
                                onChange={(e) => handleAllocationChange('lowRisk', Number(e.target.value))}
                                min={0}
                                max={100}
                                step={5}
                                aria-label="Low risk allocation percentage"
                            />
                            <span className={styles['input-icon']}>%</span>
                        </div>
                        <span className={styles['return-indicator']}>Expected Return: {expectedReturns.lowRisk}%</span>
                    </label>
                </div>

                <div className={styles['input-group']}>
                    <label>
                        Moderate Risk Assets (Hybrid Funds)
                        <div className={styles['input-wrapper']}>
                            <input
                                type="number"
                                value={allocation.moderateRisk}
                                onChange={(e) => handleAllocationChange('moderateRisk', Number(e.target.value))}
                                min={0}
                                max={100}
                                step={5}
                                aria-label="Moderate risk allocation percentage"
                            />
                            <span className={styles['input-icon']}>%</span>
                        </div>
                        <span className={styles['return-indicator']}>Expected Return: {expectedReturns.moderateRisk}%</span>
                    </label>
                </div>

                <div className={styles['input-group']}>
                    <label>
                        High Risk Assets (Stocks, Equity MF)
                        <div className={styles['input-wrapper']}>
                            <input
                                type="number"
                                value={allocation.highRisk}
                                onChange={(e) => handleAllocationChange('highRisk', Number(e.target.value))}
                                min={0}
                                max={100}
                                step={5}
                                aria-label="High risk allocation percentage"
                            />
                            <span className={styles['input-icon']}>%</span>
                        </div>
                        <span className={styles['return-indicator']}>Expected Return: {expectedReturns.highRisk}%</span>
                    </label>
                </div>

                <div className={styles['input-group']}>
                    <label>
                        Monthly Savings
                        <div className={styles['input-wrapper']}>
                            <input
                                type="number"
                                value={allocation.monthlySavings}
                                onChange={(e) => setAllocation({ ...allocation, monthlySavings: Number(e.target.value) })}
                                step={1000}
                                min={1000}
                                aria-label="Monthly savings amount in rupees"
                            />
                            <span className={styles['input-icon']}>₹</span>
                        </div>
                    </label>
                </div>

                <div className={styles['input-group']}>
                    <label>
                        Annual Savings Growth Rate
                        <div className={styles['input-wrapper']}>
                            <input
                                type="number"
                                value={allocation.savingsGrowthRate}
                                onChange={(e) => setAllocation({ ...allocation, savingsGrowthRate: Number(e.target.value) })}
                                step={0.1}
                                min={0}
                                max={20}
                                aria-label="Annual savings growth rate percentage"
                            />
                            <span className={styles['input-icon']}>%</span>
                        </div>
                    </label>
                </div>
            </div>

            <div className={styles['chart-container']}>
                <Pie data={pieChartData} options={{
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    size: 12
                                },
                                padding: 20
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.label}: ${context.parsed}%`
                            }
                        }
                    }
                }} />
            </div>

            <div className={styles.result}>
                <h3>Investment Summary</h3>
                <div className={styles['summary-stats']}>
                    <div className={styles['stat-item']}>
                        <span>Target Corpus:</span>
                        <strong>{formatIndianCurrency(targetCorpus)}</strong>
                    </div>
                    <div className={styles['stat-item']}>
                        <span>Expected Annual Return:</span>
                        <strong>{calculateWeightedReturn().toFixed(1)}%</strong>
                    </div>
                    <div className={styles['stat-item']}>
                        <span>Years to Target:</span>
                        <strong>{yearsToTarget()} years</strong>
                    </div>
                </div>
                <button 
                    className={styles['submit-button']}
                    onClick={() => onPlanSet(allocation)}
                    aria-label="Set investment plan"
                >
                    Set This Plan
                </button>
            </div>
        </div>
    );
};

export default PlanComponent;
