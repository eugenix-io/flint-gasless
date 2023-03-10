import { ethers } from 'ethers';
import ERC20Abi from '../abis/ERC20.json';
import * as ERC20Utils from './ERC20Utils';
import * as FlintGasless from './FlintGasless';
import Web3 from 'web3';
import axios from 'axios';
import { getGaslessContractAddress } from '../injected/store/store';
import { getToCurrency } from '../injected/jqueryUITransformer';

let NONCE;

const domainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'verifyingContract', type: 'address' },
    { name: 'salt', type: 'bytes32' },
];

const metaTransactionType = [
    { name: 'nonce', type: 'uint256' },
    { name: 'from', type: 'address' },
    { name: 'functionSignature', type: 'bytes' },
];

const swapWithoutFees = [
    { type: 'uint', name: 'amountIn' },
    { type: 'address', name: 'tokenIn' },
    { type: 'address', name: 'tokenOut' },
    { type: 'address', name: 'userAddress' },
    { type: 'address[]', name: 'path' },
    { type: 'uint24[]', name: 'fees' },
    { type: 'uint', name: 'nonce' },
    { type: 'bool', name: 'isTokenOutMatic' },
];

export const signTokenApproval = async ({ walletAddress, fromToken }) => {
    try {
        console.log('GETTING SIGN FOR APPROVAL - ', walletAddress, fromToken);
        const nonce = await ERC20Utils.getNonce(fromToken, walletAddress);
        console.log('THIS IS NOCNE - ', nonce);
        let functionSignature = await generateFunctionSignature(ERC20Abi);

        let message = {
            nonce: parseInt(nonce),
            from: walletAddress,
            functionSignature: functionSignature,
        };

        const dataToSign = {
            types: {
                EIP712Domain: domainType,
                MetaTransaction: metaTransactionType,
            },
            domain: {
                name: await ERC20Utils.getName(fromToken),
                version: '1',
                verifyingContract: fromToken,
                salt: '0x0000000000000000000000000000000000000000000000000000000000000089',
            },
            primaryType: 'MetaTransaction',
            message: message,
        };

        console.log('THIS IS DATA TO SIGN FOR APPROVAL - ', dataToSign);

        const sign = await ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [walletAddress, JSON.stringify(dataToSign)],
        });

        let { r, s, v } = getSignatureParameters(sign);

        const approvalData = {
            r,
            s,
            v,
            functionSignature,
            userAddress: walletAddress,
            approvalContractAddress: fromToken,
        };

        let txResp = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/mtx/approve`,
            approvalData
        );
        if (txResp.data.message != 'success') {
            throw 'Invalid approval status';
        }
        return txResp.data;
    } catch (error) {
        throw error;
    }
};

export const signGaslessSwap = async ({ walletAddress, swapState }) => {
    try {
        console.log('Executing sign gasless swaps...', swapState);

        let isTokenOutMatic = false;
        if (getToCurrency() == 'MATIC') {
            isTokenOutMatic = true;
        }
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
            isTokenOutMatic,
        };

        console.log('THIS IS THE MESSAGE - ', message);

        const dataToSign = {
            types: {
                EIP712Domain: domainType,
                SwapWithoutFees: swapWithoutFees,
            },
            domain: {
                name: await FlintGasless.getName(),
                version: '1',
                verifyingContract: await getGaslessContractAddress(),
                salt: '0x0000000000000000000000000000000000000000000000000000000000000089',
            },
            primaryType: 'SwapWithoutFees',
            message: message,
        };

        console.log('THIS IS DATA WE NEED TO SIGN - ', dataToSign);
        const sign = await ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [walletAddress, JSON.stringify(dataToSign)],
        });

        let { r, s, v } = getSignatureParameters(sign);

        console.log('SWAP SIGN - ', r, s, v);
        console.log('SWAP MESSAGE - ', message);
        let txResp = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/mtx/send`,
            {
                ...message,
                r,
                s,
                v,
            }
        );
        if (txResp.data.message != 'success') {
            throw 'INVALID STATUS FOR RESPONSE';
        } else {
            NONCE++;
        }
        return txResp.data;
    } catch (error) {
        throw error;
    }
};

const generateFunctionSignature = async (abi) => {
    let iface = new ethers.Interface(abi);
    // Approve amount for spender 1 matic
    return iface.encodeFunctionData('approve', [
        await getGaslessContractAddress(),
        ethers.parseEther('10000'),
    ]);
};

const getSignatureParameters = (signature) => {
    if (!Web3.utils.isHexStrict(signature)) {
        throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
        );
    }
    var r = signature.slice(0, 66);
    var s = '0x'.concat(signature.slice(66, 130));
    var v = '0x'.concat(signature.slice(130, 132));
    v = Web3.utils.hexToNumber(v);
    if (![27, 28].includes(v)) v += 27;
    return {
        r: r,
        s: s,
        v: v,
    };
};
