import React, { useState } from 'react';
import './App.css';
import PowerOfSavings from './components/PowerOfSavings';
import PowerOfRateOfReturn from './components/PowerOfRateOfReturn';
import RuleOf72 from './components/RuleOf72';

type VisualizationType = 'powerOfSavings' | 'powerOfReturn' | 'ruleOf72';

const App: React.FC = () => {
    const [selectedVisualization, setSelectedVisualization] = useState<VisualizationType>('powerOfSavings');

    const renderVisualization = () => {
        switch (selectedVisualization) {
            case 'powerOfSavings':
                return <PowerOfSavings />;
            case 'powerOfReturn':
                return <PowerOfRateOfReturn />;
            case 'ruleOf72':
                return <RuleOf72 />;
            default:
                return <PowerOfSavings />;
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
                    >
                        <option value="powerOfSavings">Power of Savings</option>
                        <option value="powerOfReturn">Power of Rate of Return</option>
                        <option value="ruleOf72">Rule of 72</option>
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
