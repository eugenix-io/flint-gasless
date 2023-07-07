// MyComponent.js
import React, { useEffect, useRef, useState } from 'react';
import SelectorFee from './SelectorFee.jsx';
import { OptimisedBy } from './widgetChilds/OptimisedBy.jsx';
import { Approval } from './widgetChilds/Approval.jsx';
import { Selector } from './widgetChilds/Selector.jsx';
import { Swapping } from './widgetChilds/swapping.jsx';

let swapD = false;
const MyComponent = () => {
    const [conditionResult, setConditionResult] = useState('initial');
    const [isHovered, setIsHovered] = useState(false);

    const handleHover = () => {
        setIsHovered(true);
    };

    const handleLeave = () => {
        setIsHovered(false);
    };

    // Function to handle the message from injected.js
    const handleConditionResult = (event) => {
        if (event.data && event.data.type === 'conditionResult') {
            const conditionResult = event.data.value;
            console.log('meassage received to handle ui', conditionResult);
            setConditionResult(conditionResult);
        }
    };

    useEffect(() => {
        // Add a listener to receive messages from the injected.js script
        window.addEventListener('message', handleConditionResult);

        // Clean up the listener when the component unmounts
        return () => {
            window.removeEventListener('message', handleConditionResult);
        };
    }, []);

    return (
        <>
            <div
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
                style={{ zIndex: 9999999 }}
            >
                {/* <Swapping style={{ zIndex: 9999 }}></Swapping> */}

                {!isHovered ? (
                    <>
                        {conditionResult === 'initial' && (
                            <>
                                <OptimisedBy></OptimisedBy>
                            </>
                        )}
                    </>
                ) : (
                    ''
                )}

                {conditionResult === 'approvalRequested' && (
                    <Approval></Approval>
                )}
                <div>
                    {conditionResult === 'swapInitiated' && (
                        <Swapping style={{ zIndex: 9999 }}></Swapping>
                    )}
                </div>

                {isHovered && (
                    <>
                        {conditionResult === 'initial' && <Selector></Selector>}
                    </>
                )}
            </div>
        </>
    );
};

export default MyComponent;
