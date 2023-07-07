import React, { useState } from 'react';
import styled from 'styled-components';

import Logo from './../../assets/Subtract.svg';
import Input from './../../assets/inputToken.svg';
import Selected from './../../assets/selected.svg';
import Unselected from './../../assets/unselected.svg';
import Polygon from './../../assets/polygon2.svg';

const Container = styled.div`
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    position: fixed;
    width: 415px;
    height: 209px;
    top: 75%;
    left: 85%;
    transform: translate(-50%, -50%);

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
    left: 25px;
`;

const Img = styled.div`
    padding: 20px;
    display: flex;
    align-items: center;
    height: 50%;
`;

const Line = styled.div`
    height: 1px;
    width: 100%;
    border: 1px solid rgb(58, 55, 55);
    /* margin-bottom: 20px; */
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    color: rgba(242, 242, 242, 1);
    width: 100%;
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
    height: 80%;
    padding: 14px 14px 13px 14px; /* Adjusted to fix the decimal padding values */
    border-radius: 10px;
    gap: 11.777777671813965px;
    background: ${(props) =>
        props.active ? '#4a4a4a' : 'rgba(33, 33, 33, 1)'};
    margin-right: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;
    justify-content: space-between;
    img {
        /* Add any styles for images if needed */
    }
`;

const RadioButton = styled.input`
    display: none;
`;
export const Selector = () => {
    const [selectedToken, setSelectedToken] = useState('tokenIn');

    const handleTokenChange = (token) => {
        console.log('token change', token);
        setSelectedToken(token);
        window.postMessage(
            { type: 'selectedTokenToPayFee', value: token },
            '*'
        );
    };

    return (
        <div>
            <Container>
                <Heading>Choose token for gas fees:</Heading>
                <Img>
                    <Button active={selectedToken === 'tokenIn'}>
                        <RadioButton
                            type="radio"
                            name="token"
                            value="tokenIn"
                            checked={selectedToken === 'tokenIn'}
                            onChange={() => handleTokenChange('tokenIn')}
                        />
                        <img src={Input} alt="Input Token" />
                        <p style={{ marginLeft: '-15%' }}>INPUT</p>
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
                        <img width={'25px'} src={Polygon} alt="MATIC Token" />
                        <p style={{ marginLeft: '-15%' }}>MATIC</p>
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
        </div>
    );
};
