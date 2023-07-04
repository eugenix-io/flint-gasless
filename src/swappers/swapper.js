import axios from 'axios';
import { uniswapDecoder } from '../decoders/uniswap.decoder';
import {
    formatEIP721SignSushiSwap,
    sendSushiSwapGaslessTxn,
    signGaslessSwap,
    signTokenApproval,
} from '../utils/signature';
import { approve, isTokenApproved, isTokenEligible } from '../utils/ERC20Utils';
import { sushiSwapDecoder } from '../decoders/sushiswap.decoder';
import { quickSwapDecoder } from '../decoders/quickswap.decoder';

async function checkAllowance(fromToken, userWalletAddress, amountIn) {
    let allowance;
    try {
        allowance = await isTokenApproved(fromToken, userWalletAddress);
    } catch (error) {
        console.log('error fetching allowance', error);
        return;
    }
    console.log('GOT THE ALLOWANCE - ', allowance, amountIn);

    if (Number(allowance) >= Number(amountIn) && Number(allowance) != 0) {
        // allowance present
        console.log('allowance present continue with the swap');
    } else {
        // do the approval
        // Send the result to the content script (bridge)
        window.postMessage(
            { type: 'conditionResult', value: 'approvalRequested' },
            '*'
        );
        await performTokenAprroval(fromToken, userWalletAddress);
        console.log('now approval is confirmed, now sign and perform the swap');
    }
}

async function performTokenAprroval(fromToken, userWalletAddress) {
    console.log('ALLOWANCE LESS THAN REQUIRED');
    // check token eligibility
    const tokenEligible = await isTokenEligible(fromToken);
    console.log('THIS IS TOKEN ELIGIBLE - ', tokenEligible);
    let isEMTSupported = tokenEligible.isEMT;
    let gaslessApprovalSupported;
    if (!tokenEligible.isEMT && !tokenEligible.isPermit) {
        gaslessApprovalSupported = false;
    } else {
        gaslessApprovalSupported = true;
    }

    try {
        if (gaslessApprovalSupported) {
            if (isEMTSupported) {
                await signTokenApproval({
                    fromToken: fromToken,
                    userWalletAddress,
                });
            } else {
                await signTokenPermit({
                    fromToken: fromToken,
                    userWalletAddress,
                });
            }
        } else {
            throw 'Gasless not supported!';
        }
    } catch (err) {
        console.log('temp error', err);
        await approve(fromToken, userWalletAddress);
    }
}
export const swapOnUniswap = async (request) => {
    const swapState = await uniswapDecoder(request);
    // console.log('swap state for uniswap after decoding', swapState);
    const userWalletAddress = request.params[0].from;

    // check approval amount
    await checkAllowance(
        swapState.fromToken,
        userWalletAddress,
        swapState.amountIn
    );
    window.postMessage(
        { type: 'conditionResult', value: 'swapInitiated' },
        '*'
    );

    try {
        const data = await signGaslessSwap({
            userWalletAddress,
            swapState,
        });
        const hash = data.hash;
        const chainId = 137; // in futuregetCurrenyNetwork();
        let explorerLink;
        if (chainId == 137) {
            explorerLink = `https://polygonscan.com/tx/${hash}`;
        } else if (chainId == 42161) {
            explorerLink = `https://arbiscan.io/tx/${hash}`;
        } else if (chainId == 1) {
            explorerLink = `https://etherscan.io/tx/${hash}`;
        }

        console.log('Trasanction successfull', explorerLink);
        window.postMessage(
            { type: 'conditionResultSwaping', value: explorerLink },
            '*'
        );

        return hash;
    } catch (error) {
        console.log('error while signing gasless swap', error);
    }
};

export const swapOnSushiswap = async (request, target, thisArg) => {
    const swapState = await sushiSwapDecoder(request);
    console.log('swap state for sushiswap after decoding', swapState);

    const userWalletAddress = request.params[0].from;

    await checkAllowance(
        swapState.tokenIn,
        userWalletAddress,
        swapState.amountIn
    );

    const messageParams = swapState;
    messageParams.userAddress = userWalletAddress;

    const dataToSign = await formatEIP721SignSushiSwap(messageParams);
    console.log('this is the data to sign ', dataToSign);

    const dataForProviderWallet = [
        userWalletAddress,
        JSON.stringify(dataToSign),
    ];

    const args = {
        method: 'eth_signTypedData_v4',
        params: dataForProviderWallet,
    };
    console.log(args, 'Passing this args');
    const signature = await Reflect.apply(target, thisArg, [args]);

    const hash = await sendSushiSwapGaslessTxn({
        data: messageParams,
        signature,
    });

    // Send the transaction and return the hash
    const chainId = 137; // in futuregetCurrenyNetwork();
    let explorerLink;
    if (chainId == 137) {
        explorerLink = `https://polygonscan.com/tx/${hash}`;
    } else if (chainId == 42161) {
        explorerLink = `https://arbiscan.io/tx/${hash}`;
    } else if (chainId == 1) {
        explorerLink = `https://etherscan.io/tx/${hash}`;
    }

    console.log('Trasanction successfull', explorerLink);

    return hash;
};

export const swapOnQuickSwap = async (request) => {
    const swapState = await quickSwapDecoder(request);
    console.log('swap state for quickswap after decoding', swapState);

    return;
    const userWalletAddress = request.params[0].from;

    await checkAllowance(
        swapState.tokenIn,
        userWalletAddress,
        swapState.amountIn
    );

    const messageParams = swapState;
    messageParams.userAddress = userWalletAddress;

    const dataToSign = await formatEIP721SignSushiSwap(messageParams);
    console.log('this is the data to sign ', dataToSign);

    const dataForProviderWallet = [
        userWalletAddress,
        JSON.stringify(dataToSign),
    ];

    const args = {
        method: 'eth_signTypedData_v4',
        params: dataForProviderWallet,
    };
    console.log(args, 'Passing this args');
    const signature = await Reflect.apply(target, thisArg, [args]);

    const hash = await sendSushiSwapGaslessTxn({
        data: messageParams,
        signature,
    });

    // Send the transaction and return the hash
    const chainId = 137; // in futuregetCurrenyNetwork();
    let explorerLink;
    if (chainId == 137) {
        explorerLink = `https://polygonscan.com/tx/${hash}`;
    } else if (chainId == 42161) {
        explorerLink = `https://arbiscan.io/tx/${hash}`;
    } else if (chainId == 1) {
        explorerLink = `https://etherscan.io/tx/${hash}`;
    }

    console.log('Trasanction successfull', explorerLink);

    return hash;
};
