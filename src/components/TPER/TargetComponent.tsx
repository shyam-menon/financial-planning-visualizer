import React, { useState } from 'react';
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

const formatIndianCurrency = (amount: number): string => {
    const crore = Math.floor(amount / 10000000);
    const lakh = Math.floor((amount % 10000000) / 100000);
    if (crore > 0) {
        return `₹${crore} crore ${lakh > 0 ? `${lakh} lakh` : ''}`;
    }
    return `₹${lakh} lakh`;
};

interface TargetComponentProps {
    onTargetSet: (target: number) => void;
}

export const TargetComponent: React.FC<TargetComponentProps> = ({ onTargetSet }) => {
    const [monthlyExpenses, setMonthlyExpenses] = useState<number>(40000); // Default ₹40,000
    const [multiplier, setMultiplier] = useState<number>(500); // Conservative estimate
    const [detailedMode, setDetailedMode] = useState<boolean>(false);
    const [inflation, setInflation] = useState<number>(6); // Default 6% based on Indian inflation
    const [yearsToRetirement, setYearsToRetirement] = useState<number>(30);

    const calculateSimpleTarget = (): number => {
        return monthlyExpenses * multiplier;
    };

    const calculateDetailedTarget = (): number => {
        const monthlyInflationRate = inflation / 1200; // Convert annual % to monthly decimal
        const futureMonthlyExpenses = monthlyExpenses * 
            Math.pow(1 + monthlyInflationRate, yearsToRetirement * 12);
        return futureMonthlyExpenses * multiplier;
    };

    const targetCorpus = detailedMode ? calculateDetailedTarget() : calculateSimpleTarget();

    const chartData = {
        labels: Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`),
        datasets: [{
            label: 'Monthly Expenses Growth',
            data: Array.from({ length: 12 }, (_, i) => 
                monthlyExpenses * Math.pow(1 + inflation/1200, i)),
            borderColor: 'rgb(79, 70, 229)',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.1
        }]
    };

    return (
        <div className={styles['target-component']}>
            <h2>Set Your Financial Target</h2>
            
            <div className={styles['input-group']}>
                <label>
                    Monthly Expenses (₹):
                    <div className={styles['input-wrapper']}>
                        <input
                            type="number"
                            value={monthlyExpenses}
                            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                            step={100000} // Step size of 1 lakh as per Indian context
                            min={0}
                            aria-label="Monthly expenses in rupees"
                        />
                        <span className={styles['input-icon']}>₹</span>
                    </div>
                </label>
            </div>

            <div className={styles['input-group']}>
                <label>
                    Calculation Method:
                    <select 
                        value={detailedMode ? "detailed" : "simple"}
                        onChange={(e) => setDetailedMode(e.target.value === "detailed")}
                        aria-label="Select calculation method"
                    >
                        <option value="simple">Simple (Rule of Thumb)</option>
                        <option value="detailed">Detailed (With Inflation)</option>
                    </select>
                </label>
            </div>

            {detailedMode && (
                <>
                    <div className={styles['input-group']}>
                        <label>
                            Annual Inflation Rate (%):
                            <div className={styles['input-wrapper']}>
                                <input
                                    type="number"
                                    value={inflation}
                                    onChange={(e) => setInflation(Number(e.target.value))}
                                    step={0.1} // As per Indian context preferences
                                    min={0}
                                    max={20}
                                    aria-label="Annual inflation rate percentage"
                                />
                                <span className={styles['input-icon']}>%</span>
                            </div>
                        </label>
                    </div>
                    <div className={styles['input-group']}>
                        <label>
                            Years to Retirement:
                            <div className={styles['input-wrapper']}>
                                <input
                                    type="number"
                                    value={yearsToRetirement}
                                    onChange={(e) => setYearsToRetirement(Number(e.target.value))}
                                    step={1} // As per Indian context preferences
                                    min={1}
                                    aria-label="Years until retirement"
                                />
                                <span className={styles['input-icon']}>yrs</span>
                            </div>
                        </label>
                    </div>
                    <div className={styles['chart-container']}>
                        <Line data={chartData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Monthly Expenses Growth (1 Year Projection)',
                                    color: '#1e293b',
                                    font: {
                                        size: 16,
                                        weight: 'bold' // Fixed TypeScript error by using string literal
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (context) => `₹${context.parsed.y.toLocaleString('en-IN')}`
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Monthly Expenses (₹)',
                                        color: '#64748b'
                                    },
                                    ticks: {
                                        callback: (value) => `₹${value.toLocaleString('en-IN')}`
                                    }
                                }
                            }
                        }} />
                    </div>
                </>
            )}

            <div className={styles.result}>
                <h3>Target Corpus: {formatIndianCurrency(targetCorpus)}</h3>
                <p className={styles['result-explanation']}>
                    This target is calculated based on {detailedMode ? 
                        `your monthly expenses of ₹${monthlyExpenses.toLocaleString('en-IN')}, adjusted for ${inflation}% annual inflation over ${yearsToRetirement} years` :
                        `${multiplier}x your current monthly expenses of ₹${monthlyExpenses.toLocaleString('en-IN')}`
                    }.
                </p>
                <button 
                    className={styles['submit-button']}
                    onClick={() => onTargetSet(targetCorpus)}
                    aria-label="Set target corpus"
                >
                    Set This Target
                </button>
            </div>
        </div>
    );
};

export default TargetComponent;
