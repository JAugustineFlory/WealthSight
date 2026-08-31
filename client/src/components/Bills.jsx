import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/finance';
import './../styles/Bills.css';

function Bills() {
    const { refreshHeroData } = useOutletContext();
    const [bills, setBills] = useState([]);
    const [cards, setCards] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        due_date: '',
        recurring: false,
        card_id: '',
        category_id: '',
    });
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

    function loadBills() {
        fetch('http://localhost:3000/bills', { credentials: 'include' })
            .then((res) => res.json())
            .then(setBills)
            .catch(() => setBills([]));
    }

    function loadCards() {
        fetch('http://localhost:3000/cards', { credentials: 'include' })
            .then((res) => res.json())
            .then(setCards)
            .catch(() => setCards([]));
    }

    function loadCategories() {
        fetch('http://localhost:3000/categories', { credentials: 'include' })
            .then((res) => res.json())
            .then(setCategories)
            .catch(() => setCategories([]));
    }

    useEffect(() => {
        loadBills();
        loadCards();
        loadCategories();
    }, []);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    }

    function startEdit(bill) {
        setEditingId(bill.id);
        setFormData({
            name: bill.name,
            amount: bill.amount,
            due_date: bill.due_date ? bill.due_date.slice(0, 10) : '',
            recurring: bill.recurring,
            card_id: bill.card_id || '',
            category_id: bill.category_id || '',
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData({ name: '', amount: '', due_date: '', recurring: false, card_id: '', category_id: '' });
    }

    // category_id/card_id are optional FKs — send null instead of an empty string,
    // since the backend expects either a real uuid or nothing at all
    function cleanIds(data) {
        return {
            ...data,
            card_id: data.card_id || null,
            category_id: data.category_id || null,
        };
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        const isEditing = Boolean(editingId);
        const url = isEditing
            ? `http://localhost:3000/bills/${editingId}`
            : 'http://localhost:3000/bills';

        try {
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(cleanIds({
                    ...formData,
                    amount: Number(formData.amount),
                    // new bills start unpaid; status is changed afterward via the toggle buttons
                    status: isEditing ? undefined : 'unpaid',
                })),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                return;
            }

            cancelEdit();
            loadBills();
            refreshHeroData();
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Are you sure you want to delete this bill?')) return;

        try {
            const response = await fetch(`http://localhost:3000/bills/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                return;
            }

            loadBills();
            refreshHeroData();
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    }

    async function handleStatusChange(bill, status) {
        try {
            const response = await fetch(`http://localhost:3000/bills/${bill.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(cleanIds({
                    name: bill.name,
                    amount: bill.amount,
                    due_date: bill.due_date ? bill.due_date.slice(0, 10) : '',
                    recurring: bill.recurring,
                    card_id: bill.card_id,
                    category_id: bill.category_id,
                    status,
                })),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                return;
            }

            loadBills();
            refreshHeroData();
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    }

    async function handleAddCategory() {
        if (!newCategoryName.trim()) return;

        try {
            const response = await fetch('http://localhost:3000/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: newCategoryName, type: 'expense' }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                return;
            }

            const newCategory = await response.json();
            setNewCategoryName('');
            loadCategories();
            setFormData({ ...formData, category_id: newCategory.id });
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    }

    const isFormValid = formData.name.trim() !== '' && formData.amount !== '' && formData.due_date !== '';

    return (
        <div className="bills-page">
            <h1>Bills & Recurring Expenses</h1>
            {error && <p className="error">{error}</p>}

            <form className="bills-add-row" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
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
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    required
                />
                <select name="card_id" value={formData.card_id} onChange={handleChange}>
                    <option value="">No card</option>
                    {cards.map((card) => (
                        <option key={card.id} value={card.id}>{card.nickname}</option>
                    ))}
                </select>
                <select name="category_id" value={formData.category_id} onChange={handleChange}>
                    <option value="">No category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
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

            <div className="quick-add-category">
                <input
                    type="text"
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                />
                <button type="button" onClick={handleAddCategory}>+ Add Category</button>
            </div>

            <div className="bills-list">
                {bills.map((bill) => (
                    <div className="bills-row" key={bill.id}>
                        <span>{bill.name}</span>
                        <span>{formatCurrency(bill.amount)}</span>
                        <span>{formatDate(bill.due_date)}</span>
                        <div className="status-toggle">
                            {['unpaid', 'upcoming', 'paid'].map((status) => (
                                <button
                                    type="button"
                                    key={status}
                                    className={bill.status === status ? 'active' : ''}
                                    onClick={() => handleStatusChange(bill, status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <button type="button" onClick={() => startEdit(bill)}>Edit</button>
                        <button type="button" onClick={() => handleDelete(bill.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Bills;
