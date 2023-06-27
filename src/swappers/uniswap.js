import axios from 'axios';
import { uniswapDecoder } from '../utils/decoders/uniswap.decoder';
import { signGaslessSwap, signTokenApproval } from '../utils/signature';
import { isTokenApproved, isTokenEligible } from '../utils/ERC20Utils';

export const swapOnUniswap = async (request) => {
    const swapState = await uniswapDecoder(request);
    const userWalletAddress = request.params[0].from;
    const toAddress = request.params[0].to;
    console.log('swap state for uniswap after decoding', swapState);

    // check approval amount
    const allowance = await isTokenApproved(
        swapState.fromToken,
        userWalletAddress
    );
    console.log('GOT THE ALLOWANCE - ', allowance);
    if (
        !(
            Number(allowance) >= Number(swapState.amountIn) &&
            Number(allowance) != 0
        )
    ) {
        // allowance is less than request amount, handle approval
        console.log(
            'ALLOWANCE LESS THAN REQUIRED',
            swapState.amountIn,
            allowance,
            allowance >= swapState.amountIn
        );

        // check token eligibility
        const tokenEligible = await isTokenEligible(swapState.fromToken);
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
                        fromToken: swapState.fromToken,
                        userWalletAddress,
                    });
                } else {
                    await signTokenPermit({
                        fromToken: swapState.fromToken,
                        userWalletAddress,
                    });
                }
            } else {
                throw 'Gasless not supported!';
            }
        } catch (err) {
            console.log('temp error', err);
            await approve(swapState.fromToken, userWalletAddress);
        }
    }

    console.log('now approval is confirmed, now sign and perform the swap');

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
        return hash;
    } catch (error) {
        console.log('error while signing gasless swap', error);
    }
};
