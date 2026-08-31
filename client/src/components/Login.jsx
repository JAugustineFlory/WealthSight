import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './../styles/Login.css';

function Login() {
    const [signUpMode, setSignUpMode] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const [error, setError] = useState('');
    const { setUser } = useContext(AuthContext);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        if (signUpMode && password !== verifyPassword) {
            setError('Passwords do not match');
            return;
        }

        const endpoint = signUpMode ? 'signup' : 'login';
        const body = signUpMode
            ? { username, email, password }
            : { email, password };

        try {
            const response = await fetch(`http://localhost:3000/users/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                return;
            }

            const user = await response.json();
            setUser(user);
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    }

    return (
        <div className="login-page">
            <h1 className="login-tagline">WealthSight — The only budget tool you need</h1>

            <div className="login-content">
                <div className="login-form-panel">
                    <h2>{signUpMode ? 'Sign up to get started' : 'Sign in to get started'}</h2>

                    <form onSubmit={handleSubmit}>
                        {error && <p className="error">{error}</p>}

                        {signUpMode && (
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                            />
                        )}

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />

                        {signUpMode && (
                            <input
                                type="password"
                                placeholder="Verify Password"
                                value={verifyPassword}
                                onChange={(event) => setVerifyPassword(event.target.value)}
                            />
                        )}

                        <div className="login-buttons">
                            <button type="submit" className="primary">
                                {signUpMode ? 'Sign Up' : 'Log In'}
                            </button>
                            <button type="button" onClick={() => setSignUpMode(!signUpMode)}>
                                {signUpMode ? 'Already have an account? Log In' : 'Sign Up'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="login-preview-panel">
                    <div className="preview-stat-row">
                        <div className="preview-stat">
                            <p className="preview-label">Example Income</p>
                            <p className="preview-value">$4,250</p>
                        </div>
                        <div className="preview-stat">
                            <p className="preview-label">Example Monthly Expenses</p>
                            <p className="preview-value">$2,890</p>
                        </div>
                    </div>

                    <div className="preview-graph">
                        <p>Example Graph</p>
                    </div>

                    <div className="preview-budget">
                        <p className="preview-budget-title">Example Budget</p>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Rent</td>
                                    <td>$1,200</td>
                                </tr>
                                <tr>
                                    <td>Utilities</td>
                                    <td>$180</td>
                                </tr>
                                <tr>
                                    <td>Groceries</td>
                                    <td>$420</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
