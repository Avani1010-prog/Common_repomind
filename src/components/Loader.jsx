import React from 'react';

const Loader = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
                width: '7rem',
                height: '7rem',
                border: '8px solid var(--border)',
                borderTopColor: 'var(--accent)',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                fontSize: '2.25rem',
                animation: 'spin 1s linear infinite'
            }}>
                <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em" style={{ animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }}>
                    <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"></path>
                </svg>
            </div>
        </div>
    );
};

export default Loader;
