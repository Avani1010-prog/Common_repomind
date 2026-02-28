import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageLoader — shows a sleek top progress bar + fullscreen
 * flash overlay on every route change.  Theme-aware via CSS vars.
 */
const PageLoader = () => {
    const location = useLocation();
    const [state, setState] = useState('idle'); // idle | loading | done
    const [progress, setProgress] = useState(0);
    const timerRef = useRef(null);
    const intervalRef = useRef(null);

    const clearAll = () => {
        clearTimeout(timerRef.current);
        clearInterval(intervalRef.current);
    };

    useEffect(() => {
        // Kick off loader on every route change
        clearAll();
        setState('loading');
        setProgress(0);

        // Quickly ramp to ~80 % then stall — mimics real loading feel
        let p = 0;
        intervalRef.current = setInterval(() => {
            p += Math.random() * 18 + 6;
            if (p >= 82) { p = 82; clearInterval(intervalRef.current); }
            setProgress(p);
        }, 80);

        // After a short delay, finish and hide
        timerRef.current = setTimeout(() => {
            clearInterval(intervalRef.current);
            setProgress(100);
            setState('done');

            // Remove after exit animation
            timerRef.current = setTimeout(() => {
                setState('idle');
                setProgress(0);
            }, 500);
        }, 520);

        return clearAll;
    }, [location.pathname]);

    if (state === 'idle') return null;

    return (
        <>
            {/* ── Top progress bar ───────────────────────────── */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                zIndex: 9999,
                background: 'var(--border)',
            }}>
                <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'var(--accent)',
                    boxShadow: `0 0 12px var(--accent-glow), 0 0 4px var(--accent)`,
                    transition: state === 'done'
                        ? 'width 0.25s ease, opacity 0.45s ease 0.1s'
                        : 'width 0.12s ease',
                    opacity: state === 'done' ? 0 : 1,
                    borderRadius: '0 2px 2px 0',
                }} />

                {/* Glow dot at the head */}
                <div style={{
                    position: 'absolute',
                    top: '-3px',
                    left: `calc(${progress}% - 6px)`,
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    boxShadow: `0 0 18px 4px var(--accent-glow)`,
                    opacity: state === 'done' ? 0 : 1,
                    transition: 'left 0.12s ease, opacity 0.35s ease',
                    pointerEvents: 'none',
                }} />
            </div>

            {/* ── Fullscreen flash overlay ────────────────────── */}
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9998,
                background: `radial-gradient(ellipse at center, var(--accent-soft) 0%, transparent 70%)`,
                opacity: state === 'done' ? 0 : 0.45,
                transition: state === 'done'
                    ? 'opacity 0.4s ease'
                    : 'opacity 0.15s ease',
                pointerEvents: 'none',
            }} />
        </>
    );
};

export default PageLoader;
