import { update } from './flintButtonState';
import { setGasInFromToken } from './jqueryUITransformer';

const getTokenInAddress = (str) => {
    const newStr = str.split('?')[1];
    const url = new URLSearchParams(newStr);

    return {
        tokenInAddress: url.get('tokenInAddress'),
        amount: url.get('amount'),
    };
};

export const interceptRequests = () => {
    const { fetch: originalFetch } = window;
    window.fetch = async (...args) => {
        let [resource, config] = args;
        const uuid = new Date().getTime();
        if (
            (typeof resource === 'object' &&
                resource.url?.includes('https://api.uniswap.org/v1/quote')) ||
            (typeof resource === 'string' &&
                resource.includes('https://api.uniswap.org/v1/quote'))
        ) {
            const { tokenInAddress, amount } = getTokenInAddress(resource.url);
            console.log('GOING TO UPDATE STATE NOW!');
            update({
                action: 'NEW_QUOTE_REQUEST_INITIATED',
                uuid,
                payload: { fromToken: tokenInAddress, amountIn: amount },
            });
            setGasInFromToken();
        }

        let response = await originalFetch(resource, config);

        if (response.url?.includes('https://api.uniswap.org/v1/quote')) {
            const responseJson = await response.json();
            update({
                action: 'NEW_QUOTE_REQUEST_COMPLETED',
                uuid,
                payload: responseJson,
            });
        }
        return response;
    };
};
