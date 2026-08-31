import { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency, formatDate, calculateSuggestedPayment } from '../utils/finance';
import './../styles/Cards.css';

function Cards() {
    const { refreshHeroData } = useOutletContext();
    const { user } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    const [formData, setFormData] = useState({
        nickname: '',
        organization: '',
        credit_limit: '',
        current_debt: '',
        apr: '',
        due_date: '',
        payoff_period_months: 30,
        autopay_enabled: false,
    });
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

    function loadCards() {
        fetch('http://localhost:3000/cards', { credentials: 'include' })
            .then((res) => res.json())
            .then(setCards)
            .catch(() => setCards([]));
    }

    useEffect(() => {
        loadCards();
    }, []);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    }

    function startEdit(card) {
        setEditingId(card.id);
        setFormData({
            nickname: card.nickname,
            organization: card.organization,
            credit_limit: card.credit_limit,
            current_debt: card.current_debt,
            apr: card.apr,
            due_date: card.due_date ? card.due_date.slice(0, 10) : '',
            payoff_period_months: card.payoff_period_months || 30,
            autopay_enabled: card.autopay_enabled,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData({
            nickname: '', organization: '', credit_limit: '', current_debt: '',
            apr: '', due_date: '', payoff_period_months: 30, autopay_enabled: false,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        const isEditing = Boolean(editingId);
        const url = isEditing
            ? `http://localhost:3000/cards/${editingId}`
            : 'http://localhost:3000/cards';

        try {
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    credit_limit: Number(formData.credit_limit),
                    current_debt: Number(formData.current_debt),
                    apr: Number(formData.apr),
                    payoff_period_months: Number(formData.payoff_period_months),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                return;
            }

            cancelEdit();
            loadCards();
            refreshHeroData();
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Are you sure you want to delete this card?')) return;

        try {
            const response = await fetch(`http://localhost:3000/cards/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                return;
            }

            loadCards();
            refreshHeroData();
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    }

    const isFormValid = formData.nickname.trim() !== '' && formData.organization.trim() !== ''
        && formData.credit_limit !== '' && formData.current_debt !== '' && formData.apr !== '';

    return (
        <div className="cards-page">
            <h1>Credit Cards & Loans</h1>
            {error && <p className="error">{error}</p>}

            <form className="cards-add-row" onSubmit={handleSubmit}>
                <input type="text" name="nickname" placeholder="Nickname" value={formData.nickname} onChange={handleChange} required />
                <input type="text" name="organization" placeholder="Bank/Org" value={formData.organization} onChange={handleChange} required />
                <input type="number" name="credit_limit" placeholder="Limit" value={formData.credit_limit} onChange={handleChange} required />
                <input type="number" name="current_debt" placeholder="Current Debt" value={formData.current_debt} onChange={handleChange} required />
                <input type="number" name="apr" placeholder="APR %" value={formData.apr} onChange={handleChange} required />
                <div className="field-with-label">
                    <label htmlFor="due_date">Payment Due Date</label>
                    <input type="date" id="due_date" name="due_date" value={formData.due_date} onChange={handleChange} />
                </div>
                <div className="payoff-slider">
                    <label htmlFor="payoff_period_months">Payoff: {formData.payoff_period_months} months</label>
                    <input
                        type="range"
                        id="payoff_period_months"
                        name="payoff_period_months"
                        min="6"
                        max="60"
                        step="1"
                        value={formData.payoff_period_months}
                        onChange={handleChange}
                    />
                </div>
                <label className="autopay-label">
                    <input type="checkbox" name="autopay_enabled" checked={formData.autopay_enabled} onChange={handleChange} />
                    Autopay
                </label>
                <button type="submit" disabled={!isFormValid}>{editingId ? 'Save' : 'Add'}</button>
                {editingId && (
                    <button type="button" onClick={cancelEdit}>Cancel</button>
                )}
            </form>

            <div className="cards-table">
                <div className="cards-table-header">
                    <span>Card</span>
                    <span>Balance / Limit</span>
                    <span>APR</span>
                    <span>Due Date</span>
                    <span>Suggested Payment</span>
                    <span>Autopay</span>
                    <span>Actions</span>
                </div>
                {cards.map((card) => {
                    const utilization = card.credit_limit > 0
                        ? (Number(card.current_debt) / Number(card.credit_limit)) * 100
                        : 0;
                    const isHighUtilization = utilization >= 30;
                    const months = card.payoff_period_months || user?.default_payoff_months || 30;
                    const suggestedPayment = calculateSuggestedPayment(
                        Number(card.current_debt),
                        Number(card.apr),
                        months
                    );

                    return (
                        <div
                            className={`cards-table-row ${isHighUtilization ? 'high-utilization' : ''}`}
                            key={card.id}
                            title={isHighUtilization
                                ? 'Card has reached/surpassed 30% utilization, which may impact credit score. We suggest using another card.'
                                : ''}
                        >
                            <span className="card-nickname">{card.nickname} — {card.organization}</span>
                            <span>{formatCurrency(card.current_debt)} / {formatCurrency(card.credit_limit)} ({utilization.toFixed(0)}%)</span>
                            <span>{card.apr}%</span>
                            <span>{formatDate(card.due_date)}</span>
                            <span>{formatCurrency(suggestedPayment)} ({months}mo)</span>
                            <span>{card.autopay_enabled ? <span className="autopay-tag">ON</span> : '—'}</span>
                            <span className="cards-row-actions">
                                <button type="button" onClick={() => startEdit(card)}>Edit</button>
                                <button type="button" onClick={() => handleDelete(card.id)}>Delete</button>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Cards;
