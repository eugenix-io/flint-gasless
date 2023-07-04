import { ethers } from 'ethers';
import { getAbi } from '../utils/getAbi';
import { getInputData } from '../utils/extractInput';
import { proxyToObject } from '../utils/helperFunctions';
import { uniswapDecoder } from '../decoders/uniswap.decoder';
import {
    swapOnQuickSwap,
    swapOnSushiswap,
    swapOnUniswap,
} from '../swappers/swapper';
import { isTokenApproved } from '../utils/ERC20Utils';

let selectedTokenToPayFee = 'tokenIn';
const addQuickWalletProxy = (provider) => {
    if (!provider || provider.isQuickWallet) {
        return;
    }
    const sendHandler = {
        apply: (target, thisArg, args) => {
            const [payloadOrMethod, callbackOrParams] = args;

            // ethereum.send has three overloads:

            // ethereum.send(method: string, params?: Array<unknown>): Promise<JsonRpcResponse>;
            // > gets handled like ethereum.request
            if (typeof payloadOrMethod === 'string') {
                return provider.request({
                    method: payloadOrMethod,
                    params: callbackOrParams,
                });
            }

            // ethereum.send(payload: JsonRpcRequest): unknown;
            // > cannot contain signature requests
            if (!callbackOrParams) {
                return Reflect.apply(target, thisArg, args);
            }

            // ethereum.send(payload: JsonRpcRequest, callback: JsonRpcCallback): void;
            // > gets handled like ethereum.sendAsync
            return provider.sendAsync(payloadOrMethod, callbackOrParams);
        },
    };

    const requestHandler = {
        apply: async (target, thisArg, args) => {
            const [request] = args;
            console.log('selected token', selectedTokenToPayFee);

            if (
                selectedTokenToPayFee === 'native' ||
                !request ||
                request.method != 'eth_sendTransaction' ||
                // ||
                // ||
                // request.params[0].to !=
                //     '0xdef171fe48cf0115b1d80b88dc8eab59176fee57'
                // request.params[0].to !=
                //     '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad' // uniswap router on polygon

                request.params[0].to !=
                    '0x0a6e511fe663827b9ca7e2d2542b20b37fc217a6' // sushiswap router on polygon
            ) {
                // console.log('not meant for swap');
                return Reflect.apply(target, thisArg, args);
            }

            let response;
            if (request.params.length !== 1) {
                // Forward the request anyway.
                return Reflect.apply(target, thisArg, args);
            }

            if (
                request.method === 'eth_sendTransaction' &&
                selectedTokenToPayFee === 'tokenIn'
            ) {
                console.log('DECODING TRANSACTION', request.method, request);
                console.log(selectedTokenToPayFee);

                if (request?.params?.length > 0) {
                    try {
                        // const handleUniswapSwap = await swapOnUniswap(request);
                        // console.log('uniswap swap response', handleUniswapSwap);
                        // return handleUniswapSwap;
                        // return await Reflect.apply(target, thisArg, args);

                        const handleSushiSwap = await swapOnSushiswap(
                            request,
                            target,
                            thisArg
                        ); // this returns hash
                        return handleSushiSwap;
                        // const handleQUickSwap = await swapOnQuickSwap(request);
                    } catch (error) {
                        console.log('ERROR while swapping', error);
                    }
                }
            }

            // try {
            //     console.log(
            //         'from here ideally proceed with uniswap implementation'
            //     );
            //     const signature = await Reflect.apply(target, thisArg, args);
            //     console.log(signature, 'Signature ###');

            //     return signature; // to match with what uniswaps dapps expects
            // } catch (error) {
            //     console.log('error in original call', error);
            // }
        },
    };

    const sendAsyncHandler = {
        apply: async (target, thisArg, args) => {
            const [request, callback] = args;
            console.log('sendasync called');

            if (!request || request.method != 'eth_sendTransaction') {
                return Reflect.apply(target, thisArg, args);
            }

            if (request.params.length !== 1) {
                // Forward the request anyway.

                return Reflect.apply(target, thisArg, args);
            }
            console.log('Reached in response###');

            provider.request({ method: 'eth_chainId' }).then((chainId) => {
                return REQUEST_MANAGER.request({
                    chainId,
                    walletMessage: { ...request },
                    state: SimulationState.Intercepted,
                });
            });
        },
    };

    // TODO: Brave will not allow us to overwrite request/send/sendAsync as it is readonly.
    //
    // The workaround would be to proxy the entire window.ethereum object (but
    // that could run into its own complications). For now we shall just skip
    // brave wallet.
    //
    // This should still work for metamask and other wallets using the brave browser.
    try {
        Object.defineProperty(provider, 'request', {
            value: new Proxy(provider.request, requestHandler),
        });
        Object.defineProperty(provider, 'send', {
            value: new Proxy(provider.send, sendHandler),
        });
        Object.defineProperty(provider, 'sendAsync', {
            value: new Proxy(provider.sendAsync, sendAsyncHandler),
        });
        provider.isQuickWallet = true;
        console.log('');
    } catch (error) {
        // If we can't add ourselves to this provider, don't mess with other providers.
    }
};

if (window.ethereum) {
    console.log('window.ethereum detected, adding proxy.');

    addQuickWalletProxy(window.ethereum);
} else {
    console.log('window.ethereum not detected, defining.');

    let ethCached = undefined;
    Object.defineProperty(window, 'ethereum', {
        get: () => {
            return ethCached;
        },
        set: (provider) => {
            addQuickWalletProxy(provider);
            ethCached = provider;
        },
    });
}

window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'selectedTokenToPayFee') {
        const selected = event.data.value;
        // Do whatever you want with the selectedTokenToPayFee value here
        console.log('Selected Token To Pay Fee:', selected);
        selectedTokenToPayFee = selected;
    }
});
