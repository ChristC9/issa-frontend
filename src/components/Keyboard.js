import React, { useEffect } from 'react';
import './Keyboard.css';

const Keyboard = ({ onKeyPress, keyStatuses = {} }) => {
    const keys = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
    ];

    // Handle physical keyboard input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                onKeyPress('ENTER');
            } else if (e.key === 'Backspace') {
                onKeyPress('BACKSPACE');
            } else {
                const key = e.key.toUpperCase();
                if (/^[A-Z]$/.test(key)) {
                    onKeyPress(key);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onKeyPress]);

    return (
        <div className="keyboard">
            {keys.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                    {row.map((key) => (
                        <button
                            key={key}
                            className={`keyboard-key ${key.length > 1 ? 'keyboard-key-wide' : ''} ${keyStatuses[key] || ''}`}
                            onClick={() => onKeyPress(key)}
                        >
                            {key === 'BACKSPACE' ? '⌫' : key}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Keyboard; 