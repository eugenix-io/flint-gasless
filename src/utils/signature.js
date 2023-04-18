import { ethers } from 'ethers';
import ERC20Abi from '../abis/ERC20.json';
import * as ERC20Utils from './ERC20Utils';
import * as FlintGasless from './FlintGasless';
import Web3 from 'web3';
import axios from 'axios';
import {
    getCurrenyNetwork,
    getGaslessContractAddress,
} from '../injected/store/store';
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
    { type: 'bool', name: 'isTokenOutNative' },
];

const SwapOnSushiParams = [
    { type: 'address', name: 'tokenIn' },
    { type: 'uint', name: 'amountIn' },
    { type: 'address', name: 'tokenOut' },
    { type: 'uint', name: 'amountOutMin' },
    { type: 'address', name: 'to' },
    { type: 'uint', name: 'nonce' },
    { type: 'bytes', name: 'route'}
];

const FLINT_CONTRACT = '0xae294F66775eDd9C81f4540eAdA41Bc1E4eE22AD';

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

BigInt.prototype.toJSON = function () {
    return this.toString();
};

export const formatEIP721SignSushiSwap = async (messagePayload) => {
    const chainId = getCurrenyNetwork();
    const salt = Web3.utils.padLeft(`0x${chainId.toString(16)}`, 64);
    const NONCE = await FlintGasless.getNonce();
    messagePayload.nonce = NONCE;
    const dataToSign = {
        types: {
            EIP712Domain: domainType,
            SwapGaslessSushiSwapFlint: SwapOnSushiParams,
        },
        domain: {
            name: await FlintGasless.getName(),
            version: '1',
            verifyingContract: FLINT_CONTRACT,
            salt,
        },
        primaryType: 'SwapGaslessSushiSwapFlint',
        message: messagePayload,
    };

    return dataToSign;
}

export const signTokenPermit = async ({ walletAddress, fromToken }) => {
    try {
        console.log('GETTING SIGN FOR PERMIT ', walletAddress, fromToken);
        const nonce = await ERC20Utils.getNonce(fromToken, walletAddress);
        // const nonce = 0;
        console.log('THIS IS NONCE - ', nonce);
        // let functionSignature = await generateFunctionSignature(ERC20Abi);

        const date = new Date();
        // keeping a deadline of 1 year
        const deadline = date.setFullYear(date.getFullYear() + 1);
        const value = ethers.parseEther('1000000');
        const cAddress = await getGaslessContractAddress();
        const message = {
            owner: walletAddress,
            spender: cAddress,
            value,
            nonce,
            deadline,
        };

        const Permit = [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
        ];

        const domainName = await ERC20Utils.getName(fromToken);
        const domainVersion = await ERC20Utils.getVersion(fromToken);
        const chainId = getCurrenyNetwork();
        // const contractAddress = '0x912CE59144191C1204E64559FE8253a0e49E6548'; // Arbitrum main contract address
        const domain = {
            name: domainName,
            version: domainVersion,
            verifyingContract: fromToken,
            chainId: chainId,
        };

        const dataToSign = {
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' },
                ],
                Permit: Permit,
            },
            domain: domain,
            primaryType: 'Permit',
            message: message,
        };
        console.log(
            'THIS IS DATA TO SIGN FOR PERMIT - ',
            JSON.stringify(dataToSign)
        );

        const sign = await ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [walletAddress, JSON.stringify(dataToSign)],
        });

        let { r, s, v } = getSignatureParameters(sign);

        const approvalData = {
            contractAddress: fromToken,
            owner: walletAddress,
            spender: cAddress,
            value,
            deadline,
            v,
            r,
            s,
            chainId,
        };

        console.log('approvalData', approvalData);

        let txResp = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/mtx/permit`,
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

export const sendSushiSwapGaslessTxn = async ({ data, signature }) => {
    console.log('message sendSushiSwapGaslessTxn', message);

    const { r, s, v } = getSignatureParameters(signature);

    console.log(r,s,v, "RSV params");

    data.isNative = false;
    data.sigR = r;
    data.sigV = v;
    data.sigS = s;

    /**
     * message = {
        amountIn,
        amountOutMin,
        route,
        to,
        tokenIn,
        tokenOut,
        nonce: 0
    };
     */

    const resp = await axios.post(`http://localhost:5001/mtx/swap-sushi`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const respData = resp.data;
    console.log(respData, 'Response from transaction $###');

    const { txHash } = respData;

    return txHash;
}

export const signGaslessSwap = async ({ walletAddress, swapState }) => {
    try {
        console.log('Executing sign gasless swaps...', swapState);

        let isTokenOutNative = false;
        const chainId = getCurrenyNetwork();
        if (
            (getToCurrency() == 'MATIC' && chainId == 137) ||
            (getToCurrency() == 'ETH' && chainId == 42161)
        ) {
            isTokenOutNative = true;
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
            isTokenOutNative,
        };

        console.log('THIS IS THE MESSAGE - ', message);
        const salt = Web3.utils.padLeft(`0x${chainId.toString(16)}`, 64);

        const dataToSign = {
            types: {
                EIP712Domain: domainType,
                SwapWithoutFees: swapWithoutFees,
            },
            domain: {
                name: await FlintGasless.getName(),
                version: '1',
                verifyingContract: await getGaslessContractAddress(),
                salt,
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
                chainId,
            }
        );
        console.log('txResp', txResp);
        if (txResp.data.message != 'success') {
            throw 'INVALID STATUS FOR RESPONSE';
        } else {
            NONCE++;
        }
        return txResp.data;
    } catch (error) {
        console.log('ERROR HERE', error);
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
