import React, { useState } from 'react';
import './App.css';
import RuleOf72 from './components/RuleOf72';
import PowerOfRateOfReturn from './components/PowerOfRateOfReturn';
import FourPercentRule from './components/FourPercentRule';
import PowerOfSavings from './components/PowerOfSavings';

type VisualizationType = 'rule-of-72' | 'power-of-rate-of-return' | '4-percent-rule' | 'power-of-savings';

const App: React.FC = () => {
    const [selectedVisualization, setSelectedVisualization] = useState<VisualizationType>('rule-of-72');

    const renderVisualization = () => {
        switch (selectedVisualization) {
            case 'rule-of-72':
                return <RuleOf72 />;
            case 'power-of-rate-of-return':
                return <PowerOfRateOfReturn />;
            case '4-percent-rule':
                return <FourPercentRule />;
            case 'power-of-savings':
                return <PowerOfSavings />;
            default:
                return <RuleOf72 />;
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="app-title">Financial Planning Visualizer</h1>
                <p className="app-description">
                    Explore powerful financial concepts through interactive visualizations. 
                    Understand compound interest, savings strategies, and retirement planning 
                    to make informed financial decisions.
                </p>
            </header>

            <div className="visualization-selector">
                <select
                    className="visualization-select"
                    value={selectedVisualization}
                    onChange={(e) => setSelectedVisualization(e.target.value as VisualizationType)}
                    aria-label="Select visualization"
                >
                    <option value="rule-of-72">Rule of 72</option>
                    <option value="power-of-rate-of-return">Power of Rate of Return</option>
                    <option value="4-percent-rule">4% Rule</option>
                    <option value="power-of-savings">Power of Savings</option>
                </select>
                <span className="select-arrow" aria-hidden="true">▼</span>
            </div>

            <main>
                {renderVisualization()}
            </main>

            <footer className="app-footer">
                <p>Built with React and Chart.js</p>
            </footer>
        </div>
    );
};

export default App;
