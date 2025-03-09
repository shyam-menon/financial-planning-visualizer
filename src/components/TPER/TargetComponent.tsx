import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import styles from './TPER.module.css';

interface TargetComponentProps {
    onTargetCalculated: (target: number, currentAge: number, retirementAge: number) => void;
}

interface CorpusOption {
    name: string;
    multiplier: number;
    description: string;
}

export const TargetComponent: React.FC<TargetComponentProps> = ({ onTargetCalculated }) => {
    const [monthlyExpenses, setMonthlyExpenses] = useState<number>(100000); // ₹1,00,000 default
    const [currentAge, setCurrentAge] = useState<number>(36);
    const [retirementAge, setRetirementAge] = useState<number>(60);
    const [inflationRate, setInflationRate] = useState<number>(6); // 6% default for India
    const [lifeExpectancy, setLifeExpectancy] = useState<number>(85); // Default life expectancy
    const [selectedMultiplier, setSelectedMultiplier] = useState<number>(400); // Default to Safe option
    const [targetCorpus, setTargetCorpus] = useState<number>(0);

    const corpusOptions: CorpusOption[] = [
        {
            name: "Minimum",
            multiplier: 300,
            description: "Basic retirement with essential expenses covered"
        },
        {
            name: "Safe",
            multiplier: 400,
            description: "Comfortable retirement with moderate lifestyle"
        },
        {
            name: "Comfortable",
            multiplier: 600,
            description: "Luxurious retirement with extra discretionary spending"
        }
    ];

    const calculateTarget = (): number => {
        const yearsToRetirement = retirementAge - currentAge;
        
        // Calculate monthly expenses at retirement (adjusted for inflation)
        const inflatedExpenses = monthlyExpenses * Math.pow(1 + inflationRate/100, yearsToRetirement);
        
        // Calculate corpus using selected multiplier
        return inflatedExpenses * selectedMultiplier;
    };

    const generateProjectionData = () => {
        const yearsToRetirement = retirementAge - currentAge;
        const data = [];
        const labels = [];
        
        for (let year = 0; year <= yearsToRetirement; year++) {
            const age = currentAge + year;
            const remainingYearsToRetirement = retirementAge - age;
            
            // Calculate expenses at retirement for this starting age
            const inflatedExpenses = monthlyExpenses * Math.pow(1 + inflationRate/100, remainingYearsToRetirement);
            
            // Calculate required corpus using selected multiplier
            const requiredCorpus = inflatedExpenses * selectedMultiplier;
            
            data.push(Math.max(0, requiredCorpus));
            labels.push(`Age ${age}`);
        }

        return { data, labels };
    };

    useEffect(() => {
        const target = calculateTarget();
        setTargetCorpus(target);
        onTargetCalculated(target, currentAge, retirementAge);
    }, [monthlyExpenses, currentAge, retirementAge, inflationRate, selectedMultiplier]);

    const formatIndianCurrency = (amount: number): string => {
        const crore = Math.floor(amount / 10000000);
        const lakh = Math.floor((amount % 10000000) / 100000);
        if (crore > 0) {
            return `₹${crore} crore ${lakh > 0 ? `${lakh} lakh` : ''}`;
        }
        return `₹${lakh} lakh`;
    };

    const projectionData = generateProjectionData();
    const chartData = {
        labels: projectionData.labels,
        datasets: [
            {
                label: 'Required Corpus',
                data: projectionData.data,
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.1
            }
        ]
    };

    return (
        <div className={styles['target-component']}>
            <h2>Set Your Retirement Target</h2>
            
            <div className={styles['input-group']}>
                <div className={styles['input-field']}>
                    <label htmlFor="currentAge">Current Age</label>
                    <input
                        type="number"
                        id="currentAge"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(Number(e.target.value))}
                        min="18"
                        max="70"
                        step="1"
                    />
                </div>

                <div className={styles['input-field']}>
                    <label htmlFor="retirementAge">Retirement Age</label>
                    <input
                        type="number"
                        id="retirementAge"
                        value={retirementAge}
                        onChange={(e) => setRetirementAge(Number(e.target.value))}
                        min={currentAge + 1}
                        max="75"
                        step="1"
                    />
                </div>

                <div className={styles['input-field']}>
                    <label htmlFor="monthlyExpenses">Monthly Expenses (₹)</label>
                    <input
                        type="number"
                        id="monthlyExpenses"
                        value={monthlyExpenses}
                        onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                        min="10000"
                        step="1000"
                    />
                </div>

                <div className={styles['input-field']}>
                    <label>Retirement Lifestyle</label>
                    <div className={styles['radio-group']}>
                        {corpusOptions.map(option => (
                            <label key={option.name}>
                                <input
                                    type="radio"
                                    value={option.multiplier}
                                    checked={selectedMultiplier === option.multiplier}
                                    onChange={(e) => setSelectedMultiplier(Number(e.target.value))}
                                />
                                {option.name}
                                <span className={styles['option-description']}>
                                    ({option.description})
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles['input-field']}>
                    <label htmlFor="inflationRate">Expected Inflation Rate (%)</label>
                    <input
                        type="number"
                        id="inflationRate"
                        value={inflationRate}
                        onChange={(e) => setInflationRate(Number(e.target.value))}
                        min="2"
                        max="15"
                        step="0.1"
                    />
                </div>

                <div className={styles['input-field']}>
                    <label htmlFor="lifeExpectancy">Life Expectancy (Years)</label>
                    <input
                        type="number"
                        id="lifeExpectancy"
                        value={lifeExpectancy}
                        onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                        min={retirementAge + 1}
                        max="100"
                        step="1"
                    />
                </div>
            </div>

            <div className={styles['target-summary']}>
                <h3>Target Corpus Required</h3>
                <p className={styles['target-amount']}>{formatIndianCurrency(Math.max(0, targetCorpus))}</p>
                <p className={styles['target-description']}>
                    {`Based on ${selectedMultiplier}x of your monthly expenses at retirement, adjusted for ${inflationRate}% inflation over ${retirementAge - currentAge} years until retirement.`}
                </p>
                <p className={styles['calculation-details']}>
                    <strong>How it's calculated:</strong><br/>
                    1. Current monthly expenses: {formatIndianCurrency(monthlyExpenses)}<br/>
                    2. Monthly expenses at retirement: {formatIndianCurrency(monthlyExpenses * Math.pow(1 + inflationRate/100, retirementAge - currentAge))}<br/>
                    3. Required corpus = Monthly expenses at retirement × {selectedMultiplier}
                </p>
            </div>

            <div className={styles['chart-container']}>
                <Line 
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Required Corpus Growth Over Time',
                                color: '#1e293b',
                                font: {
                                    size: 16,
                                    weight: 'bold'
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        const value = context.raw as number;
                                        return `Required: ${formatIndianCurrency(value)}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                title: {
                                    display: true,
                                    text: 'Corpus Required (₹)',
                                    color: '#64748b'
                                },
                                ticks: {
                                    callback: (value) => formatIndianCurrency(value as number)
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default TargetComponent;
