import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3000/users/me', {
            credentials: 'include',
        })
            .then((res) => {
                if(!res.ok) throw new Error('Not authenticated');
                return res.json();
            })
            .then((data) => setUser(data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}