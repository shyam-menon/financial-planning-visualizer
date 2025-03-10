import React, { useState } from 'react';
import './App.css';
import RuleOf72 from './components/RuleOf72';
import PowerOfRateOfReturn from './components/PowerOfRateOfReturn';
import FourPercentRule from './components/FourPercentRule';
import PowerOfSavings from './components/PowerOfSavings';
import TPERVisualizer from './components/TPER/TPERVisualizer';

type VisualizationType = 'tper' | 'rule-of-72' | 'power-of-rate-of-return' | 'power-of-savings' | '4-percent-rule';

const App: React.FC = () => {
    const [selectedVisualization, setSelectedVisualization] = useState<VisualizationType>('tper');

    const renderVisualization = () => {
        switch (selectedVisualization) {
            case 'tper':
                return <TPERVisualizer />;
            case 'rule-of-72':
                return <RuleOf72 />;
            case 'power-of-rate-of-return':
                return <PowerOfRateOfReturn />;
            case 'power-of-savings':
                return <PowerOfSavings />;
            case '4-percent-rule':
                return <FourPercentRule />;
            default:
                return <TPERVisualizer />;
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="app-title">Financial Planning Visualizer</h1>
                <p className="app-description">
                    Plan your financial future with interactive tools for retirement planning, 
                    asset allocation, and progress tracking. Values and calculations are 
                    tailored for the Indian market context.
                </p>
            </header>

            <div className="visualization-selector">
                <select
                    className="visualization-select"
                    value={selectedVisualization}
                    onChange={(e) => setSelectedVisualization(e.target.value as VisualizationType)}
                    aria-label="Select visualization"
                >
                    <option value="tper">TPER Framework</option>
                    <option value="rule-of-72">Rule of 72</option>
                    <option value="power-of-rate-of-return">Returns Matter</option>
                    <option value="power-of-savings">Power of Savings</option>
                    <option value="4-percent-rule">4% Rule</option>
                </select>
                <span className="select-arrow" aria-hidden="true">▼</span>
            </div>

            <main>
                {renderVisualization()}
            </main>

            <footer className="app-footer">
            </footer>
        </div>
    );
};

export default App;
