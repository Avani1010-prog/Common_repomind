import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHealth } from '../services/api';

const StatusRow = ({ label, value, ok }) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.85rem 0', borderBottom: '1px solid var(--accent-border)'
    }}>
        <span style={{ color: 'var(--gray)', fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: ok ? 'var(--accent)' : '#ff4444', fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}>{value}</span>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ok ? 'var(--accent)' : '#ff4444' }} />
        </div>
    </div>
);

const Status = () => {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastChecked, setLastChecked] = useState(null);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const data = await getHealth();
            setHealth(data);
            setLastChecked(new Date());
        } catch {
            setHealth({ status: 'error', error: 'Cannot reach backend' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHealth(); const t = setInterval(fetchHealth, 30000); return () => clearInterval(t); }, []);

    const isOk = health?.status === 'ok';

    return (
        <div style={{ minHeight: '100vh', padding: '3rem 1.5rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '2px', background: 'var(--accent)' }} />
                        <span className="section-label">System Status</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--white)' }}>Health Monitor</h1>
                        <button onClick={fetchHealth} className="btn-outline-lime" disabled={loading}>
                            {loading ? 'Checking...' : 'Refresh'}
                        </button>
                    </div>
                    {lastChecked && (
                        <p style={{ color: 'var(--gray)', fontSize: '0.75rem', fontFamily: 'Space Mono, monospace', marginTop: '0.5rem' }}>
                            Last checked: {lastChecked.toLocaleTimeString()}
                        </p>
                    )}
                </motion.div>

                {loading && !health ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <div className="spinner" />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Overall Status Banner */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="glass-card"
                            style={{
                                background: isOk ? 'var(--accent-soft) !important' : 'rgba(255,68,68,0.07) !important',
                                border: `1.5px solid ${isOk ? 'var(--accent)' : 'rgba(255,68,68,0.5)'} !important`,
                                padding: '1.5rem 2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                            }}>
                            <div style={{
                                width: '14px', height: '14px', borderRadius: '50%',
                                background: isOk ? 'var(--accent)' : '#ff4444',
                                boxShadow: isOk ? '0 0 12px var(--accent-glow)' : '0 0 12px #ff4444',
                                flexShrink: 0,
                            }} />
                            <div>
                                <div className={isOk ? 'lime-glow' : ''} style={{ fontWeight: 800, fontSize: '1rem', color: isOk ? 'var(--accent)' : '#ff4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {isOk ? 'All Systems Operational' : 'System Degraded'}
                                </div>
                                {health?.error && <div style={{ color: 'var(--gray)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{health.error}</div>}
                            </div>
                        </motion.div>

                        {/* Services */}
                        {health && !health.error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="glass-card"
                                style={{ padding: '2rem' }}>
                                <div className="section-label" style={{ marginBottom: '1rem' }}>Services</div>
                                <StatusRow label="Backend API" value={health.status === 'ok' ? 'Online' : 'Offline'} ok={health.status === 'ok'} />
                                <StatusRow label="Database" value={health.database?.status || 'Unknown'} ok={health.database?.status === 'connected'} />
                                <StatusRow label="AI Service" value={health.ai?.status || 'Unknown'} ok={health.ai?.status === 'configured'} />
                            </motion.div>
                        )}

                        {/* System Info */}
                        {health?.system && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="glass-card"
                                style={{ padding: '2rem' }}>
                                <div className="section-label" style={{ marginBottom: '1rem' }}>System Info</div>
                                <StatusRow label="Node.js" value={health.system.nodeVersion} ok={true} />
                                <StatusRow label="Platform" value={health.system.platform} ok={true} />
                                <StatusRow label="Memory (Used)" value={health.system.memoryUsage} ok={true} />
                                <StatusRow label="Uptime" value={health.system.uptime} ok={true} />
                            </motion.div>
                        )}

                        {/* Stats */}
                        {health?.stats && Object.keys(health.stats).length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="glass-card"
                                style={{ padding: '2rem' }}>
                                <div className="section-label" style={{ marginBottom: '1rem' }}>Database Stats</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    {[
                                        { label: 'Codebases', value: health.stats.codebases ?? '—' },
                                        { label: 'Code Files', value: health.stats.codeFiles ?? '—' },
                                        { label: 'Questions', value: health.stats.questions ?? '—' },
                                    ].map((stat, i) => (
                                        <div key={i} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)', fontFamily: 'Space Mono, monospace' }}>{stat.value}</div>
                                            <div style={{ color: 'var(--gray)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Status;
