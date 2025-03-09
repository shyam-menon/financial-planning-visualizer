import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { AssetAllocationPlan } from './PlanComponent';
import styles from './TPER.module.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ExecuteComponentProps {
    targetCorpus: number;
    plan: AssetAllocationPlan;
    onExecutionUpdate: (assets: CurrentAssets) => void;
}

interface CurrentAssets {
    fixedDeposits: number;
    bonds: number;
    hybridFunds: number;
    stocks: number;
    mutualFunds: number;
}

const formatIndianCurrency = (amount: number): string => {
    const crore = Math.floor(amount / 10000000);
    const lakh = Math.floor((amount % 10000000) / 100000);
    if (crore > 0) {
        return `₹${crore} crore ${lakh > 0 ? `${lakh} lakh` : ''}`;
    }
    return `₹${lakh} lakh`;
};

export const ExecuteComponent: React.FC<ExecuteComponentProps> = ({
    targetCorpus,
    plan,
    onExecutionUpdate
}) => {
    const [currentAssets, setCurrentAssets] = useState<CurrentAssets>({
        fixedDeposits: 2500000, // ₹25 lakh
        bonds: 1500000, // ₹15 lakh
        hybridFunds: 3000000, // ₹30 lakh
        stocks: 2000000, // ₹20 lakh
        mutualFunds: 1000000 // ₹10 lakh
    });

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

    const getRebalancingNeeds = () => {
        const total = getTotalAssets();
        const current = getCurrentAllocation();
        const targetLowRisk = plan.lowRisk;
        const targetModerateRisk = plan.moderateRisk;
        const targetHighRisk = plan.highRisk;

        return {
            lowRisk: ((targetLowRisk - parseFloat(current.lowRisk)) * total / 100).toFixed(0),
            moderateRisk: ((targetModerateRisk - parseFloat(current.moderateRisk)) * total / 100).toFixed(0),
            highRisk: ((targetHighRisk - parseFloat(current.highRisk)) * total / 100).toFixed(0)
        };
    };

    const handleAssetChange = (
        type: keyof CurrentAssets,
        value: number
    ) => {
        const newAssets = { ...currentAssets, [type]: value };
        setCurrentAssets(newAssets);
        onExecutionUpdate(newAssets);
    };

    const barChartData = {
        labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
        datasets: [
            {
                label: 'Current Allocation (%)',
                data: [
                    parseFloat(getCurrentAllocation().lowRisk),
                    parseFloat(getCurrentAllocation().moderateRisk),
                    parseFloat(getCurrentAllocation().highRisk)
                ],
                backgroundColor: 'rgba(79, 70, 229, 0.8)'
            },
            {
                label: 'Target Allocation (%)',
                data: [plan.lowRisk, plan.moderateRisk, plan.highRisk],
                backgroundColor: 'rgba(99, 102, 241, 0.4)'
            }
        ]
    };

    const rebalancingNeeds = getRebalancingNeeds();

    return (
        <div className={styles['execute-component']}>
            <h2>Execute Your Investment Plan</h2>

            <div className={styles['current-assets']}>
                <h3>Current Assets</h3>
                <div className={styles['asset-inputs']}>
                    <div className={styles['input-group']}>
                        <label>
                            Fixed Deposits
                            <div className={styles['input-wrapper']}>
                                <input
                                    type="number"
                                    value={currentAssets.fixedDeposits}
                                    onChange={(e) => handleAssetChange('fixedDeposits', Number(e.target.value))}
                                    step={100000} // 1 lakh steps
                                    min={0}
                                    aria-label="Fixed deposits amount in rupees"
                                />
                                <span className={styles['input-icon']}>₹</span>
                            </div>
                        </label>
                    </div>

                    <div className={styles['input-group']}>
                        <label>
                            Bonds
                            <div className={styles['input-wrapper']}>
                                <input
                                    type="number"
                                    value={currentAssets.bonds}
                                    onChange={(e) => handleAssetChange('bonds', Number(e.target.value))}
                                    step={100000} // 1 lakh steps
                                    min={0}
                                    aria-label="Bonds amount in rupees"
                                />
                                <span className={styles['input-icon']}>₹</span>
                            </div>
                        </label>
                    </div>

                    <div className={styles['input-group']}>
                        <label>
                            Hybrid Funds
                            <div className={styles['input-wrapper']}>
                                <input
                                    type="number"
                                    value={currentAssets.hybridFunds}
                                    onChange={(e) => handleAssetChange('hybridFunds', Number(e.target.value))}
                                    step={100000} // 1 lakh steps
                                    min={0}
                                    aria-label="Hybrid funds amount in rupees"
                                />
                                <span className={styles['input-icon']}>₹</span>
                            </div>
                        </label>
                    </div>

                    <div className={styles['input-group']}>
                        <label>
                            Stocks
                            <div className={styles['input-wrapper']}>
                                <input
                                    type="number"
                                    value={currentAssets.stocks}
                                    onChange={(e) => handleAssetChange('stocks', Number(e.target.value))}
                                    step={100000} // 1 lakh steps
                                    min={0}
                                    aria-label="Stocks amount in rupees"
                                />
                                <span className={styles['input-icon']}>₹</span>
                            </div>
                        </label>
                    </div>

                    <div className={styles['input-group']}>
                        <label>
                            Mutual Funds
                            <div className={styles['input-wrapper']}>
                                <input
                                    type="number"
                                    value={currentAssets.mutualFunds}
                                    onChange={(e) => handleAssetChange('mutualFunds', Number(e.target.value))}
                                    step={100000} // 1 lakh steps
                                    min={0}
                                    aria-label="Mutual funds amount in rupees"
                                />
                                <span className={styles['input-icon']}>₹</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <div className={styles['chart-container']}>
                <Bar 
                    data={barChartData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top' as const,
                            },
                            title: {
                                display: true,
                                text: 'Current vs Target Allocation',
                                color: '#1e293b',
                                font: {
                                    size: 16,
                                    weight: 'bold'
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) => `${context.dataset.label}: ${context.parsed.y}%`
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                    display: true,
                                    text: 'Allocation (%)',
                                    color: '#64748b'
                                }
                            }
                        }
                    }}
                />
            </div>

            <div className={styles.result}>
                <h3>Portfolio Analysis</h3>
                <div className={styles['summary-stats']}>
                    <div className={styles['stat-item']}>
                        <span>Total Portfolio Value:</span>
                        <strong>{formatIndianCurrency(getTotalAssets())}</strong>
                    </div>
                    <div className={styles['stat-item']}>
                        <span>Target Corpus:</span>
                        <strong>{formatIndianCurrency(targetCorpus)}</strong>
                    </div>
                    <div className={styles['stat-item']}>
                        <span>Corpus Gap:</span>
                        <strong>{formatIndianCurrency(targetCorpus - getTotalAssets())}</strong>
                    </div>
                </div>

                <div className={styles['rebalancing-needs']}>
                    <h4>Rebalancing Required</h4>
                    <div className={styles['rebalancing-items']}>
                        <div className={styles['rebalancing-item']}>
                            <span>Low Risk Assets:</span>
                            <strong className={parseFloat(rebalancingNeeds.lowRisk) > 0 ? styles.positive : styles.negative}>
                                {parseFloat(rebalancingNeeds.lowRisk) > 0 ? '+' : ''}{formatIndianCurrency(parseFloat(rebalancingNeeds.lowRisk))}
                            </strong>
                        </div>
                        <div className={styles['rebalancing-item']}>
                            <span>Moderate Risk Assets:</span>
                            <strong className={parseFloat(rebalancingNeeds.moderateRisk) > 0 ? styles.positive : styles.negative}>
                                {parseFloat(rebalancingNeeds.moderateRisk) > 0 ? '+' : ''}{formatIndianCurrency(parseFloat(rebalancingNeeds.moderateRisk))}
                            </strong>
                        </div>
                        <div className={styles['rebalancing-item']}>
                            <span>High Risk Assets:</span>
                            <strong className={parseFloat(rebalancingNeeds.highRisk) > 0 ? styles.positive : styles.negative}>
                                {parseFloat(rebalancingNeeds.highRisk) > 0 ? '+' : ''}{formatIndianCurrency(parseFloat(rebalancingNeeds.highRisk))}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecuteComponent;
