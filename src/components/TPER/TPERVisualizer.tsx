import React, { useState } from 'react';
import TargetComponent from './TargetComponent';
import PlanComponent, { AssetAllocationPlan } from './PlanComponent';
import ExecuteComponent from './ExecuteComponent';
import ReviewComponent from './ReviewComponent';
import styles from './TPER.module.css';

interface CurrentAssets {
    fixedDeposits: number;
    bonds: number;
    hybridFunds: number;
    stocks: number;
    mutualFunds: number;
}

export const TPERVisualizer: React.FC = () => {
    const [activeStep, setActiveStep] = useState<'target' | 'plan' | 'execute' | 'review'>('target');
    const [targetCorpus, setTargetCorpus] = useState<number>(10000000); // ₹1 crore default
    const [plan, setPlan] = useState<AssetAllocationPlan>({
        lowRisk: 30,
        moderateRisk: 40,
        highRisk: 30,
        monthlySavings: 50000,
        savingsGrowthRate: 10
    });
    const [currentAssets, setCurrentAssets] = useState<CurrentAssets>({
        fixedDeposits: 2500000, // ₹25 lakh
        bonds: 1500000, // ₹15 lakh
        hybridFunds: 3000000, // ₹30 lakh
        stocks: 2000000, // ₹20 lakh
        mutualFunds: 1000000 // ₹10 lakh
    });

    const handleTargetSet = (target: number) => {
        setTargetCorpus(target);
        setActiveStep('plan');
    };

    const handlePlanSet = (newPlan: AssetAllocationPlan) => {
        setPlan(newPlan);
        setActiveStep('execute');
    };

    const handleExecutionUpdate = (assets: CurrentAssets) => {
        setCurrentAssets(assets);
    };

    const renderStep = () => {
        switch (activeStep) {
            case 'target':
                return <TargetComponent onTargetSet={handleTargetSet} />;
            case 'plan':
                return <PlanComponent 
                    targetCorpus={targetCorpus}
                    onPlanSet={handlePlanSet}
                />;
            case 'execute':
                return <ExecuteComponent
                    targetCorpus={targetCorpus}
                    plan={plan}
                    onExecutionUpdate={handleExecutionUpdate}
                />;
            case 'review':
                return <ReviewComponent
                    targetCorpus={targetCorpus}
                    plan={plan}
                    currentAssets={currentAssets}
                />;
            default:
                return null;
        }
    };

    return (
        <div className={styles['tper-visualizer']}>
            <div className={styles['tper-nav']}>
                <button 
                    className={`${styles['nav-button']} ${activeStep === 'target' ? styles.active : ''}`}
                    onClick={() => setActiveStep('target')}
                >
                    Target
                </button>
                <button 
                    className={`${styles['nav-button']} ${activeStep === 'plan' ? styles.active : ''}`}
                    onClick={() => setActiveStep('plan')}
                    disabled={!targetCorpus}
                >
                    Plan
                </button>
                <button 
                    className={`${styles['nav-button']} ${activeStep === 'execute' ? styles.active : ''}`}
                    onClick={() => setActiveStep('execute')}
                    disabled={!plan}
                >
                    Execute
                </button>
                <button 
                    className={`${styles['nav-button']} ${activeStep === 'review' ? styles.active : ''}`}
                    onClick={() => setActiveStep('review')}
                    disabled={!currentAssets}
                >
                    Review
                </button>
            </div>

            <div className={styles['tper-content']}>
                {renderStep()}
            </div>
        </div>
    );
};

export default TPERVisualizer;
