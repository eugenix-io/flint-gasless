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
    addLoaderButton,
    hideLoaderButton,
    triggerQuote,
} from './jqueryUITransformer';
import axios from 'axios';
import { getCurrenyNetwork, getSupportedNetworks } from './store/store';
import { getArbGasPrice, getEthPrice, getGasPrice } from './injected';
import { getGasForApproval, getGasFee } from '../utils/FlintGasless';
import { getScanBaseUrl } from '../utils/scan';
import { getTokensList } from '../utils/apiController';

let walletAddress;
let currentToken;
let swapState = {};
let tokens = {};
let wrappedTokensData = {};
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
            addLoaderButton();
            swapState = {};
            inputType = type;
            break;
        case 'NEW_QUOTE_REQUEST_COMPLETED':
            console.log(payload, 'NEW_QUOTE_REQUEST_COMPLETED payload $$$');
            if (latestQuoteId !== uuid) {
                return;
            }
            hideLoaderButton();
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

            let amountInToken1 = Number(payload.amountDecimals);
            let amountInToken2 = Number(payload.quoteDecimals);

            let gasInUSD = Number(payload.gasUseEstimateUSD);
            let gasUseEstimateQuoteDecimals =
                payload.gasUseEstimateQuoteDecimals;
            const gasPrice = Number(payload.gasPriceWei);

            let gasInToToken = Number(gasUseEstimateQuoteDecimals);
            let gasInFromToken =
                gasInToToken * (amountInToken1 / amountInToken2);

            if (inputType !== 'exactIn') {
                amountInToken1 = Number(payload.quoteDecimals);
                amountInToken2 = Number(payload.amountDecimals);

                gasInFromToken = Number(gasUseEstimateQuoteDecimals);

                gasInToToken =
                    gasInFromToken * (amountInToken2 / amountInToken1);
            }

            let approvalFeesToken = 0;
            let approvalFeesUsd = 0;

            let fromTokenUsdValue;

            let gasFeesParamsEth;

            const chainId = getCurrenyNetwork();
            if (chainId == 42161 || chainId == 1) {
                //uniswap quote API returns gas estimate in USD as 10x and the gas use as 1/10x
                //don't know the exact reason for this but dividing gasInUsd by 10 seems to work
                gasInUSD /= 10;
                gasInFromToken /= 10;
                gasInToToken /= 10;

                let promises1 = [getGasFee(), getGasForApproval()];
                const [gasForSwap, gasForApproval] = await Promise.all(
                    promises1
                );

                console.log(
                    'fetched approval and swap fees from smart contracts',
                    gasForSwap,
                    gasForApproval
                );
                if (gasForSwap < 100) {
                    gasInFromToken = 0;
                    gasInUSD = 0;
                    gasInToToken = 0; // need to set this to zero to reflect in confirm swap pop up modal
                }
                if (gasForApproval < 100) {
                    // check the swap and approve values fetched from smart contracts, if zero then skip network call
                    approvalFeesUsd = 0;
                } else {
                    let promises2 = [
                        axios.get(
                            `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
                        ),
                        axios.get(
                            `https://${getScanBaseUrl(
                                chainId
                            )}/api?module=proxy&action=eth_gasPrice`
                        ),
                    ];
                    const [ethPriceResponse, ethGasPriceResponse] =
                        await Promise.all(promises2);
                    approvalFeesUsd =
                        (gasForApproval *
                            Number(ethGasPriceResponse.data.result) *
                            ethPriceResponse.data.ethereum.usd) /
                        10 ** 18;
                    fromTokenUsdValue = gasInUSD / gasInFromToken;
                    approvalFeesToken = approvalFeesUsd / fromTokenUsdValue;
                }
                // Get gas fees for ethereum
                if (chainId === 1) {
                    console.log('Getting eth gas params $$$', route);
                    const tokenInDecimal = route[0].tokenIn.decimals;
                    let gasFeePromise = [
                        axios.get(
                            `${process.env.REACT_APP_BACKEND_BASE_URL}/v1/swap/get-gasfee?tokenIn=${tokenArray[0]}&tokenOut=${tokenArray[1]}&amount=${payload.amount}&chain=1&exactIn=true&tokenInDecimal=${tokenInDecimal}&gasPrice=${payload.gasPriceWei}`
                        ),
                    ];

                    const [gasFeesParams] = await Promise.all(gasFeePromise);
                    gasFeesParamsEth = gasFeesParams.data;
                    console.log(gasFeesParamsEth, 'gasFeesParamsEth $$$');
                }
            }

            setGasInToToken(gasInToToken);
            setGasInFromToken(
                gasInFromToken,
                gasInUSD,
                approvalFeesUsd,
                approvalFeesToken,
                gasFeesParamsEth
            );
            const currentTokenBalance = await getTokenBalance(
                swapState.fromToken,
                walletAddress
            );
            const fromInputAmount = getFromInput()?.val();
            const fromAmount = ethers.toBigInt(inputAmount);
            console.log(
                'MINIMUM AMOUNT CHECK',
                currentTokenBalance,
                fromAmount,
                Number(fromAmount),
                gasInFromToken,
                fromInputAmount
            );
            // checking if the requested amount is more than available balance and gas required
            if (
                parseInt(currentTokenBalance) >= parseInt(fromAmount) &&
                Number(fromInputAmount) > gasInFromToken * 1.5
            ) {
                if (
                    getCurrenyNetwork() === 1 &&
                    Number(fromTokenUsdValue) < 70
                ) {
                    insufficientBalance('eth');
                } else {
                    activeSwap();
                    enableSwapButton();
                    updatePriceValues();
                }
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
    console.log('Reached handleApproval %%%&&');
    showLoaderApprove();
    try {
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
                throw 'Gasless not supported!';
            }
        } catch (err) {
            await approve(currentToken, walletAddress);
        }
        triggerQuote();

        hideLoaderApprove();
        hideApprove();
    } catch (err) {
        hideLoaderApprove();
        showApprove();
    }
};

export const handleSwap = async () => {
    try {
        const data = await signGaslessSwap({
            walletAddress,
            swapState,
        });
        const hash = data.hash;
        const chainId = getCurrenyNetwork();
        if (chainId == 137) {
            setTransactionHash(`https://polygonscan.com/tx/${hash}`);
        } else if (chainId == 42161) {
            setTransactionHash(`https://arbiscan.io/tx/${hash}`);
        } else if (chainId == 1) {
            setTransactionHash(`https://etherscan.io/tx/${hash}`);
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
    console.log(fromTokenSymbol, 'fromTokenSymbol herer@@@');
    let chainId = getCurrenyNetwork();
    if (Object.keys(tokens).length < 1) {
        await initTokens();
    }
    console.log(tokens[chainId][fromTokenSymbol], 'token RRRR');
    const fromToken = tokens[chainId][fromTokenSymbol].address;
    console.log('GOT ADDRESS - ', fromToken, tokens, chainId, fromTokenSymbol);
    //NATIVE MATIC AS FROM TOKEN IS NOT ALLOWED
    console.log('THIS IS THE FROM TOKEN - ', fromToken);
    const supportedNetworks = await getSupportedNetworks();
    console.log(supportedNetworks, 'supportedNetworks');
    if (!supportedNetworks.includes(chainId)) {
        disableService('Gaspay is not supported on this network.');
        return;
    } else if (
        (fromToken == '0x0000000000000000000000000000000000001010' &&
            chainId == 137) ||
        ((fromToken == '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' ||
            fromTokenSymbol == 'ETH') &&
            chainId == 42161) ||
        (chainId === 1 && fromTokenSymbol === 'ETH')
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
    const chainId = getCurrenyNetwork();
    let result = await getTokensList({ chainId });
    console.log(result, 'INIT TOKENS $$');
    tokens = result.tokens;
}

export const getTokenAddressFromSymbol = (symbol) => {
    const chainId = getCurrenyNetwork();
    let address;
    console.log(tokens, 'TOkenss');

    console.log(tokens, 'tokens &&&&');
    if (Object.keys(tokens).length > 1) {
        try {
            address = tokens[chainId][symbol];
        } catch (e) {}
    }
    return address;
};

updateConsoleLog();
initTokens();
