import { useContext, useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/finance';
import Login from './Login';
import './../styles/Layout.css';

function Layout() {
    const { user, loading } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    const [bills, setBills] = useState([]);
    const [income, setIncome] = useState([]);
    const location = useLocation();

    useEffect(() => {
        if (!user) return;
        refreshHeroData();
    }, [user]);

    // exposed to child pages via Outlet context, so any add/edit/delete
    // elsewhere in the app can tell the hero to refetch its totals
    function refreshHeroData() {
        fetch('http://localhost:3000/cards', { credentials: 'include' })
            .then((res) => res.json())
            .then(setCards)
            .catch(() => setCards([]));

        fetch('http://localhost:3000/bills', { credentials: 'include' })
            .then((res) => res.json())
            .then(setBills)
            .catch(() => setBills([]));

        fetch('http://localhost:3000/income', { credentials: 'include' })
            .then((res) => res.json())
            .then(setIncome)
            .catch(() => setIncome([]));
    }

    if (loading) {
        return <p>Preparing your dashboard</p>
    }

    if (!user) {
        return <Login />;
    }

    const totalIncome = income.reduce((sum, entry) => sum + Number(entry.amount), 0);
    const totalExpenses = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);
    const totalDebt = cards.reduce((sum, card) => sum + Number(card.current_debt), 0);
    const remaining = totalIncome - totalExpenses;

    const upcomingBills = bills
        .filter((bill) => bill.status !== 'paid')
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    const nextPayment = upcomingBills[0];

    return (
        <div>
            {/**Header contains persistent Dashboard */}
            <header className="hero">
                <h1>WealthSight</h1>

                <div className="hero-stats">
                    <div className="hero-stat">
                        <p className="hero-label">Monthly Income</p>
                        <p className="hero-value">{formatCurrency(totalIncome)}</p>
                        {location.pathname === '/income' ? (
                            <Link to="/">Close</Link>
                        ) : (
                            <Link to="/income">Add/Edit Income</Link>
                        )}
                    </div>

                    <div className="hero-stat">
                        <p className="hero-label">Monthly Expenses</p>
                        <p className="hero-value">{formatCurrency(totalExpenses)}</p>
                        {location.pathname === '/bills' ? (
                            <Link to="/">Close</Link>
                        ) : (
                            <Link to="/bills">Add/Edit</Link>
                        )}
                    </div>

                    <div className="hero-stat">
                        <p className="hero-label">Total Debt</p>
                        <p className="hero-value">{formatCurrency(totalDebt)}</p>
                        {location.pathname === '/cards' ? (
                            <Link to="/">Close</Link>
                        ) : (
                            <Link to="/cards">Add/Edit</Link>
                        )}
                    </div>

                    <div className="hero-stat">
                        <p className="hero-label">Remaining</p>
                        <p className="hero-value">{formatCurrency(remaining)}</p>
                    </div>

                    <div className="hero-stat">
                        <p className="hero-label">Next Payment</p>
                        {nextPayment ? (
                            <>
                                <p className="hero-value">{formatCurrency(nextPayment.amount)}</p>
                                <p className="hero-sublabel">{formatDate(nextPayment.due_date)}</p>
                            </>
                        ) : (
                            <p className="hero-value">None</p>
                        )}
                        {location.pathname === '/budgets' ? (
                            <Link to="/">Close</Link>
                        ) : (
                            <Link to="/budgets">Add/Edit</Link>
                        )}
                    </div>
                </div>
            </header>
            {/**main contains routes/interchangeable components */}
            <main>
                <Outlet context={{ refreshHeroData }} />
            </main>
        </div>
    );
}


export default Layout;
