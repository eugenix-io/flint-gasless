import { ethers } from 'ethers';
import ERC20Abi from '../abis/ERC20.json';
import * as ERC20Utils from './ERC20Utils';
import * as FlintGasless from './FlintGasless';
import Web3 from 'web3';
import axios from 'axios';
import {
    getCurrenyNetwork,
    getGaslessContractAddress,
    getGasPayVersion,
} from '../injected/store/store';
import { getToCurrency } from '../injected/jqueryUITransformer';

BigInt.prototype.toJSON = function () {
    return this.toString();
};

let NONCE;

const GASPAY_DOMAIN_TYPES = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'verifyingContract', type: 'address' },
    { name: 'salt', type: 'bytes32' },
];

export const signTokenApproval = async ({ walletAddress, fromToken }) => {
    try {
        const nonce = await ERC20Utils.getNonce(fromToken, walletAddress);
        let functionSignature = await generateFunctionSignature(ERC20Abi);

        let message = {
            nonce: parseInt(nonce),
            from: walletAddress,
            functionSignature: functionSignature,
        };

        let { r, s, v } = await getSignature({
            walletAddress,
            message,
            messageType: {
                types: [
                    { name: 'nonce', type: 'uint256' },
                    { name: 'from', type: 'address' },
                    { name: 'functionSignature', type: 'bytes' },
                ],
                name: 'MetaTransaction',
            },
            //the domain type for EMT transactions on Polygon is the same as our contract, however we don't use GASPAY_DOMAIN_TYPES
            //here because it creates the wrong meaning and reduces flexibility in case we later change our domain types
            domainType: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'verifyingContract', type: 'address' },
                { name: 'salt', type: 'bytes32' },
            ],
            domainData: {
                name: await ERC20Utils.getName(fromToken),
                version: await ERC20Utils.getVersion(fromToken),
                verifyingContract: fromToken,
                salt: '0x0000000000000000000000000000000000000000000000000000000000000089',
            },
        });

        const approvalData = {
            params: {
                r,
                s,
                v,
                functionSignature,
                userAddress: walletAddress,
            },
            approvalContractAddress: fromToken,
            chainId: getCurrenyNetwork(),
            type: 'EMT',
        };

        let txResp = await axios.post(
            `${process.env.REACT_APP_BACKEND_BASE_URL}/v1/swap/approve`,
            approvalData
        );
        return txResp.data;
    } catch (error) {
        throw error;
    }
};

export const signTokenPermit = async ({ walletAddress, fromToken }) => {
    try {
        const chainId = getCurrenyNetwork();
        const [
            tokenNonce,
            tokenDomainName,
            tokenDomainVersion,
            approvalNonce,
            cAddress,
            toNativeRoute,
            gasForApproval,
        ] = await Promise.all([
            ERC20Utils.getNonce(fromToken, walletAddress),
            ERC20Utils.getName(fromToken),
            ERC20Utils.getVersion(fromToken),
            FlintGasless.getApprovalNonce(walletAddress),
            getGaslessContractAddress(),
            getRoute(
                fromToken,
                getWrappedToken(chainId),
                getApproximateAmountForRoute(chainId),
                chainId
            ),
            FlintGasless.getGasForApproval(),
        ]);

        const date = new Date();
        // keeping a deadline of 1 year
        const deadline = date.setFullYear(date.getFullYear() + 1);
        const value = ethers.parseEther('1000000');
        const message = {
            owner: walletAddress,
            spender: cAddress,
            value,
            nonce: tokenNonce,
            deadline,
        };

        //the below code only works for Arbitrum
        const tokenDomain = {
            name: tokenDomainName,
            version: tokenDomainVersion,
            verifyingContract: fromToken,
            chainId: chainId,
        };

        let signaturePromises = [];

        //getting the signature for permit
        signaturePromises.push(
            getSignature({
                walletAddress,
                message,
                messageType: {
                    types: [
                        { name: 'owner', type: 'address' },
                        { name: 'spender', type: 'address' },
                        { name: 'value', type: 'uint256' },
                        { name: 'nonce', type: 'uint256' },
                        { name: 'deadline', type: 'uint256' },
                    ],
                    name: 'Permit',
                },
                domainType: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' },
                ],
                domainData: tokenDomain,
            })
        );

        const toNativePath = toNativeRoute.data.path.reverse();
        const toNativeFees = toNativeRoute.data.fees.reverse();

        const approvalMessage = {
            userAddress: walletAddress,
            tokenAddress: fromToken,
            approvalValue: value,
            approvalDeadline: deadline,
            toNativePath: toNativePath,
            toNativeFees: toNativeFees,
            gasForApproval: gasForApproval,
            nonce: approvalNonce,
        };

        //getting the signature for approval without fees
        signaturePromises.push(
            getSignature({
                walletAddress,
                message: approvalMessage,
                messageType: {
                    types: [
                        { type: 'address', name: 'userAddress' },
                        { type: 'address', name: 'tokenAddress' },
                        { type: 'uint', name: 'approvalValue' },
                        { type: 'uint', name: 'approvalDeadline' },
                        { type: 'address[]', name: 'toNativePath' },
                        { type: 'uint24[]', name: 'toNativeFees' },
                        { type: 'uint', name: 'gasForApproval' },
                        { type: 'uint', name: 'nonce' },
                    ],
                    name: 'ApproveWithoutFees',
                },
                domainType: GASPAY_DOMAIN_TYPES,
                domainData: await getDomainData(chainId),
            })
        );

        let [tokenSignature, gaslessSignature] = await Promise.all(
            signaturePromises
        );

        let params = {
            userAddress: walletAddress,
            tokenAddress: fromToken,
            approvalValue: value,
            approvalDeadline: deadline,
            toNativePath: toNativePath,
            toNativeFees: toNativeFees,
            gasForApproval: gasForApproval,
            nonce: approvalNonce,
            approvalSigR: tokenSignature.r,
            approvalSigS: tokenSignature.s,
            approvalSigV: tokenSignature.v,
            sigR: gaslessSignature.r,
            sigS: gaslessSignature.s,
            sigV: gaslessSignature.v,
        };

        let txResp = await axios.post(
            `${process.env.REACT_APP_BACKEND_BASE_URL}/v1/swap/gasless-approval`,
            {
                params,
                chainId,
                version: getGasPayVersion(),
            }
        );
    } catch (error) {
        throw error;
    }
};

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

const getApproximateAmountForRoute = (chainId) => {
    console.log('will get amount - ', chainId);
    switch (chainId) {
        case 137:
            return ethers.parseEther('0.2').toString();
        case 42161:
            return ethers.parseEther('0.0002').toString();
    }
};

const getWrappedToken = (chainId) => {
    switch (chainId) {
        case 137:
            return '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
        case 42161:
            return '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
    }
};

const getRoute = async (tokenIn, tokenOut, amount, chainId) => {
    return await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/v1/swap/route?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amount=${amount}&chainId=${chainId}&source=UNISWAP&type=exactOut`
    );
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

async function getSignature({
    walletAddress,
    message,
    messageType,
    domainType,
    domainData,
}) {
    const dataToSign = {
        types: {
            EIP712Domain: domainType,
        },
        domain: domainData,
        primaryType: messageType.name,
        message: message,
    };

    dataToSign.types[messageType.name] = messageType.types;

    console.log('This is data to sign - ', dataToSign);

    const signature = await ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [walletAddress, JSON.stringify(dataToSign)],
    });

    return getSignatureParameters(signature);
}
