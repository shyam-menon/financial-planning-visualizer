import React from 'react';

export type VisualizationType = 'none' | 'tper' | 'ruleOf72' | 'rateOfReturn' | 'powerOfSavings' | 'fourPercentRule';

interface VisualizationSelectorProps {
    selectedVisualization: VisualizationType;
    onVisualizationChange: (visualization: VisualizationType) => void;
}

const VisualizationSelector: React.FC<VisualizationSelectorProps> = ({
    selectedVisualization,
    onVisualizationChange
}) => {
    return (
        <div className="visualization-selector">
            <select
                value={selectedVisualization}
                onChange={(e) => onVisualizationChange(e.target.value as VisualizationType)}
                className="visualization-dropdown"
            >
                <option value="none">Select a Visualization</option>
                <option value="tper">TPER Framework</option>
                <option value="ruleOf72">Rule of 72</option>
                <option value="rateOfReturn">Returns Matter</option>
                <option value="powerOfSavings">Power of Consistent Savings</option>
                <option value="fourPercentRule">The 4% Rule</option>
            </select>
        </div>
    );
};

export default VisualizationSelector;
