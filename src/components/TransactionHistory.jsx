import axios from 'axios';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getSignificantDigits } from '../utils/commonFunctions.js';
import { getNetworkFromChainId } from '../utils/FaucetTokenUtils.js';
import { getWalletAddress } from '../utils/StorageUtils.js';
import BoxContainer from './BoxContainer.jsx';
import SlidingContainer from './SlidingContainer.jsx';

const Heading = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    line-height: 23px;
    color: #f5f5f5;
`;
const Container = styled.div`
    padding: 25px;
    min-height: 500px;
`;

const DateHeader = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    letter-spacing: 0.2px;
    color: #bdbdbd;
    margin: 20px 0 10px 0;
`;

const InfoBox = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
`;
const NetworkImage = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 20px;
`;

const CoinAmountBlock = styled.div`
    flex: 1;
    padding: 0 10px;
`;

const CoinHeading = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    letter-spacing: 0.2px;
    color: #bdbdbd;
    text-align: ${(props) => (props.right ? 'right' : 'left')};
`;

const CoinAmount = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 24px;
    text-align: right;
    letter-spacing: 0.2px;
    color: #f5f5f5;
    text-align: ${(props) => (props.right ? 'right' : 'left')};
`;

const ViewMoreBlock = styled.div`
    background: #112713;
    border-radius: 25px;
    padding: 5px 12px;
    color: #9dffa2;
    font-weight: 600;
    margin-top: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;
`;

const BlockExplorerLink = styled.div`
    font-family: 'Gilmer';
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
    color: #6de573;
    cursor: pointer;
`;

