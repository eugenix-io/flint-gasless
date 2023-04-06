import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import GasInProgress from './GasInProgress.jsx';
import DownArrow from '../assets/img/down_arrow.svg';
import TokenSelector from './TokenSelector.jsx';
import axios from 'axios';
import { useDebounce } from 'use-debounce';

const BridgeContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
`;

const CoinSelectorContainer = styled.div`
    display: flex;
    flex-direction: column;
    cursor: pointer;
`;

const CoinSelectorHeading = styled.div`
    font-size: 0.9rem;
    color: #bdbdbd;
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
    color: ${(props) => (props.small ? 'rgb(101,101,101)' : 'white')};
    margin-right: 10px;
    font-size: ${(props) => (props.small ? '0.9rem' : '1.2rem')};
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

const Col = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;
    margin-right: 10px;
`;

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const CoinSelector = ({
    heading,
    coinLogo,
    chainLogo,
    symbol,
    onTokenClick,
    onAmountChange,
    amount,
    inputDisabled,
    chain,
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
                    <Col>
                        <CoinName>{symbol}</CoinName>
                        <CoinName small>
                            {capitalizeFirstLetter(chain)}
                        </CoinName>
                    </Col>
                    <CoinAndChainImageContainer>
                        <CoinImage src={coinLogo}></CoinImage>
                        <ChainImage src={chainLogo}></ChainImage>
                    </CoinAndChainImageContainer>
                </CoinSelectorInputContainerCoin>
            </CoinSelectorInputContainer>
        </CoinSelectorContainer>
    );
};

const Bridge = () => {
    const [loadingGasScreen, setLoadingGasScreen] = useState(true);
    const [faucetTokens, setFaucetTokens] = useState({});
    const [chain, setChain] = useState();

    const handleSubmit = () => {
        window.open(`https://faucet.flint.money/?chain=${chain}`, '_blank');
    };

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
            {loadingGasScreen || faucetTokens?.chain?.length == 0 ? (
                <GasInProgress></GasInProgress>
            ) : (
                <>
                    <TokenSelector
                        onChainSelect={setChain}
                        faucetTokens={faucetTokens}
                    ></TokenSelector>

                    <SubmitButton onClick={handleSubmit}>Get Gas</SubmitButton>
                </>
            )}
        </BridgeContainer>
    );
};

export default Bridge;
