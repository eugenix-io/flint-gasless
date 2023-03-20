import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Logo from '../assets/gasly.svg';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: center;
    align-items: center;
`;

const LogoImage = styled.img`
    margin-bottom: 10%;
    margin-top: 10%;
`;

const Text = styled.div`
    color: white;
    font-size: 1.3rem;
    text-align: center;
    margin-bottom: 12%;

`;

const ConnectWalletButton = styled.div`
    color: black;
    font-size: 1rem;
    background-color: #6de573;
    width: 90%;
    margin: auto;

    border-radius: 50px;
    padding-top: 3%;
    padding-bottom: 3%;
    text-align: center;
`;

const ConnectWallet = () => {
    return (
        <Container>
            <LogoImage src={Logo} width="50px"></LogoImage>
            <Text>
                Send gas across chains<br></br> in one click
            </Text>
            <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
        </Container>
    );
};

export default ConnectWallet;