const TransactionBlock = ({ transaction, showDate }) => {
    const [open, setOpen] = useState(false);
    const trData = transaction.metadata.transaction;
    const inputNetwork = getNetworkFromChainId(transaction.inputChainId);
    const outputNetwork = getNetworkFromChainId(transaction.outputChainId);

    const inputBigAmount = ethers.toBigInt(transaction.inputAmount);
    const outputBigAmount = ethers.toBigInt(transaction.outputAmount);

    const inputInEth = ethers.formatEther(inputBigAmount);
    const outputInEth = ethers.formatEther(outputBigAmount);

    return (
        <>
            {showDate ? (
                <DateHeader>
                    {new Date(Number(trData.timeStamp) * 1000).toDateString()}
                </DateHeader>
            ) : (
                <br />
            )}
            <BoxContainer style={{ alignItems: 'flex-start' }}>
                <InfoBox>
                    <NetworkImage src={inputNetwork.image} />
                    <CoinAmountBlock>
                        <CoinHeading>From</CoinHeading>
                        <CoinAmount>
                            {getSignificantDigits(inputInEth)}{' '}
                            {inputNetwork.tokenSymbol}
                        </CoinAmount>
                    </CoinAmountBlock>
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M7.73571 6.85312C7.72146 6.80587 7.71246 6.75712 7.69371 6.71212C7.64271 6.58987 7.61346 6.56887 7.53096 6.46837L1.52721 0.464621C1.48896 0.433871 1.45371 0.398622 1.41321 0.371622C1.08696 0.153372 0.594211 0.247122 0.372211 0.578622C0.207961 0.824622 0.207961 1.16662 0.372211 1.41262C0.399211 1.45312 0.434461 1.48837 0.465961 1.52587L5.93871 6.99937L0.465961 12.4721L0.372211 12.5861C0.348961 12.6289 0.321961 12.6701 0.303211 12.7159C0.171211 13.0331 0.288211 13.4321 0.579211 13.6271C0.825211 13.7914 1.16721 13.7914 1.41321 13.6271C1.45371 13.5994 1.48896 13.5649 1.52721 13.5334L7.53096 7.52962C7.56171 7.49212 7.59696 7.45687 7.62396 7.41637C7.67871 7.33387 7.71696 7.24237 7.73571 7.14562C7.75521 7.04962 7.74546 6.95062 7.73571 6.85312ZM13.7395 6.85312C13.7252 6.80587 13.7155 6.75712 13.6967 6.71212C13.6465 6.58987 13.6165 6.56887 13.5347 6.46837L7.53096 0.464621C7.49271 0.433871 7.45746 0.398622 7.41696 0.371622C7.13121 0.180372 6.71721 0.217121 6.46971 0.464621C6.22596 0.708371 6.18396 1.12462 6.37596 1.41262C6.40296 1.45312 6.43821 1.48837 6.46971 1.52587L11.9425 6.99937L6.46971 12.4721L6.37596 12.5861C6.35271 12.6289 6.32571 12.6701 6.30696 12.7159C6.17496 13.0339 6.29571 13.4351 6.58296 13.6271C6.82896 13.7914 7.17096 13.7914 7.41696 13.6271C7.45746 13.5994 7.49271 13.5649 7.53096 13.5334L13.5347 7.52962C13.5655 7.49212 13.6007 7.45687 13.6277 7.41637C13.6825 7.33387 13.7207 7.24237 13.7395 7.14562C13.759 7.04962 13.7492 6.95062 13.7395 6.85312Z"
                            fill="#DBDBDB"
                        />
                    </svg>

                    <CoinAmountBlock>
                        <CoinHeading right>To</CoinHeading>
                        <CoinAmount right>
                            {getSignificantDigits(outputInEth)}{' '}
                            {outputNetwork.tokenSymbol}
                        </CoinAmount>
                    </CoinAmountBlock>
                    <NetworkImage src={outputNetwork.image} />
                </InfoBox>
                <ViewMoreBlock onClick={() => setOpen(!open)}>
                    View more{' '}
                    <svg
                        width="6"
                        height="10"
                        viewBox="0 0 6 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            marginTop: '2px',
                            marginLeft: '8px',
                            transition: 'transform 0.2s',
                            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                    >
                        <path
                            d="M1.75003 9.16681C1.64036 9.16745 1.53164 9.14642 1.43011 9.10495C1.32858 9.06348 1.23623 9.00238 1.15836 8.92514C1.08026 8.84767 1.01826 8.75551 0.975955 8.65396C0.933647 8.55241 0.911865 8.44349 0.911865 8.33348C0.911865 8.22347 0.933647 8.11455 0.975955 8.013C1.01826 7.91145 1.08026 7.81928 1.15836 7.74181L3.9167 5.00014L1.2667 2.24181C1.11149 2.08568 1.02437 1.87447 1.02437 1.65431C1.02437 1.43416 1.11149 1.22295 1.2667 1.06681C1.34417 0.988704 1.43633 0.926709 1.53788 0.884401C1.63943 0.842094 1.74835 0.820312 1.85836 0.820312C1.96837 0.820312 2.0773 0.842094 2.17884 0.884401C2.28039 0.926709 2.37256 0.988704 2.45003 1.06681L5.6667 4.40014C5.81939 4.55592 5.90491 4.76535 5.90491 4.98348C5.90491 5.2016 5.81939 5.41104 5.6667 5.56681L2.33336 8.90014C2.25857 8.98092 2.1685 9.04608 2.06838 9.09185C1.96826 9.13762 1.86006 9.1631 1.75003 9.16681Z"
                            fill="#9dffa2"
                        ></path>
                    </svg>
                </ViewMoreBlock>
                <SlidingContainer height={'150px'} open={open}>
                    <br />
                    <CoinHeading>Scan links:</CoinHeading>
                    <br />
                    <CoinAmount>Receiving chain transaction</CoinAmount>
                    <BlockExplorerLink
                        onClick={() => {
                            window.open(
                                `${inputNetwork.expolrerDomain}/${transaction.inputHash}`
                            );
                        }}
                    >
                        {`(View on ${inputNetwork.explorerName})`}{' '}
                        <svg
                            width="6"
                            height="10"
                            viewBox="0 0 6 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                                marginTop: '5px',
                                marginLeft: '8px',
                                transform: 'rotate(-45deg)',
                            }}
                        >
                            <path
                                d="M1.75003 9.16681C1.64036 9.16745 1.53164 9.14642 1.43011 9.10495C1.32858 9.06348 1.23623 9.00238 1.15836 8.92514C1.08026 8.84767 1.01826 8.75551 0.975955 8.65396C0.933647 8.55241 0.911865 8.44349 0.911865 8.33348C0.911865 8.22347 0.933647 8.11455 0.975955 8.013C1.01826 7.91145 1.08026 7.81928 1.15836 7.74181L3.9167 5.00014L1.2667 2.24181C1.11149 2.08568 1.02437 1.87447 1.02437 1.65431C1.02437 1.43416 1.11149 1.22295 1.2667 1.06681C1.34417 0.988704 1.43633 0.926709 1.53788 0.884401C1.63943 0.842094 1.74835 0.820312 1.85836 0.820312C1.96837 0.820312 2.0773 0.842094 2.17884 0.884401C2.28039 0.926709 2.37256 0.988704 2.45003 1.06681L5.6667 4.40014C5.81939 4.55592 5.90491 4.76535 5.90491 4.98348C5.90491 5.2016 5.81939 5.41104 5.6667 5.56681L2.33336 8.90014C2.25857 8.98092 2.1685 9.04608 2.06838 9.09185C1.96826 9.13762 1.86006 9.1631 1.75003 9.16681Z"
                                fill="#9dffa2"
                            ></path>
                        </svg>
                    </BlockExplorerLink>
                    <br />
                    <br />
                    <CoinAmount>Bridging chain transaction</CoinAmount>
                    <BlockExplorerLink
                        onClick={() => {
                            window.open(
                                `${outputNetwork.expolrerDomain}/${transaction.outputHash}`
                            );
                        }}
                    >
                        {`(View on ${outputNetwork.explorerName})`}{' '}
                        <svg
                            width="6"
                            height="10"
                            viewBox="0 0 6 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                                marginTop: '5px',
                                marginLeft: '8px',
                                transform: 'rotate(-45deg)',
                            }}
                        >
                            <path
                                d="M1.75003 9.16681C1.64036 9.16745 1.53164 9.14642 1.43011 9.10495C1.32858 9.06348 1.23623 9.00238 1.15836 8.92514C1.08026 8.84767 1.01826 8.75551 0.975955 8.65396C0.933647 8.55241 0.911865 8.44349 0.911865 8.33348C0.911865 8.22347 0.933647 8.11455 0.975955 8.013C1.01826 7.91145 1.08026 7.81928 1.15836 7.74181L3.9167 5.00014L1.2667 2.24181C1.11149 2.08568 1.02437 1.87447 1.02437 1.65431C1.02437 1.43416 1.11149 1.22295 1.2667 1.06681C1.34417 0.988704 1.43633 0.926709 1.53788 0.884401C1.63943 0.842094 1.74835 0.820312 1.85836 0.820312C1.96837 0.820312 2.0773 0.842094 2.17884 0.884401C2.28039 0.926709 2.37256 0.988704 2.45003 1.06681L5.6667 4.40014C5.81939 4.55592 5.90491 4.76535 5.90491 4.98348C5.90491 5.2016 5.81939 5.41104 5.6667 5.56681L2.33336 8.90014C2.25857 8.98092 2.1685 9.04608 2.06838 9.09185C1.96826 9.13762 1.86006 9.1631 1.75003 9.16681Z"
                                fill="#9dffa2"
                            ></path>
                        </svg>
                    </BlockExplorerLink>
                </SlidingContainer>
            </BoxContainer>
        </>
    );
};

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const getTransaction = async () => {
            // TODO: replace hardcoded address with actual user wallet address
            const result = await axios.get(
                `${
                    process.env.REACT_APP_BASE_URL
                }/faucet/v1/bridge/transactions?address=${getWalletAddress()}&offset=20&page=0`
            );
            setTransactions(result.data);
        };
        getTransaction();
    }, []);

    return (
        <Container>
            <Heading>History</Heading>
            {transactions.map((tr, index) => {
                let showDate = true;
                if (index > 0) {
                    const t1 = transactions[index - 1].createdAt;
                    const t2 = transactions[index].createdAt;
                    const date1 = new Date(t1);
                    const date2 = new Date(t2);
                    const d1 = date1.getDay();
                    const m1 = date1.getMonth();
                    const y1 = date1.getFullYear();
                    const d2 = date2.getDay();
                    const m2 = date2.getMonth();
                    const y2 = date2.getFullYear();

                    if (d1 === d2 && m1 === m2 && y1 === y2) {
                        showDate = false;
                    }
                }
                return (
                    <TransactionBlock
                        transaction={tr}
                        key={index}
                        showDate={showDate}
                    />
                );
            })}
        </Container>
    );
};

export default TransactionHistory;
