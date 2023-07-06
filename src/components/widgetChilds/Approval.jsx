import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Lottie from 'react-lottie-player';
import lottieLoader from '../../assets/Loader.json';
import lottieSuccess from '../../assets/Success.json';

const Container = styled.div`
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18%;
    height: 45%;
    top: 67%;
    left: 88%;
    transform: translate(-50%, -50%);
    padding: 21px 38px 35.5px 39px;
    border-radius: 21.880342483520508px;
    border: 4px;
    border: 4px solid rgba(40, 40, 40, 1);
    background: linear-gradient(0deg, #0c0c0c, #0c0c0c),
        linear-gradient(0deg, #282828, #282828);
    flex-direction: column;
    justify-content: space-evenly;
`;

const Extra3 = styled.div`
    display: flex;
    width: 100%;
    height: 70%;
`;
const Content3 = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Heading3 = styled.div`
    color: rgba(242, 242, 242, 1);
    font-weight: 400;
    font-size: 16px;
    line-height: 19.36px;
    letter-spacing: 0.4px;
`;

const Heading23 = styled.div`
    display: flex;
    color: rgba(255, 255, 255, 1);
    position: relative;
    color: gray;
    font-weight: 400;
    line-height: 22.5px;
    letter-spacing: 0.4px;
    justify-content: center;
`;

const ButtonHeading = styled.div`
    position: relative;

    font-family: Gilmer;
    font-weight: 700;
`;

export const Approval = () => {
    const [conditionResult, setConditionResult] = useState(false);

    const handleConditionResult = (event) => {
        if (event.data && event.data.type === 'conditionResultApproval') {
            const conditionResult = event.data.value;
            // Update the state with the condition result
            console.log('meassage received to handle ui', conditionResult);
            setConditionResult(conditionResult);
        }
    };
    useEffect(() => {
        // Add a listener to receive messages from the injected.js script
        window.addEventListener('messageApproval', handleConditionResult);

        // Clean up the listener when the component unmounts
        return () => {
            window.removeEventListener(
                'messageApproval',
                handleConditionResult
            );
        };
    }, []);

    return (
        <div>
            <Container>
                <Extra3>
                    <Lottie
                        loop
                        animationData={
                            conditionResult ? lottieSuccess : lottieLoader
                        }
                        play
                        // style={{ width: '60%' }}
                    />
                </Extra3>
                <Content3>
                    <Heading3>
                        <ButtonHeading>
                            {conditionResult === false ? (
                                <p>Approval Pending</p>
                            ) : (
                                // <p>Approval Successful</p>
                                ''
                            )}
                        </ButtonHeading>
                    </Heading3>
                    <Heading23>
                        {conditionResult === false ? (
                            <p>Approve Gaspay to spend fund on your behalf!</p>
                        ) : (
                            ''
                        )}
                    </Heading23>
                </Content3>
            </Container>
        </div>
    );
};
