import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import BoxContainer from './BoxContainer.jsx';

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
`;

const transactions = [
    {
        transactionId: '573a0dfd-a1c3-4656-8a46-6832290e7b15',
        address: '0x1fb8b18101194adb78e0737b7e15087d2296dc1a',
        inputChainId: 137,
        inputHash:
            '0x0b9fe6d4da0d94f3eef21ad6c0a3ce86415327c900e26eeddd07975e8fd21945',
        inputAmount: '200000000000000000',
        outputChainId: 43114,
        outputHash:
            '0xa4973bb8f28c9b7e185831ee807b22b5efe966adb0a44db4205c720ea02b6892',
        outputAmount: '14109146341463414',
        status: 'completed',
        metadata: {
            failReason:
                'cannot estimate gas; transaction may fail or may require manual gas limit [ See: https://links.ethers.org/v5-errors-UNPREDICTABLE_GAS_LIMIT ] (error={"reason":"invalid hex string","code":"INVALID_ARGUMENT","argument":"value","value":"-0x01dd7c1681d000"}, tx="[object Object]", code=UNPREDICTABLE_GAS_LIMIT, version=defender-relay-client)',
            transaction: {
                to: '0x660ac0f3f37835327444cc74686aeb9bc44b8319',
                gas: '21000',
                from: '0x1fb8b18101194adb78e0737b7e15087d2296dc1a',
                hash: '0x0b9fe6d4da0d94f3eef21ad6c0a3ce86415327c900e26eeddd07975e8fd21945',
                input: '0x',
                nonce: '96',
                value: '200000000000000000',
                gasUsed: '21000',
                isError: '0',
                gasPrice: '165423494067',
                methodId: '0x',
                blockHash:
                    '0x5f4fae7630fbec93f6911033be9d97668601ec25c8376da569e09690b86d572a',
                timeStamp: '1678794800',
                blockNumber: '40334675',
                functionName: '',
                confirmations: '26',
                contractAddress: '',
                transactionIndex: '53',
                txreceipt_status: '1',
                cumulativeGasUsed: '9608151',
            },
        },
        createdAt: '2023-03-14T11:54:36.000Z',
        updatedAt: '2023-03-14T12:19:32.000Z',
        version: 0,
    },
    {
        transactionId: '870ed43a-fb9c-4575-b73f-25fc09c6e1f4',
        address: '0x1fb8b18101194adb78e0737b7e15087d2296dc1a',
        inputChainId: 137,
        inputHash:
            '0x5bf537142d015e9ce3d26b94502e7682ccfd928ff39ab81ca218d1993bc5126c',
        inputAmount: '100000000000000000',
        outputChainId: 56,
        outputHash:
            '0xcb2ff89ff8bdb5f3c8aa0c87803ada31b3cdd6f7a4d87333d0aa133fc4cdda89',
        outputAmount: '285625000000000',
        status: 'completed',
        metadata: {
            transaction: {
                to: '0x873a64b16f84700314f8b4df0a7d30e463b2743a',
                gas: '21000',
                from: '0x1fb8b18101194adb78e0737b7e15087d2296dc1a',
                hash: '0x5bf537142d015e9ce3d26b94502e7682ccfd928ff39ab81ca218d1993bc5126c',
                input: '0x',
                nonce: '97',
                value: '100000000000000000',
                gasUsed: '21000',
                isError: '0',
                gasPrice: '127836823200',
                methodId: '0x',
                blockHash:
                    '0x706031cc5755cccb636e8618bd408ae4a1be5e86edea6b2ccf2a4262dde5eaf9',
                timeStamp: '1678796624',
                blockNumber: '40335488',
                functionName: '',
                confirmations: '13',
                contractAddress: '',
                transactionIndex: '67',
                txreceipt_status: '1',
                cumulativeGasUsed: '13342085',
            },
        },
        createdAt: '2023-03-14T12:24:28.000Z',
        updatedAt: '2023-03-14T12:25:59.000Z',
        version: 0,
    },
    {
        transactionId: 'f09c8e02-24fc-44f6-a498-d53e7503224f',
        address: '0x1fb8b18101194adb78e0737b7e15087d2296dc1a',
        inputChainId: 42161,
        inputHash:
            '0x6a46b48ba7eaaf17601fd05b70141557ab496584a9e6d0b2aab114d00485f423',
        inputAmount: '100000000000000',
        outputChainId: 137,
        outputHash:
            '0x858afa4e9d65f5820d93f8af174da4b468398fa9e54d0fcd5dc9b3bbe279009a',
        outputAmount: '142120112521844000',
        status: 'completed',
        metadata: {
            transaction: {
                to: '0x9632b2a066b95a1521a8774f7367882681c6acf1',
                gas: '391801',
                from: '0x1fb8b18101194adb78e0737b7e15087d2296dc1a',
                hash: '0x6a46b48ba7eaaf17601fd05b70141557ab496584a9e6d0b2aab114d00485f423',
                input: '0x',
                nonce: '22',
                value: '100000000000000',
                gasUsed: '288970',
                isError: '0',
                gasPrice: '100000000',
                methodId: '0x',
                blockHash:
                    '0x764762c1977b9b13ef45bf57c43486accce867f43e61defbdeeec1d83b9c1f7c',
                timeStamp: '1678494298',
                blockNumber: '69731072',
                functionName: '',
                confirmations: '190',
                contractAddress: '',
                transactionIndex: '3',
                txreceipt_status: '1',
                cumulativeGasUsed: '2507498',
            },
        },
        createdAt: '2023-03-14T11:45:53.000Z',
        updatedAt: '2023-03-14T11:51:27.000Z',
        version: 0,
    },
    {
        transactionId: 'f09c8e02-24fc-44f6-a498-d53e7503224f',
        address: '0x1fb8b18101194adb78e0737b7e15087d2296dc1a',
        inputChainId: 42161,
        inputHash:
            '0x6a46b48ba7eaaf17601fd05b70141557ab496584a9e6d0b2aab114d00485f423',
        inputAmount: '100000000000000',
        outputChainId: 137,
        outputHash:
            '0x858afa4e9d65f5820d93f8af174da4b468398fa9e54d0fcd5dc9b3bbe279009a',
        outputAmount: '142120112521844000',
        status: 'completed',
        metadata: {
            transaction: {
                to: '0x9632b2a066b95a1521a8774f7367882681c6acf1',
                gas: '391801',
                from: '0x1fb8b18101194adb78e0737b7e15087d2296dc1a',
                hash: '0x6a46b48ba7eaaf17601fd05b70141557ab496584a9e6d0b2aab114d00485f423',
                input: '0x',
                nonce: '22',
                value: '100000000000000',
                gasUsed: '288970',
                isError: '0',
                gasPrice: '100000000',
                methodId: '0x',
                blockHash:
                    '0x764762c1977b9b13ef45bf57c43486accce867f43e61defbdeeec1d83b9c1f7c',
                timeStamp: '1672294298',
                blockNumber: '69731072',
                functionName: '',
                confirmations: '190',
                contractAddress: '',
                transactionIndex: '3',
                txreceipt_status: '1',
                cumulativeGasUsed: '2507498',
            },
        },
        createdAt: '2023-03-14T11:45:53.000Z',
        updatedAt: '2023-03-14T11:51:27.000Z',
        version: 0,
    },
];

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

const TransactionBlock = ({ transaction, showDate }) => {
    const trData = transaction.metadata.transaction;
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
                    <NetworkImage src="https://dnj9s9rkg1f49.cloudfront.net/gasly.svg" />
                    <CoinAmountBlock>
                        <CoinHeading>From</CoinHeading>
                        <CoinAmount>1.12 ETH</CoinAmount>
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
                        <CoinAmount right>2350.1291 usdt</CoinAmount>
                    </CoinAmountBlock>
                    <NetworkImage src="https://dnj9s9rkg1f49.cloudfront.net/gasly.svg" />
                </InfoBox>
                <ViewMoreBlock>
                    View more{' '}
                    <svg
                        width="6"
                        height="10"
                        viewBox="0 0 6 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ marginTop: '2px', marginLeft: '8px' }}
                    >
                        <path
                            d="M1.75003 9.16681C1.64036 9.16745 1.53164 9.14642 1.43011 9.10495C1.32858 9.06348 1.23623 9.00238 1.15836 8.92514C1.08026 8.84767 1.01826 8.75551 0.975955 8.65396C0.933647 8.55241 0.911865 8.44349 0.911865 8.33348C0.911865 8.22347 0.933647 8.11455 0.975955 8.013C1.01826 7.91145 1.08026 7.81928 1.15836 7.74181L3.9167 5.00014L1.2667 2.24181C1.11149 2.08568 1.02437 1.87447 1.02437 1.65431C1.02437 1.43416 1.11149 1.22295 1.2667 1.06681C1.34417 0.988704 1.43633 0.926709 1.53788 0.884401C1.63943 0.842094 1.74835 0.820312 1.85836 0.820312C1.96837 0.820312 2.0773 0.842094 2.17884 0.884401C2.28039 0.926709 2.37256 0.988704 2.45003 1.06681L5.6667 4.40014C5.81939 4.55592 5.90491 4.76535 5.90491 4.98348C5.90491 5.2016 5.81939 5.41104 5.6667 5.56681L2.33336 8.90014C2.25857 8.98092 2.1685 9.04608 2.06838 9.09185C1.96826 9.13762 1.86006 9.1631 1.75003 9.16681Z"
                            fill="#9dffa2"
                        ></path>
                    </svg>
                </ViewMoreBlock>
            </BoxContainer>
        </>
    );
};

const TransactionHistory = () => {
    useEffect(() => {
        const getTransaction = async () => {
            // const result = await axios.get(
            //     `${process.env.REACT_APP_BASE_URL}/faucet/v1/bridge/transactions`,
            //     {
            //         address: '0x1Fb8B18101194AdB78E0737b7E15087d2296dC1a',
            //         offset: 20,
            //         page: 0,
            //     }
            // );
            // return result;
        };
        getTransaction();
    });

    return (
        <Container>
            <Heading>History</Heading>
            {transactions.map((tr, index) => {
                let showDate = true;
                if (index > 0) {
                    const t1 =
                        transactions[index - 1].metadata.transaction.timeStamp;
                    const t2 =
                        transactions[index].metadata.transaction.timeStamp;
                    const date1 = new Date(Number(t1) * 1000);
                    const date2 = new Date(Number(t2) * 1000);
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
