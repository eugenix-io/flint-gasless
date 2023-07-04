import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Lottie from 'react-lottie-player';
import lottieLoader from '../../assets/Loader.json';
import lottieSuccess from '../../assets/Success.json';

const Container = styled.div`
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: space-between;
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
`;

const Extra3 = styled.div`
    position: fixed;
    width: 90%;
    height: 70%;
`;
const Content3 = styled.div`
    position: absolute;
    width: 223px;
    height: 77.5px;
    top: 60%;
    left: 39px;
    gap: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const Heading3 = styled.div`
    color: rgba(242, 242, 242, 1);
    width: 159px;
    height: 19px;
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
    width: 100%;
    height: 46px;
    font-weight: 400;
    font-size: 15px;
    line-height: 22.5px;
    letter-spacing: 0.4px;
    top: 20%;
    justify-content: center;
`;

const Sign = styled.div`
    width: 210.58px;
    height: 82.62px;
    top: -104px;
    left: 3861px;
    padding: 21.309999465942383px 62.290000915527344px 21.309999465942383px
        62.290000915527344px;
    border-radius: 20px;
    background: #1eea94;
`;

const ButtonHeading = styled.div`
    position: fixed;
    margin-left: -28%;

    width: 100%;
    height: 40px;
    font-family: Gilmer;
    font-size: 15px;
    font-weight: 700;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: center;
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
                        style={{ width: '60%' }}
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
