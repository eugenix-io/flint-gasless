import { ethers } from 'ethers';
import { getAbi } from '../utils/getAbi';
import { getInputData } from '../utils/extractInput';

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

            console.log('INTERCEPTED request handler', request);

            if (!request || request.method != 'eth_sendTransaction') {
                return Reflect.apply(target, thisArg, args);
            }

            let response;
            if (request.params.length !== 1) {
                // Forward the request anyway.
                return Reflect.apply(target, thisArg, args);
            }

            if (request.method === 'eth_sendTransaction') {
                console.log('DECODING TRANSACTION', request?.params?.length);
                if (request?.params?.length > 0) {
                    try {
                        const data = request?.params[0].data;
                        const address = request?.params[0].to;
                        console.log(data, address);
                        const abiData = await getAbi(address);
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
                            let decodeed = abiCode.decode(types, inputs[0][1]); // why taking 1
                            console.log(decodeed, 'DATA DECODED'); // how to figure out which one is what
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
                    } catch (error) {
                        console.log('ERROR', error);
                    }
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

            // const { dataForProviderWallet, messageParams } =
            //     await transformInputDataForFlint(request);

            // args = {
            //     method: 'eth_signTypedData_v4',
            //     params: dataForProviderWallet,
            // };

            // console.log(args, 'Passing this args');
            try {
                const signature = await Reflect.apply(target, thisArg, args);
                console.log(signature, 'Signature ###');
            } catch (error) {
                console.log('error in original call', error);
            }

            // const hash = await sendSushiSwapGaslessTxn({
            //     data: messageParams,
            //     signature,
            // });

            // Send the transaction and return the hash

            return 'hash';

            // throw ethErrors.provider.userRejectedRequest(
            //     'Quick Wallet: User denied message.'
            // );
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
