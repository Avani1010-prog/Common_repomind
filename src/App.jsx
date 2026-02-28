import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import PageLoader from './components/PageLoader';
import Home from './pages/Home';
import QAInterface from './pages/QAInterface';
import Status from './pages/Status';
import History from './pages/History';

const THEME_KEY = 'repomind-theme';

function App() {
    const [toast, setToast] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'lime');

    // Apply theme to <html> element whenever it changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    return (
        <Router>
            <PageLoader />
            <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', background: 'var(--bg)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <Navbar theme={theme} setTheme={setTheme} />
                <div className="main-content" style={{ width: '100%', flex: 1 }}>
                    <Routes>
                        <Route path="/" element={<Home showToast={showToast} />} />
                        <Route path="/qa/:codebaseId" element={<QAInterface showToast={showToast} />} />
                        <Route path="/status" element={<Status />} />
                        <Route path="/history" element={<History showToast={showToast} />} />
                    </Routes>
                </div>
                {toast && <Toast message={toast.message} type={toast.type} />}
            </div>
        </Router>
    );
}

export default App;
