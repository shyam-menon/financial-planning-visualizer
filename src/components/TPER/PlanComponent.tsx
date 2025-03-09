import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import styles from './TPER.module.css';

export interface AssetAllocation {
    lowRisk: number;
    moderateRisk: number;
    highRisk: number;
    monthlySavings: number;
    savingsGrowthRate: number;
    currentNetWorth: number;
}

interface PlanComponentProps {
    targetCorpus: number;
    currentAge: number;
    retirementAge: number;
    onPlanSet: (plan: AssetAllocation) => void;
}

const calculateDefaultNetWorth = (age: number): number => {
    // Base: 1 crore at age 36
    const baseAge = 36;
    const baseNetWorth = 10000000; // 1 crore in rupees
    
    if (age <= baseAge) {
        // For younger ages, scale down by 10% per year difference
        const yearDiff = baseAge - age;
        return baseNetWorth * Math.pow(0.9, yearDiff);
    } else {
        // For older ages, scale up by 8% per year difference
        // Using a slightly lower rate than typical returns to be conservative
        const yearDiff = age - baseAge;
        return baseNetWorth * Math.pow(1.08, yearDiff);
    }
};

const ASSET_RETURNS = {
    lowRisk: 6.5,     // Fixed deposits and bonds (conservative)
    moderateRisk: 9,  // Hybrid funds (balanced)
    highRisk: 12      // Stocks and equity MF (aggressive)
};

