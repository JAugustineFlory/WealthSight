import { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../utils/finance';
import './../styles/Dashboard.css';

function monthLabel(monthKey) {
    // monthKey is "YYYY-MM" — build a real date so we can format it nicely
    const [year, month] = monthKey.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function groupByMonth(entries, dateField) {
    const totals = {};
    entries.forEach((entry) => {
        const raw = entry[dateField];
        if (!raw) return;
        const key = raw.slice(0, 7); // "YYYY-MM"
        totals[key] = (totals[key] || 0) + Number(entry.amount);
    });
    return totals;
}

function Dashboard() {
    const [budgets, setBudgets] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/budgets', { credentials: 'include' })
            .then((res) => res.json())
            .then(setBudgets)
            .catch(() => setBudgets([]));

        Promise.all([
            fetch('http://localhost:3000/income', { credentials: 'include' }).then((res) => res.json()),
            fetch('http://localhost:3000/bills', { credentials: 'include' }).then((res) => res.json()),
        ])
            .then(([income, bills]) => {
                const incomeByMonth = groupByMonth(income, 'date_received');
                const expensesByMonth = groupByMonth(bills, 'due_date');

                // union of every month that appears in either dataset
                const allMonths = new Set([
                    ...Object.keys(incomeByMonth),
                    ...Object.keys(expensesByMonth),
                ]);

                const points = Array.from(allMonths)
                    .sort()
                    .map((monthKey) => ({
                        month: monthLabel(monthKey),
                        net: (incomeByMonth[monthKey] || 0) - (expensesByMonth[monthKey] || 0),
                    }));

                setChartData(points);
            })
            .catch(() => setChartData([]));
    }, []);

    return (
        <div className="dashboard-page">
            <div className="dashboard-graph">
                {chartData.length === 0 ? (
                    <p>Add income and bills to see your net income trend.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                            <CartesianGrid stroke="rgba(56, 189, 248, 0.15)" />
                            <XAxis dataKey="month" stroke="#7a93c2" />
                            <YAxis stroke="#7a93c2" />
                            <Tooltip
                                contentStyle={{ background: '#0d1b3d', border: '1px solid #38bdf8' }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Line
                                type="monotone"
                                dataKey="net"
                                stroke="#00e5ff"
                                strokeWidth={2}
                                dot={{ fill: '#00e5ff', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="dashboard-budget">
                <h3>Budget</h3>
                {budgets.length === 0 ? (
                    <p>No budgets set yet.</p>
                ) : (
                    <table>
                        <tbody>
                            {budgets.map((budget) => (
                                <tr key={budget.id}>
                                    <td>{budget.month_year}</td>
                                    <td>{formatCurrency(budget.monthly_limit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
