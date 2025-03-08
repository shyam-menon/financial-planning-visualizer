import React, { useState, useEffect } from 'react';
import FinancialChart from './FinancialChart';

const RateOfReturn: React.FC = () => {
    const [startingCapital, setStartingCapital] = useState<number>(1000000);
    const [startingAge, setStartingAge] = useState<number>(30);
    const [endingAge, setEndingAge] = useState<number>(60);
    const [returnRate, setReturnRate] = useState<number>(12);
    const [animatedAmount, setAnimatedAmount] = useState<number>(0);
    const [animatedMultiple, setAnimatedMultiple] = useState<number>(1);

    const calculateGrowth = () => {
        const years = endingAge - startingAge;
        const finalAmount = startingCapital * Math.pow(1 + returnRate / 100, years);
        const growthMultiple = finalAmount / startingCapital;
        return { finalAmount, growthMultiple, years };
    };

    useEffect(() => {
        const { finalAmount, growthMultiple } = calculateGrowth();
        
        // Animate the final amount
        const startAmount = animatedAmount;
        const endAmount = finalAmount;
        const startMultiple = animatedMultiple;
        const endMultiple = growthMultiple;
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            
            if (elapsed < duration) {
                const progress = elapsed / duration;
                const currentAmount = startAmount + (endAmount - startAmount) * progress;
                const currentMultiple = startMultiple + (endMultiple - startMultiple) * progress;
                setAnimatedAmount(currentAmount);
                setAnimatedMultiple(currentMultiple);
                requestAnimationFrame(animate);
            } else {
                setAnimatedAmount(endAmount);
                setAnimatedMultiple(endMultiple);
            }
        };
        
        requestAnimationFrame(animate);
    }, [startingCapital, startingAge, endingAge, returnRate]);

    const formatCurrency = (amount: number): string => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} L`;
        }
        return `₹${amount.toLocaleString()}`;
    };

    const generateChartData = () => {
        const years = endingAge - startingAge;
        const data = [];
        
        for (let year = 0; year <= years; year++) {
            const amount = startingCapital * Math.pow(1 + returnRate / 100, year);
            data.push({
                age: startingAge + year,
                amount: amount
            });
        }
        
        return data;
    };

    const chartData = {
        labels: generateChartData().map(data => data.age),
        datasets: [
            {
                label: 'Net Worth',
                data: generateChartData().map(data => data.amount),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true
            }
        ]
    };

    return (
        <div className="visualization-container rate-of-return">
            <h2>Power of Rate of Return</h2>
            <p className="explanation">
                See how your wealth can grow exponentially through the power of compound returns. 
                A higher rate of return can dramatically impact your long-term wealth.
            </p>

            <div className="interactive-section">
                <div className="input-grid">
                    <div className="input-group">
                        <label htmlFor="starting-capital">
                            Starting Capital (₹)
                            <div className="input-wrapper">
                                <input
                                    id="starting-capital"
                                    type="number"
                                    min="100000"
                                    step="100000"
                                    value={startingCapital}
                                    onChange={(e) => setStartingCapital(Math.max(100000, Number(e.target.value)))}
                                />
                                <div className="input-icon">₹</div>
                            </div>
                        </label>
                    </div>

                    <div className="input-group">
                        <label htmlFor="starting-age">
                            Current Age
                            <div className="input-wrapper">
                                <input
                                    id="starting-age"
                                    type="number"
                                    min="18"
                                    max="59"
                                    value={startingAge}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (value < endingAge) {
                                            setStartingAge(value);
                                        }
                                    }}
                                />
                                <div className="input-icon">yrs</div>
                            </div>
                        </label>
                    </div>

                    <div className="input-group">
                        <label htmlFor="ending-age">
                            Target Age
                            <div className="input-wrapper">
                                <input
                                    id="ending-age"
                                    type="number"
                                    min="19"
                                    max="100"
                                    value={endingAge}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (value > startingAge) {
                                            setEndingAge(value);
                                        }
                                    }}
                                />
                                <div className="input-icon">yrs</div>
                            </div>
                        </label>
                    </div>

                    <div className="input-group slider-group">
                        <label htmlFor="return-rate">
                            Annual Return Rate (%)
                            <div className="slider-container">
                                <input
                                    id="return-rate"
                                    type="range"
                                    min="1"
                                    max="30"
                                    step="0.5"
                                    value={returnRate}
                                    onChange={(e) => setReturnRate(Number(e.target.value))}
                                    className="slider"
                                />
                                <div className="slider-value">{returnRate}%</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="result-card growth-card">
                    <div className="result-grid">
                        <div className="result-item">
                            <h3>Final Amount</h3>
                            <div className="result-value highlight-number">
                                {formatCurrency(animatedAmount)}
                            </div>
                        </div>
                        <div className="result-item">
                            <h3>Growth Multiple</h3>
                            <div className="result-value highlight-number">
                                {animatedMultiple.toFixed(1)}x
                            </div>
                        </div>
                        <div className="result-item">
                            <h3>Time Period</h3>
                            <div className="result-value">
                                {endingAge - startingAge} years
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chart-section">
                    <FinancialChart
                        title="Wealth Growth Projection"
                        labels={chartData.labels}
                        datasets={chartData.datasets}
                        yAxisLabel="Net Worth (₹)"
                        xAxisLabel="Age"
                    />
                </div>

                <div className="insight">
                    <div className="insight-card">
                        <div className="insight-icon">💡</div>
                        <div className="insight-content">
                            <p>
                                Starting with <span className="highlight-amount">{formatCurrency(startingCapital)}</span> at age {startingAge},
                                with a <span className="highlight-rate">{returnRate}%</span> annual return rate:
                            </p>
                            <ul className="insight-list">
                                <li>Your money will grow {animatedMultiple.toFixed(1)}x over {endingAge - startingAge} years</li>
                                <li>You'll have {formatCurrency(animatedAmount)} by age {endingAge}</li>
                                <li>This demonstrates the power of compound growth over time</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RateOfReturn;
