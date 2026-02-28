import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';
import { GitBranch, Maximize2 } from 'lucide-react';

const Mermaid = ({ chart }) => {
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(null);
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            securityLevel: 'loose',
            fontFamily: 'Space Mono',
            fontSize: 14,
            themeVariables: {
                background: '#0a0a0a',
                primaryColor: '#111111',
                primaryTextColor: '#ffffff',
                primaryBorderColor: '#ffffff',
                lineColor: '#ffffff',
                secondaryColor: '#1a1a1a',
                tertiaryColor: '#111111',
                edgeLabelBackground: '#0a0a0a',
                nodeTextColor: '#ffffff',
                clusterBkg: '#000000',
                titleColor: '#ffffff',
            }
        });
    }, []);

    useEffect(() => {
        const renderDiagram = async () => {
            if (!chart) return;
            try {
                const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(uniqueId, chart);
                setSvg(svg);
                setError(null);
            } catch (err) {
                console.error('Mermaid render error:', err);
                setError(err);
            }
        };
        renderDiagram();
    }, [chart]);

    if (!chart || error) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    background: '#0a0a0a',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    borderRadius: '14px',
                    marginBottom: '1.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                    width: '100%',
                }}
            >
                {/* Header bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <GitBranch size={14} color="#ffffff" />
                        <span style={{
                            color: '#ffffff',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            fontFamily: 'Space Mono, monospace',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        }}>Visual Diagram</span>
                    </div>
                    <button
                        onClick={() => setFullscreen(true)}
                        title="View fullscreen"
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            padding: '0.25rem 0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.62rem',
                            fontFamily: 'Space Mono, monospace',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                        <Maximize2 size={11} /> Expand
                    </button>
                </div>

                {/* Diagram area */}
                <div
                    style={{
                        overflowX: 'auto',
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'center',
                        minHeight: '140px',
                    }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            </motion.div>

            {/* Fullscreen overlay */}
            {fullscreen && (
                <div
                    onClick={() => setFullscreen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: 'rgba(0,0,0,0.92)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        cursor: 'zoom-out',
                    }}
                >
                    {/* Fullscreen header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        marginBottom: '1.25rem',
                        color: '#ffffff',
                    }}>
                        <GitBranch size={18} />
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                            Visual Diagram — click anywhere to close
                        </span>
                    </div>

                    {/* Fullscreen diagram */}
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#0a0a0a',
                            border: '1.5px solid rgba(255,255,255,0.2)',
                            borderRadius: '18px',
                            padding: '2.5rem',
                            maxWidth: '95vw',
                            maxHeight: '82vh',
                            overflowY: 'auto',
                            overflowX: 'auto',
                            boxShadow: '0 0 60px rgba(0,0,0,0.8)',
                            cursor: 'default',
                        }}
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />

                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginTop: '1rem', fontFamily: 'Space Mono, monospace' }}>
                        Click outside to close
                    </p>
                </div>
            )}
        </>
    );
};

export default Mermaid;
