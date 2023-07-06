import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Lottie from 'react-lottie-player';
import lottieLoader from '../../assets/Loader.json';
import lottieSuccess from '../../assets/Success.json';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: fixed;
    width: 23%;
    height: 27%;
    top: 56%;
    left: 76%;
    padding: 34px 27px 37.5px 26px;
    border-radius: 20px;
    border: 4px;
    background: linear-gradient(0deg, #0c0c0c, #0c0c0c),
        linear-gradient(0deg, #282828, #282828);
    border: 4px solid #282828;
`;

const Rectangle = styled.div`
    width: 100%;
`;

const Content4 = styled.div`
    display: flex;
    width: 100%;
    height: 36%;
    flex-direction: column;
    align-items: baseline;
    justify-content: center;
`;

const Heading4 = styled.div`
    display: flex;
    width: 100%;
    height: 45%;
    font-weight: 400;
    font-size: 16px;
    line-height: 19.36px;
    letter-spacing: 0.4px;
    color: rgb(242, 242, 242);
    justify-content: center;
    align-items: center;
`;

const Heading24 = styled.div`
    width: 100%;
    height: 75%;
    color: gray;
    font-weight: 400;
    font-size: 15px;
    line-height: 22.5px;
    letter-spacing: 0.4px;
    display: flex;
    justify-content: center;
    align-items: baseline;
`;

const Sign = styled.div`
    display: flex;
    position: relative;
    top: -25%;
    width: 100%;
    height: 85%;
    border-radius: 10px;
    background: #1eea94;
    align-items: center;
    justify-content: center;
`;

export const Swapping = () => {
    const [conditionResult, setConditionResult] = useState(null);

    const handleConditionResult = (event) => {
        if (event.data && event.data.type === 'conditionResultSwaping') {
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

    return (
        <>
            <Container>
                {/* <Animate4></Animate4> */}
                <Rectangle>
                    {conditionResult === null ? (
                        <Sign>
                            <p style={{ color: 'black', fontWeight: '400' }}>
                                Sign Your Transaction!
                            </p>
                        </Sign>
                    ) : (
                        <Lottie
                            loop
                            animationData={
                                conditionResult === 'swapping'
                                    ? lottieLoader
                                    : lottieSuccess
                            }
                            play
                            style={{ width: '50%', marginLeft: '25%' }}
                        />
                    )}
                </Rectangle>
                <Content4>
                    <Heading4>
                        {conditionResult === null && (
                            <p>Time to go gasless now!</p>
                        )}
                        {conditionResult != null &&
                            conditionResult != 'swapping' && (
                                <p>Transaction Successful</p>
                            )}
                    </Heading4>
                    <Heading24>
                        {conditionResult === null && (
                            <p>Sign the transaction and to go gasless!</p>
                        )}
                        {conditionResult != null &&
                            conditionResult != 'swapping' && (
                                <p>
                                    view transaction{' '}
                                    <a href={conditionResult}>here</a>
                                </p>
                            )}
                    </Heading24>
                </Content4>
            </Container>
        </>
    );
};
