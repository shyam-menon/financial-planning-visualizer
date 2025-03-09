export const formatIndianCurrency = (amount: number): string => {
    if (amount === 0) return '₹0';
    if (amount < 0) return `-${formatIndianCurrency(Math.abs(amount))}`;

    // For amounts less than 1 lakh
    if (amount < 100000) {
        return `₹${amount.toLocaleString('en-IN')}`;
    }

    const crore = Math.floor(amount / 10000000);
    const remainingAfterCrore = amount % 10000000;
    const lakh = Math.floor(remainingAfterCrore / 100000);
    const remainingAfterLakh = remainingAfterCrore % 100000;
    const thousand = Math.floor(remainingAfterLakh / 1000);
    
    const parts = [];
    
    if (crore > 0) {
        parts.push(`${crore} crore`);
    }
    if (lakh > 0) {
        parts.push(`${lakh} lakh`);
    }
    if (thousand > 0) {
        parts.push(`${thousand} thousand`);
    }

    return parts.length > 0 ? `₹${parts.join(' ')}` : '₹0';
};
