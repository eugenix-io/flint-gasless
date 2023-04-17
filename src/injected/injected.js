import { ethers } from 'ethers';
import {
    addFlintUILayer,
    getFromCurrency,
    getFromInput,
    hideConnectWalletButton,
    setNativeTokenNameAndLogo,
    showConnectWalletButton,
} from './jqueryUITransformer';
import { interceptRequests } from './requestInterceptor';
import {
    setWalletAddress,
    buttonClick,
    handleTokenChange,
    getWalletAddress,
} from './flintButtonState';
import axios from 'axios';
import Web3 from 'web3';
import { v4 as uuidv4 } from 'uuid';

axios.interceptors.request.use(
    function (config) {
        // check if the URL contains a specific string
        if (config.url.includes('ngrok')) {
            // add default header to the request
            config.headers['ngrok-skip-browser-warning'] = '1';
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

import { getGasPayVersion, setCurrentNetwork } from './store/store';
import { getGasFee } from '../utils/FlintGasless';
import { trackEvent } from '../utils/SegmentUtils';
import { transformInputDataForFlint } from '../utils/transactions';
import { sendSushiSwapGaslessTxn } from '../utils/signature';

let contractGasPrice;
let arbGasPrice;
let ethPrice;

export const getGasPrice = () => {
    return contractGasPrice;
};

export const setResponseJson = (newJson) => {
    responseJson = newJson;
};

let signer = null,
    walletAddress;

const initiateConnectWallet = async () => {
    console.log('ETH', window.ethereum);
    if (window.ethereum === null) {
        // If MetaMask is not installed, we use the default provider,
        // which is backed by a variety of third-party services (such
        // as INFURA). They do not have private keys installed so are
        // only have read-only access
        console.log('MetaMask not installed; using read-only defaults');
        // provider = ethers.getDefaultProvider();
    } else {
        window.ethereum.on('chainChanged', handleChainChange);
        handleChainChange(); //first time
        pollAccountChange();
    }
};

function pollAccountChange() {
    walletAddress = window.ethereum.selectedAddress;
    if (getWalletAddress() != walletAddress) {
        setWalletAddress(walletAddress);
        trackEvent('GASPAY_LOAD', {
            platform: 'UNISWAP',
            version: getGasPayVersion(),
        });
    }
    if (walletAddress != null) {
        hideConnectWalletButton();
    } else {
        showConnectWalletButton();
    }
    setTimeout(pollAccountChange, 100);
}

async function getChainId() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    let network = await provider.getNetwork();
    return parseInt(network.chainId);
}

const handleChainChange = async () => {
    let chainId = await getChainId();
    setCurrentNetwork(chainId);
    setNativeTokenNameAndLogo();
    handleTokenChange(
        getFromCurrency(),
        getFromInput() ? getFromInput().val() : 0
    );
};

const getEth = async () => {
    console.log('called');
    // Initiate wallet connect
    await initiateConnectWallet();
};

export const getArbGasPrice = async () => {
    if (!arbGasPrice) {
        try {
            const url =
                'https://api.arbiscan.io/api?module=proxy&action=eth_gasPrice&apikey=WUP7FAH8JGUXKT6MZ78ZJ7KDHYN96PPZSA';
            const result = await axios.get(url);
            arbGasPrice = Number(result.data.result);
        } catch (error) {
            arbGasPrice = 100000000;
        }
    }
    return arbGasPrice;
};

const getGasPriceFromContract = async () => {
    contractGasPrice = await getGasFee();
    console.log('CONTRACT GAS PRICE', contractGasPrice);
};

export const getEthPrice = async () => {
    if (!ethPrice) {
        try {
            const resp = await axios.get(
                'https://api.coinbase.com/v2/prices/ETH-USD/spot'
            );
            ethPrice = Number(resp.data.data.amount);
        } catch (e) {
            ethPrice = 20000;
        }
    }
    return ethPrice;
};

const attachUI = (i) => {
    setTimeout(() => {
        const len = addFlintUILayer(buttonClick);
        if (len === 0) {
            attachUI(i + 1);
        } else {
            getEth();
        }
    }, 100);
};

const addQuickWalletProxy = (provider) => {
    if (!provider || provider.isQuickWallet) {
        return;
    }

    // Heavily taken from RevokeCash to ensure consistency. Thanks Rosco :)!
    //
    // https://github.com/RevokeCash/browser-extension
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
            console.log('Quick wallet inside request handler');
            console.log(target, 'Target in request...');
            console.log(thisArg, 'this arg in request...');

            console.log(args, 'Args in request...');

            const [request] = args;
            if (!request || request.method != 'eth_sendTransaction') {
                return Reflect.apply(target, thisArg, args);
            }

            let response;
            if (request.params.length !== 1) {
                // Forward the request anyway.

                return Reflect.apply(target, thisArg, args);
            }

            const dataToSign = await transformInputDataForFlint(request);

            console.log(dataToSign, 'dataToSign transformInputDataForFlint');

            const data = [
                '0xd7C9F3b280D4690C3232469F3BCb4361632bfC77',
                JSON.stringify(dataToSign),
            ];

            args = {
                method: 'eth_signTypedData_v4',
                params: data,
            };

            console.log(args, 'Passing this args');

            const signature = await Reflect.apply(target, thisArg, [args]);

            console.log(signature, 'Signature ###');

            const hash = await sendSushiSwapGaslessTxn({ data: dataToSign, signature });

            // Send the transaction and return the hash

            return hash;

            
            // throw ethErrors.provider.userRejectedRequest(
            //     'Quick Wallet: User denied message.'
            // );
        },
    };

    const sendAsyncHandler = {
        apply: async (target, thisArg, args) => {
            const [request, callback] = args;

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
    console.log('QuickWallet: window.ethereum detected, adding proxy.');

    addQuickWalletProxy(window.ethereum);
} else {
    console.log('QuickWallet: window.ethereum not detected, defining.');

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

attachUI(0);
interceptRequests();
setTimeout(() => {
    getGasPriceFromContract();
}, 1000);

console.log('Runnning injec3tion YAYyyyyyy!!!!');
