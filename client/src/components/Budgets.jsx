import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { formatCurrency } from '../utils/finance';
import './../styles/Budgets.css';

function Budgets() {
    const { refreshHeroData } = useOutletContext();
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [formData, setFormData] = useState({
        monthly_limit: '',
        month_year: '',
        category_id: '',
    });
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

    function loadBudgets() {
        fetch('http://localhost:3000/budgets', { credentials: 'include' })
            .then((res) => res.json())
            .then(setBudgets)
            .catch(() => setBudgets([]));
    }

    function loadCategories() {
        fetch('http://localhost:3000/categories', { credentials: 'include' })
            .then((res) => res.json())
            .then(setCategories)
            .catch(() => setCategories([]));
    }

    useEffect(() => {
        loadBudgets();
        loadCategories();
    }, []);

    function handleChange(event) {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    function startEdit(budget) {
        setEditingId(budget.id);
        setFormData({
            monthly_limit: budget.monthly_limit,
            month_year: budget.month_year,
            category_id: budget.category_id || '',
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData({ monthly_limit: '', month_year: '', category_id: '' });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        const isEditing = Boolean(editingId);
        const url = isEditing
            ? `http://localhost:3000/budgets/${editingId}`
            : 'http://localhost:3000/budgets';

        try {
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    monthly_limit: Number(formData.monthly_limit),
                    category_id: formData.category_id || null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                return;
            }

            cancelEdit();
            loadBudgets();
            refreshHeroData();
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Are you sure you want to delete this budget?')) return;

        try {
            const response = await fetch(`http://localhost:3000/budgets/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                return;
            }

            loadBudgets();
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

    function categoryName(id) {
        const category = categories.find((c) => c.id === id);
        return category ? category.name : 'Uncategorized';
    }

    const isFormValid = formData.monthly_limit !== '' && formData.month_year.trim() !== '';

    return (
        <div className="budgets-page">
            <h1>Budget</h1>
            {error && <p className="error">{error}</p>}

            <form className="budgets-add-row" onSubmit={handleSubmit}>
                <select name="category_id" value={formData.category_id} onChange={handleChange}>
                    <option value="">No category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                <input
                    type="number"
                    name="monthly_limit"
                    placeholder="Monthly Limit"
                    value={formData.monthly_limit}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="month_year"
                    placeholder="Aug-2026"
                    value={formData.month_year}
                    onChange={handleChange}
                    required
                />
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

            <div className="budgets-list">
                {budgets.map((budget) => (
                    <div className="budgets-row" key={budget.id}>
                        <span>{categoryName(budget.category_id)}</span>
                        <span>{budget.month_year}</span>
                        <span>{formatCurrency(budget.monthly_limit)}</span>
                        <button type="button" onClick={() => startEdit(budget)}>Edit</button>
                        <button type="button" onClick={() => handleDelete(budget.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Budgets;
