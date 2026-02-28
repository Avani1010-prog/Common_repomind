import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Zap, Search, Code2, History, FolderOpen, Brain } from 'lucide-react';
import { uploadZip, uploadGithub, uploadGithubSplit } from '../services/api';
import GithubCard from '../components/GithubCard';
import Loader from '../components/Loader';

const Home = ({ showToast }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [githubUrl, setGithubUrl] = useState('');
    const [githubLoading, setGithubLoading] = useState(false);
    const [frontendUrl, setFrontendUrl] = useState('');
    const [backendUrl, setBackendUrl] = useState('');
    const [githubSplitLoading, setGithubSplitLoading] = useState(false);

    const handleFileUpload = async (file) => {
        if (!file) return;
        if (!file.name.endsWith('.zip')) {
            showToast('Only ZIP files allowed', 'error');
            return;
        }
        setUploading(true);
        try {
            const response = await uploadZip(file);
            showToast(`Uploaded: ${response.fileCount} files`, 'success');
            navigate(`/qa/${response.codebaseId}`);
        } catch (err) {
            showToast(err.response?.data?.error || 'Upload failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    };

    const handleGithub = async (e) => {
        e.preventDefault();
        const url = githubUrl.trim();
        if (!url) { showToast('Select or enter a GitHub repo URL', 'error'); return; }
        setGithubLoading(true);
        try {
            const response = await uploadGithub(url);
            showToast(`Scanned: ${response.fileCount} files`, 'success');
            navigate(`/qa/${response.codebaseId}`);
        } catch (err) {
            showToast(err.response?.data?.error || 'Scan failed', 'error');
        } finally {
            setGithubLoading(false);
        }
    };

    const handleGithubSplit = async (e) => {
        e.preventDefault();
        const fe = frontendUrl.trim();
        const be = backendUrl.trim();
        if (!fe || !be) { showToast('Enter both frontend and backend repo URLs', 'error'); return; }
        setGithubSplitLoading(true);
        try {
            const response = await uploadGithubSplit(fe, be);
            showToast(`Scanned: ${response.fileCount} files (${response.frontendFileCount} frontend + ${response.backendFileCount} backend)`, 'success');
            navigate(`/qa/${response.codebaseId}`);
        } catch (err) {
            // Network error (backend down) — err.response will be undefined
            if (!err.response) {
                if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                    showToast('Request timed out — repos may be large, try again', 'error');
                } else {
                    showToast('Cannot reach server — make sure backend is running on port 5000', 'error');
                }
            } else {
                showToast(err.response?.data?.error || 'Split scan failed', 'error');
            }
        } finally {
            setGithubSplitLoading(false);
        }
    };

    const features = [
        { icon: <Zap size={20} />, title: 'Instant Analysis', desc: 'GPT-4 powered code understanding in seconds' },
        { icon: <Search size={20} />, title: 'Precise Search', desc: 'Find exact files, line ranges, and snippets' },
        { icon: <Code2 size={20} />, title: 'Refactor AI', desc: 'Get smart improvement suggestions' },
        { icon: <History size={20} />, title: 'Q&A History', desc: 'Last 10 questions saved automatically' },
    ];

    return (
        <div style={{ minHeight: '100vh' }}>

            {/* ── HERO ── */}
            <section style={{ borderBottom: '2px solid var(--border)', padding: '5rem 1.5rem 4rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                        {/* Label */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <div style={{ width: '40px', height: '2px', background: 'var(--accent)' }} />
                            <span className="section-label">AI Codebase Intelligence</span>
                            <div style={{ width: '40px', height: '2px', background: 'var(--accent)' }} />
                        </div>

                        {/* Headline */}
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                            fontWeight: 800,
                            lineHeight: 1.05,
                            letterSpacing: '-0.02em',
                            color: 'var(--white)',
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                        }}>
                            Ask Anything<br />
                            About Your<br />
                            <span style={{ color: 'var(--accent)' }}>Codebase.</span>
                        </h1>

                        <p style={{ color: 'var(--gray)', fontSize: '1.1rem', maxWidth: '520px', lineHeight: 1.7, marginBottom: '2.5rem', textAlign: 'center', margin: '0 auto 2.5rem' }}>
                            Upload a ZIP or connect a GitHub repo. Ask natural language questions.
                            Get precise answers with file paths, line ranges, and code snippets.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                            <button
                                className="btn-primary"
                                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                                style={{ fontSize: '1rem', padding: '1rem 3rem', letterSpacing: '0.15em' }}
                            >
                                GET STARTED →
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section style={{ borderBottom: '2px solid var(--border)', padding: '3rem 1.5rem' }}>
                <div className="features-grid" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card"
                            style={{ padding: '1.75rem 1.5rem', cursor: 'default' }}
                            whileHover={{ y: -4 }}
                        >
                            <div style={{
                                width: '40px', height: '40px',
                                background: 'var(--accent-soft)',
                                border: '2px solid var(--accent-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--accent)',
                                marginBottom: '1rem',
                                borderRadius: '8px',
                            }}>
                                {f.icon}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--white)', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>{f.title}</div>
                            <div style={{ color: 'var(--gray)', fontSize: '0.8rem', lineHeight: 1.6 }}>{f.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── UPLOAD SECTION ── */}
            <section id="upload-section" style={{ padding: '4rem 1.5rem', borderBottom: '2px solid var(--border)' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* ZIP Upload */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{ padding: '2.5rem' }}
                    >
                        <div className="section-label" style={{ marginBottom: '1.5rem' }}>Option 01</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--white)', marginBottom: '0.5rem' }}>Upload ZIP File</h2>
                        <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '2rem' }}>Max 50MB. All major languages supported.</p>

                        {/* Drop Zone */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
                                background: dragging ? 'var(--accent-soft)' : 'var(--dark)',
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: '1.5rem',
                                borderRadius: '8px',
                            }}
                        >
                            {uploading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                    <Loader />
                                    <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 700, marginTop: '1rem' }}>Processing...</span>
                                </div>
                            ) : (
                                <>
                                    <Upload size={32} style={{ color: dragging ? 'var(--accent)' : 'var(--border)', margin: '0 auto 1rem' }} />
                                    <p style={{ color: dragging ? 'var(--accent)' : 'var(--gray)', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {dragging ? 'Drop it!' : 'Drag & drop your ZIP here'}
                                    </p>
                                    <p style={{ color: 'var(--border)', fontSize: '0.75rem', marginTop: '0.5rem' }}>or click to browse</p>
                                </>
                            )}
                        </div>

                        <input ref={fileInputRef} type="file" accept=".zip" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e.target.files[0])} />

                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            <Upload size={16} /> {uploading ? 'Uploading...' : 'Browse Files'}
                        </button>
                    </motion.div>

                    {/* GitHub */}
                    <GithubCard
                        id="github-section"
                        onSubmit={handleGithub}
                        loading={githubLoading}
                        githubUrl={githubUrl}
                        setGithubUrl={setGithubUrl}
                        onSplitSubmit={handleGithubSplit}
                        splitLoading={githubSplitLoading}
                        frontendUrl={frontendUrl}
                        setFrontendUrl={setFrontendUrl}
                        backendUrl={backendUrl}
                        setBackendUrl={setBackendUrl}
                    />
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section style={{ padding: '4rem 1.5rem' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <div className="section-label" style={{ marginBottom: '2rem' }}>How It Works</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { num: '01', title: 'Upload', desc: 'Drop a ZIP file or paste a GitHub URL to load your codebase.' },
                            { num: '02', title: 'Ask', desc: 'Type any natural language question about your code.' },
                            { num: '03', title: 'Explore', desc: 'Get precise answers with file paths, lines, and snippets.' },
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.12 }}
                                whileHover={{ x: 4 }}
                                className="glass-card hiw-card"
                            >
                                {/* Big number */}
                                <div style={{
                                    fontSize: '3rem', fontWeight: 900, color: 'var(--accent)',
                                    fontFamily: 'Space Mono, monospace', lineHeight: 1,
                                    flexShrink: 0, userSelect: 'none', minWidth: '64px', textAlign: 'right',
                                    textShadow: '0 0 12px var(--accent-glow), 0 0 30px var(--accent-soft)',
                                }}>
                                    {step.num}
                                </div>

                                {/* Divider */}
                                <div style={{ width: '2px', height: '48px', background: 'var(--border)', flexShrink: 0 }} />

                                {/* Content */}
                                <div>
                                    <div style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                                        {step.title}
                                    </div>
                                    <p style={{ color: 'var(--gray)', fontSize: '0.85rem', lineHeight: 1.6 }}>{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ borderTop: '2px solid var(--border)', padding: '3rem 1.5rem', background: 'var(--dark)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>

                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <FolderOpen size={20} color="var(--accent)" strokeWidth={2.5} />
                                <Brain size={10} color="var(--accent)" strokeWidth={3} style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                            </div>
                            <span style={{ color: 'var(--white)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}>REPOMIND</span>
                        </div>
                        <p style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>AI-Powered Code Analysis & Intelligence.</p>
                    </div>

                    {/* Links */}
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <a href="https://www.linkedin.com/in/avani-pandey-945651328/" target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--gray)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                            onMouseLeave={e => e.target.style.color = 'var(--gray)'}
                        >LinkedIn</a>
                        <a href="https://github.com/Avani1010-prog" target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--gray)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                            onMouseLeave={e => e.target.style.color = 'var(--gray)'}
                        >GitHub</a>
                    </div>

                    {/* Copyright */}
                    <div style={{ color: 'var(--border)', fontSize: '0.75rem', fontFamily: 'Space Mono, monospace' }}>
                        © 2026 RepoMind Inc.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
