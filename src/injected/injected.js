import React from 'react';
import ReactDOM from 'react-dom';
import MyComponent from '../components/Widget.jsx';
import $ from 'jquery';

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
            // console.log(request?.method, request);

            if (
                !request ||
                request?.method != 'eth_sendTransaction' ||
                request?.params?.length !== 1
            ) {
                return await Reflect.apply(target, thisArg, args);
            }

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

                case '0xdef171fe48cf0115b1d80b88dc8eab59176fee57':
                    console.log('quick swap detected');
                    targetDex = 'quickswap';
                    break;
                default:
                    targetDex = null;
            }
            if (targetDex == null) {
                // console.log('null found hence returning', targetDex);
                return await Reflect.apply(target, thisArg, args);
            }
            console.log('reached here', targetDex);
            if (
                selectedTokenToPayFee === 'native' ||
                selectedTokenToPayFee === 'native' // does not want to use input token for fees/ do not want to use gaspay
            ) {
                // console.log('not meant for us returning');
                return Reflect.apply(target, thisArg, args);
            }

            let response;

            // console.log('DECODING TRANSACTION', request.method, request);

            try {
                if (targetDex === 'uniswap') {
                    const handleUniswapSwap = await swapOnUniswap(request);
                    // console.log('uniswap swap response', handleUniswapSwap);
                    window.postMessage({ type: 'swapdone', value: true }, '*');

                    // const testPromise = new Promise((resolve, reject) => {
                    //     resolve(handleUniswapSwap);
                    // });
                    return handleUniswapSwap;
                } else if (targetDex === 'sushiswap') {
                    const handleSushiSwap = await swapOnSushiswap(
                        request,
                        target,
                        thisArg
                    ); // this returns hash
                    return handleSushiSwap;
                } else if ((targetDex = 'quickswap')) {
                    const handleQUickSwap = await swapOnQuickSwap(request);
                    console.log('response from quickswap', handleQUickSwap);

                    // do the same for quickswap
                    // const handleQUickSwap = await swapOnQuickSwap(request);
                    return handleQUickSwap;
                }
            } catch (error) {
                window.postMessage(
                    { type: 'conditionResult', value: 'initial' },
                    '*'
                ); // if error get widget to original state
                console.log(
                    'ERROR while swapping through gaspay processing with default swap',
                    error
                );

                const signature = await Reflect.apply(target, thisArg, args);
                console.log(signature, 'Signature ###');

                return signature; // to match with what uniswaps dapps expects
            }
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
        console.log('error while creating proxy objects', error);
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
    try {
        let widgetContainer = document.createElement('div');
        widgetContainer.id = 'myExtensionWidget';
        document.body.appendChild(widgetContainer);

        ReactDOM.render(
            <MyComponent />,
            document.getElementById('myExtensionWidget')
        );
    } catch (error) {
        console.log('doc not found', error);
    }
}

// console.log('test', typeof document, document);
setTimeout(() => {
    injectWidget();
}, 1000);
