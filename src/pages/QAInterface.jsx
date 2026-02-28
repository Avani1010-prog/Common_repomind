import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Tag, Sparkles, FileCode, ChevronDown, ChevronUp,
    Bot, User, ArrowLeft, Hash, GitBranch
} from 'lucide-react';
import { askQuestion, getHistory, generateRefactor } from '../services/api';
import CodeSnippet from '../components/CodeSnippet';
import Mermaid from '../components/Mermaid';

/* ── tiny sub-components ─────────────────────────────────────────── */

const TypingDots = () => (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '4px 0' }}>
        {[0, 1, 2].map(i => (
            <span key={i} style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: 'var(--accent)',
                animation: `typingBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                display: 'inline-block',
            }} />
        ))}
        <style>{`
            @keyframes typingBounce {
                0%, 60%, 100% { transform: translateY(0); opacity: .6; }
                30% { transform: translateY(-6px); opacity: 1; }
            }
        `}</style>
    </div>
);

const FileRefCard = ({ fileRef: r, onRefactor, loadingRefactor }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{
            border: '1px solid var(--accent-border)',
            borderRadius: '8px',
            overflow: 'hidden',
            marginTop: '0.5rem',
            background: 'var(--dark)',
        }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.6rem 0.9rem', background: 'var(--accent-soft)',
                    border: 'none', cursor: 'pointer', gap: '0.75rem',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <FileCode size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--accent)', fontFamily: 'Space Mono, monospace', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.file}
                    </span>
                    <span style={{ color: 'var(--gray)', fontSize: '0.65rem', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>
                        L{r.lineStart}–{r.lineEnd}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                        onClick={e => { e.stopPropagation(); onRefactor(r.snippet, 'javascript'); }}
                        disabled={loadingRefactor}
                        style={{
                            background: 'transparent', border: '1px solid var(--accent-border)',
                            borderRadius: '4px', color: 'var(--accent)', cursor: 'pointer',
                            fontSize: '0.62rem', fontWeight: 700, padding: '0.15rem 0.4rem',
                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                            letterSpacing: '0.05em', textTransform: 'uppercase',
                            opacity: loadingRefactor ? 0.5 : 1,
                        }}
                    >
                        <Sparkles size={10} /> Refactor
                    </button>
                    {open ? <ChevronUp size={13} color="var(--gray)" /> : <ChevronDown size={13} color="var(--gray)" />}
                </div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                    >
                        {r.explanation && (
                            <p style={{ color: 'var(--gray)', fontSize: '0.78rem', padding: '0.6rem 0.9rem', borderBottom: '1px solid var(--accent-border)', lineHeight: 1.6, margin: 0 }}>
                                {r.explanation}
                            </p>
                        )}
                        <CodeSnippet code={r.snippet} language="javascript" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ── main component ──────────────────────────────────────────────── */

const QAInterface = ({ showToast }) => {
    const { codebaseId } = useParams();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]); // {role:'user'|'ai', content, tags, fileRefs, mermaid, refactor, id}
    const [question, setQuestion] = useState('');
    const [tags, setTags] = useState('');
    const [showTags, setShowTags] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingRefactor, setLoadingRefactor] = useState(false);
    const [codebaseName, setCodebaseName] = useState('');

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    /* load past history as initial messages */
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await getHistory(codebaseId);
                const qs = Array.isArray(response?.questions) ? response.questions : [];
                const msgs = [];
                qs.slice().reverse().forEach((item, i) => {
                    msgs.push({
                        id: `h-user-${i}`,
                        role: 'user',
                        content: item.question,
                        tags: item.tags || [],
                    });
                    msgs.push({
                        id: `h-ai-${i}`,
                        role: 'ai',
                        content: item.answer,
                        mermaid: item.mermaid_code,
                        fileRefs: item.file_references || [],
                        timestamp: item.created_at,
                    });
                });
                setMessages(msgs);
                if (qs[0]?.codebase_name) setCodebaseName(qs[0].codebase_name);
            } catch { /* silent */ }
        };
        loadHistory();
    }, [codebaseId]);

    /* auto-scroll */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async (e) => {
        e?.preventDefault();
        const q = question.trim();
        if (!q) return;

        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        const userMsgId = `u-${Date.now()}`;
        const aiMsgId = `a-${Date.now()}`;

        setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: q, tags: tagArray }]);
        setQuestion('');
        setTags('');
        setShowTags(false);
        setLoading(true);

        try {
            const response = await askQuestion(codebaseId, q, tagArray);
            setMessages(prev => [...prev, {
                id: aiMsgId,
                role: 'ai',
                content: response.answer,
                mermaid: response.mermaidCode,
                fileRefs: response.fileReferences || [],
                timestamp: new Date().toISOString(),
            }]);
            showToast('Answer ready!', 'success');
        } catch (err) {
            setMessages(prev => [...prev, {
                id: aiMsgId,
                role: 'ai',
                content: '⚠️ ' + (err.response?.data?.error || 'Failed to get an answer. Please try again.'),
                fileRefs: [],
                isError: true,
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefactor = async (msgId, code, language) => {
        setLoadingRefactor(true);
        try {
            const response = await generateRefactor(code, language);
            setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, refactor: response.suggestions } : m
            ));
            showToast('Refactor suggestions ready', 'success');
        } catch {
            showToast('Failed to generate suggestions', 'error');
        } finally {
            setLoadingRefactor(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="qa-page-wrap" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            background: 'var(--bg)',
            overflow: 'hidden',
        }}>

            {/* ── TOP BAR ── */}
            <div className="qa-topbar" style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.85rem 1.5rem',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--accent-border)',
                flexShrink: 0,
                zIndex: 10,
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '0.4rem',
                        fontSize: '0.8rem', fontWeight: 700, padding: '0.4rem 0.6rem',
                        borderRadius: '6px', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--gray)'; e.currentTarget.style.background = 'transparent'; }}
                >
                    <ArrowLeft size={15} /> Home
                </button>

                <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

                {/* Bot avatar */}
                <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--accent-soft)',
                    border: '2px solid var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                }}>
                    <Bot size={18} color="var(--accent)" />
                    <span style={{
                        position: 'absolute', bottom: '0', right: '0',
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: '#00dd88', border: '2px solid var(--bg)',
                    }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--white)', letterSpacing: '0.02em' }}>
                        RepoMind AI
                    </div>
                    <div style={{ color: 'var(--accent)', fontSize: '0.68rem', fontFamily: 'Space Mono, monospace', opacity: 0.85 }}>
                        {codebaseName || `Session: ${codebaseId?.slice(-8)}`}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: '20px', padding: '0.3rem 0.75rem' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00dd88', display: 'inline-block' }} />
                    <span style={{ color: 'var(--accent)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em' }}>ONLINE</span>
                </div>
            </div>

            {/* ── CHAT MESSAGES ── */}
            <div className="qa-chat-area" style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
            }}>

                {/* Welcome message */}
                {messages.length === 0 && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', textAlign: 'center' }}
                    >
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: 'var(--accent-soft)', border: '2px solid var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '0.5rem',
                        }}>
                            <Bot size={32} color="var(--accent)" />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--white)' }}>Ask me anything about your codebase</div>
                        <p style={{ color: 'var(--gray)', fontSize: '0.85rem', maxWidth: '380px', lineHeight: 1.7 }}>
                            I can find functions, explain logic, trace data flows, identify bugs, and suggest refactors.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                            {[
                                'Where is auth handled?',
                                'How does the upload flow work?',
                                'List all API endpoints',
                                'What DB models exist?',
                            ].map(q => (
                                <button
                                    key={q}
                                    onClick={() => { setQuestion(q); inputRef.current?.focus(); }}
                                    style={{
                                        background: 'var(--dark)', border: '1px solid var(--border)',
                                        borderRadius: '20px', color: 'var(--gray)',
                                        padding: '0.4rem 0.9rem', cursor: 'pointer',
                                        fontSize: '0.75rem', fontWeight: 600,
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-soft)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--gray)'; e.currentTarget.style.background = 'var(--dark)'; }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Message list */}
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            display: 'flex',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            maxWidth: '100%',
                        }}
                    >
                        {/* Avatar */}
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                            background: msg.role === 'user' ? 'var(--border)' : 'var(--accent-soft)',
                            border: `2px solid ${msg.role === 'user' ? 'var(--border)' : 'var(--accent)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {msg.role === 'user'
                                ? <User size={15} color="var(--gray)" />
                                : <Bot size={15} color="var(--accent)" />
                            }
                        </div>

                        {/* Bubble + extras */}
                        <div style={{ maxWidth: 'min(75%, 700px)', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>

                            {/* Bubble */}
                            <div style={{
                                background: msg.role === 'user'
                                    ? 'var(--accent)'
                                    : msg.isError ? 'rgba(255,68,68,0.08)' : 'var(--card)',
                                color: msg.role === 'user' ? 'var(--bg)' : msg.isError ? '#ff6666' : 'var(--white)',
                                border: msg.role === 'user' ? 'none' : `1px solid ${msg.isError ? 'rgba(255,68,68,0.3)' : 'var(--accent-border)'}`,
                                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                padding: '0.85rem 1.1rem',
                                fontSize: '0.88rem',
                                lineHeight: 1.75,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                boxShadow: msg.role === 'user' ? '0 4px 12px var(--accent-glow)' : '0 2px 8px rgba(0,0,0,0.3)',
                            }}>
                                {msg.content}
                            </div>

                            {/* Tags (user) */}
                            {msg.role === 'user' && msg.tags?.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {msg.tags.map((t, ti) => (
                                        <span key={ti} style={{
                                            background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                                            borderRadius: '20px', color: 'var(--accent)',
                                            fontSize: '0.62rem', padding: '0.1rem 0.45rem',
                                            fontFamily: 'Space Mono, monospace', display: 'flex', alignItems: 'center', gap: '0.2rem',
                                        }}>
                                            <Hash size={9} /> {t}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Mermaid diagram */}
                            {msg.role === 'ai' && msg.mermaid && (
                                <div style={{ width: '100%' }}>
                                    <div style={{ color: 'var(--gray)', fontSize: '0.68rem', fontFamily: 'Space Mono, monospace', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <GitBranch size={11} /> Visual Overview
                                    </div>
                                    <Mermaid chart={msg.mermaid} />
                                </div>
                            )}

                            {/* File references */}
                            {msg.role === 'ai' && msg.fileRefs?.length > 0 && (
                                <div style={{ width: '100%' }}>
                                    <div style={{ color: 'var(--gray)', fontSize: '0.68rem', fontFamily: 'Space Mono, monospace', marginBottom: '0.35rem' }}>
                                        {msg.fileRefs.length} file reference{msg.fileRefs.length > 1 ? 's' : ''}
                                    </div>
                                    {msg.fileRefs.map((ref, ri) => (
                                        <FileRefCard
                                            key={ri}
                                            fileRef={ref}
                                            onRefactor={(code, lang) => handleRefactor(msg.id, code, lang)}
                                            loadingRefactor={loadingRefactor}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Refactor panel */}
                            {msg.role === 'ai' && msg.refactor?.length > 0 && (
                                <div style={{
                                    background: 'var(--dark)', border: '1px solid var(--accent-border)',
                                    borderRadius: '12px', padding: '1rem', width: '100%',
                                }}>
                                    <div style={{ color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Sparkles size={12} /> Refactor Suggestions
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {msg.refactor.map((s, si) => (
                                            <div key={si} style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '0.75rem' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--white)', marginBottom: '0.2rem' }}>{s.title}</div>
                                                <p style={{ color: 'var(--gray)', fontSize: '0.77rem', lineHeight: 1.6, margin: 0 }}>{s.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Timestamp */}
                            {msg.timestamp && (
                                <div style={{ color: 'var(--border)', fontSize: '0.62rem', fontFamily: 'Space Mono, monospace' }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Typing indicator */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}
                    >
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                            background: 'var(--accent-soft)', border: '2px solid var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Bot size={15} color="var(--accent)" />
                        </div>
                        <div style={{
                            background: 'var(--card)', border: '1px solid var(--accent-border)',
                            borderRadius: '18px 18px 18px 4px',
                            padding: '0.85rem 1.1rem',
                        }}>
                            <TypingDots />
                        </div>
                    </motion.div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* ── INPUT AREA ── */}
            <div className="qa-input-area" style={{
                flexShrink: 0,
                padding: '1rem 1.5rem 1.25rem',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--accent-border)',
            }}>

                {/* Tags row (expandable) */}
                <AnimatePresence>
                    {showTags && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden', marginBottom: '0.5rem' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem' }}>
                                <Tag size={13} color="var(--gray)" />
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={e => setTags(e.target.value)}
                                    placeholder="Tags (comma-separated): auth, api, database"
                                    style={{
                                        flex: 1, background: 'var(--dark)', border: '1px solid var(--border)',
                                        borderRadius: '8px', color: 'var(--white)', padding: '0.45rem 0.75rem',
                                        fontSize: '0.8rem', outline: 'none', fontFamily: 'Space Grotesk, sans-serif',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main input row */}
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end' }}>

                    {/* Tags toggle */}
                    <button
                        type="button"
                        onClick={() => setShowTags(v => !v)}
                        title="Add tags"
                        style={{
                            background: showTags ? 'var(--accent-soft)' : 'transparent',
                            border: `1px solid ${showTags ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: '10px',
                            color: showTags ? 'var(--accent)' : 'var(--gray)',
                            cursor: 'pointer',
                            padding: '0.65rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.15s',
                            height: '44px', width: '44px',
                        }}
                    >
                        <Tag size={15} />
                    </button>

                    {/* Text input */}
                    <textarea
                        ref={inputRef}
                        value={question}
                        onChange={e => { setQuestion(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about your codebase…   (Enter to send, Shift+Enter for newline)"
                        disabled={loading}
                        rows={1}
                        style={{
                            flex: 1,
                            background: 'var(--dark)',
                            border: '1.5px solid var(--border)',
                            borderRadius: '12px',
                            color: 'var(--white)',
                            padding: '0.65rem 1rem',
                            fontSize: '0.9rem',
                            resize: 'none',
                            outline: 'none',
                            fontFamily: 'Space Grotesk, sans-serif',
                            lineHeight: 1.5,
                            overflowY: 'hidden',
                            minHeight: '44px',
                            maxHeight: '120px',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />

                    {/* Send button */}
                    <button
                        type="submit"
                        disabled={loading || !question.trim()}
                        style={{
                            background: loading || !question.trim() ? 'var(--border)' : 'var(--accent)',
                            border: 'none',
                            borderRadius: '12px',
                            color: loading || !question.trim() ? 'var(--gray)' : 'var(--bg)',
                            cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
                            padding: '0.65rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.2s',
                            height: '44px', width: '44px',
                            boxShadow: !loading && question.trim() ? '0 4px 12px var(--accent-glow)' : 'none',
                        }}
                    >
                        <Send size={17} />
                    </button>
                </form>

                <p className="qa-hint-text" style={{ color: 'var(--border)', fontSize: '0.62rem', fontFamily: 'Space Mono, monospace', textAlign: 'center', marginTop: '0.5rem' }}>
                    Enter ↵ send · Shift+Enter newline
                </p>
            </div>
        </div>
    );
};

export default QAInterface;
