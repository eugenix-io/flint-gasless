import axios from 'axios';
import { ethers } from 'ethers';
import Web3 from 'web3';
import * as FlintGasless from './FlintGasless';
import {
    getGasPayVersion,
    getGaslessContractAddress,
} from '../injected/store/store';
import { getSignature } from './helperFunctions';
import * as ERC20Utils from './ERC20Utils';
import ERC20Abi from '../abis/ERC20.json';
import { getTokensList } from './apiControllers';

let NONCE;

const GASPAY_DOMAIN_TYPES = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'verifyingContract', type: 'address' },
    { name: 'salt', type: 'bytes32' },
];

const generateFunctionSignature = async (abi) => {
    let iface = new ethers.Interface(abi);
    // Approve amount for spender 1 matic
    return iface.encodeFunctionData('approve', [
        await getGaslessContractAddress(),
        ethers.parseEther('10000'),
    ]);
};

export const signTokenApproval = async ({ userWalletAddress, fromToken }) => {
    let walletAddress = userWalletAddress;
    try {
        console.log('signTokenApproval UNISWAP token...');
        let nonce;
        try {
            nonce = await ERC20Utils.getNonce(fromToken, walletAddress);
        } catch (error) {
            console.log(
                'error while fetching nonces in signTokenApproval function',
                error
            );
            return;
        }
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
            chainId: await getChainId(),
            type: 'EMT',
        };
        console.log('approvalData in sign token approval', approvalData);

        let txResp = await axios.post(
            `${process.env.REACT_APP_BACKEND_BASE_URL}/v1/swap/approve`,
            approvalData
        );
        return txResp.data;
    } catch (error) {
        throw error;
    }
};

const getWrappedToken = async (chainId) => {
    try {
        const result = await getTokensList({ chainId });
        console.log(result, 'Axios response for tokens list');
        const wrappedTokensData = result.chainData;

        const chainkey = Object.keys(wrappedTokensData).filter(
            (key) => key.toString() === chainId.toString()
        );
        const chainData = wrappedTokensData[chainkey];
        console.log(chainData, 'Chaindata for current chain');
        const wrappedTokenAddress = chainData.wrappedNativeTokenAddress;
        const amount = chainData.amount;
        return { wrappedTokenAddress, amount };
    } catch (error) {
        console.log(error, 'Error in getWrappedToken');
    }
};
const getRoute = async (tokenIn, tokenOut, amount, chainId) => {
    return await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/v1/swap/route?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amount=${amount}&chainId=${chainId}&source=UNISWAP&type=exactOut`
    );
};

export const signTokenPermit = async ({ userWalletAddress, fromToken }) => {
    console.log('signTokenPermit called ehfrer');
    let walletAddress = userWalletAddress;
    try {
        const chainId = getChainId();
        const { wrappedTokenAddress, amount } = await getWrappedToken(chainId);

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
            getRoute(fromToken, wrappedTokenAddress, amount, chainId),
            FlintGasless.getGasForApproval(),
        ]);

        const date = new Date();
        // keeping a deadline of 1 year
        const deadline = date.setFullYear(date.getFullYear() + 1);
        const value = ethers.parseEther('1000000');

        // let holder, expiry, allowed, daiNonce;

        let message = {
            owner: walletAddress,
            spender: cAddress,
            value,
            nonce: tokenNonce,
            deadline,
        };
        let messageForAaveonETH = {
            owner: walletAddress,
            spender: cAddress,
            value,
            nonce: ERC20Utils.getNonceforAaveonETH(fromToken, walletAddress),
            deadline,
        };
        let messageForDAIonETH = {
            holder: walletAddress,
            spender: cAddress,
            nonce: tokenNonce,
            expiry: deadline,
            allowed: true,
        };

        //the below code only works for Arbitrum
        let tokenDomain = {
            name: tokenDomainName,
            version: tokenDomainVersion,
            verifyingContract: fromToken,
            chainId: chainId,
        };

        let signaturePromises = [];

        //getting the signature for permit
        // Check for UNISWAP token

        console.log(fromToken, 'fromToken herer$#$$$');

        if (
            fromToken.toLowerCase() ===
            '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'.toLowerCase()
        ) {
            // Uniswap token
            tokenDomain = {
                name: tokenDomainName,
                chainId: chainId,
                verifyingContract: fromToken,
            };
            console.log('UNi token detected@@@', tokenDomain);
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
                        { name: 'chainId', type: 'uint256' },
                        { name: 'verifyingContract', type: 'address' },
                    ],
                    domainData: tokenDomain,
                })
            );
        } else if (
            fromToken.toLowerCase() ===
            '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'.toLowerCase()
        ) {
            console.log('AAVE token detected', tokenDomain);
            signaturePromises.push(
                getSignature({
                    walletAddress,
                    message: messageForAaveonETH,
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
        } else if (
            fromToken.toLowerCase() ===
            '0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase()
        ) {
            console.log('DAI token detected', tokenDomain);
            signaturePromises.push(
                getSignature({
                    walletAddress,
                    message: messageForDAIonETH,
                    messageType: {
                        types: [
                            { name: 'holder', type: 'address' },
                            { name: 'spender', type: 'address' },
                            { name: 'nonce', type: 'uint256' },
                            { name: 'expiry', type: 'uint256' },
                            { name: 'allowed', type: 'bool' },
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
        } else {
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
        }

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
            tokenNonce,
        };

        console.log('Calling approval gasless####', params);

        let txResp = await axios.post(
            `${process.env.REACT_APP_BACKEND_BASE_URL}/v1/swap/gasless-approval`,
            {
                params,
                chainId,
                version: getGasPayVersion(),
            }
        );

        console.log(txResp, 'Approval response..');
    } catch (error) {
        throw error;
    }
};

export const signGaslessSwap = async ({ userWalletAddress, swapState }) => {
    let walletAddress = userWalletAddress;
    try {
        console.log(
            'Executing sign gasless swaps...',
            swapState,
            walletAddress
        );

        let isTokenOutNative = false;
        const chainId = await getChainId();
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
    const salt = await Web3.utils.padLeft(`0x${chainId.toString(16)}`, 64);
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

export async function getChainId() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    let network = await provider.getNetwork();
    return parseInt(network.chainId);
}
