import React from 'react';
import ReactDOM from 'react-dom';
import MyComponent from '../components/Widget.jsx';

import {
    swapOnQuickSwap,
    swapOnSushiswap,
    swapOnUniswap,
} from '../swappers/swapper';
import { isTokenApproved } from '../utils/ERC20Utils';

let selectedTokenToPayFee = 'tokenIn';
var currentURL = window.location.href;

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
            if (
                !request ||
                request?.method != 'eth_sendTransaction' ||
                request?.params?.length !== 1
            ) {
                return await Reflect.apply(target, thisArg, args);
            }
            console.log('selected token', selectedTokenToPayFee);
            console.log('intercepted request', request);

            let targetAddress = request?.params[0].to;
            console.log('targetAddress is', targetAddress);
            let targetDex;
            switch (targetAddress) {
                case '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad':
                    console.log('uniswap deteced');
                    targetDex = 'uniswap';
                    break;
                case '0x0a6e511fe663827b9ca7e2d2542b20b37fc217a6':
                    console.log('sushiswap deteced');
                    targetDex = 'sushiswap';
                    break;
                default:
                    targetDex = null;
            }
            if (targetDex == null) {
                console.log('null found hence returning');
                return await Reflect.apply(target, thisArg, args);
            }
            console.log('reached here', targetDex);
            if (
                selectedTokenToPayFee === 'native' ||
                selectedTokenToPayFee === 'native' // does not want to use input token for fees/ do not want to use gaspay
            ) {
                console.log('not meant for us returning');
                return Reflect.apply(target, thisArg, args);
            }

            let response;

            console.log('DECODING TRANSACTION', request.method, request);
            console.log(selectedTokenToPayFee);

            try {
                if (targetDex === 'uniswap') {
                    const handleUniswapSwap = await swapOnUniswap(request);
                    console.log('uniswap swap response', handleUniswapSwap);
                    return handleUniswapSwap;
                } else if (targetDex === 'sushiswap') {
                    const handleSushiSwap = await swapOnSushiswap(
                        request,
                        target,
                        thisArg
                    ); // this returns hash
                    return handleSushiSwap;
                }
                // do the same for quickswap
                // const handleQUickSwap = await swapOnQuickSwap(request);
            } catch (error) {
                console.log(
                    'ERROR while swapping through gaspay processing with default swap',
                    error
                );

                const signature = await Reflect.apply(target, thisArg, args);
                console.log(signature, 'Signature ###');

                return signature; // to match with what uniswaps dapps expects
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

function injectWidget() {
    console.log('inject called');
    let widgetContainer = document.createElement('div');
    console.log('container', widgetContainer);

    widgetContainer.id = 'myExtensionWidget';
    console.log('document body before', document.body);

    document.body.appendChild(widgetContainer);
    console.log('document body after', document.body);

    ReactDOM.render(
        <MyComponent />,
        document.getElementById('myExtensionWidget')
    );
}

// Inject the widget when the DOM is ready
console.log('test', typeof document, document);

// document.addEventListener('DOMContentLoaded', injectWidget);

if (document.readyState === 'loading') {
    console.log('doc ready');
    document.addEventListener('DOMContentLoaded', injectWidget);
} else {
    console.log('doc not ready');

    injectWidget();
}
