import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Bridge from './Bridge.jsx';
import ConnectWallet from './ConnectWallet.jsx';

const Faucet = () => {
    const [wallet, setWallet] = useState(ethers.Wallet.createRandom());

    return (
        <>
            {wallet ? (
                <Bridge wallet={wallet}></Bridge>
            ) : (
                <ConnectWallet></ConnectWallet>
            )}
        </>
    );
};

export default Faucet;
