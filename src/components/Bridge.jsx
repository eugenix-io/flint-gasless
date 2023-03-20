import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import GasInProgress from './GasInProgress.jsx';
import TransactionStatus from './TransactionStatus.jsx';
import DownArrow from '../assets/img/down_arrow.svg';
import TokenSelector from './TokenSelector.jsx';
import { ethers } from 'ethers';
import axios from 'axios';
import { data } from 'jquery';
import { useDebounce } from 'use-debounce';

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

const ErrorMessage = styled.div`
    font-size: 0.9rem;
    color: grey;
    margin-top: 2%;
    padding-left: 2%;
    text-align: center;
`;

const CoinSelector = ({
    heading,
    coinLogo,
    chainLogo,
    symbol,
    onTokenClick,
    onAmountChange,
    amount,
    inputDisabled,
}) => {
    return (
        <CoinSelectorContainer>
            <CoinSelectorHeading>{heading}</CoinSelectorHeading>
            <CoinSelectorInputContainer>
                <CoinSelectorInputContainerAmount
                    type="number"
                    placeholder="11.2"
                    onChange={(e) => onAmountChange(e.target.value)}
                    value={amount}
                    disabled={inputDisabled ? true : false}
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
    const [loadingGasScreen, setLoadingGasScreen] = useState(true);
    const [transactionProgressScreen, setTransactionProgressScreen] =
        useState(false);
    const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
    const [lastTokenSelector, setLastTokenSelector] = useState('');
    const [fromState, setFromState] = useState({
        token: 'ethereum',
        chain: 'ethereum',
    });
    const [toState, setToState] = useState({
        token: 'ethereum',
        chain: 'arbitrum',
    });
    const [errorMessage, setErrorMessage] = useState(false);
    const [amount, setAmount] = useState();
    const [debouncedAmount] = useDebounce(amount, 200);
    const [outputAmount, setOutputAmount] = useState();
    const [faucetTokens, setFaucetTokens] = useState({});

    const fromTokenClick = () => {
        setIsTokenSelectorOpen(true);
        setLastTokenSelector('from');
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

    const handleSubmit = () => {
        if (fromState.chain == toState.chain) {
            setErrorMessage('The from and to chain need to be different');
            return;
        } else if (!amount) {
            setErrorMessage('Input amount cannot be 0');
            return;
        }
        setErrorMessage('');

        let params = {
            inputChain: faucetTokens.chains[fromState.chain],
            outputChain: faucetTokens.chains[toState.chain],
            inputToken: faucetTokens.tokens[fromState.token],
            outputToken: faucetTokens.tokens[toState.token],
            inputAmount: amount,
            outputAmount: outputAmount,
        };
        window.open(
            `https://faucet.flint.money/?data=${encodeURI(
                JSON.stringify(params)
            )}`,
            '_blank'
        );
    };

    useEffect(() => {
        (async () => {
            let result = await axios.get(
                `${
                    process.env.REACT_APP_BASE_URL
                }/faucet/v1/bridge/output?inputChainId=${
                    faucetTokens.chains[fromState.chain].chainId
                }&outputChainId=${
                    faucetTokens.chains[toState.chain].chainId
                }&amount=${ethers.parseEther(amount)}`
            );
            setOutputAmount(result.data / 10 ** 18);
        })();
    }, [debouncedAmount, fromState, toState]);

    useEffect(() => {
        (async () => {
            let result = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/faucet/v1/bridge/config`
            );
            setFaucetTokens(result.data);
            console.log('this is config - ', result.data);
            setTimeout(() => {
                setLoadingGasScreen(false);
            }, 400);
        })();
    }, []);

    return (
        <BridgeContainer>
            {loadingGasScreen ? (
                <GasInProgress></GasInProgress>
            ) : transactionProgressScreen ? (
                <TransactionStatus></TransactionStatus>
            ) : (
                <>
                    {isTokenSelectorOpen ? (
                        <TokenSelector
                            onTokenSelect={onTokenSelect}
                            close={closeTokenSelector}
                            chain={
                                lastTokenSelector == 'from'
                                    ? fromState.chain
                                    : toState.chain
                            }
                            faucetTokens={faucetTokens}
                        ></TokenSelector>
                    ) : (
                        <>
                            <CoinSelector
                                heading="From:"
                                coinLogo={
                                    faucetTokens.tokens[fromState.token].image
                                }
                                chainLogo={
                                    faucetTokens.chains[fromState.chain].image
                                }
                                symbol={
                                    faucetTokens.tokens[fromState.token].symbol
                                }
                                onTokenClick={fromTokenClick}
                                onAmountChange={(value) => {
                                    setAmount(value);
                                }}
                                amount={amount}
                            ></CoinSelector>
                            <SwapArrow src={DownArrow}></SwapArrow>
                            <CoinSelector
                                heading="To:"
                                coinLogo={
                                    faucetTokens.tokens[toState.token].image
                                }
                                chainLogo={
                                    faucetTokens.chains[toState.chain].image
                                }
                                symbol={
                                    faucetTokens.tokens[toState.token].symbol
                                }
                                onTokenClick={toTokenClick}
                                amount={outputAmount}
                                inputDisabled={true}
                            ></CoinSelector>
                            <SubmitButton onClick={handleSubmit}>
                                Get Gas
                            </SubmitButton>
                            {errorMessage && (
                                <ErrorMessage>{errorMessage}</ErrorMessage>
                            )}
                        </>
                    )}
                </>
            )}
        </BridgeContainer>
    );
};

export default Bridge;
