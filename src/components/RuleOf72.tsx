import React, { useState, useEffect } from 'react';

const RuleOf72: React.FC = () => {
    const [interestRate, setInterestRate] = useState<number>(5);
    const [yearsToDouble, setYearsToDouble] = useState<number>(14.4);
    const [animatedValue, setAnimatedValue] = useState<number>(14.4);

    useEffect(() => {
        const newYearsToDouble = 72 / interestRate;
        setYearsToDouble(newYearsToDouble);
        
        // Animate the number change
        const startValue = animatedValue;
        const endValue = newYearsToDouble;
        const duration = 500; // milliseconds
        const startTime = Date.now();
        
        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            
            if (elapsed < duration) {
                const progress = elapsed / duration;
                const currentValue = startValue + (endValue - startValue) * progress;
                setAnimatedValue(currentValue);
                requestAnimationFrame(animate);
            } else {
                setAnimatedValue(endValue);
            }
        };
        
        requestAnimationFrame(animate);
    }, [interestRate]);

    return (
        <div className="visualization-container">
            <h2 className="visualization-title">Rule of 72</h2>
            <p className="visualization-description">
                The Rule of 72 is a simple way to determine how long it will take for an investment to double given a fixed annual rate of return.
            </p>

            <div className="input-section">
                <div className="input-group">
                    <label htmlFor="interestRate">
                        Interest Rate (%)
                        <span className="input-value">{interestRate}%</span>
                    </label>
                    <input
                        type="range"
                        id="interestRate"
                        min="1"
                        max="20"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseInt(e.target.value))}
                    />
                </div>

                <div className="result-card">
                    <h3>Your money will double in:</h3>
                    <div className="highlight-value">{yearsToDouble.toFixed(1)} years</div>
                </div>

                <div className="explanation-card">
                    <p>
                        At a {interestRate}% annual return, your investment will double in approximately {yearsToDouble.toFixed(1)} years.
                    </p>
                    <div className="money-icons">
                        <span role="img" aria-label="money">💰</span>
                        <span className="arrow">➡️</span>
                        <span role="img" aria-label="money doubled">💰💰</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RuleOf72;
