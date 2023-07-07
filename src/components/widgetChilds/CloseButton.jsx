import React from 'react';

const CloseButton = () => {
    const handleClose = () => {
        window.postMessage({ type: 'conditionResult', value: 'initial' }, '*');
    };

    return (
        <button
            onClick={handleClose}
            style={{
                // display: 'flex',
                position: 'absolute',
                top: '-10%',
                left: '-8%',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                zIndex: '999',
            }}
        >
            <img
                width="35"
                height="35"
                src="https://img.icons8.com/ios-glyphs/30/1eea94/macos-close.png"
                alt="macos-close"
            />
        </button>
    );
};

export default CloseButton;
