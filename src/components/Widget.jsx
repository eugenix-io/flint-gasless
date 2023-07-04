// MyComponent.js
import React, { useEffect, useState } from 'react';
import SelectorFee from './SelectorFee.jsx';
import { OptimisedBy } from './widgetChilds/OptimisedBy.jsx';
import styled from 'styled-components';
import Logo from './../assets/Subtract.svg';
import Input from './../assets/inputToken.svg';
import Selected from './../assets/selected.svg';
import Unselected from './../assets/unselected.svg';
import Polygon from './../assets/polygon2.svg';

const Container = styled.div`
    position: fixed;
    width: 415px;
    height: 209px;
    top: 613px;
    left: 1333px;
    border-radius: 21.880342483520508px;
    border: 4px solid rgba(40, 40, 40, 1);
    background: linear-gradient(0deg, #0c0c0c, #0c0c0c),
        linear-gradient(0deg, #282828, #282828);
`;

const Heading = styled.div`
    color: rgba(255, 255, 255, 1);
    font-weight: 400;
    font-size: 16px;
    line-height: 19.36px;
    position: relative;
    width: 213px;
    height: 19px;
    top: 25px;
    left: 25px;
`;

const Img = styled.div`
    padding: 20px;
    display: flex;
    align-items: center;
    margin-top: 20px;
`;

const Line = styled.div`
    /* height: 1px; */
    /* width: 100%; */
    border: 1px solid rgb(58, 55, 55);
    /* margin-bottom: 20px; */
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    color: rgba(242, 242, 242, 1);
    width: 304px;
    height: 20px;
    font-weight: 400;
    font-size: 14px;
    line-height: 19.1px;
    gap: 10px;
    margin-left: 30px;
    padding-top: 20px;
`;

const Button = styled.label`
    display: inline-block;
    position: relative;
    color: rgba(242, 242, 242, 1);
    width: 170px;
    height: 30px;
    padding: 14px 14px 13px 14px; /* Adjusted to fix the decimal padding values */
    border-radius: 10px;
    gap: 11.777777671813965px;
    background: ${(props) =>
        props.active ? '#4a4a4a' : 'rgba(33, 33, 33, 1)'};
    margin-right: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;

    img {
        /* Add any styles for images if needed */
    }
`;

const RadioButton = styled.input`
    display: none;
`;

const MyComponent = () => {
    const [showFirstSVG, setShowFirstSVG] = useState(true);
    const [conditionResult, setConditionResult] = useState('');
    const [selectedToken, setSelectedToken] = useState('tokenIn');

    const handleTokenChange = (token) => {
        console.log('token change', token);
        setSelectedToken(token);
        window.postMessage(
            { type: 'selectedTokenToPayFee', value: token },
            '*'
        );
    };
    
    // Function to handle the message from injected.js
    const handleConditionResult = (event) => {
        if (event.data && event.data.type === 'conditionResult') {
            const conditionResult = event.data.value;
            // Update the state with the condition result
            console.log('meassage received', conditionResult);
            setConditionResult(conditionResult);
        }
    };

    useEffect(() => {
        // After 2 seconds, switch to the second SVG
        const timer = setTimeout(() => {
            setShowFirstSVG(false);
        }, 2000);

        // Clear the timer when the component unmounts
        return () => clearTimeout(timer);
    }, []);

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
                    <Container>
                        <Heading>Choose token for gas fees:</Heading>
                        <Img>
                            <Button active={selectedToken === 'tokenIn'}>
                                <RadioButton
                                    type="radio"
                                    name="token"
                                    value="tokenIn"
                                    checked={selectedToken === 'tokenIn'}
                                    onChange={() =>
                                        handleTokenChange('tokenIn')
                                    }
                                />
                                <img src={Input} alt="Input Token" />
                                INPUT
                                <img
                                    src={
                                        selectedToken === 'tokenIn'
                                            ? Selected
                                            : Unselected
                                    }
                                    alt="Selection Indicator"
                                />
                            </Button>
                            <Button active={selectedToken === 'native'}>
                                <RadioButton
                                    type="radio"
                                    name="token"
                                    value="native"
                                    checked={selectedToken === 'native'}
                                    onChange={() => handleTokenChange('native')}
                                />
                                <img
                                    width={'25px'}
                                    src={Polygon}
                                    alt="MATIC Token"
                                />
                                MATIC
                                <img
                                    src={
                                        selectedToken === 'native'
                                            ? Selected
                                            : Unselected
                                    }
                                    alt="Selection Indicator"
                                />
                            </Button>
                        </Img>
                        <Line></Line>
                        <Footer>
                            <img src={Logo}></img>
                            <p>You can either select input or chain token.</p>
                        </Footer>
                    </Container>
                    {/* <div style={selectorScreen}>
                        {/* <div style={typographyStyle}>Choose token for gas fees:</div> */}
                    {/* <SelectorFee></SelectorFee> */}
                    <div>
                        {/* <label>
                                Input Token
                                <input
                                    type="checkbox"
                                    value="tokenIn"
                                    checked={
                                        selectedTokenToPayFee === 'tokenIn'
                                    }
                                    onChange={handleTokenToPayFeeChange}
                                />
                            </label>
                            <label>
                                Native
                                <input
                                    type="checkbox"
                                    value="native"
                                    checked={selectedTokenToPayFee === 'native'}
                                    onChange={handleTokenToPayFeeChange}
                                />
                            </label> */}
                        <div className="heading">
                            Choose token for gas fees:
                        </div>
                        <div className="img">
                            <label
                                className={`btn ${
                                    selectedToken === 'input' ? 'active' : ''
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="token"
                                    value="input"
                                    checked={selectedToken === 'input'}
                                    onChange={() => handleTokenChange('input')}
                                />
                                <img src="./img/inputToken.png"></img>
                                INPUT
                                <img
                                    src={
                                        selectedToken === 'input'
                                            ? './img/selected.png'
                                            : './img/unselected.png'
                                    }
                                ></img>
                            </label>
                            <label
                                className={`btn ${
                                    selectedToken === 'matic' ? 'active' : ''
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="token"
                                    value="matic"
                                    checked={selectedToken === 'matic'}
                                    onChange={() => handleTokenChange('matic')}
                                />
                                <img src="./img/matic.png"></img>
                                MATIC
                                <img
                                    src={
                                        selectedToken === 'matic'
                                            ? './img/selected.png'
                                            : './img/unselected.png'
                                    }
                                ></img>
                            </label>
                        </div>
                        <div className="line"></div>
                        <div className="footer">
                            <img src="./img/gaspay.png"></img>
                            <p>You can either select input or chain token.</p>
                        </div>
                    </div>
                    {/* </div> */}
                </>
            )}
        </>
    );
};

export default MyComponent;
