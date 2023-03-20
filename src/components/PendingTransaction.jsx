import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getWalletAddress } from '../utils/StorageUtils.js';
import GasInProgress from './GasInProgress.jsx';

const Container = styled.div`
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const getTransaction = async () => {
    const result = await axios.get(
        `${
            process.env.REACT_APP_BASE_URL
        }/faucet/v1/bridge/transactions?address=${await getWalletAddress()}&offset=1&page=0`
    );
    return result.data;
};

const PendingTransaction = ({ hash, setNewTransaction, setHistoryPage }) => {
    useEffect(() => {
        const timer = setInterval(async () => {
            const transaction = await getTransaction();
            if (transaction[0].inputHash === hash) {
                setNewTransaction(false);
                setHistoryPage(true);
            }
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <Container>
            <GasInProgress
                title={'Waiting for transaction'}
                message={
                    'Your transaction is processing, this may take up to 2 minutes'
                }
            />
        </Container>
    );
};

export default PendingTransaction;
