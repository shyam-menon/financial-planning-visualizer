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
        currentNetWorth: number;
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

export const ExecuteComponent: React.FC<ExecuteComponentProps> = ({ plan, onAssetsUpdated }) => {
    const [portfolio, setPortfolio] = useState<Portfolio>({
        fixedDeposits: 0,
        bonds: 0,
        mutualFunds: 0,
        stocks: 0,
        gold: 0,
        reits: 0,
        currentNetWorth: plan.currentNetWorth,
        monthlyInvestments: {
            fixedDeposits: 0,
            bonds: 0,
            mutualFunds: 0,
            stocks: 0,
            gold: 0,
            reits: 0,
            total: 0
        }
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

    const handlePortfolioChange = (field: keyof Portfolio, value: string) => {
        const numericValue = value === '' ? 0 : parseFloat(value);
        const updatedPortfolio = {
            ...portfolio,
            [field]: numericValue
        };
        
        // Update monthly investments
        const monthlyTotal = Object.values({
            fixedDeposits: updatedPortfolio.fixedDeposits,
            bonds: updatedPortfolio.bonds,
            mutualFunds: updatedPortfolio.mutualFunds,
            stocks: updatedPortfolio.stocks,
            gold: updatedPortfolio.gold,
            reits: updatedPortfolio.reits
        }).reduce((sum, value) => sum + value, 0);

        updatedPortfolio.monthlyInvestments = {
            fixedDeposits: updatedPortfolio.fixedDeposits,
            bonds: updatedPortfolio.bonds,
            mutualFunds: updatedPortfolio.mutualFunds,
            stocks: updatedPortfolio.stocks,
            gold: updatedPortfolio.gold,
            reits: updatedPortfolio.reits,
            total: monthlyTotal
        };

        setPortfolio(updatedPortfolio);
        onAssetsUpdated(updatedPortfolio);

        // Calculate progress based on monthly investment targets
        const suggested = calculateSuggestedPortfolio();
        const targetMonthly = suggested.monthlyInvestments.total;
        const progress = Math.min((monthlyTotal / targetMonthly) * 100, 100);

        // Update execution status with Indian context-aware messages
        let message = '';
        if (progress >= 90) {
            message = 'Excellent! Your monthly investments are well-aligned with the target.';
        } else if (progress >= 75) {
            message = 'Good progress! Your monthly investment plan is on track.';
        } else if (progress >= 50) {
            message = 'You are following the plan. Keep maintaining your monthly investments.';
        } else if (progress >= 25) {
            message = 'Getting started with your monthly investment plan.';
        } else {
            message = 'Begin your monthly investments as per the suggested allocation.';
        }

        setExecutionStatus({
            isOnTrack: progress >= 75,
            message,
            progress
        });
    };

    const updateMonthlyInvestments = (newPortfolio: Portfolio) => {
        const suggested = calculateSuggestedPortfolio();
        
        // If we're just starting out, use the suggested monthly investments
        const hasNoInvestments = Object.values({
            fixedDeposits: newPortfolio.fixedDeposits,
            bonds: newPortfolio.bonds,
            mutualFunds: newPortfolio.mutualFunds,
            stocks: newPortfolio.stocks,
            gold: newPortfolio.gold,
            reits: newPortfolio.reits
        }).every(value => value === 0);

        if (hasNoInvestments) {
            return {
                ...newPortfolio,
                monthlyInvestments: suggested.monthlyInvestments
            };
        }

        // If we've reached or exceeded all targets, maintain the original allocation
        const hasReachedTargets = Object.entries({
            fixedDeposits: newPortfolio.fixedDeposits >= suggested.fixedDeposits,
            bonds: newPortfolio.bonds >= suggested.bonds,
            mutualFunds: newPortfolio.mutualFunds >= suggested.mutualFunds,
            stocks: newPortfolio.stocks >= suggested.stocks,
            gold: newPortfolio.gold >= suggested.gold,
            reits: newPortfolio.reits >= suggested.reits
        }).every(([_, hasReached]) => hasReached);

        if (hasReachedTargets) {
            return {
                ...newPortfolio,
                monthlyInvestments: suggested.monthlyInvestments
            };
        }

        // Calculate remaining amounts to reach targets
        const remaining = {
            fixedDeposits: Math.max(0, suggested.fixedDeposits - newPortfolio.fixedDeposits),
            bonds: Math.max(0, suggested.bonds - newPortfolio.bonds),
            mutualFunds: Math.max(0, suggested.mutualFunds - newPortfolio.mutualFunds),
            stocks: Math.max(0, suggested.stocks - newPortfolio.stocks),
            gold: Math.max(0, suggested.gold - newPortfolio.gold),
            reits: Math.max(0, suggested.reits - newPortfolio.reits)
        };

        // Calculate monthly investments based on remaining amounts
        const monthlyTotal = plan.monthlySavings;
        const totalRemaining = Object.values(remaining).reduce((sum, value) => sum + value, 0);

        const monthlyInvestments = {
            fixedDeposits: Math.round((remaining.fixedDeposits / totalRemaining) * monthlyTotal),
            bonds: Math.round((remaining.bonds / totalRemaining) * monthlyTotal),
            mutualFunds: Math.round((remaining.mutualFunds / totalRemaining) * monthlyTotal),
            stocks: Math.round((remaining.stocks / totalRemaining) * monthlyTotal),
            gold: Math.round((remaining.gold / totalRemaining) * monthlyTotal),
            reits: Math.round((remaining.reits / totalRemaining) * monthlyTotal),
            total: monthlyTotal
        };

        // Adjust for rounding errors
        const actualTotal = Object.values(monthlyInvestments).reduce((sum, value) => sum + value, 0) - monthlyInvestments.total;
        const adjustment = monthlyTotal - actualTotal;

        if (adjustment !== 0) {
            // Add adjustment to mutual funds (largest allocation)
            monthlyInvestments.mutualFunds += adjustment;
        }

        return {
            ...newPortfolio,
            monthlyInvestments
        };
    };

    const calculateSuggestedPortfolio = (): Portfolio => {
        const monthlyInvestment = plan.monthlySavings;

        // Calculate monthly breakdown based on plan allocation
        // Low risk assets: Fixed Deposits (60%) and Bonds (40%)
        const lowRiskMonthly = monthlyInvestment * (plan.allocation.lowRisk / 100);
        const fdMonthly = Math.round(lowRiskMonthly * 0.6); // FDs are preferred in Indian context
        const bondsMonthly = lowRiskMonthly - fdMonthly; // Ensure exact allocation

        // Moderate risk: Mutual Funds (70%) and Gold (30%)
        const moderateRiskMonthly = monthlyInvestment * (plan.allocation.moderateRisk / 100);
        const mfMonthly = Math.round(moderateRiskMonthly * 0.7); // Higher allocation to MFs in Indian market
        const goldMonthly = moderateRiskMonthly - mfMonthly; // Ensure exact allocation

        // High risk: Stocks (80%) and REITs (20%)
        const highRiskMonthly = monthlyInvestment * (plan.allocation.highRisk / 100);
        const stocksMonthly = Math.round(highRiskMonthly * 0.8);
        const reitsMonthly = highRiskMonthly - stocksMonthly; // Ensure exact allocation

        // Round all values to nearest ₹1,000 as per Indian investment patterns
        const monthlyBreakdown = {
            fixedDeposits: Math.round(fdMonthly / 1000) * 1000,
            bonds: Math.round(bondsMonthly / 1000) * 1000,
            mutualFunds: Math.round(mfMonthly / 1000) * 1000,
            gold: Math.round(goldMonthly / 1000) * 1000,
            stocks: Math.round(stocksMonthly / 1000) * 1000,
            reits: Math.round(reitsMonthly / 1000) * 1000
        };

        // Adjust rounding differences to maintain exact monthly investment
        const totalMonthly = Object.values(monthlyBreakdown).reduce((sum, value) => sum + value, 0);
        const adjustment = monthlyInvestment - totalMonthly;
        
        // Add any rounding adjustment to mutual funds (typically largest allocation)
        if (adjustment !== 0) {
            monthlyBreakdown.mutualFunds += adjustment;
        }

        return {
            fixedDeposits: monthlyBreakdown.fixedDeposits,
            bonds: monthlyBreakdown.bonds,
            mutualFunds: monthlyBreakdown.mutualFunds,
            stocks: monthlyBreakdown.stocks,
            gold: monthlyBreakdown.gold,
            reits: monthlyBreakdown.reits,
            currentNetWorth: plan.currentNetWorth,
            monthlyInvestments: {
                ...monthlyBreakdown,
                total: monthlyInvestment
            }
        };
    };

    const resetPortfolio = () => {
        const suggested = calculateSuggestedPortfolio();
        const defaultPortfolio = {
            fixedDeposits: suggested.monthlyInvestments.fixedDeposits,
            bonds: suggested.monthlyInvestments.bonds,
            mutualFunds: suggested.monthlyInvestments.mutualFunds,
            stocks: suggested.monthlyInvestments.stocks,
            gold: suggested.monthlyInvestments.gold,
            reits: suggested.monthlyInvestments.reits,
            currentNetWorth: plan.currentNetWorth,
            monthlyInvestments: suggested.monthlyInvestments
        };
        setPortfolio(defaultPortfolio);
        onAssetsUpdated(defaultPortfolio);
        
        setExecutionStatus({
            isOnTrack: true,
            message: 'Portfolio reset to default monthly investment plan.',
            progress: 0
        });
    };

    useEffect(() => {
        const suggested = calculateSuggestedPortfolio();
        const defaultPortfolio = {
            fixedDeposits: suggested.monthlyInvestments.fixedDeposits,
            bonds: suggested.monthlyInvestments.bonds,
            mutualFunds: suggested.monthlyInvestments.mutualFunds,
            stocks: suggested.monthlyInvestments.stocks,
            gold: suggested.monthlyInvestments.gold,
            reits: suggested.monthlyInvestments.reits,
            currentNetWorth: plan.currentNetWorth,
            monthlyInvestments: suggested.monthlyInvestments
        };
        setPortfolio(defaultPortfolio);
        onAssetsUpdated(defaultPortfolio);
        
        setExecutionStatus({
            isOnTrack: true,
            message: 'Monthly investment plan initialized based on your target allocation.',
            progress: 100
        });
    }, [plan]);

    const calculateCurrentAllocation = () => {
        // Calculate total invested amount excluding current net worth
        const totalInvested = portfolio.fixedDeposits + 
                            portfolio.bonds + 
                            portfolio.mutualFunds + 
                            portfolio.stocks + 
                            portfolio.gold + 
                            portfolio.reits;

        if (totalInvested === 0) return { lowRisk: 0, moderateRisk: 0, highRisk: 0 };

        // Calculate risk-based allocation percentages
        const lowRisk = ((portfolio.fixedDeposits + portfolio.bonds) / totalInvested) * 100;
        const moderateRisk = ((portfolio.mutualFunds + portfolio.gold) / totalInvested) * 100;
        const highRisk = ((portfolio.stocks + portfolio.reits) / totalInvested) * 100;

        return { lowRisk, moderateRisk, highRisk };
    };

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

    useEffect(() => {
        onAssetsUpdated(portfolio);
    }, [portfolio, onAssetsUpdated]);

    useEffect(() => {
        // Update monthly investments whenever plan changes
        setPortfolio(currentPortfolio => {
            const updatedPortfolio = updateMonthlyInvestments(currentPortfolio);
            onAssetsUpdated(updatedPortfolio);
            return updatedPortfolio;
        });
    }, [plan.monthlySavings, plan.allocation]);

    useEffect(() => {
        // Update monthly investments whenever portfolio values change
        const updatePortfolioWithMonthly = () => {
            const totalAssets = Object.values({
                fixedDeposits: portfolio.fixedDeposits,
                bonds: portfolio.bonds,
                mutualFunds: portfolio.mutualFunds,
                stocks: portfolio.stocks,
                gold: portfolio.gold,
                reits: portfolio.reits
            }).reduce((sum, value) => sum + value, 0);

            // Calculate execution progress
            const targetAmount = plan.monthlySavings * 6;
            const progress = Math.min((totalAssets / targetAmount) * 100, 100);

            let message = '';
            let isOnTrack = true;

            if (progress >= 90) {
                message = 'Excellent progress! You are very close to your 6-month target.';
            } else if (progress >= 75) {
                message = 'Good progress! Keep maintaining your monthly investments.';
            } else if (progress >= 50) {
                message = 'You are on track. Continue with your investment plan.';
            } else if (progress >= 25) {
                message = 'Getting started well. Stay consistent with your investments.';
                isOnTrack = true;
            } else {
                message = 'You are in the early stages. Focus on regular monthly investments.';
                isOnTrack = true;
            }

            setExecutionStatus({
                isOnTrack,
                message,
                progress
            });

            // Update monthly investments based on current portfolio allocation
            const updatedPortfolio = updateMonthlyInvestments(portfolio);
            if (JSON.stringify(updatedPortfolio) !== JSON.stringify(portfolio)) {
                setPortfolio(updatedPortfolio);
                onAssetsUpdated(updatedPortfolio);
            }
        };

        updatePortfolioWithMonthly();
    }, [portfolio.fixedDeposits, portfolio.bonds, portfolio.mutualFunds, portfolio.stocks, portfolio.gold, portfolio.reits, plan.monthlySavings]);

    return (
        <div>
            <div className={styles['section-header']}>
                <h2>Execute Your Plan</h2>
                <div>
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

            <div className={styles['monthly-investments']}>
                <h3>Monthly Investment Plan</h3>
                <div className={styles['monthly-total']}>
                    <span>Total Monthly Investment</span>
                    <strong>{formatIndianCurrency(portfolio.monthlyInvestments.total)}</strong>
                </div>
                <div className={styles['monthly-breakdown']}>
                    <div className={styles['breakdown-item']}>
                        <span>Fixed Deposits</span>
                        <span>{formatIndianCurrency(portfolio.monthlyInvestments.fixedDeposits)}</span>
                    </div>
                    <div className={styles['breakdown-item']}>
                        <span>Bonds</span>
                        <span>{formatIndianCurrency(portfolio.monthlyInvestments.bonds)}</span>
                    </div>
                    <div className={styles['breakdown-item']}>
                        <span>Mutual Funds</span>
                        <span>{formatIndianCurrency(portfolio.monthlyInvestments.mutualFunds)}</span>
                    </div>
                    <div className={styles['breakdown-item']}>
                        <span>Stocks</span>
                        <span>{formatIndianCurrency(portfolio.monthlyInvestments.stocks)}</span>
                    </div>
                    <div className={styles['breakdown-item']}>
                        <span>Gold</span>
                        <span>{formatIndianCurrency(portfolio.monthlyInvestments.gold)}</span>
                    </div>
                    <div className={styles['breakdown-item']}>
                        <span>REITs</span>
                        <span>{formatIndianCurrency(portfolio.monthlyInvestments.reits)}</span>
                    </div>
                </div>
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
                                    <span>Monthly Investment</span>
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
                                <p className={styles['input-helper']}>
                                    Suggested: {formatIndianCurrency(calculateSuggestedPortfolio().monthlyInvestments.fixedDeposits)}
                                </p>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-amount']}>
                                    {formatIndianCurrency(portfolio.fixedDeposits * 6)}
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
                                    <span>Monthly Investment</span>
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
                                <p className={styles['input-helper']}>
                                    Suggested: {formatIndianCurrency(calculateSuggestedPortfolio().monthlyInvestments.bonds)}
                                </p>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-amount']}>
                                    {formatIndianCurrency(portfolio.bonds * 6)}
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
                                    <span>Monthly Investment</span>
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
                                <p className={styles['input-helper']}>
                                    Suggested: {formatIndianCurrency(calculateSuggestedPortfolio().monthlyInvestments.mutualFunds)}
                                </p>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-amount']}>
                                    {formatIndianCurrency(portfolio.mutualFunds * 6)}
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
                                    <span>Monthly Investment</span>
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
                                <p className={styles['input-helper']}>
                                    Suggested: {formatIndianCurrency(calculateSuggestedPortfolio().monthlyInvestments.gold)}
                                </p>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-amount']}>
                                    {formatIndianCurrency(portfolio.gold * 6)}
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
                                    <span>Monthly Investment</span>
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
                                <p className={styles['input-helper']}>
                                    Suggested: {formatIndianCurrency(calculateSuggestedPortfolio().monthlyInvestments.stocks)}
                                </p>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-amount']}>
                                    {formatIndianCurrency(portfolio.stocks * 6)}
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
                                    <span>Monthly Investment</span>
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
                                <p className={styles['input-helper']}>
                                    Suggested: {formatIndianCurrency(calculateSuggestedPortfolio().monthlyInvestments.reits)}
                                </p>
                            </div>
                            <div className={styles['input-column']}>
                                <label>Target (6 Months)</label>
                                <div className={styles['target-amount']}>
                                    {formatIndianCurrency(portfolio.reits * 6)}
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
