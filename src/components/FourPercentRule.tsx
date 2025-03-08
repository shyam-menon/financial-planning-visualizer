import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import styles from './FourPercentRule.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FourPercentRule: React.FC = () => {
  const [startingBalance, setStartingBalance] = useState<number>(10000000); // 1 Crore
  const [withdrawalRate, setWithdrawalRate] = useState<number>(4);
  const [returnRate, setReturnRate] = useState<number>(7);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [years, setYears] = useState<number>(30);
  const [animatedWithdrawal, setAnimatedWithdrawal] = useState<number>(0);
  const [animatedBalance, setAnimatedBalance] = useState<number>(0);

  const formatCurrency = (amount: number): string => {
    // Convert to Indian number format (lakhs and crores)
    const absAmount = Math.abs(amount);
    let formattedAmount: string;

    if (absAmount >= 10000000) {
      // For amounts >= 1 crore
      formattedAmount = (absAmount / 10000000).toFixed(2) + ' Cr';
    } else if (absAmount >= 100000) {
      // For amounts >= 1 lakh
      formattedAmount = (absAmount / 100000).toFixed(2) + ' L';
    } else {
      // For smaller amounts
      formattedAmount = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
      }).format(absAmount);
    }

    return `₹${formattedAmount}`;
  };

  const calculateProjection = () => {
    const labels = Array.from({ length: years + 1 }, (_, i) => i.toString());
    let balance = startingBalance;
    const balances = [balance];
    const withdrawals = [startingBalance * (withdrawalRate / 100)];

    for (let year = 1; year <= years; year++) {
      const withdrawal = withdrawals[year - 1] * (1 + inflationRate / 100);
      withdrawals.push(withdrawal);
      
      const growth = balance * (returnRate / 100);
      balance = balance + growth - withdrawal;
      balances.push(Math.max(0, balance));
    }

    return {
      labels,
      datasets: [
        {
          label: 'Portfolio Balance',
          data: balances,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.05)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#4f46e5',
          pointHoverBorderWidth: 3,
          pointHoverRadius: 6,
          order: 2
        },
        {
          label: 'Annual Withdrawal',
          data: withdrawals,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#10b981',
          pointHoverBorderWidth: 3,
          pointHoverRadius: 6,
          order: 1
        }
      ]
    };
  };

  const chartData = calculateProjection();
  const isPortfolioSustainable = animatedBalance > 0;

  const handleStartingBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Ensure value is not negative and doesn't exceed a reasonable maximum (100 Cr)
    setStartingBalance(Math.max(0, Math.min(1000000000, value)));
  };

  const handleWithdrawalRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Ensure withdrawal rate is between 0 and 100
    setWithdrawalRate(Math.max(0, Math.min(100, value)));
  };

  const handleReturnRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Ensure return rate is between 0 and 100
    setReturnRate(Math.max(0, Math.min(100, value)));
  };

  const handleInflationRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Ensure inflation rate is between 0 and 100
    setInflationRate(Math.max(0, Math.min(100, value)));
  };

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Ensure years is between 1 and 100
    setYears(Math.max(1, Math.min(100, value)));
  };

  // Animation effect
  useEffect(() => {
    // Calculate values once at the start of the effect
    const targetWithdrawal = startingBalance * (withdrawalRate / 100);
    const targetBalance = chartData.datasets[0].data[years];
    
    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const withdrawalIncrement = targetWithdrawal / steps;
    const balanceIncrement = targetBalance / steps;
    
    const timer = setInterval(() => {
      if (currentStep < steps) {
        setAnimatedWithdrawal(prev => Math.min(prev + withdrawalIncrement, targetWithdrawal));
        setAnimatedBalance(prev => Math.min(prev + balanceIncrement, targetBalance));
        currentStep++;
      } else {
        clearInterval(timer);
      }
    }, stepDuration);
    
    // Cleanup function to clear interval
    return () => clearInterval(timer);
  }, [startingBalance, withdrawalRate, returnRate, inflationRate, years, chartData.datasets]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#1e293b'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          size: 14
        },
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return ` ${context.dataset.label}: ${formatCurrency(value)}`;
          },
          title: (tooltipItems) => {
            const item = tooltipItems[0];
            return `Year ${item.label}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Years',
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#1e293b',
          padding: { top: 10 }
        },
        grid: {
          display: false
        },
        ticks: {
          color: '#475569',
          font: {
            size: 12
          },
          maxRotation: 0
        }
      },
      y: {
        title: {
          display: true,
          text: 'Amount (₹)',
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#1e293b',
          padding: { bottom: 10 }
        },
        grid: {
          color: '#e2e8f0',
          tickLength: 0,
          display: true
        },
        ticks: {
          color: '#475569',
          font: {
            size: 12
          },
          callback: (value) => formatCurrency(value as number),
          maxTicksLimit: 8
        },
        beginAtZero: true
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2
      },
      point: {
        radius: 4,
        hitRadius: 8,
        hoverRadius: 6
      }
    }
  };

  return (
    <div className={styles.visualizationContainer}>
      <div className={styles.explanation}>
        <h2>Understanding the 4% Rule</h2>
        <p>
          The 4% rule is a widely-used guideline in retirement planning that suggests you can withdraw 4% of your 
          retirement savings annually, adjusted for inflation, with a high probability of your portfolio lasting 
          30 years or more. This rule is based on historical market performance and assumes a diversified portfolio 
          of stocks and bonds.
        </p>
        <div className={styles.keyPoints}>
          <div className={styles.keyPoint}>
            <span className={styles.keyPointIcon}>📊</span>
            <div>
              <h3>Initial Withdrawal</h3>
              <p>Your first-year withdrawal is 4% of your starting balance. For example, with ₹1 crore saved, 
              you would withdraw ₹4 lakhs in the first year.</p>
            </div>
          </div>
          <div className={styles.keyPoint}>
            <span className={styles.keyPointIcon}>📈</span>
            <div>
              <h3>Inflation Adjustment</h3>
              <p>Each subsequent year, increase your withdrawal amount by the inflation rate to maintain 
              purchasing power.</p>
            </div>
          </div>
          <div className={styles.keyPoint}>
            <span className={styles.keyPointIcon}>⚖️</span>
            <div>
              <h3>Portfolio Balance</h3>
              <p>Your portfolio continues to grow through investment returns, helping to offset withdrawals 
              and inflation over time.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.inputGrid}>
        <div className={styles.inputGroup}>
          <label htmlFor="startingBalance">
            Starting Balance
            <span 
              className={styles.tooltip} 
              data-tip="Your current retirement savings or the amount you plan to have when starting retirement"
              tabIndex={0}
              role="tooltip"
              aria-label="Help: Starting Balance"
            >
              ?
            </span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              id="startingBalance"
              value={startingBalance}
              onChange={handleStartingBalanceChange}
              min="0"
              max="1000000000"
              step="100000"
              aria-label="Enter your starting balance in Rupees"
            />
            <span className={styles.inputIcon}>₹</span>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="withdrawalRate">
            Withdrawal Rate
            <span 
              className={styles.tooltip} 
              data-tip="The percentage of your portfolio you plan to withdraw each year. The 4% rule suggests this as a safe withdrawal rate for a 30-year retirement"
              tabIndex={0}
              role="tooltip"
              aria-label="Help: Withdrawal Rate"
            >
              ?
            </span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              id="withdrawalRate"
              value={withdrawalRate}
              onChange={handleWithdrawalRateChange}
              min="0"
              max="100"
              step="0.1"
              aria-label="Enter your withdrawal rate as a percentage"
            />
            <span className={styles.inputIcon}>%</span>
          </div>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              value={withdrawalRate}
              onChange={handleWithdrawalRateChange}
              min="0"
              max="10"
              step="0.1"
              className={styles.slider}
              aria-label="Adjust your withdrawal rate"
            />
            <div
              className={styles.sliderValue}
              style={{ '--slider-progress': `${(withdrawalRate / 10) * 100}%` } as React.CSSProperties}
            >
              {withdrawalRate}%
            </div>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="returnRate">
            Return Rate
            <span 
              className={styles.tooltip} 
              data-tip="Expected annual return on your investments after fees. Historical stock market returns in India have averaged around 12% per year before inflation"
              tabIndex={0}
              role="tooltip"
              aria-label="Help: Return Rate"
            >
              ?
            </span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              id="returnRate"
              value={returnRate}
              onChange={handleReturnRateChange}
              min="0"
              max="100"
              step="0.1"
              aria-label="Enter your expected return rate as a percentage"
            />
            <span className={styles.inputIcon}>%</span>
          </div>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              value={returnRate}
              onChange={handleReturnRateChange}
              min="0"
              max="20"
              step="0.1"
              className={styles.slider}
              aria-label="Adjust your expected return rate"
            />
            <div
              className={styles.sliderValue}
              style={{ '--slider-progress': `${(returnRate / 20) * 100}%` } as React.CSSProperties}
            >
              {returnRate}%
            </div>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="inflationRate">
            Inflation Rate
            <span 
              className={styles.tooltip} 
              data-tip="Expected annual increase in prices. India's inflation has historically averaged around 6% per year"
              tabIndex={0}
              role="tooltip"
              aria-label="Help: Inflation Rate"
            >
              ?
            </span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              id="inflationRate"
              value={inflationRate}
              onChange={handleInflationRateChange}
              min="0"
              max="100"
              step="0.1"
              aria-label="Enter your expected inflation rate as a percentage"
            />
            <span className={styles.inputIcon}>%</span>
          </div>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              value={inflationRate}
              onChange={handleInflationRateChange}
              min="0"
              max="15"
              step="0.1"
              className={styles.slider}
              aria-label="Adjust your expected inflation rate"
            />
            <div
              className={styles.sliderValue}
              style={{ '--slider-progress': `${(inflationRate / 15) * 100}%` } as React.CSSProperties}
            >
              {inflationRate}%
            </div>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="years">
            Time Period (Years)
            <span 
              className={styles.tooltip} 
              data-tip="How long you need your retirement savings to last. The 4% rule was designed for a 30-year retirement period"
              tabIndex={0}
              role="tooltip"
              aria-label="Help: Time Period"
            >
              ?
            </span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              id="years"
              value={years}
              onChange={handleYearsChange}
              min="1"
              max="100"
              step="1"
              aria-label="Enter the time period in years"
            />
            <span className={styles.inputIcon}>yrs</span>
          </div>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              value={years}
              onChange={handleYearsChange}
              min="1"
              max="50"
              step="1"
              className={styles.slider}
              aria-label="Adjust the time period"
            />
            <div
              className={styles.sliderValue}
              style={{ '--slider-progress': `${(years / 50) * 100}%` } as React.CSSProperties}
            >
              {years} years
            </div>
          </div>
        </div>
      </div>

      <div className={styles.resultGrid}>
        <div className={styles.resultItem}>
          <div className={styles.resultLabel}>Initial Annual Withdrawal</div>
          <div className={styles.resultValue}>{formatCurrency(animatedWithdrawal)}</div>
          <div className={styles.resultSubtitle}>
            Monthly: {formatCurrency(animatedWithdrawal / 12)}
            <br />
            This is your first-year withdrawal amount based on the selected withdrawal rate
          </div>
        </div>

        <div className={styles.resultItem}>
          <div className={styles.resultLabel}>Final Portfolio Balance</div>
          <div className={styles.resultValue}>{formatCurrency(animatedBalance)}</div>
          <div className={styles.resultSubtitle}>
            {isPortfolioSustainable 
              ? "Your portfolio is projected to be sustainable for the selected time period"
              : "Warning: Your portfolio may be depleted before the end of the selected period. Consider adjusting your withdrawal rate or increasing savings."
            }
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>Portfolio Balance and Withdrawals Over Time</h3>
        <div 
          className={styles.chartWrapper} 
          style={{ height: '400px', marginTop: '1rem' }}
          role="img"
          aria-label="Line chart showing portfolio balance and annual withdrawals in Rupees over time"
        >
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className={styles.chartDescription}>
          This chart visualizes how your portfolio balance (blue line) and annual withdrawals (green line) 
          change over time, accounting for investment returns, inflation, and regular withdrawals.
        </div>
      </div>
    </div>
  );
};

export default FourPercentRule;
