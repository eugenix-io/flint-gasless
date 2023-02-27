import {
    isTokenApproved,
    getNonce,
    isTokenEligible,
    approve,
} from '../utils/ERC20Utils';
import ERC20Abi from '../abis/ERC20.json';
import $ from 'jquery';
import { ethers } from 'ethers';
import { signTokenApproval, signGaslessSwap } from '../utils/signature';
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
} from './jqueryUITransformer';
import axios from 'axios';
import { getCurrenyNetwork } from './store/store';

let walletAddress;
let currentToken;
let swapState = {};
let tokens = {};
let latestQuoteId;
let gaslessApprovalSupported = false;
const WMATIC = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

export const update = async ({ action, payload, uuid }) => {
    console.log('NEW ACTION IN BUTTON STATE - ', action, payload);
    switch (action) {
        //params - fromToken,
        case 'NEW_QUOTE_REQUEST_INITIATED':
            latestQuoteId = uuid;
            //only if the user changes the token, check if we need an approval
            disableSwapButton();
            swapState = {};
            break;
        case 'NEW_QUOTE_REQUEST_COMPLETED':
            if (latestQuoteId !== uuid) {
                return;
            }
            enableSwapButton();
            updatePriceValues();
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
            swapState = {
                amountIn: payload.amount,
                routes: payload.route[0],
                fromToken: tokenArray[0],
                toToken: tokenArray[tokenArray.length - 1],
                tokenArray: tokenArray,
                feeArr: feeArr,
            };
            console.log('UPDATING SWAP STATE - ', swapState);

            let promises = [
                axios.get(
                    'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice'
                ),
                axios.get(
                    `https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=${swapState.toToken},${WMATIC}&vs_currencies=usd`
                ),
            ];
            let [gasPriceResp, tokenPriceResp] = await Promise.all(promises);
            const { result } = gasPriceResp.data;
            const gasInMatic = (Number(result) * 130000) / 10 ** 18;
            const response = tokenPriceResp.data;
            const toPrice = response[swapState.toToken.toLowerCase()]['usd'];
            const maticPrice = response[WMATIC.toLowerCase()]['usd'];
            const gasInToToken = (gasInMatic / maticPrice) * toPrice;
            setGasInToToken(gasInToToken);
            // fetch(
            //     'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice'
            // )
            //     .then((res) => res.json())
            //     .then((res) => {
            //         const gas = res['result'];
            //         const gasInMatic = (Number(gas) * 130000) / 10 ** 18;
            //         fetch(
            //             `https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=${swapState.fromToken},${swapState.toToken}&vs_currencies=usd`
            //         )
            //             .then((res) => res.json())
            //             .then((res) => {
            //                 const fromAmount = Number(getFromInput()?.val());
            //                 const toAmount = Number(getToInput()?.val());
            //                 console.log('PRICES', res);
            //             });
            //     });
            //if it's in the approve state then the state will be updated by the approval logic
            break;
    }
};

export const setWalletAddress = (address) => {
    walletAddress = address;
};

export const buttonClick = async () => {
    if (swapState.fromToken) {
        showSwapPopup();
    }
    console.log('Button was clicked!!');
};

export const handleApproval = async () => {
    showLoaderApprove();
    try {
        if (gaslessApprovalSupported) {
            await signTokenApproval({
                fromToken: currentToken,
                walletAddress,
            });
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
        const data = JSON.parse(re.data);
        const hash = data.hash;
        $('#fl-vw-plsc').attr('href', `https://polygonscan.com/tx/${hash}`);
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
    let fromToken = tokens[fromTokenSymbol];
    console.log('GOT ADDRESS - ', fromToken);
    //NATIVE MATIC AS FROM TOKEN IS NOT ALLOWED
    console.log('THIS IS THE FROM TOKEN - ', fromToken);
    if (
        fromToken == '0x0000000000000000000000000000000000001010' ||
        getCurrenyNetwork() != 137
    ) {
        disableService();
        return;
    }
    if (!fromToken) {
        return;
    }
    console.log('CALLING - ', fromTokenSymbol, amountIn);
    currentToken = fromToken;
    enableService();
    showApprove();
    showLoaderApprove();
    const tokenEligible = await isTokenEligible(fromToken);
    console.log('THIS IS TOKEN ELIGIBLE - ', tokenEligible);
    if (!tokenEligible.isEMT) {
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
        args.push('[' + 'FLINT_BUTTON' + '] ');
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
        if (token.chainId == 137) {
            tokens[token.symbol] = token.address;
        } else if (
            token.extensions &&
            token.extensions.bridgeInfo &&
            token.extensions.bridgeInfo['137']
        ) {
            tokens[token.symbol] =
                token.extensions.bridgeInfo['137'].tokenAddress;
        }
    });
}

updateConsoleLog();
initTokens();
