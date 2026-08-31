import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Income from './components/Income';
import Bills from './components/Bills';
import Cards from './components/Cards';
import Budgets from './components/Budgets';

import './styles/App.css'

const router = createBrowserRouter([
    {
        path: '/',//persistent hero/summary section
        element: <Layout />,
        children: [//interchanging modules
            { index: true, element: <Dashboard /> },
            { path: 'income', element: <Income /> },
            { path: 'bills', element: <Bills /> },
            { path: 'cards', element: <Cards /> },
            { path: 'budgets', element: <Budgets /> },
        ],
    },
]);

function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default App
