// MyComponent.js
import React, { useEffect, useState } from 'react';
import SelectorFee from './SelectorFee.jsx';
import { OptimisedBy } from './widgetChilds/OptimisedBy.jsx';
import { Approval } from './widgetChilds/Approval.jsx';
import { Selector } from './widgetChilds/Selector.jsx';
import { Swapping } from './widgetChilds/swapping.jsx';

const MyComponent = () => {
    const [showFirstSVG, setShowFirstSVG] = useState(true);
    const [conditionResult, setConditionResult] = useState('initial');

    useEffect(() => {
        // After 2 seconds, switch to the second SVG
        const timer = setTimeout(() => {
            setShowFirstSVG(false);
        }, 3000);

        // Clear the timer when the component unmounts
        return () => clearTimeout(timer);
    }, []);

    // Function to handle the message from injected.js
    const handleConditionResult = (event) => {
        if (event.data && event.data.type === 'conditionResult') {
            const conditionResult = event.data.value;
            // Update the state with the condition result
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

    // Conditional rendering based on the condition result
    // const widgetComponent = conditionResult ? <ComponentA /> : <ComponentB />;

    // Render the widget component inside the widgetContainer
    // ReactDOM.render(widgetComponent, widgetContainer);

    return (
        <>
            {showFirstSVG ? (
                <OptimisedBy></OptimisedBy>
            ) : (
                <>
                    {conditionResult === 'initial' && <Selector></Selector>}
                    <Approval></Approval>
                    <Swapping></Swapping>

                    {conditionResult === 'approvalRequested' && (
                        <Approval></Approval>
                    )}
                    {conditionResult === 'swapInitiated' && (
                        <Swapping></Swapping>
                    )}
                </>
            )}
        </>
    );
};

export default MyComponent;
