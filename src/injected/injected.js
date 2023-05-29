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
import { getAbi } from '../utils/scan';

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
            const [request] = args;

            if (!request || request.method != 'eth_sendTransaction') {
                return Reflect.apply(target, thisArg, args);
            }

            let response;
            if (request.params.length !== 1) {
                // Forward the request anyway.

                return Reflect.apply(target, thisArg, args);
            }

            if (request.method === 'eth_sendTransaction') {
                if (request?.params?.length > 0) {
                    try {
                        const data = request?.params[0].data;
                        const address = request?.params[0].to;
                        const abiData = await getAbi('polygon', address);
                        const abi = JSON.parse(abiData.data.result);
                        const a = getInputData({ data, abi });
                        console.log(a, 'DATA DECODED', address);

                        try {
                            const inputs = a.decodedInput.inputs;
                            console.log('DATA DECODED INPUTS', inputs);
                            let abiCode = new ethers.AbiCoder();
                            let types = [
                                'address',
                                'uint256',
                                'uint256',
                                'bytes',
                                'bool',
                            ];
                            let decodeed = abiCode.decode(types, inputs[0][0]);
                            console.log(decodeed, 'DATA DECODED');
                            console.log(decodeed[0], 'DATA DECODED address');
                            console.log(decodeed[1], 'DATA DECODED amount in');
                            console.log(
                                decodeed[2],
                                'DATA DECODED min amount out'
                            );
                            console.log(decodeed[3], 'DATA DECODED path');
                            console.log(
                                decodeed[4],
                                'DATA DECODED pay is user'
                            );
                        } catch (error) {
                            console.log(error, 'DATA DECODED ERROR');
                        }
                    } catch (error) {}
                }

                const smaple_decoded = {
                    commands: '0x00',
                    inputs: [
                        [
                            '0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000e6100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b2791bca1f2de4661ed88a30c99a7a9449aa841740001f41bfd67037b42cf73acf2047067bd4f2c47d9bfd6000000000000000000000000000000000000000000',
                        ],
                    ],
                    deadline: '1684747732',
                };
            }

            const { dataForProviderWallet, messageParams } =
                await transformInputDataForFlint(request);

            args = {
                method: 'eth_signTypedData_v4',
                params: dataForProviderWallet,
            };

            console.log(args, 'Passing this args');

            const signature = await Reflect.apply(target, thisArg, [args]);

            console.log(signature, 'Signature ###');

            const hash = await sendSushiSwapGaslessTxn({
                data: messageParams,
                signature,
            });

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

attachUI(0);
interceptRequests();
setTimeout(() => {
    getGasPriceFromContract();
}, 1000);

const getInputData = ({ data, abi }) => {
    // console.log(data, abi, 'DATA DECODED');
    try {
        let contractInterface = new ethers.Interface(abi);
        let decodedArgumentsProxy = contractInterface.decodeFunctionData(
            data.substring(0, 10),
            data
        );

        let decodedInput = proxyToObject(decodedArgumentsProxy);
        decodedInput = JSON.parse(
            JSON.stringify(
                decodedInput,
                (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value // return everything else unchanged
            )
        );
        let functionData = contractInterface.getFunction(data.substring(0, 10));

        console.log('this is the decoded input - DATA DECODED', decodedInput);
        // functionData.inputs.forEach((param, index) => {
        //     decodedInput[param.name] = decodedArguments[index];
        // });
        console.log('This is the final abi - DATA DECODED', abi);
        return { abi, decodedInput, functionData };
    } catch (err) {
        console.error('failed to decode with err - DATA DECODED', err);
        return { failedDecode: true };
    }
};

const proxyToObject = (proxy) => {
    console.log('this is proxy - ', proxy);
    let data;
    try {
        data = proxy.toObject();
        if (Object.entries(data).length == 1 && data['_'] != undefined) {
            throw "it's an array";
        }
    } catch (err) {
        // array inputs cannot be converted to objects
        return proxy.toArray();
    }
    Object.entries(data).map(([key, value]) => {
        if (typeof value == 'object' && typeof value.toObject == 'function') {
            data[key] = proxyToObject(value);
        }
    });
    return data;
};
