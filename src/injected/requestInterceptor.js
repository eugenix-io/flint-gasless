import { update } from './flintButtonState';
import { setGasInFromToken } from './jqueryUITransformer';

const getTokenInAddress = (str) => {
    const newStr = str.split('?')[1];
    const url = new URLSearchParams(newStr);

    return {
        tokenInAddress: url.get('tokenInAddress'),
        amount: url.get('amount'),
        type: url.get('type'),
    };
};

export const getQuoteValues = async (
    tokenIn,
    tokenOut,
    chain,
    amount,
    exactIn = true
) => {
    console.log('reached trigger quote');
    if (tokenIn && tokenOut && chain && amount > 0) {
        // await fetch(
        //     `https://api.uniswap.org/v1/quote?protocols=v2%2Cv3%2Cmixed&tokenInAddress=${tokenIn}&tokenInChainId=${chain}&tokenOutAddress=${tokenOut}&tokenOutChainId=${chain}&amount=${amount}&type=${
        //         exactIn ? 'exactIn' : 'exactOut'
        //     }`
        // );
    }
};

export const interceptRequests = () => {
    console.log('INTERCEPTING $$');
    const { fetch: originalFetch } = window;
    console.log('window object', window);
    window.fetch = async (...args) => {
        let [resource, config] = args;
        const uuid = new Date().getTime();
        if (
            (typeof resource === 'object' &&
                resource.url?.includes('https://api.uniswap.org/v1/quote')) ||
            (typeof resource === 'string' &&
                resource.includes('https://api.uniswap.org/v1/quote'))
        ) {
            console.log('within fetch ', resource, config);

            const { tokenInAddress, amount, type } = getTokenInAddress(
                resource.url || resource
            );
            console.log('INITIATE TO UPDATE STATE NOW! reached $$');

            update({
                action: 'NEW_QUOTE_REQUEST_INITIATED',
                uuid,
                payload: { fromToken: tokenInAddress, amountIn: amount },
                type,
            });
            setGasInFromToken();
        }

        let response = await originalFetch(resource, config);

        if (response.url?.includes('https://api.uniswap.org/v1/quote')) {
            const responseJson = await response.clone().json();
            console.log('quote api response', responseJson);
            update({
                action: 'NEW_QUOTE_REQUEST_COMPLETED',
                uuid,
                payload: responseJson,
            });
        }
        return response;
    };
};
