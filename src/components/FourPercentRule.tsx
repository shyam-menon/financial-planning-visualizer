import React, { useState, useEffect } from 'react';
import FinancialChart from './FinancialChart';

const FourPercentRule: React.FC = () => {
    const [startingBalance, setStartingBalance] = useState<number>(10000000);
    const [withdrawalRate, setWithdrawalRate] = useState<number>(4);
    const [returnRate, setReturnRate] = useState<number>(7);
    const [inflationRate, setInflationRate] = useState<number>(3);
    const [years, setYears] = useState<number>(30);
    const [animatedWithdrawal, setAnimatedWithdrawal] = useState<number>(0);
    const [animatedBalance, setAnimatedBalance] = useState<number>(0);

    const calculateProjection = () => {
        const initialWithdrawal = (startingBalance * withdrawalRate) / 100;
        const projectionData = [];
        let currentBalance = startingBalance;
        let currentWithdrawal = initialWithdrawal;
        const realReturnRate = (1 + returnRate / 100) / (1 + inflationRate / 100) - 1;

        for (let year = 0; year <= years; year++) {
            const returns = currentBalance * (returnRate / 100);
            const endingBalance = currentBalance + returns - currentWithdrawal;
            
            projectionData.push({
                year,
                startingBalance: currentBalance,
                returns: returns,
                withdrawal: currentWithdrawal,
                endingBalance: endingBalance
            });

            currentBalance = endingBalance;
            // Increase withdrawal by inflation rate
            currentWithdrawal = currentWithdrawal * (1 + inflationRate / 100);
        }

        return {
            projectionData,
            initialWithdrawal,
            finalBalance: currentBalance,
            finalWithdrawal: currentWithdrawal,
            realReturnRate: realReturnRate * 100
        };
    };

    useEffect(() => {
        const { initialWithdrawal, finalBalance } = calculateProjection();
        
        const startWithdrawal = animatedWithdrawal;
        const endWithdrawal = initialWithdrawal;
        const startBalance = animatedBalance;
        const endBalance = finalBalance;
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            
            if (elapsed < duration) {
                const progress = elapsed / duration;
                const currentWithdrawal = startWithdrawal + (endWithdrawal - startWithdrawal) * progress;
                const currentBalance = startBalance + (endBalance - startBalance) * progress;
                setAnimatedWithdrawal(currentWithdrawal);
                setAnimatedBalance(currentBalance);
                requestAnimationFrame(animate);
            } else {
                setAnimatedWithdrawal(endWithdrawal);
                setAnimatedBalance(endBalance);
            }
        };
        
        requestAnimationFrame(animate);
    }, [startingBalance, withdrawalRate, returnRate, inflationRate, years]);

    const formatCurrency = (amount: number): string => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} L`;
        }
        return `₹${amount.toLocaleString()}`;
    };

    const { projectionData, finalWithdrawal, realReturnRate } = calculateProjection();
    const chartData = {
        labels: projectionData.map(data => `Year ${data.year}`),
        datasets: [
            {
                label: 'Starting Balance',
                data: projectionData.map(data => data.startingBalance),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                order: 1
            },
            {
                label: 'Investment Returns',
                data: projectionData.map(data => data.returns),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                order: 2
            },
            {
                label: 'Annual Withdrawal',
                data: projectionData.map(data => data.withdrawal),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                order: 3
            },
            {
                label: 'Ending Balance',
                data: projectionData.map(data => data.endingBalance),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderDash: [5, 5],
                fill: false,
                order: 0
            }
        ]
    };

    const isPortfolioSustainable = animatedBalance > 0;

    return (
        <div className="visualization-container four-percent-rule">
            <h2>The 4% Rule Visualization</h2>
            <p className="explanation">
                The 4% rule suggests that you can withdraw 4% of your retirement savings annually, 
                adjusted for inflation, with a high probability of your portfolio lasting 30 years.
            </p>

            <div className="interactive-section">
                <div className="input-grid">
                    <div className="input-group">
                        <label htmlFor="starting-balance">
                            Starting Balance
                            <div className="input-wrapper">
                                <input
                                    id="starting-balance"
                                    type="number"
                                    min="1000000"
                                    step="100000"
                                    value={startingBalance}
                                    onChange={(e) => setStartingBalance(Math.max(1000000, Number(e.target.value)))}
                                />
                                <div className="input-icon">₹</div>
                            </div>
                        </label>
                    </div>

                    <div className="input-group slider-group">
                        <label htmlFor="withdrawal-rate">
                            Withdrawal Rate (%)
                            <div className="slider-container">
                                <input
                                    id="withdrawal-rate"
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="0.1"
                                    value={withdrawalRate}
                                    onChange={(e) => setWithdrawalRate(Number(e.target.value))}
                                    className="slider"
                                />
                                <div className="slider-value">{withdrawalRate}%</div>
                            </div>
                        </label>
                    </div>

                    <div className="input-group slider-group">
                        <label htmlFor="return-rate">
                            Expected Return Rate (%)
                            <div className="slider-container">
                                <input
                                    id="return-rate"
                                    type="range"
                                    min="1"
                                    max="15"
                                    step="0.5"
                                    value={returnRate}
                                    onChange={(e) => setReturnRate(Number(e.target.value))}
                                    className="slider"
                                />
                                <div className="slider-value">{returnRate}%</div>
                            </div>
                        </label>
                    </div>

                    <div className="input-group slider-group">
                        <label htmlFor="inflation-rate">
                            Expected Inflation Rate (%)
                            <div className="slider-container">
                                <input
                                    id="inflation-rate"
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="0.5"
                                    value={inflationRate}
                                    onChange={(e) => setInflationRate(Number(e.target.value))}
                                    className="slider"
                                />
                                <div className="slider-value">{inflationRate}%</div>
                            </div>
                        </label>
                    </div>

                    <div className="input-group slider-group">
                        <label htmlFor="years">
                            Projection Years
                            <div className="slider-container">
                                <input
                                    id="years"
                                    type="range"
                                    min="10"
                                    max="50"
                                    step="1"
                                    value={years}
                                    onChange={(e) => setYears(Number(e.target.value))}
                                    className="slider"
                                />
                                <div className="slider-value">{years} years</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="result-card withdrawal-card">
                    <div className="result-grid">
                        <div className="result-item">
                            <h3>Initial Annual Withdrawal</h3>
                            <div className="result-value highlight-number">
                                {formatCurrency(animatedWithdrawal)}
                            </div>
                            <div className="result-subtitle">
                                Monthly: {formatCurrency(animatedWithdrawal / 12)}
                            </div>
                        </div>
                        <div className="result-item">
                            <h3>Final Annual Withdrawal</h3>
                            <div className="result-value highlight-number">
                                {formatCurrency(finalWithdrawal)}
                            </div>
                            <div className="result-subtitle">
                                After {years} years with inflation
                            </div>
                        </div>
                        <div className="result-item">
                            <h3>Final Balance</h3>
                            <div className="result-value highlight-number">
                                {formatCurrency(animatedBalance)}
                            </div>
                            <div className="result-subtitle">
                                After {years} years
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sustainability-indicator">
                    <div className={`indicator ${isPortfolioSustainable ? 'sustainable' : 'unsustainable'}`}>
                        <div className="indicator-icon">
                            {isPortfolioSustainable ? '✅' : '⚠️'}
                        </div>
                        <div className="indicator-text">
                            {isPortfolioSustainable 
                                ? `Your portfolio is likely to be sustainable with a real return rate of ${realReturnRate.toFixed(1)}%` 
                                : 'Your withdrawal rate may be too high relative to returns and inflation'}
                        </div>
                    </div>
                </div>

                <div className="chart-section">
                    <FinancialChart
                        title="Portfolio Balance, Returns, and Withdrawals Over Time"
                        labels={chartData.labels}
                        datasets={chartData.datasets}
                        yAxisLabel="Amount (₹)"
                        xAxisLabel="Time"
                    />
                    <div className="chart-legend">
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#6366f1' }}></div>
                            <span>Starting Balance: Your portfolio value at the start of each year</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#10b981' }}></div>
                            <span>Investment Returns: Earnings based on {returnRate}% return rate</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#ef4444' }}></div>
                            <span>Annual Withdrawal: Increases by {inflationRate}% inflation each year</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#8b5cf6' }}></div>
                            <span>Ending Balance: Portfolio value after returns and withdrawals</span>
                        </div>
                    </div>
                </div>

                <div className="insight">
                    <div className="insight-card">
                        <div className="insight-icon">💡</div>
                        <div className="insight-content">
                            <p>
                                With a starting balance of <span className="highlight-amount">{formatCurrency(startingBalance)}</span>,
                                withdrawal rate of <span className="highlight-rate">{withdrawalRate}%</span>, and 
                                inflation rate of <span className="highlight-rate">{inflationRate}%</span>:
                            </p>
                            <ul className="insight-list">
                                <li>Initial withdrawal: {formatCurrency(animatedWithdrawal)} per year</li>
                                <li>Final withdrawal: {formatCurrency(finalWithdrawal)} per year</li>
                                <li>Real return rate (after inflation): {realReturnRate.toFixed(1)}%</li>
                                <li>Portfolio {isPortfolioSustainable ? 'maintains' : 'depletes'} value over {years} years</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FourPercentRule;
