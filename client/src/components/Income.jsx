import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/finance';
import './../styles/Income.css';

function Income() {
    const { refreshHeroData } = useOutletContext();
    const [income, setIncome] = useState([]);
    const [formData, setFormData] = useState({
        source: '',
        amount: '',
        date_received: '',
        recurring: false,
    });
    const [error, setError] = useState('');
    // when set, the form acts as an editor for this entry's id instead of creating a new one
    const [editingId, setEditingId] = useState(null);

    function loadIncome() {
        fetch('http://localhost:3000/income', { credentials: 'include' })
            .then((res) => res.json())
            .then(setIncome)
            .catch(() => setIncome([]));
    }

    function handleChange(event) {
        const { name, value, type, checked } = event.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    }

    function startEdit(entry) {
        setEditingId(entry.id);
        setFormData({
            source: entry.source,
            amount: entry.amount,
            // date_received comes back as a full timestamp; trim to YYYY-MM-DD for the date input
            date_received: entry.date_received ? entry.date_received.slice(0, 10) : '',
            recurring: entry.recurring,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData({ source: '', amount: '', date_received: '', recurring: false });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        const isEditing = Boolean(editingId);
        const url = isEditing
            ? `http://localhost:3000/income/${editingId}`
            : 'http://localhost:3000/income';

        try {
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    amount: Number(formData.amount),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                return;
            }

            setEditingId(null);
            setFormData({ source: '', amount: '', date_received: '', recurring: false });
            loadIncome();
            refreshHeroData();
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;

        try {
            const response = await fetch(`http://localhost:3000/income/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                return;
            }

            loadIncome();
            refreshHeroData();
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    }

    useEffect(() => {
        loadIncome();
    }, []);

    const total = income.reduce((sum, entry) => sum + Number(entry.amount), 0);

    const isFormValid = formData.source.trim() !== '' && formData.amount !== '' && formData.date_received !== '';

    return (
        <div className="income-page">
            <h1>Income</h1>
            {error && <p className="error">{error}</p>}

            <form className="income-add-row" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="source"
                    placeholder="Source"
                    value={formData.source}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="date_received"
                    value={formData.date_received}
                    onChange={handleChange}
                    required
                />
                <label className="recurring-label">
                    <input
                        type="checkbox"
                        name="recurring"
                        checked={formData.recurring}
                        onChange={handleChange}
                    />
                    Recurring
                </label>
                <button type="submit" disabled={!isFormValid}>{editingId ? 'Save' : 'Add'}</button>
                {editingId && (
                    <button type="button" onClick={cancelEdit}>Cancel</button>
                )}
            </form>

            <p className="income-total">Total Income: {formatCurrency(total)}</p>

            <div className="income-list">
                {income.map((entry) => (
                    <div className="income-row" key={entry.id}>
                        <span>{entry.source}{entry.recurring && <span className="recurring-tag"> (recurring)</span>}</span>
                        <span>{formatCurrency(entry.amount)}</span>
                        <span>{formatDate(entry.date_received)}</span>
                        <button type="button" onClick={() => startEdit(entry)}>Edit</button>
                        <button type="button" onClick={() => handleDelete(entry.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Income;
