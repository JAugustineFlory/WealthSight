export function calculateSuggestedPayment(currentDebt, apr, months) {
    const monthlyRate = apr / 100 / 12;

    if (!months || months <= 0) {
        return 0;
    }

    if (monthlyRate === 0) {
        return currentDebt / months;
    }

    return (currentDebt * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount || 0);
}

export function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
