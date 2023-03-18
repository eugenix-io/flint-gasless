import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import crossLogo from '../assets/img/cross.png';

const TokenSelectorContainer = styled.div`
    background-color: #121212;
    padding: 4%;
    border-radius: 10px;
    border: 1px solid #1c1c1c;
    position: relative;
`;

const Heading = styled.div`
    color: white;
    font-family: GilmerMedium;
    font-size: 1.1rem;
`;

const ChainSelectorContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 2%;
    justify-content: space-between;
    padding-right: 10%;
`;

const Chain = styled.div`
    background-color: ${(props) => (props.selected ? '#6DE573' : '#1c1c1c')};
    padding-top: 2%;
    padding-bottom: 2%;
    padding-left: 4%;
    padding-right: 4%;
    border-radius: 50px;
    margin-bottom: 2%;
    color: ${(props) => (props.selected ? 'black' : 'white')};

    &:hover {
        background-color: ${(props) =>
            props.selected ? '#6DE573' : '#3e3e3e'};
    }
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

const ChainImage = styled.img`
    width: 20px;
    background-color: white;
    border-radius: 50px;
`;

const ChainName = styled.div`
    font-size: 1rem;
    margin-left: 5px;
`;

const TokeRow = styled.div`
    display: flex;
    flex-direction: row;
    color: ${(props) => (props.live ? 'white' : 'grey')};
    border-radius: 15px;
    padding: 2%;
    margin-top: 2%;
    align-items: center;
    cursor: pointer;
    &:hover {
        background-color: #3e3e3e;
    }

    ${(props) => {
        if (!props.live) {
            return css`
                pointer-events: none;
            `;
        }
    }}
`;

const TokenImage = styled.img`
    width: 40px;
    background-color: white;
    border-radius: 50px;
`;

const TokenName = styled.div`
    font-size: 1.1rem;
    margin-left: 4%;
    font-family: GilmerMedium;
`;

const TokenComingSoon = styled.div`
    font-size: 0.9rem;
    margin-left: 4%;
    font-family: GilmerMedium;
    color: grey;
    margin-left: auto;
`;

const CloseButton = styled.img`
    position: absolute;
    top: 3%;
    right: 3%;
    width: 12px;
    cursor: pointer;
`;

const TokenSelector = ({ close, onTokenSelect, chain, faucetTokens }) => {
    const [selectedChain, setSelectedChain] = useState(chain);
    return (
        <TokenSelectorContainer>
            <CloseButton onClick={close} src={crossLogo}></CloseButton>
            <Heading>Select chain</Heading>
            <ChainSelectorContainer>
                {Object.entries(faucetTokens.chains).map(
                    ([key, chain], index) => (
                        <Chain
                            onClick={() => setSelectedChain(key)}
                            selected={selectedChain == key}
                        >
                            <ChainImage src={chain.image}></ChainImage>
                            <ChainName>{chain.name}</ChainName>
                        </Chain>
                    )
                )}
            </ChainSelectorContainer>
            <Heading style={{ marginTop: '4%' }}>Select token</Heading>
            {Object.entries(faucetTokens.tokens)
                .filter(([key, token]) =>
                    token.chainIds.includes(
                        faucetTokens.chains[selectedChain].chainId
                    )
                )
                .map(([key, token], index) => (
                    <TokeRow
                        onClick={() => {
                            onTokenSelect({ chain: selectedChain, token: key });
                        }}
                        live={token.live}
                    >
                        <TokenImage src={token.image}></TokenImage>
                        <TokenName>{token.symbol}</TokenName>
                        {!token.live && (
                            <TokenComingSoon>Coming soon</TokenComingSoon>
                        )}
                    </TokeRow>
                ))}
        </TokenSelectorContainer>
    );
};

export default TokenSelector;
