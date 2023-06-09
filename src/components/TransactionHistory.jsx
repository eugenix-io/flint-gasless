import axios from 'axios';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
// import styled from 'styled-components';
// import { getSignificantDigits } from '../utils/commonFunctions.js';
// import { getNetworkFromChainId } from '../utils/FaucetTokenUtils.js';
// import { getWalletAddress } from '../utils/StorageUtils.js';
// import BoxContainer from './BoxContainer.jsx';
// import SlidingContainer from './SlidingContainer.jsx';

// const Heading = styled.div`
//     font-style: normal;
//     font-weight: 700;
//     font-size: 18px;
//     line-height: 23px;
//     color: #f5f5f5;
// `;
// const Container = styled.div`
//     padding: 25px;
//     min-height: 500px;
// `;

// const DateHeader = styled.div`
//     font-style: normal;
//     font-weight: 600;
//     font-size: 14px;
//     line-height: 21px;
//     letter-spacing: 0.2px;
//     color: #bdbdbd;
//     margin: 20px 0 10px 0;
// `;

// const InfoBox = styled.div`
//     display: flex;
//     align-items: center;
//     width: 100%;
// `;
// const NetworkImage = styled.img`
//     width: 40px;
//     height: 40px;
//     border-radius: 20px;
// `;

// const CoinAmountBlock = styled.div`
//     flex: 1;
//     padding: 0 10px;
// `;

// const CoinHeading = styled.div`
//     font-style: normal;
//     font-weight: 600;
//     font-size: 14px;
//     line-height: 21px;
//     letter-spacing: 0.2px;
//     color: #bdbdbd;
//     text-align: ${(props) => (props.right ? 'right' : 'left')};
// `;

// const CoinAmount = styled.div`
//     font-style: normal;
//     font-weight: 600;
//     font-size: 12px;
//     line-height: 24px;
//     text-align: right;
//     letter-spacing: 0.2px;
//     color: #f5f5f5;
//     text-align: ${(props) => (props.right ? 'right' : 'left')};
// `;

// const ViewMoreBlock = styled.div`
//     background: #112713;
//     border-radius: 25px;
//     padding: 5px 12px;
//     color: #9dffa2;
//     font-weight: 600;
//     margin-top: 10px;
//     display: flex;
//     align-items: center;
//     cursor: pointer;
// `;

// const BlockExplorerLink = styled.div`
//     font-style: normal;
//     font-weight: 600;
//     font-size: 12px;
//     line-height: 18px;
//     color: #6de573;
//     cursor: pointer;
// `;

// const TransactionBlock = ({ transaction, showDate }) => {
//     const [open, setOpen] = useState(false);
//     const trData = transaction.metadata.transaction;
//     const inputNetwork = getNetworkFromChainId(transaction.inputChainId);
//     let outputNetwork;
//     if (transaction.outputChainId) {
//         outputNetwork = getNetworkFromChainId(transaction.outputChainId);
//     }

//     const inputBigAmount = ethers.toBigInt(transaction.inputAmount);
//     let outputBigAmount;
//     let outputInEth;
//     if (transaction.outputAmount) {
//         outputBigAmount = ethers.toBigInt(transaction.outputAmount);
//         outputInEth = ethers.formatEther(outputBigAmount);
//     }

//     const inputInEth = ethers.formatEther(inputBigAmount);

//     return (
//         <>

//         </>
//     );
// };

const TransactionHistory = () => {
    // const [transactions, setTransactions] = useState([]);

    // useEffect(() => {
    //     // const getTransaction = async () => {
    //     //     const result = await axios.get(
    //     //         `${
    //     //             process.env.REACT_APP_BASE_URL
    //     //         }/faucet/v1/bridge/transactions?address=${await getWalletAddress()}&offset=50&page=0`
    //     //     );
    //     //     setTransactions(result.data);
    //     // };
    //     // const timer = setInterval(() => {
    //     //     getTransaction();
    //     // }, 1000);

    //     // return () => {
    //     //     clearInterval(timer);
    //     // };
    // }, []);

    return (
        <Container>
            {/* <Heading>History</Heading>
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
            })} */}
        </Container>
    );
};

export default TransactionHistory;
