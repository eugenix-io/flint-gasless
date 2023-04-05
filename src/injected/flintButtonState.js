import {
    isTokenApproved,
    getNonce,
    isTokenEligible,
    approve,
    getTokenBalance,
} from '../utils/ERC20Utils';
import { ethers } from 'ethers';
import {
    signTokenApproval,
    signGaslessSwap,
    signTokenPermit,
} from '../utils/signature';
import {
    showSwapPopup,
    updatePriceValues,
    showRejectPopup,
    hideWaitingPopup,
    showTransactionSuccessPopup,
    hideRejectPopup,
    enableSwapButton,
    disableSwapButton,
    showApprove,
    hideApprove,
    showLoaderApprove,
    hideLoaderApprove,
    disableService,
    enableService,
    setGasInToToken,
    setGasInFromToken,
    getFromInput,
    insufficientBalance,
    activeSwap,
    setTransactionHash,
} from './jqueryUITransformer';
import axios from 'axios';
import { getCurrenyNetwork, getSupportedNetworks } from './store/store';
import { getArbGasPrice, getEthPrice, getGasPrice } from './injected';

let walletAddress;
let currentToken;
let swapState = {};
let tokens = {};
let latestQuoteId;
let gaslessApprovalSupported = false;
const WMATIC = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
let inputType = 'exactOut';

let isEmtSupported = false;

const coinContractPriceMap = {};

export const update = async ({ action, payload, uuid, type }) => {
    console.log('NEW ACTION IN BUTTON STATE - ', action, payload);
    switch (action) {
        //params - fromToken,
        case 'NEW_QUOTE_REQUEST_INITIATED':
            latestQuoteId = uuid;
            //only if the user changes the token, check if we need an approval
            disableSwapButton();
            swapState = {};
            inputType = type;
            break;
        case 'NEW_QUOTE_REQUEST_COMPLETED':
            if (latestQuoteId !== uuid) {
                return;
            }
            console.log('STARTING NEW QUOTE REQ', payload);
            const route = payload?.route[0];
            const tokenArray = [
                route[0].tokenIn.address,
                route[0].tokenOut.address,
            ];
            const feeArr = [route[0].fee];
            for (let i = 1; i < route.length; i++) {
                feeArr.push(route[i].fee);
                tokenArray.push(route[i].tokenOut.address);
            }
            console.log('THIS IS THE TOKEN ARRAY - ', tokenArray);
            if (tokenArray[0] != currentToken) {
                swapState = {};
                return;
            }
            const inputAmount =
                inputType === 'exactIn' ? payload.amount : payload.quote;
            swapState = {
                amountIn: inputAmount,
                routes: payload.route[0],
                fromToken: tokenArray[0],
                toToken: tokenArray[tokenArray.length - 1],
                tokenArray: tokenArray,
                feeArr: feeArr,
            };
            console.log('UPDATING SWAP STATE - ', swapState);
            // const gasINUSD = Number(payload.gasUseEstimateUSD);
            let amountInToken1 = Number(payload.amountDecimals);
            let amountInToken2 = Number(payload.quoteDecimals);

            let gasINUSD = Number(payload.gasUseEstimateUSD);
            getCurrenyNetwork() != 137;

            let gasInToToken = Number(payload.gasUseEstimateQuoteDecimals);
            let gasInFromToken =
                gasInToToken * (amountInToken1 / amountInToken2);

            if (inputType !== 'exactIn') {
                amountInToken1 = Number(payload.quoteDecimals);
                amountInToken2 = Number(payload.amountDecimals);

                gasInFromToken = Number(payload.gasUseEstimateQuoteDecimals);

                gasInToToken =
                    gasInFromToken * (amountInToken2 / amountInToken1);
            }
            const fromContractAddr = tokenArray[0].toLowerCase();
            const toContractAddr =
                tokenArray[tokenArray.length - 1].toLowerCase();

            // Calculation of gas fee for the case of ARBITRUM chain
            if (getCurrenyNetwork() != 137) {
                const gasPriceContract = Number(getGasPrice());
                const gasArb = await getArbGasPrice();
                const ethPrice = await getEthPrice();
                gasINUSD = (gasArb * gasPriceContract * ethPrice) / 10 ** 18;
                let fromUSDPrice;
                let toUSDPrice;

                if (
                    coinContractPriceMap[fromContractAddr] &&
                    coinContractPriceMap[toContractAddr]
                ) {
                    fromUSDPrice = coinContractPriceMap[fromContractAddr];
                    toUSDPrice = coinContractPriceMap[toContractAddr];
                } else {
                    const coinGeckoURL = `https://api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=${fromContractAddr},${toContractAddr}&vs_currencies=usd`;
                    const pricesData = await (
                        await axios.get(coinGeckoURL)
                    ).data;
                    console.log('pricesData', pricesData);
                    fromUSDPrice = pricesData[fromContractAddr]['usd'];
                    toUSDPrice = pricesData[toContractAddr]['usd'];
                    coinContractPriceMap[fromContractAddr] = fromUSDPrice;
                    coinContractPriceMap[toContractAddr] = toUSDPrice;
                }

                gasInToToken = gasINUSD / toUSDPrice;
                gasInFromToken = gasINUSD / fromUSDPrice;
            }

            setGasInToToken(gasInToToken);
            setGasInFromToken(gasInFromToken, gasINUSD);
            const currentTokenBalance = await getTokenBalance(
                swapState.fromToken,
                walletAddress
            );
            // const fromAmount = getFromInput()?.val();
            const fromAmount = ethers.toBigInt(inputAmount);
            console.log(
                'MINIMUM AMOUNT CHECK',
                currentTokenBalance,
                fromAmount,
                Number(fromAmount),
                gasInFromToken
            );
            // checking if the requested amount is more than available balance and gas required
            if (
                currentTokenBalance >= fromAmount &&
                fromAmount > gasInFromToken * 1.5
            ) {
                activeSwap();
                enableSwapButton();
                updatePriceValues();
            } else {
                insufficientBalance();
            }
            //if it's in the approve state then the state will be updated by the approval logic
            break;
    }
};

