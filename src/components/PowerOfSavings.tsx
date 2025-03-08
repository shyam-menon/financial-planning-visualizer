import React, { useState, useCallback, useEffect } from 'react';
import FinancialChart from './FinancialChart';
import styles from './PowerOfSavings.module.css';

interface YearlyData {
    age: number;
    yearsToRetirement: number;
    currentSavings: number;
    annualSavings: number;
    netWorth: number;
    returnAmount: number;
    savingsGrowth: number;
    cumulativeReturns: number;
    cumulativeSavings: number;
}

const PowerOfSavings: React.FC = () => {
    const [currentAge, setCurrentAge] = useState<number>(25);
    const [retirementAge, setRetirementAge] = useState<number>(60);
    const [initialSavings, setInitialSavings] = useState<number>(10000000); // 1 Crore
    const [annualSavings, setAnnualSavings] = useState<number>(1200000); // 12 Lakhs
    const [returnRate, setReturnRate] = useState<number>(7); // Conservative estimate for Indian markets
    const [savingsGrowthRate, setSavingsGrowthRate] = useState<number>(6); // Based on Indian inflation
    const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);

    const calculateProjection = useCallback(() => {
        const data: YearlyData[] = [];
        let currentSavings = initialSavings;
        let currentAnnualSavings = annualSavings;
        let totalYears = retirementAge - currentAge;
        let cumulativeReturns = 0;
        let cumulativeSavings = initialSavings;

        for (let year = 0; year <= totalYears; year++) {
            const age = currentAge + year;
            const yearsToRetirement = totalYears - year;
            
            // Calculate returns on existing net worth
            const returnAmount = currentSavings * (returnRate / 100);
            cumulativeReturns += returnAmount;
            
            // Calculate growth in annual savings
            const savingsGrowth = year > 0 ? 
                (currentAnnualSavings * savingsGrowthRate / 100) : 0;
            
            // Update annual savings with growth
            if (year > 0) {
                currentAnnualSavings += savingsGrowth;
                cumulativeSavings += currentAnnualSavings;
            }

            // Calculate new net worth
            currentSavings = currentSavings + returnAmount + currentAnnualSavings;

            data.push({
                age,
                yearsToRetirement,
                currentSavings: Number(currentSavings.toFixed(2)),
                annualSavings: Number(currentAnnualSavings.toFixed(2)),
                netWorth: Number(currentSavings.toFixed(2)),
                returnAmount: Number(returnAmount.toFixed(2)),
                savingsGrowth: Number(savingsGrowth.toFixed(2)),
                cumulativeReturns: Number(cumulativeReturns.toFixed(2)),
                cumulativeSavings: Number(cumulativeSavings.toFixed(2))
            });
        }

        setYearlyData(data);
    }, [currentAge, retirementAge, initialSavings, annualSavings, returnRate, savingsGrowthRate]);

    useEffect(() => {
        calculateProjection();
    }, [calculateProjection]);

    const formatCurrency = (amount: number): string => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} L`;
        }
        return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    };

    const chartData = {
        labels: yearlyData.map(data => data.age),
        datasets: [
            {
                label: 'Net Worth',
                data: yearlyData.map(data => data.netWorth),
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                borderWidth: 2,
                order: 1
            },
            {
                label: 'Total Savings',
                data: yearlyData.map(data => data.cumulativeSavings),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                borderWidth: 2,
                order: 2
            }
        ]
    };

    const returnsBreakdownData = {
        labels: yearlyData.map(data => data.age),
        datasets: [
            {
                label: 'Investment Returns',
                data: yearlyData.map(data => data.cumulativeReturns),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                borderWidth: 2,
                order: 1
            },
            {
                label: 'Annual Contributions',
                data: yearlyData.map(data => data.annualSavings),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                borderWidth: 2,
                order: 2
            }
        ]
    };

    return (
        <div className={styles['visualization-container']}>
            <h2>Power of Consistent Savings</h2>
            <p className={styles.explanation}>
                See how your wealth grows through a combination of existing savings, 
                regular contributions that increase over time, and investment returns. 
                This demonstrates why both saving consistently and investing wisely 
                are crucial for long-term wealth building.
            </p>

            <div className={styles['interactive-section']}>
                <div className={styles['input-grid']}>
                    <div className={styles['input-group']}>
                        <label htmlFor="currentAge">
                            Current Age
                            <span className={styles['input-value']}>{currentAge}</span>
                        </label>
                        <input
                            type="range"
                            id="currentAge"
                            min="18"
                            max="70"
                            value={currentAge}
                            onChange={(e) => setCurrentAge(parseInt(e.target.value))}
                        />
                    </div>

                    <div className={styles['input-group']}>
                        <label htmlFor="retirementAge">
                            Retirement Age
                            <span className={styles['input-value']}>{retirementAge}</span>
                        </label>
                        <input
                            type="range"
                            id="retirementAge"
                            min={currentAge + 1}
                            max="90"
                            value={retirementAge}
                            onChange={(e) => setRetirementAge(parseInt(e.target.value))}
                        />
                    </div>

                    <div className={styles['input-group']}>
                        <label htmlFor="initialSavings">
                            Initial Savings
                            <span className={styles['input-value']}>{formatCurrency(initialSavings)}</span>
                        </label>
                        <input
                            type="range"
                            id="initialSavings"
                            min="100000"
                            max="100000000"
                            step="100000"
                            value={initialSavings}
                            onChange={(e) => setInitialSavings(parseInt(e.target.value))}
                        />
                    </div>

                    <div className={styles['input-group']}>
                        <label htmlFor="annualSavings">
                            Annual Savings
                            <span className={styles['input-value']}>{formatCurrency(annualSavings)}</span>
                        </label>
                        <input
                            type="range"
                            id="annualSavings"
                            min="100000"
                            max="10000000"
                            step="100000"
                            value={annualSavings}
                            onChange={(e) => setAnnualSavings(parseInt(e.target.value))}
                        />
                    </div>

                    <div className={styles['input-group']}>
                        <label htmlFor="returnRate">
                            Expected Return Rate (%)
                            <span className={styles['input-value']}>{returnRate}%</span>
                        </label>
                        <input
                            type="range"
                            id="returnRate"
                            min="1"
                            max="15"
                            step="0.1"
                            value={returnRate}
                            onChange={(e) => setReturnRate(parseFloat(e.target.value))}
                        />
                    </div>

                    <div className={styles['input-group']}>
                        <label htmlFor="savingsGrowthRate">
                            Annual Savings Growth Rate (%)
                            <span className={styles['input-value']}>{savingsGrowthRate}%</span>
                        </label>
                        <input
                            type="range"
                            id="savingsGrowthRate"
                            min="0"
                            max="15"
                            step="0.1"
                            value={savingsGrowthRate}
                            onChange={(e) => setSavingsGrowthRate(parseFloat(e.target.value))}
                        />
                    </div>
                </div>

                <div className={styles['summary-stats']}>
                    <div className={styles.stat}>
                        <label>Final Net Worth:</label>
                        <span>{formatCurrency(yearlyData[yearlyData.length - 1]?.netWorth || 0)}</span>
                    </div>
                    <div className={styles.stat}>
                        <label>Total Investment Returns:</label>
                        <span>{formatCurrency(yearlyData[yearlyData.length - 1]?.cumulativeReturns || 0)}</span>
                    </div>
                    <div className={styles.stat}>
                        <label>Total Contributions:</label>
                        <span>{formatCurrency(yearlyData[yearlyData.length - 1]?.cumulativeSavings || 0)}</span>
                    </div>
                </div>

                <div className={styles['chart-container']} style={{ height: '400px', marginBottom: '2rem' }}>
                    <FinancialChart
                        title="Net Worth Growth Over Time"
                        labels={chartData.labels}
                        datasets={chartData.datasets}
                        yAxisLabel="Amount (₹)"
                        xAxisLabel="Age"
                        useLogScale={true}
                    />
                </div>

                <div className={styles['chart-container']} style={{ height: '400px' }}>
                    <FinancialChart
                        title="Returns Breakdown"
                        labels={returnsBreakdownData.labels}
                        datasets={returnsBreakdownData.datasets}
                        yAxisLabel="Amount (₹)"
                        xAxisLabel="Age"
                        useLogScale={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default PowerOfSavings;
