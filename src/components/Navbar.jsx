import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, History, FolderOpen, Brain, Palette, X } from 'lucide-react';

// ── Theme definitions ──────────────────────────────────────────────────────
const THEMES = [
    { id: 'lime', label: 'Lime', color: '#c8ff00', bg: '#080808' },
    { id: 'purple', label: 'Purple', color: '#c084fc', bg: '#09060f' },
    { id: 'ocean', label: 'Ocean', color: '#00e5ff', bg: '#020c12' },
    { id: 'sunset', label: 'Sunset', color: '#ff6b35', bg: '#0e0704' },
    { id: 'rose', label: 'Rose', color: '#ff2d78', bg: '#0d0308' },
    { id: 'arctic', label: 'Arctic', color: '#00ffcc', bg: '#030e0c' },
    { id: 'neon', label: 'Neon', color: '#3d8eff', bg: '#030508' },
    { id: 'gold', label: 'Gold', color: '#ffc72c', bg: '#0c0900' },
    { id: 'infrared', label: 'Infrared', color: '#ff3c3c', bg: '#0a0202' },
    { id: 'mint', label: 'Mint', color: '#00e676', bg: '#020c06' },
];

const Navbar = ({ theme, setTheme }) => {
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showThemePicker, setShowThemePicker] = useState(false);
    const [showMobileTheme, setShowMobileTheme] = useState(false);
    const leaveTimer = useRef(null);

    const links = [
        { to: '/', label: 'Home', icon: <Home size={20} /> },
        { to: '/status', label: 'Status', icon: <Activity size={20} /> },
        { to: '/history', label: 'History', icon: <History size={20} /> },
    ];

    const accentColor = THEMES.find(t => t.id === theme)?.color || '#c8ff00';

    /* ── desktop hover handlers ── */
    const handleMouseEnter = () => { clearTimeout(leaveTimer.current); setIsExpanded(true); };
    const handleMouseLeave = () => {
        leaveTimer.current = setTimeout(() => { setIsExpanded(false); setShowThemePicker(false); }, 250);
    };

    /* close mobile theme picker when clicking outside */
    useEffect(() => {
        if (!showMobileTheme) return;
        const close = () => setShowMobileTheme(false);
        const t = setTimeout(() => document.addEventListener('click', close), 10);
        return () => { clearTimeout(t); document.removeEventListener('click', close); };
    }, [showMobileTheme]);

    /* close mobile theme picker on route change */
    useEffect(() => { setShowMobileTheme(false); }, [location.pathname]);

    return (
        <>
            {/* ══════════════════════════════════════════════════
                DESKTOP SIDEBAR (hidden on mobile via CSS)
            ══════════════════════════════════════════════════ */}
            <div
                style={{ position: 'fixed', top: 0, left: 0, width: '16px', height: '100vh', zIndex: 200 }}
                onMouseEnter={handleMouseEnter}
            />

            <nav
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'fixed', top: 0, left: 0, height: '100vh',
                    width: isExpanded ? '260px' : '0px',
                    overflow: 'hidden', zIndex: 150,
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(25px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(25px) saturate(180%)',
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isExpanded
                        ? '4px 0 40px rgba(0,0,0,0.6), inset -1px 0 20px rgba(255,255,255,0.04)'
                        : 'none',
                }}
            >
                <div style={{
                    width: '260px', height: '100%',
                    display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem',
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)',
                    transition: 'opacity 0.22s ease, transform 0.22s ease',
                    pointerEvents: isExpanded ? 'auto' : 'none',
                }}>

                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none', marginBottom: '3rem', display: 'flex' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '32px', height: '32px', background: `${accentColor}1a`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '6px', flexShrink: 0, position: 'relative', transition: 'background 0.4s',
                            }}>
                                <FolderOpen size={24} color={accentColor} strokeWidth={2.5} />
                                <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                    <Brain size={12} color={accentColor} strokeWidth={3} />
                                </div>
                            </div>
                            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                RepoMind
                            </span>
                        </div>
                    </Link>

                    {/* Nav Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {links.map(link => {
                            const isActive = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.to} to={link.to} className="nav-link"
                                    style={{
                                        textDecoration: 'none', height: '48px',
                                        display: 'flex', alignItems: 'center', paddingLeft: '1rem',
                                        fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                                        color: isActive ? 'var(--bg)' : '#888888',
                                        background: isActive ? accentColor : 'transparent',
                                        border: '1px solid', borderColor: isActive ? accentColor : 'transparent',
                                        borderRadius: '8px', transition: 'all 0.15s', whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = accentColor; e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
                                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#888888'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; } }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>{link.icon}</span>
                                    <span style={{ marginLeft: '0.75rem' }}>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Footer: Theme Picker */}
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            onClick={() => setShowThemePicker(p => !p)} title="Change theme"
                            style={{
                                background: showThemePicker ? `${accentColor}22` : 'transparent',
                                border: `1px solid ${showThemePicker ? accentColor : 'transparent'}`,
                                borderRadius: '8px', color: showThemePicker ? accentColor : '#666',
                                cursor: 'pointer', padding: '0.5rem',
                                display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                                transition: 'all 0.2s', fontSize: '0.75rem', fontWeight: 700,
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                            }}
                            onMouseEnter={e => { if (!showThemePicker) { e.currentTarget.style.color = accentColor; e.currentTarget.style.borderColor = '#333'; } }}
                            onMouseLeave={e => { if (!showThemePicker) { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = 'transparent'; } }}
                        >
                            <Palette size={16} /><span>Theme</span>
                        </button>

                        {showThemePicker && (
                            <div style={{
                                width: '100%', background: 'rgba(15,15,15,0.97)',
                                border: '1px solid #2a2a2a', borderRadius: '12px', padding: '0.75rem',
                                display: 'flex', flexDirection: 'column', gap: '0.35rem',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                            }}>
                                <p style={{ color: '#444', fontSize: '0.62rem', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                    Select theme
                                </p>
                                {THEMES.map(t => {
                                    const isActiveTheme = theme === t.id;
                                    return (
                                        <button
                                            key={t.id} onClick={() => setTheme(t.id)} title={t.label}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                                background: isActiveTheme ? `${t.color}18` : 'transparent',
                                                border: `1px solid ${isActiveTheme ? t.color : 'transparent'}`,
                                                borderRadius: '8px', padding: '0.4rem 0.6rem',
                                                cursor: 'pointer', transition: 'all 0.15s', width: '100%',
                                            }}
                                            onMouseEnter={e => { if (!isActiveTheme) { e.currentTarget.style.background = `${t.color}10`; e.currentTarget.style.borderColor = `${t.color}55`; } }}
                                            onMouseLeave={e => { if (!isActiveTheme) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
                                        >
                                            <span style={{
                                                width: '16px', height: '16px', borderRadius: '50%', background: t.color, flexShrink: 0,
                                                border: isActiveTheme ? `2px solid ${t.color}` : '2px solid #3a3a3a',
                                                boxShadow: isActiveTheme ? `0 0 8px ${t.color}88` : 'none',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                            }}>
                                                {isActiveTheme && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#000', opacity: 0.6 }} />}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: isActiveTheme ? 800 : 600, color: isActiveTheme ? t.color : '#666', letterSpacing: '0.06em', transition: 'color 0.2s' }}>
                                                {t.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div style={{ color: '#444', fontSize: '0.7rem', fontFamily: 'Space Mono, monospace' }}>v1.0.0</div>
                    </div>
                </div>
            </nav>

            {/* ══════════════════════════════════════════════════
                MOBILE BOTTOM NAV BAR
            ══════════════════════════════════════════════════ */}
            <nav className="mobile-nav">
                {links.map(link => {
                    const isActive = location.pathname === link.to;
                    return (
                        <Link
                            key={link.to} to={link.to}
                            style={{
                                textDecoration: 'none',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                gap: '3px', flex: 1, padding: '0.4rem',
                                color: isActive ? accentColor : '#555',
                                transition: 'color 0.2s', position: 'relative',
                            }}
                        >
                            {isActive && (
                                <span style={{
                                    position: 'absolute', top: '4px',
                                    width: '4px', height: '4px', borderRadius: '50%',
                                    background: accentColor, boxShadow: `0 0 8px ${accentColor}`,
                                }} />
                            )}
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{link.icon}</span>
                            <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                {link.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Theme picker toggle */}
                <button
                    onClick={e => { e.stopPropagation(); setShowMobileTheme(v => !v); }}
                    style={{
                        flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '3px', padding: '0.4rem',
                        color: showMobileTheme ? accentColor : '#555',
                        transition: 'color 0.2s',
                    }}
                >
                    <Palette size={20} />
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Theme</span>
                </button>
            </nav>

            {/* Mobile theme sheet — slides up from bottom nav */}
            {showMobileTheme && (
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        bottom: 'calc(60px + env(safe-area-inset-bottom, 0px))',
                        left: 0, right: 0,
                        background: 'rgba(10,10,10,0.97)',
                        backdropFilter: 'blur(20px)',
                        borderTop: `1px solid ${accentColor}33`,
                        borderRadius: '20px 20px 0 0',
                        padding: '1.25rem 1rem 0.75rem',
                        zIndex: 300,
                        boxShadow: '0 -8px 40px rgba(0,0,0,0.7)',
                        animation: 'fadeUp 0.22s ease forwards',
                    }}
                >
                    {/* drag handle */}
                    <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#333', margin: '0 auto 1rem' }} />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <p style={{ color: '#666', fontSize: '0.65rem', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                            Choose Theme
                        </p>
                        <button onClick={() => setShowMobileTheme(false)} style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* 2-column theme grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                        {THEMES.map(t => {
                            const isActiveTheme = theme === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => { setTheme(t.id); setShowMobileTheme(false); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                                        background: isActiveTheme ? `${t.color}18` : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${isActiveTheme ? t.color : 'transparent'}`,
                                        borderRadius: '10px', padding: '0.6rem 0.75rem',
                                        cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                >
                                    <span style={{
                                        width: '14px', height: '14px', borderRadius: '50%',
                                        background: t.color, flexShrink: 0,
                                        boxShadow: isActiveTheme ? `0 0 8px ${t.color}` : 'none',
                                        border: isActiveTheme ? `2px solid ${t.color}` : '2px solid #2a2a2a',
                                    }} />
                                    <span style={{ fontSize: '0.78rem', fontWeight: isActiveTheme ? 800 : 600, color: isActiveTheme ? t.color : '#888' }}>
                                        {t.label}
                                    </span>
                                    {isActiveTheme && (
                                        <span style={{ marginLeft: 'auto', color: t.color, fontSize: '0.65rem' }}>✓</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ height: '0.5rem' }} />
                </div>
            )}
        </>
    );
};

export default Navbar;