export const setWalletAddress = (address) => {
    walletAddress = address;
};

export const getWalletAddress = () => {
    return walletAddress;
};

export const buttonClick = async () => {
    if (swapState.fromToken) {
        showSwapPopup();
    }
};

export const handleApproval = async () => {
    showLoaderApprove();
    try {
        if (gaslessApprovalSupported) {
            if (isEmtSupported) {
                await signTokenApproval({
                    fromToken: currentToken,
                    walletAddress,
                });
            } else {
                await signTokenPermit({
                    fromToken: currentToken,
                    walletAddress,
                });
            }
        } else {
            await approve(currentToken, walletAddress);
        }

        hideLoaderApprove();
        hideApprove();
    } catch (err) {
        hideLoaderApprove();
        showApprove();
    }
};

export const handleSwap = async () => {
    try {
        const re = await signGaslessSwap({
            walletAddress,
            swapState,
        });
        let data;
        try {
            data = JSON.parse(re.data);
        } catch (error) {}
        const hash = data.hash;
        const chainId = getCurrenyNetwork();
        if (chainId == 137) {
            setTransactionHash(`https://polygonscan.com/tx/${hash}`);
        } else if (chainId == 42161) {
            setTransactionHash(`https://arbiscan.io/tx/${hash}`);
        }
        showTransactionSuccessPopup();
        hideWaitingPopup();
        hideRejectPopup();
    } catch (err) {
        console.error('FAILED IN HANDLING SWAP - ', err);
        showRejectPopup();
        hideWaitingPopup();
    }
};

export const handleTokenChange = async (fromTokenSymbol, amountIn) => {
    let chainId = getCurrenyNetwork();
    if (Object.keys(tokens).length < 1) {
        await initTokens();
    }
    let fromToken = tokens[chainId][fromTokenSymbol];
    console.log('GOT ADDRESS - ', fromToken, tokens, chainId, fromTokenSymbol);
    //NATIVE MATIC AS FROM TOKEN IS NOT ALLOWED
    console.log('THIS IS THE FROM TOKEN - ', fromToken);
    const supportedNetworks = await getSupportedNetworks();
    if (!supportedNetworks.includes(chainId)) {
        disableService('Gaspay is not supported on this network.');
        return;
    } else if (
        (fromToken == '0x0000000000000000000000000000000000001010' &&
            chainId == 137) ||
        ((fromToken == '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' ||
            fromTokenSymbol == 'ETH') &&
            chainId == 42161)
    ) {
        disableService('Gas will be deducted from the input token');
        return;
    }
    if (!fromToken) {
        return;
    }
    currentToken = fromToken;
    enableService();
    showApprove();
    showLoaderApprove();
    const tokenEligible = await isTokenEligible(fromToken);
    console.log('THIS IS TOKEN ELIGIBLE - ', tokenEligible);
    isEmtSupported = tokenEligible.isEMT;
    if (!tokenEligible.isEMT && !tokenEligible.isPermit) {
        gaslessApprovalSupported = false;
    } else {
        gaslessApprovalSupported = true;
    }
    const allowance = await isTokenApproved(fromToken, walletAddress);
    console.log('GOT THE ALLOWANCE - ', allowance);

    //TODO: fails if allowance > 0 but the user changes the amountIn later so that it's greater than allowance
    if (Number(allowance) >= Number(amountIn) && Number(allowance) != 0) {
        hideApprove();
        hideLoaderApprove();
        return;
    }
    console.log(
        'ALLOWANCE LESS THAN REQUIRED',
        amountIn,
        allowance,
        allowance >= amountIn
    );
    showApprove();
    hideLoaderApprove();
    return;
};
export const getGaslessApprovalSupported = () => {
    return gaslessApprovalSupported;
};

function updateConsoleLog() {
    var originalConsoleLog = console.log;
    console.log = function () {
        let args = [];
        args.push('[' + 'GASPAY' + '] ');
        // Note: arguments is part of the prototype
        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        originalConsoleLog.apply(console, args);
    };
}

async function initTokens() {
    let result = await axios.get('https://tokens.uniswap.org');
    result.data.tokens.forEach((token) => {
        if (token.chainId) {
            if (!tokens[token.chainId]) {
                tokens[token.chainId] = {};
            }
            tokens[token.chainId][token.symbol] = token.address;
        } else if (token.extensions && token.extensions.bridgeInfo) {
            Object.entries(token.extensions.bridgeInfo).map(([key, value]) => {
                //key if chainId
                if (!tokens[key]) {
                    tokens[key] = {};
                }
                tokens[key][token.symbol] =
                    token.extensions.bridgeInfo[key].tokenAddress;
            });
        }
    });
}

updateConsoleLog();
initTokens();
