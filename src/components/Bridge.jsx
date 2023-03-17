import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import DownArrow from '../assets/img/down_arrow.svg';
import TokenSelector from './TokenSelector.jsx';
import faucetTokens from '../config/faucetTokens.json';

const BridgeContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const WalletAddress = styled.div`
    background-color: #121212;
    color: white;
    border-radius: 50px;
    padding-top: 3%;
    padding-bottom: 3%;
    text-align: center;
    font-family: GilmerHeavy;
    font-size: 0.9rem;
    border: 1px solid rgb(54 53 53);
    margin-bottom: 5%;
`;

const CoinSelectorContainer = styled.div`
    display: flex;
    flex-direction: column;
    cursor: pointer;
`;

const CoinSelectorHeading = styled.div`
    font-size: 0.9rem;
    color: #bdbdbd;
    font-family: GilmerMedium;
`;

const CoinSelectorInputContainer = styled.div`
    background-color: #121212;
    padding-top: 3%;
    padding-bottom: 3%;
    border-radius: 15px;
    border: 1px solid rgb(54 53 53);
    padding-left: 5%;
    margin-top: 2%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const CoinSelectorInputContainerAmount = styled.input`
    width: 100%;
    padding-right: 5%;
    outline: none;
    background-color: transparent;
    color: white;
    font-family: GilmerHeavy;
    font-size: 1.3rem;
    border: 0;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        margin: 0;
    }
`;

const CoinSelectorInputContainerCoin = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-right: 4%;
`;

const CoinName = styled.div`
    color: white;
    font-family: GilmerMedium;
    margin-right: 10px;
    font-size: 1.2rem;
`;

const CoinAndChainImageContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
`;

const CoinImage = styled.img`
    height: 40px;
    background-color: white;
    border-radius: 50px;
`;

const ChainImage = styled.img`
    height: 17px;
    position: absolute;
    border: 1px solid black;
    bottom: 0;
    left: -15%;
    background-color: white;
    border-radius: 50px;
    border: 1px solid black;
    bottom: -15%;
`;

const SwapArrow = styled.img`
    height: 25px;
    margin-top: 15px;
`;

const SubmitButton = styled.div`
    width: 100%;
    border-radius: 50px;
    background-color: #6de573;
    color: black;
    font-family: GilmerMedium;
    margin: auto;
    text-align: center;
    padding-top: 4%;
    padding-bottom: 4%;
    font-size: 1.3rem;
    margin-top: 8%;
    cursor: pointer;
`;

const CoinSelector = ({
    heading,
    coinLogo,
    chainLogo,
    symbol,
    onTokenClick,
}) => {
    return (
        <CoinSelectorContainer>
            <CoinSelectorHeading>{heading}</CoinSelectorHeading>
            <CoinSelectorInputContainer>
                <CoinSelectorInputContainerAmount
                    type="number"
                    placeholder="11.2"
                ></CoinSelectorInputContainerAmount>
                <CoinSelectorInputContainerCoin onClick={onTokenClick}>
                    <CoinName>{symbol}</CoinName>
                    <CoinAndChainImageContainer>
                        <CoinImage src={coinLogo}></CoinImage>
                        <ChainImage src={chainLogo}></ChainImage>
                    </CoinAndChainImageContainer>
                </CoinSelectorInputContainerCoin>
            </CoinSelectorInputContainer>
        </CoinSelectorContainer>
    );
};

const Bridge = ({ wallet }) => {
    const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
    const [lastTokenSelector, setLastTokenSelector] = useState('');
    const [fromState, setFromState] = useState({
        token: 'ethereum',
        chain: 'ethereum',
    });
    const [toState, setToState] = useState({
        token: 'ethereum',
        chain: 'ethereum',
    });

    const fromTokenClick = () => {
        setLastTokenSelector('from');
        setIsTokenSelectorOpen(true);
    };

    const toTokenClick = () => {
        setLastTokenSelector('to');
        setIsTokenSelectorOpen(true);
    };

    const closeTokenSelector = () => {
        setIsTokenSelectorOpen(false);
    };

    const onTokenSelect = (state) => {
        switch (lastTokenSelector) {
            case 'from':
                setFromState(state);
                break;
            case 'to':
                setToState(state);
                break;
        }
        closeTokenSelector();
    };

    return (
        <BridgeContainer>
            {/* <WalletAddress>{wallet.address}</WalletAddress> */}
            {isTokenSelectorOpen ? (
                <TokenSelector
                    onTokenSelect={onTokenSelect}
                    close={closeTokenSelector}
                    chain={
                        lastTokenSelector == 'from'
                            ? fromState.chain
                            : toState.chain
                    }
                ></TokenSelector>
            ) : (
                <>
                    <CoinSelector
                        heading="From:"
                        coinLogo={faucetTokens.tokens[fromState.token].image}
                        chainLogo={faucetTokens.chains[fromState.chain].image}
                        symbol={faucetTokens.tokens[fromState.token].symbol}
                        onTokenClick={fromTokenClick}
                    ></CoinSelector>
                    <SwapArrow src={DownArrow}></SwapArrow>
                    <CoinSelector
                        heading="To:"
                        coinLogo={faucetTokens.tokens[toState.token].image}
                        chainLogo={faucetTokens.chains[toState.chain].image}
                        symbol={faucetTokens.tokens[toState.token].symbol}
                        onTokenClick={toTokenClick}
                    ></CoinSelector>
                    <SubmitButton>Get Gas</SubmitButton>
                </>
            )}
        </BridgeContainer>
    );
};

export default Bridge;
