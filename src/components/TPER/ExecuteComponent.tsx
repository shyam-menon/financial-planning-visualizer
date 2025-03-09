import React, { useState, useEffect } from 'react';
import styles from './TPER.module.css';

interface ExecuteComponentProps {
    plan: {
        targetCorpus: number;
        monthlySavings: number;
        timeHorizon: number;
        allocation: {
            lowRisk: number;
            moderateRisk: number;
            highRisk: number;
        };
    };
    onAssetsUpdated: (assets: Portfolio) => void;
}

interface Portfolio {
    fixedDeposits: number;
    bonds: number;
    mutualFunds: number;
    stocks: number;
    gold: number;
    reits: number;
    currentNetWorth: number;
}

export const ExecuteComponent: React.FC<ExecuteComponentProps> = ({ plan, onAssetsUpdated }) => {
    const [portfolio, setPortfolio] = useState<Portfolio>({
        fixedDeposits: 0,
        bonds: 0,
        mutualFunds: 0,
        stocks: 0,
        gold: 0,
        reits: 0,
        currentNetWorth: 0
    });

    const [executionStatus, setExecutionStatus] = useState({
        isOnTrack: true,
        message: '',
        progress: 0
    });

    const formatIndianCurrency = (amount: number): string => {
        if (amount >= 10000000) { // 1 crore
            const crore = Math.floor(amount / 10000000);
            const lakh = Math.floor((amount % 10000000) / 100000);
            return `₹${crore} crore${lakh > 0 ? ` ${lakh} lakh` : ''}`;
        } else if (amount >= 100000) { // 1 lakh
            const lakh = Math.floor(amount / 100000);
            const remainder = amount % 100000;
            return `₹${lakh} lakh${remainder > 0 ? ` ${remainder}` : ''}`;
        }
        return `₹${amount}`;
    };

    // Calculate suggested portfolio based on current net worth and 6 months of execution
    const calculateSuggestedPortfolio = () => {
        const monthlyInvestment = plan.monthlySavings;
        const totalInvested = monthlyInvestment * 6;

        // Split low risk between FDs and bonds
        const lowRiskAmount = totalInvested * (plan.allocation.lowRisk / 100);
        const fdAmount = lowRiskAmount * 0.6;
        const bondsAmount = lowRiskAmount * 0.4;

        // Split moderate risk between mutual funds and gold
        const moderateRiskAmount = totalInvested * (plan.allocation.moderateRisk / 100);
        const mutualFundsAmount = moderateRiskAmount * 0.7;
        const goldAmount = moderateRiskAmount * 0.3;

        // Split high risk between stocks and REITs
        const highRiskAmount = totalInvested * (plan.allocation.highRisk / 100);
        const stocksAmount = highRiskAmount * 0.8;
        const reitsAmount = highRiskAmount * 0.2;

        return {
            fixedDeposits: fdAmount,
            bonds: bondsAmount,
            mutualFunds: mutualFundsAmount,
            stocks: stocksAmount,
            gold: goldAmount,
            reits: reitsAmount,
            currentNetWorth: portfolio.currentNetWorth // Preserve current net worth
        };
    };

    // Auto-fill portfolio with suggested values
    const autoFillPortfolio = () => {
        const suggested = calculateSuggestedPortfolio();
        setPortfolio(prev => ({
            ...suggested,
            currentNetWorth: prev.currentNetWorth // Preserve current net worth
        }));
    };

    // Reset portfolio to zero
    const resetPortfolio = () => {
        setPortfolio({
            fixedDeposits: 0,
            bonds: 0,
            mutualFunds: 0,
            stocks: 0,
            gold: 0,
            reits: 0,
            currentNetWorth: 0
        });
    };

    // Calculate current allocation percentages
    const calculateCurrentAllocation = () => {
        const total = Object.values(portfolio).reduce((sum, value) => sum + value, 0) - portfolio.currentNetWorth;
        if (total === 0) return { lowRisk: 0, moderateRisk: 0, highRisk: 0 };

        const lowRisk = ((portfolio.fixedDeposits + portfolio.bonds) / total) * 100;
        const moderateRisk = ((portfolio.mutualFunds + portfolio.gold) / total) * 100;
        const highRisk = ((portfolio.stocks + portfolio.reits) / total) * 100;

        return { lowRisk, moderateRisk, highRisk };
    };

    // Check if rebalancing is needed
    const checkRebalancingNeeds = () => {
        const currentAllocation = calculateCurrentAllocation();
        const threshold = 5; // 5% deviation threshold

        const needs = [];
        if (Math.abs(currentAllocation.lowRisk - plan.allocation.lowRisk) > threshold) {
            needs.push({
                category: 'Low Risk (FDs & Bonds)',
                current: currentAllocation.lowRisk,
                target: plan.allocation.lowRisk,
                action: currentAllocation.lowRisk < plan.allocation.lowRisk ? 'increase' : 'decrease'
            });
        }

        if (Math.abs(currentAllocation.moderateRisk - plan.allocation.moderateRisk) > threshold) {
            needs.push({
                category: 'Moderate Risk (Mutual Funds & Gold)',
                current: currentAllocation.moderateRisk,
                target: plan.allocation.moderateRisk,
                action: currentAllocation.moderateRisk < plan.allocation.moderateRisk ? 'increase' : 'decrease'
            });
        }

        if (Math.abs(currentAllocation.highRisk - plan.allocation.highRisk) > threshold) {
            needs.push({
                category: 'High Risk (Stocks & REITs)',
                current: currentAllocation.highRisk,
                target: plan.allocation.highRisk,
                action: currentAllocation.highRisk < plan.allocation.highRisk ? 'increase' : 'decrease'
            });
        }

        return needs;
    };

    // Update execution status
    useEffect(() => {
        const totalInvested = Object.values(portfolio).reduce((sum, value) => sum + value, 0) - portfolio.currentNetWorth;
        const suggestedTotal = Object.values(calculateSuggestedPortfolio()).reduce((sum, value) => sum + value, 0) - portfolio.currentNetWorth;
        
        const progress = (totalInvested / suggestedTotal) * 100;
        let message = '';
        let isOnTrack = true;

        if (progress >= 95) {
            message = 'Excellent! You are ahead of your investment plan.';
        } else if (progress >= 85) {
            message = 'Good job! You are on track with your investment plan.';
        } else if (progress >= 70) {
            message = 'You are slightly behind. Consider increasing your investments.';
            isOnTrack = false;
        } else {
            message = 'You are significantly behind. Please review your investment strategy.';
            isOnTrack = false;
        }

        setExecutionStatus({ isOnTrack, message, progress });
    }, [portfolio, plan]);

    useEffect(() => {
        onAssetsUpdated(portfolio);
    }, [portfolio, onAssetsUpdated]);

    const handlePortfolioChange = (asset: keyof Portfolio, value: string) => {
        const numValue = value === '' ? 0 : parseFloat(value);
        setPortfolio(currentPortfolio => {
            const updatedPortfolio = {
                ...currentPortfolio,
                [asset]: numValue
            };
            onAssetsUpdated(updatedPortfolio);
            return updatedPortfolio;
        });
    };

    return (
        <div>
            <div className={styles['section-header']}>
                <h2>Execute Your Plan</h2>
                <div>
                    <button className={styles['reset-button']} onClick={autoFillPortfolio}>
                        Auto-fill Portfolio
                    </button>
                    <button className={styles['reset-button']} onClick={resetPortfolio}>
                        Reset
                    </button>
                </div>
            </div>

            <div className={styles['input-group']}>
                <h4>Current Net Worth</h4>
                <div className={styles['asset-category']}>
                    <div className={styles['asset-type']}>
                        <h5>Total Net Worth</h5>
                        <p className={styles['asset-description']}>
                            Your total current wealth including all assets and investments. This forms the foundation of your retirement planning.
                            For your age, a typical net worth would be around ₹1 crore, but this can vary based on your circumstances.
                        </p>
                        <div className={styles['input-row']}>
                            <div className={styles['input-column']}>
                                <div className={styles['input-label']}>
                                    <span>Current Value</span>
                                    <span className={styles['currency-symbol']}>₹</span>
                                </div>
                                <div className={styles['currency-input']}>
                                    <input
                                        type="number"
                                        value={portfolio.currentNetWorth || ''}
                                        onChange={(e) => handlePortfolioChange('currentNetWorth', e.target.value)}
                                        step="100000"
                                        min="0"
                                    />
                                </div>
                                <p className={styles['input-helper']}>
                                    Current Net Worth: {formatIndianCurrency(portfolio.currentNetWorth)}
                                </p>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-display']}>
                                    {formatIndianCurrency(portfolio.currentNetWorth + (plan.monthlySavings * 6))}
                                </div>
                                <p className={styles['input-helper']}>
                                    Expected growth with monthly savings
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles['execution-status']}>
                <h3>Execution Status</h3>
                <p>{executionStatus.message}</p>
                <p>Progress: {executionStatus.progress.toFixed(1)}%</p>
            </div>

            <div className={styles['input-group']}>
                <h4>Low Risk Assets</h4>
                <div className={styles['asset-category']}>
                    <div className={styles['asset-type']}>
                        <h5>Fixed Deposits (FDs)</h5>
                        <p className={styles['asset-description']}>Traditional bank deposits with guaranteed returns</p>
                        <div className={styles['input-row']}>
                            <div className={styles['input-column']}>
                                <div className={styles['input-label']}>
                                    <span>Current Investment</span>
                                    <span className={styles['currency-symbol']}>₹</span>
                                </div>
                                <div className={styles['currency-input']}>
                                    <input
                                        type="number"
                                        value={portfolio.fixedDeposits || ''}
                                        onChange={(e) => handlePortfolioChange('fixedDeposits', e.target.value)}
                                        step="1000"
                                    />
                                </div>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-amount']}>
                                    ₹{calculateSuggestedPortfolio().fixedDeposits.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles['asset-type']}>
                        <h5>Bonds</h5>
                        <p className={styles['asset-description']}>Government and corporate debt securities</p>
                        <div className={styles['input-row']}>
                            <div className={styles['input-column']}>
                                <div className={styles['input-label']}>
                                    <span>Current Investment</span>
                                    <span className={styles['currency-symbol']}>₹</span>
                                </div>
                                <div className={styles['currency-input']}>
                                    <input
                                        type="number"
                                        value={portfolio.bonds || ''}
                                        onChange={(e) => handlePortfolioChange('bonds', e.target.value)}
                                        step="1000"
                                    />
                                </div>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-amount']}>
                                    ₹{calculateSuggestedPortfolio().bonds.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles['input-group']}>
                <h4>Moderate Risk Assets</h4>
                <div className={styles['asset-category']}>
                    <div className={styles['asset-type']}>
                        <h5>Mutual Funds</h5>
                        <p className={styles['asset-description']}>Diversified investment portfolios managed by professionals</p>
                        <div className={styles['input-row']}>
                            <div className={styles['input-column']}>
                                <div className={styles['input-label']}>
                                    <span>Current Investment</span>
                                    <span className={styles['currency-symbol']}>₹</span>
                                </div>
                                <div className={styles['currency-input']}>
                                    <input
                                        type="number"
                                        value={portfolio.mutualFunds || ''}
                                        onChange={(e) => handlePortfolioChange('mutualFunds', e.target.value)}
                                        step="1000"
                                    />
                                </div>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-amount']}>
                                    ₹{calculateSuggestedPortfolio().mutualFunds.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles['asset-type']}>
                        <h5>Gold</h5>
                        <p className={styles['asset-description']}>Physical gold or gold-based investment instruments</p>
                        <div className={styles['input-row']}>
                            <div className={styles['input-column']}>
                                <div className={styles['input-label']}>
                                    <span>Current Investment</span>
                                    <span className={styles['currency-symbol']}>₹</span>
                                </div>
                                <div className={styles['currency-input']}>
                                    <input
                                        type="number"
                                        value={portfolio.gold || ''}
                                        onChange={(e) => handlePortfolioChange('gold', e.target.value)}
                                        step="1000"
                                    />
                                </div>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-amount']}>
                                    ₹{calculateSuggestedPortfolio().gold.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles['input-group']}>
                <h4>High Risk Assets</h4>
                <div className={styles['asset-category']}>
                    <div className={styles['asset-type']}>
                        <h5>Stocks</h5>
                        <p className={styles['asset-description']}>Equity shares of publicly traded companies</p>
                        <div className={styles['input-row']}>
                            <div className={styles['input-column']}>
                                <div className={styles['input-label']}>
                                    <span>Current Investment</span>
                                    <span className={styles['currency-symbol']}>₹</span>
                                </div>
                                <div className={styles['currency-input']}>
                                    <input
                                        type="number"
                                        value={portfolio.stocks || ''}
                                        onChange={(e) => handlePortfolioChange('stocks', e.target.value)}
                                        step="1000"
                                    />
                                </div>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-amount']}>
                                    ₹{calculateSuggestedPortfolio().stocks.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles['asset-type']}>
                        <h5>REITs</h5>
                        <p className={styles['asset-description']}>Real estate investment trusts</p>
                        <div className={styles['input-row']}>
                            <div className={styles['input-column']}>
                                <div className={styles['input-label']}>
                                    <span>Current Investment</span>
                                    <span className={styles['currency-symbol']}>₹</span>
                                </div>
                                <div className={styles['currency-input']}>
                                    <input
                                        type="number"
                                        value={portfolio.reits || ''}
                                        onChange={(e) => handlePortfolioChange('reits', e.target.value)}
                                        step="1000"
                                    />
                                </div>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-amount']}>
                                    ₹{calculateSuggestedPortfolio().reits.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles['allocation-stats']}>
                <h4>Current Asset Allocation</h4>
                {Object.entries(calculateCurrentAllocation()).map(([category, percentage]) => (
                    <div key={category} className={styles['allocation-item']}>
                        <span>{category.replace(/([A-Z])/g, ' $1').trim()}: {percentage.toFixed(1)}%</span>
                        <div className={styles['allocation-bar']}>
                            <div
                                className={styles['allocation-fill']}
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: category === 'lowRisk' ? '#34d399' :
                                        category === 'moderateRisk' ? '#fbbf24' : '#f87171'
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {checkRebalancingNeeds().length > 0 && (
                <div className={styles['rebalancing-needs']}>
                    <h4>Rebalancing Suggestions</h4>
                    <ul>
                        {checkRebalancingNeeds().map((need, index) => (
                            <li key={index} className={styles[need.action]}>
                                {need.category}: {need.action === 'increase' ? 'Increase' : 'Decrease'} allocation
                                from {need.current.toFixed(1)}% to {need.target.toFixed(1)}%
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
