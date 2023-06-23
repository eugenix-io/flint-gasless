import axios from 'axios';

import Web3 from 'web3';
import * as FlintGasless from './FlintGasless';
import {
    getGasPayVersion,
    getGaslessContractAddress,
} from '../injected/store/store';
import { getSignature } from './helperFunctions';

let NONCE;

const GASPAY_DOMAIN_TYPES = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'verifyingContract', type: 'address' },
    { name: 'salt', type: 'bytes32' },
];

export const signGaslessSwap = async ({ walletAddress, swapState }) => {
    try {
        console.log(
            'Executing sign gasless swaps...',
            swapState,
            walletAddress
        );

        let isTokenOutNative = false;
        const chainId = 137; //getChainId();
        // discuss with apoorv why always wmatic instead of matic
        // if (
        //     (getToCurrency() == 'MATIC' && chainId == 137) ||
        //     (getToCurrency() == 'ETH' && chainId == 42161)
        // ) {
        //     isTokenOutNative = true;
        // }
        if (!NONCE) {
            NONCE = await FlintGasless.getNonce(walletAddress);
        }
        let message = {
            amountIn: swapState.amountIn, //sign fails for large numbers so we need to convert to string
            tokenIn: swapState.fromToken,
            tokenOut: swapState.toToken,
            userAddress: walletAddress,
            path: swapState.tokenArray,
            fees: swapState.feeArr,
            nonce: NONCE,
            isTokenOutNative,
        };

        let { r, s, v } = await getSignature({
            walletAddress,
            message,
            messageType: {
                types: [
                    { type: 'uint', name: 'amountIn' },
                    { type: 'address', name: 'tokenIn' },
                    { type: 'address', name: 'tokenOut' },
                    { type: 'address', name: 'userAddress' },
                    { type: 'address[]', name: 'path' },
                    { type: 'uint24[]', name: 'fees' },
                    { type: 'uint', name: 'nonce' },
                    { type: 'bool', name: 'isTokenOutNative' },
                ],
                name: 'SwapWithoutFees',
            },
            domainType: GASPAY_DOMAIN_TYPES,
            domainData: await getDomainData(chainId),
        });

        let txResp = await axios.post(
            `${process.env.REACT_APP_BACKEND_BASE_URL}/v1/swap/gasless-swap`,
            {
                params: {
                    ...message,
                    sigR: r,
                    sigS: s,
                    sigV: v,
                },
                version: getGasPayVersion(),
                chainId,
            }
        );
        NONCE++;
        return txResp.data;
    } catch (error) {
        console.log('ERROR HERE', error);
        throw error;
    }
};

let GASLESS_DOMAIN_DATA;
const getDomainData = async (chainId) => {
    const salt = Web3.utils.padLeft(`0x${chainId.toString(16)}`, 64);
    if (GASLESS_DOMAIN_DATA) {
        GASLESS_DOMAIN_DATA.salt = salt;
        return GASLESS_DOMAIN_DATA;
    }
    GASLESS_DOMAIN_DATA = {
        name: await FlintGasless.getName(),
        version: '1',
        verifyingContract: await getGaslessContractAddress(),
        salt,
    };
    return GASLESS_DOMAIN_DATA;
};
