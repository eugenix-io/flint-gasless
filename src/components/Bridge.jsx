import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

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
`;

const CoinSelectorContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding-left: 2%;
    margin-top: 5%;
`;

const CoinSelectorHeading = styled.div`
    font-size: 0.9rem;
    color: #bdbdbd;
    font-family: GilmerMedium;
`;

const CoinSelectorInputContainer = styled.div`
    background-color: #121212;
    padding-top: 2%;
    padding-bottom: 2%;
    border-radius: 50px;
    border: 1px solid rgb(54 53 53);
    padding-left: 5%;
    margin-top: 2%;
    display: flex;
    flex-direction: row;
`;

const CoinSelectorInputContainerAmount = styled.input`
    width: 70%;
    outline: none;
    background-color: transparent;
    color: white;
    font-family: GilmerHeavy;
    font-size: 1.3rem;
    border: 0;
`;

const CoinSelectorInputContainerCoin = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const CoinImage = styled.img``;

const CoinSelector = () => {
    return (
        <CoinSelectorContainer>
            <CoinSelectorHeading>From:</CoinSelectorHeading>
            <CoinSelectorInputContainer>
                <CoinSelectorInputContainerAmount></CoinSelectorInputContainerAmount>
                <CoinSelectorInputContainerCoin>
                    <CoinImage src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pngwing.com%2Fen%2Fsearch%3Fq%3Dethereum&psig=AOvVaw0UquGxvOewNvDA7Bz0KnH-&ust=1678978770029000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCMiNlLuZ3v0CFQAAAAAdAAAAABAD"></CoinImage>
                </CoinSelectorInputContainerCoin>
            </CoinSelectorInputContainer>
        </CoinSelectorContainer>
    );
};

const Bridge = ({ wallet }) => {
    return (
        <BridgeContainer>
            <WalletAddress>{wallet.address}</WalletAddress>
            <CoinSelector></CoinSelector>
        </BridgeContainer>
    );
};

export default Bridge;