export const PlanComponent: React.FC<PlanComponentProps> = ({ targetCorpus, currentAge, retirementAge, onPlanSet }) => {
    const [monthlyInvestment, setMonthlyInvestment] = useState<number>(0);
    const [expectedReturn, setExpectedReturn] = useState<number>(7); // Default conservative rate
    const [currentNetWorth, setCurrentNetWorth] = useState<number>(() => calculateDefaultNetWorth(currentAge));
    const [allocation, setAllocation] = useState<AssetAllocation>({
        lowRisk: 30,
        moderateRisk: 40,
        highRisk: 30,
        monthlySavings: 0,
        savingsGrowthRate: 7,
        currentNetWorth: currentNetWorth
    });
    const [showRecommendation, setShowRecommendation] = useState<boolean>(false);

    // Update currentNetWorth when age changes
    useEffect(() => {
        setCurrentNetWorth(calculateDefaultNetWorth(currentAge));
    }, [currentAge]);

    const yearsToRetirement = retirementAge - currentAge;

    useEffect(() => {
        // Calculate required monthly investment based on target, current net worth, and years
        const monthsToRetirement = yearsToRetirement * 12;
        const monthlyRate = expectedReturn / 1200; // Convert annual % to monthly decimal
        
        // Future Value = Present Value * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
        // Solve for PMT (monthly investment)
        const futureValue = targetCorpus;
        const presentValue = currentNetWorth;
        const rateFactorPV = Math.pow(1 + monthlyRate, monthsToRetirement);
        const rateFactorPMT = (rateFactorPV - 1) / monthlyRate;
        
        // Round to nearest thousand for better readability in Indian context
        const requiredMonthly = Math.max(0, Math.round((futureValue - presentValue * rateFactorPV) / rateFactorPMT / 1000) * 1000);
        setMonthlyInvestment(requiredMonthly);
        
        // Update allocation with the new monthly savings
        setAllocation(prev => ({
            ...prev,
            monthlySavings: requiredMonthly,
            savingsGrowthRate: expectedReturn,
            currentNetWorth: currentNetWorth
        }));
    }, [targetCorpus, currentNetWorth, expectedReturn, yearsToRetirement]);

    // Calculate weighted average return based on asset allocation
    const calculateExpectedReturn = (alloc: Pick<AssetAllocation, 'lowRisk' | 'moderateRisk' | 'highRisk'>): number => {
        const weightedReturn = (
            (alloc.lowRisk * ASSET_RETURNS.lowRisk +
            alloc.moderateRisk * ASSET_RETURNS.moderateRisk +
            alloc.highRisk * ASSET_RETURNS.highRisk) / 100
        );
        return Math.round(weightedReturn * 10) / 10; // Round to 1 decimal place
    };

    // Update expected return when allocation changes
    useEffect(() => {
        const newExpectedReturn = calculateExpectedReturn(allocation);
        setExpectedReturn(newExpectedReturn);
        setAllocation(prev => ({
            ...prev,
            savingsGrowthRate: newExpectedReturn,
            currentNetWorth: currentNetWorth
        }));
    }, [allocation.lowRisk, allocation.moderateRisk, allocation.highRisk]);

    const getRecommendedAllocation = (age: number): AssetAllocation => {
        // Conservative allocation based on age
        // Rule of thumb: 100 - age = equity allocation
        const equityPercent = Math.max(30, Math.min(70, 100 - age));
        const debtPercent = Math.min(50, 100 - equityPercent);
        const hybridPercent = 100 - equityPercent - debtPercent;

        return {
            lowRisk: debtPercent,
            moderateRisk: hybridPercent,
            highRisk: equityPercent,
            monthlySavings: monthlyInvestment,
            savingsGrowthRate: expectedReturn,
            currentNetWorth: currentNetWorth
        };
    };

    const progressPercentage = Math.min(100, Math.round((currentNetWorth / targetCorpus) * 100));
    const progressColor = progressPercentage < 30 ? '#ef4444' : 
                         progressPercentage < 60 ? '#f59e0b' : '#22c55e';

    const handleSave = () => {
        // Round monthly investment to nearest thousand (Indian context)
        const roundedInvestment = Math.round(monthlyInvestment / 1000) * 1000;
        
        // Save the plan with final values
        onPlanSet({
            lowRisk: allocation.lowRisk,
            moderateRisk: allocation.moderateRisk,
            highRisk: allocation.highRisk,
            monthlySavings: roundedInvestment,
            savingsGrowthRate: expectedReturn,
            currentNetWorth: currentNetWorth
        });
    };

    const formatIndianCurrency = (amount: number): string => {
        // For zero amount
        if (amount === 0) {
            return '₹0';
        }

        // Format for amounts less than 1 lakh
        if (amount < 100000) {
            return `₹${amount.toLocaleString('en-IN')}`;
        }
        
        const crore = Math.floor(amount / 10000000);
        const lakh = Math.floor((amount % 10000000) / 100000);
        const thousands = Math.floor((amount % 100000) / 1000);
        
        let parts = [];
        if (crore > 0) {
            parts.push(`${crore} crore`);
        }
        if (lakh > 0) {
            parts.push(`${lakh} lakh`);
        }
        if (thousands > 0) {
            parts.push(`${thousands} thousand`);
        }
        
        return `₹${parts.join(' ')}`;
    };

    // Calculate required monthly investment using compound interest formula
    const calculateRequiredMonthly = (): number => {
        const monthsToRetirement = yearsToRetirement * 12;
        const monthlyRate = expectedReturn / 1200; // Convert annual % to monthly decimal
        
        const futureValue = targetCorpus;
        const presentValue = currentNetWorth;
        const rateFactorPV = Math.pow(1 + monthlyRate, monthsToRetirement);
        const rateFactorPMT = (rateFactorPV - 1) / monthlyRate;
        
        return Math.max(0, Math.round((futureValue - presentValue * rateFactorPV) / rateFactorPMT / 1000) * 1000);
    };

    const calculatedMonthlyInvestment = calculateRequiredMonthly();

    return (
        <div className={styles['plan-component']}>
            <h2>Create Your Investment Plan</h2>

            <div className={styles['net-worth-section']}>
                <h3>Current Financial Status</h3>
                <div className={styles['input-group']}>
                    <div className={styles['input-field']}>
                        <div className={styles['input-label']}>
                            <span>Current Net Worth</span>
                            <span className={styles['currency-symbol']}>₹</span>
                        </div>
                        <div className={styles['currency-input']}>
                            <input
                                type="number"
                                value={currentNetWorth}
                                onChange={(e) => setCurrentNetWorth(Number(e.target.value))}
                                min="0"
                                step="10000"
                            />
                        </div>
                        <div className={styles['info-text']}>
                            {formatIndianCurrency(currentNetWorth)}
                        </div>
                    </div>
                    <div className={styles['input-field']}>
                        <div className={styles['input-label']}>
                            <span>Planned Monthly Investment</span>
                            <span className={styles['currency-symbol']}>₹</span>
                        </div>
                        <div className={styles['currency-input']}>
                            <input
                                type="number"
                                value={monthlyInvestment}
                                onChange={(e) => {
                                    // Round to nearest thousand for better UX in Indian context
                                    const value = Math.round(Number(e.target.value) / 1000) * 1000;
                                    setMonthlyInvestment(value);
                                    setAllocation(prev => ({
                                        ...prev,
                                        monthlySavings: value,
                                        savingsGrowthRate: expectedReturn,
                                        currentNetWorth: currentNetWorth
                                    }));
                                }}
                                min="0"
                                step="1000"
                                className={styles['editable-input']}
                                placeholder="Enter planned monthly investment"
                            />
                        </div>
                        <div className={styles['info-text']}>
                            {formatIndianCurrency(monthlyInvestment)} per month
                        </div>
                        {monthlyInvestment > 0 && (
                            <div className={`${styles['suggestion-text']} ${monthlyInvestment < calculatedMonthlyInvestment ? styles['warning'] : ''}`}>
                                {monthlyInvestment < calculatedMonthlyInvestment 
                                    ? `Suggested: ${formatIndianCurrency(calculatedMonthlyInvestment)} per month to reach target`
                                    : `You're planning to invest ${monthlyInvestment > calculatedMonthlyInvestment ? 'more than' : 'exactly'} what's needed to reach your target`}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles['progress-container']}>
                    <div className={styles['progress-bar']} style={{
                        width: `${progressPercentage}%`,
                        backgroundColor: progressColor
                    }} />
                </div>

                <div className={styles['summary-box']}>
                    <div className={styles['summary-item']}>
                        <span>Gap to Target:</span>
                        <strong>{formatIndianCurrency(Math.max(0, targetCorpus - currentNetWorth))}</strong>
                    </div>
                    <div className={styles['summary-item']}>
                        <span>Progress:</span>
                        <strong style={{ color: progressColor }}>{progressPercentage}%</strong>
                    </div>
                </div>
            </div>

            <div className={styles['allocation-section']}>
                <div className={styles['allocation-header']}>
                    <h3>Asset Allocation</h3>
                    <button 
                        className={styles['recommendation-button']}
                        onClick={() => {
                            const recommended = getRecommendedAllocation(currentAge);
                            setAllocation(prev => ({
                                ...recommended,
                                monthlySavings: prev.monthlySavings,
                                savingsGrowthRate: calculateExpectedReturn(recommended)
                            }));
                            setShowRecommendation(true);
                        }}
                    >
                        Get Age-Based Recommendation
                    </button>
                </div>

                {showRecommendation && (
                    <div className={styles['recommendation-note']}>
                        <p>Based on your age ({currentAge}), we recommend this allocation:</p>
                        <ul>
                            <li>Low Risk (Fixed Deposits, Bonds): {allocation.lowRisk}% (Expected: {ASSET_RETURNS.lowRisk}% return)</li>
                            <li>Moderate Risk (Hybrid Funds): {allocation.moderateRisk}% (Expected: {ASSET_RETURNS.moderateRisk}% return)</li>
                            <li>High Risk (Stocks, Equity MF): {allocation.highRisk}% (Expected: {ASSET_RETURNS.highRisk}% return)</li>
                        </ul>
                        <p>Combined Expected Return: {expectedReturn}%</p>
                    </div>
                )}
                <div className={styles['allocation-sliders']}>
                    <div className={styles['slider-group']}>
                        <label>
                            Low Risk (Fixed Deposits, Bonds)
                            <span className={styles['percentage']}>{allocation.lowRisk}% ({ASSET_RETURNS.lowRisk}% return)</span>
                        </label>
                        <input
                            type="range"
                            value={allocation.lowRisk}
                            onChange={(e) => {
                                const newValue = Number(e.target.value);
                                const diff = newValue - allocation.lowRisk;
                                setAllocation(prev => ({
                                    lowRisk: newValue,
                                    moderateRisk: Math.max(0, prev.moderateRisk - diff/2),
                                    highRisk: Math.max(0, prev.highRisk - diff/2),
                                    monthlySavings: prev.monthlySavings,
                                    savingsGrowthRate: prev.savingsGrowthRate,
                                    currentNetWorth: currentNetWorth
                                }));
                            }}
                            min="0"
                            max="100"
                        />
                        <div className={styles['allocation-bar']} style={{width: `${allocation.lowRisk}%`, backgroundColor: '#36A2EB'}} />
                    </div>

                    <div className={styles['slider-group']}>
                        <label>
                            Moderate Risk (Hybrid Funds)
                            <span className={styles['percentage']}>{allocation.moderateRisk}% ({ASSET_RETURNS.moderateRisk}% return)</span>
                        </label>
                        <input
                            type="range"
                            value={allocation.moderateRisk}
                            onChange={(e) => {
                                const newValue = Number(e.target.value);
                                const diff = newValue - allocation.moderateRisk;
                                setAllocation(prev => ({
                                    lowRisk: Math.max(0, prev.lowRisk - diff/2),
                                    moderateRisk: newValue,
                                    highRisk: Math.max(0, prev.highRisk - diff/2),
                                    monthlySavings: prev.monthlySavings,
                                    savingsGrowthRate: prev.savingsGrowthRate,
                                    currentNetWorth: currentNetWorth
                                }));
                            }}
                            min="0"
                            max="100"
                        />
                        <div className={styles['allocation-bar']} style={{width: `${allocation.moderateRisk}%`, backgroundColor: '#FFCE56'}} />
                    </div>

                    <div className={styles['slider-group']}>
                        <label>
                            High Risk (Stocks, Equity MF)
                            <span className={styles['percentage']}>{allocation.highRisk}% ({ASSET_RETURNS.highRisk}% return)</span>
                        </label>
                        <input
                            type="range"
                            value={allocation.highRisk}
                            onChange={(e) => {
                                const newValue = Number(e.target.value);
                                const diff = newValue - allocation.highRisk;
                                setAllocation(prev => ({
                                    lowRisk: Math.max(0, prev.lowRisk - diff/2),
                                    moderateRisk: Math.max(0, prev.moderateRisk - diff/2),
                                    highRisk: newValue,
                                    monthlySavings: prev.monthlySavings,
                                    savingsGrowthRate: prev.savingsGrowthRate,
                                    currentNetWorth: currentNetWorth
                                }));
                            }}
                            min="0"
                            max="100"
                        />
                        <div className={styles['allocation-bar']} style={{width: `${allocation.highRisk}%`, backgroundColor: '#FF6384'}} />
                    </div>
                </div>
            </div>

            <div className={styles['investment-section']}>
                <h3>Monthly Investment Plan</h3>
                <div className={styles['input-group']}>
                    <div className={styles['input-field']}>
                        <label htmlFor="expectedReturn">Expected Annual Return (%)</label>
                        <input
                            type="number"
                            id="expectedReturn"
                            value={expectedReturn}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                setExpectedReturn(value);
                                setAllocation(prev => ({
                                    ...prev,
                                    savingsGrowthRate: value,
                                    currentNetWorth: currentNetWorth
                                }));
                            }}
                            min="0"
                            max="30"
                            step="0.1"
                            className={styles['editable-input']}
                        />
                        <div className={styles['info-text']}>
                            Conservative estimate for Indian markets: 7%
                        </div>
                    </div>
                </div>

                <div className={styles['summary-box']}>
                    <div className={styles['summary-item']}>
                        <span>Target Corpus:</span>
                        <strong>{formatIndianCurrency(targetCorpus)}</strong>
                    </div>
                    <div className={styles['summary-item']}>
                        <span>Years to Retirement:</span>
                        <strong>{yearsToRetirement} years</strong>
                    </div>
                    <div className={styles['summary-item']}>
                        <span>Monthly Investment:</span>
                        <strong>{formatIndianCurrency(monthlyInvestment)}</strong>
                    </div>
                </div>
            </div>

            <div className={styles['summary-section']}>
                <h3>Investment Plan Summary</h3>
                <div className={styles['summary-details']}>
                    <div>
                        <strong>Target Corpus:</strong> {formatIndianCurrency(targetCorpus)}
                    </div>
                    <div>
                        <strong>Time Horizon:</strong> {yearsToRetirement} years (Age {currentAge} to {retirementAge})
                    </div>
                    <div>
                        <strong>Monthly Investment:</strong> {formatIndianCurrency(monthlyInvestment)}
                    </div>
                    <div>
                        <strong>Expected Return:</strong> {expectedReturn}% per annum
                    </div>
                    <div>
                        <strong>Asset Allocation:</strong>
                        <ul>
                            <li>Fixed Deposits & Bonds: {allocation.lowRisk}% (₹{formatIndianCurrency(monthlyInvestment * allocation.lowRisk / 100)} monthly)</li>
                            <li>Hybrid Funds: {allocation.moderateRisk}% (₹{formatIndianCurrency(monthlyInvestment * allocation.moderateRisk / 100)} monthly)</li>
                            <li>Equity & Stocks: {allocation.highRisk}% (₹{formatIndianCurrency(monthlyInvestment * allocation.highRisk / 100)} monthly)</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className={styles['action-buttons']}>
                <button 
                    className={styles['save-plan-button']}
                    onClick={handleSave}
                >
                    Save Plan & Continue to Execute
                </button>
            </div>
        </div>
    );
};

export default PlanComponent;
