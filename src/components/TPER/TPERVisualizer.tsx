import React, { useState } from 'react';
import { TargetComponent } from './TargetComponent';
import { PlanComponent } from './PlanComponent';
import { ExecuteComponent } from './ExecuteComponent';
import { ReviewComponent } from './ReviewComponent';
import styles from './TPER.module.css';

interface TPERVisualizerProps {}

export const TPERVisualizer: React.FC<TPERVisualizerProps> = () => {
    const [activeStep, setActiveStep] = useState<'target' | 'plan' | 'execute' | 'review'>('target');
    const [targetCorpus, setTargetCorpus] = useState<number>(0);
    const [currentAge, setCurrentAge] = useState<number>(30);
    const [retirementAge, setRetirementAge] = useState<number>(60);
    const [plan, setPlan] = useState({
        targetCorpus: 0,
        monthlySavings: 50000,
        timeHorizon: 30,
        allocation: {
            lowRisk: 30,
            moderateRisk: 40,
            highRisk: 30
        },
        savingsGrowthRate: 7, // Conservative 7% return for Indian markets
        currentNetWorth: 10000000 // Default ₹1 crore as per Indian context
    });
    const [currentAssets, setCurrentAssets] = useState({
        fixedDeposits: 0,
        bonds: 0,
        mutualFunds: 0,
        stocks: 0,
        gold: 0,
        reits: 0,
        currentNetWorth: 0,
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
    const [executionStatus, setExecutionStatus] = useState<{
        isOnTrack: boolean;
        message: string;
        progress: number;
    }>({
        isOnTrack: true,
        message: '',
        progress: 0
    });

    const handleTargetCalculated = (target: number, age: number, retirement: number) => {
        setTargetCorpus(target);
        setCurrentAge(age);
        setRetirementAge(retirement);
        
        // Set default current net worth based on age
        const baseNetWorth = 10000000; // ₹1 crore at age 36
        let newNetWorth: number;
        
        if (age <= 36) {
            // Scale down by 10% per year for younger ages
            const scaleFactor = Math.pow(0.9, 36 - age);
            newNetWorth = baseNetWorth * scaleFactor;
        } else {
            // Scale up by 8% per year for older ages
            const scaleFactor = Math.pow(1.08, age - 36);
            newNetWorth = baseNetWorth * scaleFactor;
        }
        
        setCurrentAssets(prev => ({ ...prev, currentNetWorth: newNetWorth }));
        setPlan(prev => ({ ...prev, currentNetWorth: newNetWorth }));
    };

    const handlePlanSet = (newPlan: {
        lowRisk: number;
        moderateRisk: number;
        highRisk: number;
        monthlySavings: number;
        savingsGrowthRate: number;
        currentNetWorth: number;
    }) => {
        setPlan({
            targetCorpus,
            monthlySavings: newPlan.monthlySavings,
            timeHorizon: retirementAge - currentAge,
            allocation: {
                lowRisk: newPlan.lowRisk,
                moderateRisk: newPlan.moderateRisk,
                highRisk: newPlan.highRisk
            },
            savingsGrowthRate: newPlan.savingsGrowthRate,
            currentNetWorth: newPlan.currentNetWorth
        });
        
        // Update currentAssets with the new net worth
        setCurrentAssets(prev => ({
            ...prev,
            currentNetWorth: newPlan.currentNetWorth
        }));
    };

    const handleAssetsUpdated = (updatedAssets: typeof currentAssets, status?: {
        isOnTrack: boolean;
        message: string;
        progress: number;
    }) => {
        setCurrentAssets(updatedAssets);
        if (status) {
            setExecutionStatus(status);
        }
    };

    const moveToStep = (stepId: typeof activeStep) => {
        setActiveStep(stepId);
    };

    const renderStep = () => {
        switch (activeStep) {
            case 'target':
                return (
                    <TargetComponent 
                        onTargetCalculated={handleTargetCalculated}
                    />
                );
            case 'plan':
                return (
                    <PlanComponent 
                        targetCorpus={targetCorpus}
                        currentAge={currentAge}
                        retirementAge={retirementAge}
                        onPlanSet={(newPlan) => {
                            handlePlanSet(newPlan);
                            moveToStep('execute');
                        }}
                    />
                );
            case 'execute':
                return (
                    <ExecuteComponent 
                        plan={plan}
                        onAssetsUpdated={(assets, status) => {
                            handleAssetsUpdated(assets, status);
                            // Don't automatically move to review to allow user to adjust investments
                        }}
                    />
                );
            case 'review':
                return (
                    <ReviewComponent 
                        plan={plan}
                        currentAssets={currentAssets}
                        executionStatus={executionStatus}
                        currentAge={currentAge}
                        retirementAge={retirementAge}
                    />
                );
            default:
                return null;
        }
    };

    const steps = [
        { id: 'target', label: 'Target', description: 'Set retirement goals' },
        { id: 'plan', label: 'Plan', description: 'Create investment strategy' },
        { id: 'execute', label: 'Execute', description: 'Track investments' },
        { id: 'review', label: 'Review', description: 'Monitor progress' }
    ] as const;

    return (
        <div className={styles['tper-visualizer']}>
            <div className={styles['stepper']}>
                {steps.map((step, index) => (
                    <div 
                        key={step.id}
                        className={`${styles['step']} ${activeStep === step.id ? styles['active'] : ''} ${
                            steps.findIndex(s => s.id === activeStep) > index ? styles['completed'] : ''
                        }`}
                        onClick={() => setActiveStep(step.id)}
                    >
                        <div className={styles['step-icon']}>
                            {steps.findIndex(s => s.id === activeStep) > index ? '✓' : index + 1}
                        </div>
                        <div className={styles['step-content']}>
                            <div className={styles['step-label']}>{step.label}</div>
                            <div className={styles['step-description']}>{step.description}</div>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={styles['step-connector']} />
                        )}
                    </div>
                ))}
            </div>

            <div className={styles['step-content-container']}>
                {renderStep()}
            </div>

            <div className={styles['navigation']}>
                {activeStep !== 'target' && activeStep !== 'plan' && (
                    <button
                        className={styles['nav-button']}
                        onClick={() => {
                            const currentIndex = steps.findIndex(s => s.id === activeStep);
                            setActiveStep(steps[currentIndex - 1].id);
                        }}
                    >
                        Previous
                    </button>
                )}
                {activeStep !== 'review' && activeStep !== 'plan' && (
                    <button
                        className={styles['nav-button']}
                        onClick={() => {
                            const currentIndex = steps.findIndex(s => s.id === activeStep);
                            setActiveStep(steps[currentIndex + 1].id);
                        }}
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};

export default TPERVisualizer;
