import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Bot, User, Clock, Folder, Github,
    FileArchive, ChevronRight, Search, ArrowRight,
    Hash, Layers, Plus, Trash2
} from 'lucide-react';
import { getAllCodebases, getHistory, deleteCodebase } from '../services/api';

/* ─── Source tag ────────────────────────────────────────────────── */
const SourceBadge = ({ source }) => {
    const icon = source === 'github' || source === 'github-split'
        ? <Github size={10} />
        : source === 'zip' ? <FileArchive size={10} /> : <Layers size={10} />;
    return (
        <span style={{
            background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
            borderRadius: '20px', color: 'var(--accent)',
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '0.1rem 0.45rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        }}>
            {icon} {source || 'zip'}
        </span>
    );
};

/* ─── Chat message bubble (in the expanded panel) ───────────────── */
const ChatBubble = ({ msg, isUser }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
            display: 'flex',
            flexDirection: isUser ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            gap: '0.6rem',
        }}
    >
        {/* avatar */}
        <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: isUser ? 'var(--border)' : 'var(--accent-soft)',
            border: `2px solid ${isUser ? 'var(--border)' : 'var(--accent)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {isUser ? <User size={13} color="var(--gray)" /> : <Bot size={13} color="var(--accent)" />}
        </div>

        <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
            {/* bubble */}
            <div style={{
                background: isUser ? 'var(--accent)' : 'var(--dark)',
                color: isUser ? 'var(--bg)' : 'var(--white)',
                border: isUser ? 'none' : '1px solid var(--accent-border)',
                borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding: '0.6rem 0.9rem',
                fontSize: '0.82rem',
                lineHeight: 1.65,
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                boxShadow: isUser ? '0 2px 8px var(--accent-glow)' : 'none',
            }}>
                {msg.text}
            </div>

            {/* tags */}
            {isUser && msg.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {msg.tags.map((t, i) => (
                        <span key={i} style={{
                            background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                            borderRadius: '20px', color: 'var(--accent)',
                            fontSize: '0.58rem', padding: '0.1rem 0.4rem',
                            fontFamily: 'Space Mono, monospace', display: 'flex', alignItems: 'center', gap: '0.2rem',
                        }}>
                            <Hash size={8} /> {t}
                        </span>
                    ))}
                </div>
            )}

            {/* timestamp */}
            {msg.time && (
                <div style={{ color: 'var(--border)', fontSize: '0.58rem', fontFamily: 'Space Mono, monospace' }}>
                    {msg.time}
                </div>
            )}
        </div>
    </motion.div>
);

/* ─── Main ───────────────────────────────────────────────────────── */
const History = ({ showToast }) => {
    const navigate = useNavigate();
    const [codebases, setCodebases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [chatMap, setChatMap] = useState({}); // { codebaseId: [{role, text, tags, time}] }
    const [chatLoading, setChatLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState(null);   // id being confirmed
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => { fetchCodebases(); }, []);

    const fetchCodebases = async () => {
        setLoading(true);
        try {
            const data = await getAllCodebases();
            setCodebases(data?.codebases || []);
        } catch {
            showToast?.('Failed to load sessions', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadChat = async (cb) => {
        if (selectedId === cb._id) { setSelectedId(null); return; }
        setSelectedId(cb._id);
        if (chatMap[cb._id]) return; // already loaded

        setChatLoading(true);
        try {
            const data = await getHistory(cb._id);
            const qs = data?.questions || [];
            const msgs = [];
            qs.slice().reverse().forEach(item => {
                msgs.push({ role: 'user', text: item.question, tags: item.tags, time: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null });
                msgs.push({ role: 'ai', text: item.answer, time: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null });
            });
            setChatMap(prev => ({ ...prev, [cb._id]: msgs }));
        } catch {
            showToast?.('Failed to load chat', 'error');
        } finally {
            setChatLoading(false);
        }
    };
    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (deletingId !== id) { setDeletingId(id); return; }
        setDeleteLoading(true);
        try {
            await deleteCodebase(id);
            setCodebases(prev => prev.filter(cb => cb._id !== id));
            if (selectedId === id) setSelectedId(null);
            showToast?.('Session deleted', 'success');
        } catch {
            showToast?.('Failed to delete session', 'error');
        } finally {
            setDeleteLoading(false);
            setDeletingId(null);
        }
    };
    const filtered = codebases.filter(cb => cb.name?.toLowerCase().includes(search.toLowerCase()));
    const selectedCb = codebases.find(cb => cb._id === selectedId);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* ── PAGE HEADER ── */}
            <div className="history-header" style={{ padding: '2.5rem 2rem 0', borderBottom: '2px solid var(--border)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '32px', height: '2px', background: 'var(--accent)' }} />
                        <span className="section-label">Chat History</span>
                    </div>
                    <div className="history-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--white)' }}>All Sessions</h1>
                        <div className="history-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            {/* Search */}
                            <div className="history-search-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--dark)', border: '1.5px solid var(--border)', padding: '0.45rem 0.9rem', borderRadius: '8px', minWidth: '220px' }}>
                                <Search size={13} style={{ color: 'var(--gray)', flexShrink: 0 }} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search sessions..."
                                    style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--white)', fontSize: '0.82rem', width: '100%', fontFamily: 'Space Grotesk, sans-serif' }}
                                />
                            </div>
                            {/* New session */}
                            <button
                                className="btn-primary"
                                onClick={() => navigate('/')}
                                style={{ padding: '0.5rem 1.1rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                <Plus size={14} /> New Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BODY ── */}
            <div className={`history-body${selectedId ? '' : ' no-selection'}`}>

                {/* ── SESSION LIST ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                            <div className="spinner" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="glass-card"
                            style={{ padding: '3rem', textAlign: 'center' }}
                        >
                            <Folder size={40} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
                            <div style={{ color: 'var(--gray)', fontWeight: 700 }}>No sessions yet</div>
                            <p style={{ color: 'var(--border)', fontSize: '0.82rem', margin: '0.5rem 0 1.5rem' }}>Upload a codebase to start chatting.</p>
                            <button className="btn-primary" onClick={() => navigate('/')}>Get Started →</button>
                        </motion.div>
                    ) : (
                        filtered.map((cb, i) => {
                            const isSelected = selectedId === cb._id;
                            const msgs = chatMap[cb._id] || [];
                            const lastUserMsg = msgs.filter(m => m.role === 'user').slice(-1)[0];
                            const msgCount = msgs.filter(m => m.role === 'user').length;
                            const isConfirming = deletingId === cb._id;

                            return (
                                <motion.div
                                    key={cb._id}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ x: 3 }}
                                    onClick={() => !isConfirming && loadChat(cb)}
                                    style={{
                                        cursor: isConfirming ? 'default' : 'pointer',
                                        padding: '1rem 1.1rem',
                                        borderRadius: '12px',
                                        border: `1.5px solid ${isConfirming ? '#ff4444' : isSelected ? 'var(--accent)' : 'var(--accent-border)'}`,
                                        background: isConfirming ? 'rgba(255,68,68,0.07)' : isSelected ? 'var(--accent-soft)' : 'var(--card)',
                                        display: 'flex', gap: '0.85rem', alignItems: 'center',
                                        transition: 'all 0.18s',
                                        boxShadow: isSelected ? '0 0 18px var(--accent-glow)' : 'none',
                                        position: 'relative',
                                    }}
                                >
                                    {/* Avatar */}
                                    <div style={{
                                        width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
                                        background: isConfirming ? 'rgba(255,68,68,0.12)' : isSelected ? 'var(--accent)' : 'var(--dark)',
                                        border: `2px solid ${isConfirming ? '#ff4444' : isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.18s',
                                    }}>
                                        {cb.source === 'github' || cb.source === 'github-split'
                                            ? <Github size={20} color={isConfirming ? '#ff4444' : isSelected ? 'var(--bg)' : 'var(--accent)'} />
                                            : <FileArchive size={20} color={isConfirming ? '#ff4444' : isSelected ? 'var(--bg)' : 'var(--accent)'} />
                                        }
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isConfirming ? '#ff6666' : isSelected ? 'var(--accent)' : 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.18s' }}>
                                                {cb.name}
                                            </div>
                                            {cb.created_at && (
                                                <div style={{ color: 'var(--gray)', fontSize: '0.62rem', fontFamily: 'Space Mono, monospace', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Clock size={9} />
                                                    {new Date(cb.created_at).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Inline confirm or last message preview */}
                                        {isConfirming ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                                <span style={{ color: '#ff6666', fontSize: '0.75rem', fontWeight: 600 }}>Delete this session?</span>
                                                <button
                                                    onClick={(e) => handleDelete(e, cb._id)}
                                                    disabled={deleteLoading}
                                                    style={{
                                                        background: '#ff4444', border: 'none', borderRadius: '6px',
                                                        color: '#fff', cursor: 'pointer', fontSize: '0.68rem',
                                                        fontWeight: 700, padding: '0.15rem 0.55rem',
                                                        opacity: deleteLoading ? 0.6 : 1,
                                                    }}
                                                >Yes, delete</button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                                                    style={{
                                                        background: 'transparent', border: '1px solid var(--border)',
                                                        borderRadius: '6px', color: 'var(--gray)', cursor: 'pointer',
                                                        fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.55rem',
                                                    }}
                                                >Cancel</button>
                                            </div>
                                        ) : (
                                            <div style={{ color: 'var(--gray)', fontSize: '0.75rem', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.4rem' }}>
                                                {lastUserMsg ? `"${lastUserMsg.text}"` : 'No questions yet — click to open'}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <SourceBadge source={cb.source} />
                                            {cb.file_count && (
                                                <span style={{ color: 'var(--border)', fontSize: '0.6rem', fontFamily: 'Space Mono, monospace' }}>
                                                    {cb.file_count} files
                                                </span>
                                            )}
                                            {msgCount > 0 && (
                                                <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'var(--bg)', borderRadius: '20px', fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.45rem', minWidth: '20px', textAlign: 'center' }}>
                                                    {msgCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete / chevron */}
                                    {isConfirming ? null : (
                                        <button
                                            onClick={(e) => handleDelete(e, cb._id)}
                                            title="Delete session"
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid rgba(255,68,68,0.25)',
                                                borderRadius: '8px',
                                                color: '#ff6666',
                                                cursor: 'pointer',
                                                padding: '0.35rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0,
                                                opacity: 0.6,
                                                transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255,68,68,0.12)'; e.currentTarget.style.borderColor = '#ff4444'; }}
                                            onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,68,68,0.25)'; }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <ChevronRight size={15} style={{ color: isSelected ? 'var(--accent)' : 'var(--border)', flexShrink: 0, transition: 'transform 0.18s, color 0.18s', transform: isSelected ? 'rotate(90deg)' : 'none' }} />
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* ── CHAT PANEL ── */}
                <AnimatePresence>
                    {selectedId && (
                        <motion.div
                            key={selectedId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="history-chat-panel"
                            style={{
                                position: 'sticky', top: '1.5rem',
                                height: 'calc(100vh - 200px)',
                                display: 'flex', flexDirection: 'column',
                                background: 'var(--card)',
                                border: '1.5px solid var(--accent-border)',
                                borderRadius: '16px',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Panel header */}
                            <div style={{
                                padding: '1rem 1.25rem',
                                borderBottom: '1px solid var(--accent-border)',
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                background: 'var(--accent-soft)',
                                flexShrink: 0,
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'var(--dark)', border: '2px solid var(--accent)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Bot size={17} color="var(--accent)" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {selectedCb?.name}
                                    </div>
                                    <div style={{ color: 'var(--accent)', fontSize: '0.65rem', fontFamily: 'Space Mono, monospace' }}>
                                        {(chatMap[selectedId]?.filter(m => m.role === 'user').length) || 0} questions
                                    </div>
                                </div>
                                <button
                                    className="btn-primary"
                                    onClick={() => navigate(`/qa/${selectedId}`)}
                                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '8px' }}
                                >
                                    Continue Chat <ArrowRight size={13} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {chatLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <div className="spinner" />
                                    </div>
                                ) : (chatMap[selectedId] || []).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--gray)', fontSize: '0.85rem' }}>
                                        <MessageSquare size={32} style={{ color: 'var(--border)', margin: '0 auto 0.75rem', display: 'block' }} />
                                        No questions asked yet.
                                    </div>
                                ) : (
                                    (chatMap[selectedId] || []).map((msg, i) => (
                                        <ChatBubble key={i} msg={msg} isUser={msg.role === 'user'} />
                                    ))
                                )}
                            </div>

                            {/* Quick CTA at bottom */}
                            <div style={{ flexShrink: 0, padding: '0.85rem 1.1rem', borderTop: '1px solid var(--accent-border)', background: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.45rem 0.85rem', color: 'var(--border)', fontSize: '0.8rem', cursor: 'text' }}
                                    onClick={() => navigate(`/qa/${selectedId}`)}>
                                    Ask a follow-up question...
                                </div>
                                <button
                                    onClick={() => navigate(`/qa/${selectedId}`)}
                                    style={{
                                        background: 'var(--accent)', border: 'none', borderRadius: '8px',
                                        color: 'var(--bg)', cursor: 'pointer', padding: '0.5rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 10px var(--accent-glow)',
                                    }}
                                >
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default History;
