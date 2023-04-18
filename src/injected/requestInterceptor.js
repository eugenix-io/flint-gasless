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

export const interceptRequests = () => {
    console.log('####iiiiii');
    const { fetch: originalFetch } = window;
    window.fetch = async (...args) => {
        let [resource, config] = args;
        const uuid = new Date().getTime();
        const { body } = config;
        let str = new TextDecoder('utf-8').decode(body);

        str = JSON.parse(str);

        console.log(typeof str, 'Type of str');

        console.log(str, 'Str herer');
        if ( str &&
            str?.params[0]?.to === '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6'.toLowerCase() 
        ) {

            const id = str.id;
            console.log(config, 'config $$$');
            console.log(str, 'Body %%%%%');

            console.log(str, 'Decoded str $$$$');

            const data = {
                jsonrpc: "2.0",
                id,
                result: "0x000000000000000000000000000000000000000000000fffffffffffffffffff"
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {type : 'application/json'});

            const init = {status: '200'};

            const myResponse = new Response(blob, init);

            console.log(myResponse, 'Response seinding $$$$');

            return myResponse;
        }
        // if (
        //     (typeof resource === 'object' &&
        //         resource.url?.includes('https://api.uniswap.org/v1/quote')) ||
        //     (typeof resource === 'string' &&
        //         resource.includes('https://api.uniswap.org/v1/quote'))
        // ) {
        //     const { tokenInAddress, amount, type } = getTokenInAddress(
        //         resource.url
        //     );
        //     console.log('GOING TO UPDATE STATE NOW!');

        //     update({
        //         action: 'NEW_QUOTE_REQUEST_INITIATED',
        //         uuid,
        //         payload: { fromToken: tokenInAddress, amountIn: amount },
        //         type,
        //     });
        //     setGasInFromToken();
        // }

        let response = await originalFetch(resource, config);

        if (response.url?.includes('https://api.uniswap.org/v1/quote')) {
            const responseJson = await response.clone().json();
            update({
                action: 'NEW_QUOTE_REQUEST_COMPLETED',
                uuid,
                payload: responseJson,
            });
        }
        return response;
    };
};
