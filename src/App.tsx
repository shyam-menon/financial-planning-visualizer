import React, { useState } from 'react';
import './App.css';
import PowerOfSavings from './components/PowerOfSavings';
import PowerOfRateOfReturn from './components/PowerOfRateOfReturn';
import RuleOf72 from './components/RuleOf72';
import FourPercentRule from './components/FourPercentRule';

type VisualizationType = 'ruleOf72' | 'powerOfReturn' | 'fourPercentRule' | 'powerOfSavings';

const App: React.FC = () => {
    const [selectedVisualization, setSelectedVisualization] = useState<VisualizationType>('ruleOf72');

    const renderVisualization = () => {
        switch (selectedVisualization) {
            case 'ruleOf72':
                return <RuleOf72 />;
            case 'powerOfReturn':
                return <PowerOfRateOfReturn />;
            case 'fourPercentRule':
                return <FourPercentRule />;
            case 'powerOfSavings':
                return <PowerOfSavings />;
            default:
                return <RuleOf72 />;
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Financial Planning Visualizer</h1>
                <p>Explore different financial concepts through interactive visualizations</p>
            </header>

            <main className="App-main">
                <div className="visualization-selector">
                    <select 
                        value={selectedVisualization}
                        onChange={(e) => setSelectedVisualization(e.target.value as VisualizationType)}
                        className="visualization-dropdown"
                        aria-label="Select visualization type"
                    >
                        <option value="ruleOf72">Rule of 72</option>
                        <option value="powerOfReturn">Power of Rate of Return</option>
                        <option value="fourPercentRule">4% Rule</option>
                        <option value="powerOfSavings">Power of Savings</option>
                    </select>
                </div>

                {renderVisualization()}
            </main>

            <footer className="App-footer">
                <p>Built with React and Chart.js</p>
            </footer>
        </div>
    );
};

export default App;
