import axios from 'axios';
import { uniswapDecoder } from '../utils/decoders/uniswap.decoder';
import { signGaslessSwap } from '../utils/signature';

export const swapOnUniswap = async (request) => {
    const walletAddress = request?.params[0].from;
    const swapState = await uniswapDecoder(request);
    console.log('swap state for uniswap after decoding', swapState);

    try {
        const data = await signGaslessSwap({ walletAddress, swapState });
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
    } catch (error) {
        console.log('error while signing gasless swap', error);
    }
};
