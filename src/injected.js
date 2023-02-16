// // PocketUniverse logo in ASCII form.
// // import logger from '../../lib/logger';
// // import { RequestManager, Response } from '../../lib/request';
// // import { ethErrors } from 'eth-rpc-errors';

// // const log = logger.child({ component: 'Injected' });
// // log.debug({ msg: 'Injected script loaded.' });

// /// Handling all the request communication.
// // const REQUEST_MANAGER = new RequestManager();

// let timer = undefined;

// const addPocketUniverseProxy = (provider) => {
//   // Heavily taken from RevokeCash to ensure consistency. Thanks Rosco :)!
//   //
//   // https://github.com/RevokeCash/browser-extension
//   const sendHandler = {
//     apply: (target, thisArg, args) => {
//       const [payloadOrMethod, callbackOrParams] = args;

//       // ethereum.send has three overloads:

//       // ethereum.send(method: string, params?: Array<unknown>): Promise<JsonRpcResponse>;
//       // > gets handled like ethereum.request
//       if (typeof payloadOrMethod === 'string') {
//         return provider.request({
//           method: payloadOrMethod,
//           params: callbackOrParams,
//         });
//       }

//       // ethereum.send(payload: JsonRpcRequest): unknown;
//       // > cannot contain signature requests
//       if (!callbackOrParams) {
//         return Reflect.apply(target, thisArg, args);
//       }

//       // ethereum.send(payload: JsonRpcRequest, callback: JsonRpcCallback): void;
//       // > gets handled like ethereum.sendAsync
//       return provider.sendAsync(payloadOrMethod, callbackOrParams);
//     },
//   };

//   const requestHandler = {
//     apply: async (target, thisArg, args) => {
//       const [request] = args;
//       if (!request) {
//         return Reflect.apply(target, thisArg, args);
//       }

//       console.log('INTERCEPTED REQ :::: ', request);
//       console.log('INTERCEPTED PARAMS :::: ', request.params);
//       // console.log('INTERCEPTED FIRST PARAM :::: ', request.params[0]);

//       if (
//         request.method !== 'eth_signTypedData_v3' &&
//         request.method !== 'eth_signTypedData_v4' &&
//         request.method !== 'eth_sendTransaction' &&
//         request.method !== 'eth_sign' && 
//         request.method !== 'personal_sign'
//       ) {
//         return Reflect.apply(target, thisArg, args);
//       }

//       // log.info({ args }, 'Request type');
//       let response;
//       if (request.method === 'eth_sendTransaction') {
//         // log.info('Transaction Request');

//         if (request.params.length !== 1) {
//           // Forward the request anyway.
//           // log.warn('Unexpected argument length.');
//           return Reflect.apply(target, thisArg, args);
//         }

//         // log.info(request, 'Request being sent');

//         // Sending response.
//         // response = await REQUEST_MANAGER.request({
//         //   chainId: await provider.request({ method: 'eth_chainId' }),
//         //   signer: request.params[0].from,
//         //   transaction: request.params[0],
//         // });

//         // if (response === Response.Reject) {
//         //   // log.info('Reject');
//         //   // Based on EIP-1103
//         //   // eslint-disable-next-line no-throw-literal
//         //   // throw ethErrors.provider.userRejectedRequest(
//         //   //   'PocketUniverse Tx Signature: User denied transaction signature.'
//         //   // );
//         // }
//       } else if (
//         request.method === 'eth_signTypedData_v3' ||
//         request.method === 'eth_signTypedData_v4'
//       ) {
//         // log.info('Signature Request');
//         if (request.params.length !== 2) {
//           // Forward the request anyway.
//           // log.warn('Unexpected argument length.');
//           return Reflect.apply(target, thisArg, args);
//         }

//         const params = JSON.parse(request.params[1]);
//         // log.info({ params }, 'Request being sent');

//         // Sending response.
//         // response = await REQUEST_MANAGER.request({
//         //   chainId: await provider.request({ method: 'eth_chainId' }),
//         //   signer: params[0],
//         //   domain: params['domain'],
//         //   message: params['message'],
//         //   primaryType: params['primaryType'],
//         // });

//         // if (response === Response.Reject) {
//         //   log.info('Reject');
//         //   // NOTE: Be cautious when changing this name. 1inch behaves strangely when the error message diverges.
//         //   throw ethErrors.provider.userRejectedRequest(
//         //     'PocketUniverse Message Signature: User denied message signature.'
//         //   );
//         // }
//       } else if (request.method === 'eth_sign') {
//         // log.info('EthSign Request');
//         if (request.params.length !== 2) {
//           // Forward the request anyway.
//           // log.warn('Unexpected argument length.');
//           return Reflect.apply(target, thisArg, args);
//         }

//         // Sending response.
//         // response = await REQUEST_MANAGER.request({
//         //   chainId: await provider.request({ method: 'eth_chainId' }),
//         //   signer: request.params[0],
//         //   hash: request.params[1],
//         // });

//         // if (response === Response.Reject) {
//         //   log.info('Reject');
//         //   // NOTE: Be cautious when changing this name. 1inch behaves strangely when the error message diverges.
//         //   throw ethErrors.provider.userRejectedRequest(
//         //     'PocketUniverse Message Signature: User denied message signature.'
//         //   );
//         // }
//       } else if (request.method === 'personal_sign') {
//         // log.info('Presonal Sign Request');
//         // if (request.params.length < 2) {
//         //   // Forward the request anyway.
//         //   log.warn('Unexpected argument length.');
//         //   return Reflect.apply(target, thisArg, args);
//         // }

//         // Sending response.
//         // response = await REQUEST_MANAGER.request({
//         //   chainId: await provider.request({ method: 'eth_chainId' }),
//         //   signer: request.params[1],
//         //   signMessage: request.params[0],
//         // });

//         // if (response === Response.Reject) {
//         //   log.info('Reject');
//         //   // NOTE: Be cautious when changing this name. 1inch behaves strangely when the error message diverges.
//         //   throw ethErrors.provider.userRejectedRequest(
//         //     'PocketUniverse Message Signature: User denied message signature.'
//         //   );
//         // }
//       } else {
//         throw new Error('Show never reach here');
//       }

//       // For error, we just continue, to make sure we don't block the user!
//       // if (response === Response.Continue || response === Response.Error) {
//       //   log.info(response, 'Continue | Error');
//       //   return Reflect.apply(target, thisArg, args);
//       // }
//     },
//   };

//   const sendAsyncHandler = {
//     apply: async (target, thisArg, args) => {
//       const [request, callback] = args;
//       if (!request) {
//         return Reflect.apply(target, thisArg, args);
//       }

//       if (
//         request.method !== 'eth_signTypedData_v3' &&
//         request.method !== 'eth_signTypedData_v4' &&
//         request.method !== 'eth_sendTransaction' &&
//         request.method !== 'eth_sign' &&
//         request.method !== 'personal_sign'
//       ) {
//         return Reflect.apply(target, thisArg, args);
//       }

//       // log.info({ args }, 'Request Type Async Handler');
//       if (request.method === 'eth_sendTransaction') {
//         // log.info('Transaction Request');

//         if (request.params.length !== 1) {
//           // Forward the request anyway.
//           // log.warn('Unexpected argument length.');
//           return Reflect.apply(target, thisArg, args);
//         }

//         // log.info(request, 'Request being sent');
//         provider
//           .request({ method: 'eth_chainId' })
//           .then((chainId) => {
//             // return REQUEST_MANAGER.request({
//             //   chainId,
//             //   signer: request.params[0].from,
//             //   transaction: request.params[0],
//             // });
//           })
//           .then((response) => {
//             // if (response === Response.Reject) {
//             //   log.info('Reject');
//             //   // Based on EIP-1103
//             //   // eslint-disable-next-line no-throw-literal
//             //   const error = ethErrors.provider.userRejectedRequest(
//             //     'PocketUniverse Tx Signature: User denied transaction signature.'
//             //   );
//             //   const response = {
//             //     id: request?.id,
//             //     jsonrpc: '2.0',
//             //     error,
//             //   };
//             //   callback(error, response);
//             //   // For error, we just continue, to make sure we don't block the user!
//             // } else if (
//             //   response === Response.Continue ||
//             //   response === Response.Error
//             // ) {
//             //   log.info(response, 'Continue | Error');
//             //   return Reflect.apply(target, thisArg, args);
//             // }
//           });
//       } else if (
//         request.method === 'eth_signTypedData_v3' ||
//         request.method === 'eth_signTypedData_v4'
//       ) {
//         // log.info('Signature Request');
//         if (request.params.length !== 2) {
//           // Forward the request anyway.
//           // log.warn('Unexpected argument length.');
//           return Reflect.apply(target, thisArg, args);
//         }

//         const params = JSON.parse(request.params[1]);
//         // log.info({ params }, 'Request being sent');

//         provider
//           .request({ method: 'eth_chainId' })
//           .then((chainId) => {
//             // return REQUEST_MANAGER.request({
//             //   chainId,
//             //   signer: params[0],
//             //   domain: params['domain'],
//             //   message: params['message'],
//             //   primaryType: params['primaryType'],
//             // });
//           })
//           .then((response) => {
//             // if (response === Response.Reject) {
//             //   log.info('Reject');
//             //   // Based on EIP-1103
//             //   // eslint-disable-next-line no-throw-literal
//             //   const error = ethErrors.provider.userRejectedRequest(
//             //     'PocketUniverse Message Signature: User denied message signature.'
//             //   );
//             //   const response = {
//             //     id: request?.id,
//             //     jsonrpc: '2.0',
//             //     error,
//             //   };
//             //   callback(error, response);
//             //   // For error, we just continue, to make sure we don't block the user!
//             // } else if (
//             //   response === Response.Continue ||
//             //   response === Response.Error
//             // ) {
//             //   log.info(response, 'Continue | Error');
//             //   return Reflect.apply(target, thisArg, args);
//             // }
//           });
//       } else if (request.method === 'eth_sign') {
//         // log.info('EthSign Request');
//         if (request.params.length !== 2) {
//           // Forward the request anyway.
//           // log.warn('Unexpected argument length.');
//           return Reflect.apply(target, thisArg, args);
//         }

//         provider
//           .request({ method: 'eth_chainId' })
//           .then((chainId) => {
//             // return REQUEST_MANAGER.request({
//             //   chainId,
//             //   signer: request.params[0],
//             //   hash: request.params[1],
//             // });
//           })
//           .then((response) => {
//             // if (response === Response.Reject) {
//             //   log.info('Reject');
//             //   // Based on EIP-1103
//             //   // eslint-disable-next-line no-throw-literal
//             //   const error = ethErrors.provider.userRejectedRequest(
//             //     'PocketUniverse Message Signature: User denied message signature.'
//             //   );
//             //   const response = {
//             //     id: request?.id,
//             //     jsonrpc: '2.0',
//             //     error,
//             //   };
//             //   callback(error, response);
//             //   // For error, we just continue, to make sure we don't block the user!
//             // } else if (
//             //   response === Response.Continue ||
//             //   response === Response.Error
//             // ) {
//             //   log.info(response, 'Continue | Error');
//             //   return Reflect.apply(target, thisArg, args);
//             // }
//           });
//       } else if (request.method === 'personal_sign') {
//         // log.info('Presonal Sign Request');
//         if (request.params.length === 0) {
//           // Forward the request anyway.
//           // log.warn('Unexpected argument length.');
//           return Reflect.apply(target, thisArg, args);
//         }

//         provider
//           .request({ method: 'eth_chainId' })
//           .then((chainId) => {
//             // return REQUEST_MANAGER.request({
//             //   chainId,
//             //   signer: request.params[1],
//             //   signMessage: request.params[0],
//             // });
//           })
//           .then((response) => {
//             // if (response === Response.Reject) {
//             //   log.info('Reject');
//             //   // Based on EIP-1103
//             //   // eslint-disable-next-line no-throw-literal
//             //   const error = ethErrors.provider.userRejectedRequest(
//             //     'PocketUniverse Message Signature: User denied message signature.'
//             //   );
//             //   const response = {
//             //     id: request?.id,
//             //     jsonrpc: '2.0',
//             //     error,
//             //   };
//             //   callback(error, response);
//             //   // For error, we just continue, to make sure we don't block the user!
//             // } else if (
//             //   response === Response.Continue ||
//             //   response === Response.Error
//             // ) {
//             //   log.info(response, 'Continue | Error');
//             //   return Reflect.apply(target, thisArg, args);
//             // }
//           });
//       }
//     },
//   };

//   if (provider && !provider?.isPocketUniverse) {
//     // log.debug({ provider }, 'Added proxy');
//     // TODO(jqphu): Brave will not allow us to overwrite request/send/sendAsync as it is readonly.
//     //
//     // The workaround would be to proxy the entire window.ethereum object (but
//     // that could run into its own complications). For now we shall just skip
//     // brave wallet.
//     //
//     // This should still work for metamask and other wallets using the brave browser.
//     try {
//       Object.defineProperty(provider, 'request', {
//         value: new Proxy(provider.request, requestHandler),
//       });
//       Object.defineProperty(provider, 'send', {
//         value: new Proxy(provider.send, sendHandler),
//       });
//       Object.defineProperty(provider, 'sendAsync', {
//         value: new Proxy(provider.sendAsync, sendAsyncHandler),
//       });
//       provider.isPocketUniverse = true;
//       console.log('Pocket Universe is running!');
//     } catch (error) {
//       // If we can't add ourselves to this provider, don't mess with other providers.
//       // log.warn({ provider, error }, 'Could not attach to provider');
//     }
//   }
// };

// const addProxy = () => {
//   console.log('add proxy called');
//   // Protect against double initialization.
//   if (window.ethereum && !window.ethereum?.isPocketUniverse) {
//     // log.debug({ provider: window.ethereum }, 'Injecting!');
//     console.log('got ETH', window.ethereum);
//     addPocketUniverseProxy(window.ethereum);

//     if (window.ethereum.providers?.length) {
      
//       // log.debug('New providers!');
//       window.ethereum.providers.forEach(addPocketUniverseProxy);
//     }
//   }
// };

// if (window.ethereum) {
//   console.log('eth not found');
//   // log.debug({ provider: window.ethereum }, 'Detected Provider');
//   addProxy();
// } else {
//   // log.debug('Adding event listener');
//   window.addEventListener('ethereum#initialized', addProxy);
// }

// timer = setInterval(addProxy, 100);

// // This cleanup timeout serves two purposes.
// //
// // 1. There is a wallet
// //
// // We do not clear the timeout in addProxy since if coinbase wallet and
// // metamask are both present, metamask will augment the providers array. We do
// // not get any events when this happens. Thus, we continually poll to see if
// // there are any new providers and if there are we inject ourselves.
// //
// // 2. There are no wallets at all.
// //
// // Although we don't do a lot of work, we don't want to churn CPU cycles for no
// // reason. Thus after 5 seconds we give up on checking for the wallet.
// setTimeout(() => {
//   window.removeEventListener('ethereum#initialized', addProxy);
//   clearTimeout(timer);
// }, 5000);


// export const check = async () => {
//   console.log('called');
//   let [tab] =  await chrome.tabs.query({active: true, currentWindow: true});
//   console.log(tab);
//   chrome.scripting.executeScript({
//     target: {tabId: tab.id},
//     function: getEth
//   })
// }

import { ethers } from 'ethers';
import USDTAbi from './usdtAbi.json';
import web3 from 'web3';
import axios from 'axios';

const domainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "verifyingContract", type: "address" },
  { name: "salt", type: "bytes32" }
];

const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" }
];

const domainData = {
  name: "Tether USD",
  version: "1",
  verifyingContract: "0x7FFB3d637014488b63fb9858E279385685AFc1e2",
  salt: "0x0000000000000000000000000000000000000000000000000000000000000089",
};

let signer = null, provider, walletAddress;

const getSignatureParameters = (signature) => {
  if (!web3.utils.isHexStrict(signature)) {
    throw new Error(
      'Given value "'.concat(signature, '" is not a valid hex string.')
    );
  }
  var r = signature.slice(0, 66);
  var s = "0x".concat(signature.slice(66, 130));
  var v = "0x".concat(signature.slice(130, 132));
  v = web3.utils.hexToNumber(v);
  if (![27, 28].includes(v)) v += 27;
  return {
    r: r,
    s: s,
    v: v,
  };
};

const generateFunctionSignature = (abi) => {
  let iface = new ethers.Interface(abi);
  // Approve amount for spender 1 matic
  return iface.encodeFunctionData("approve", ['0xb2c125eec20aac81a6d2b37f17c252acdb785b54', 1]);
}

const generate = async () => {
  try {

    // get nonce from backend

    const nonce = (await axios.get(`https://mtx.flint.money/mtx/get-nonce?wa=${walletAddress}`)).data.nonce;

    console.log(nonce, 'Nonce from backend');
    // get the signature

    let functionSignature = generateFunctionSignature(USDTAbi);

    let message = {
      nonce: parseInt(nonce),
      from: walletAddress,
      functionSignature: functionSignature
    };

    const dataToSign = {
      types: {
        EIP712Domain: domainType,
        MetaTransaction: metaTransactionType,
      },
      domain: domainData,
      primaryType: "MetaTransaction",
      message: message,
    };

    console.log(dataToSign, 'data t sinff');

    const sign = await ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [walletAddress, JSON.stringify(dataToSign)],
    });

    console.log(sign, 'Signsgnsngs')

    let { r, s, v } = getSignatureParameters(sign);

    // Sign the data and get the signature from metamask

    // Send R, S, V to backend

    console.log(r, s, v, 'RRRRRRR');

    const data = { r, s, v, functionSignature, userAddress: walletAddress }

    const txResp = await axios.post(`https://mtx.flint.money/mtx/send`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const txJson = JSON.parse(txResp.data.data);
    console.log(txJson, 'Tx json');
    const hash = txJson["hash"];

    // {
    //   "_type": "TransactionReceipt",
    //   "accessList": null,
    //   "blockNumber": null,
    //   "blockHash": null,
    //   "chainId": "137",
    //   "data": "0x0c53c51c000000000000000000000000d91cf3a4db5e3d9bec904ace91f8c1959ad86bba00000000000000000000000000000000000000000000000000000000000000a00d1a3ad697dd7097e33dbe8aac0a3b0b683cb2b9097eb8a3ba05ce4d72d5f89b0fa6912aa9539fbe80377fac2b1ff5dd093474d603da3846438c7a3c6ffe78d1000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000b2c125eec20aac81a6d2b37f17c252acdb785b54000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000",
    //   "from": "0xb2c125eec20aac81a6d2b37f17c252acdb785b54",
    //   "gasLimit": "200000",
    //   "gasPrice": "1000000000000",
    //   "hash": "0xe0eb6b5b7c47020a9c5f711853e532248ff351df31da2827934705478d648b29",
    //   "maxFeePerGas": null,
    //   "maxPriorityFeePerGas": null,
    //   "nonce": 8,
    //   "to": "0x7FFB3d637014488b63fb9858E279385685AFc1e2",
    //   "value": "0"
    // }

    setTx(hash);

    console.log(txResp.data.data, 'transaction...');
  } catch (error) {
    console.log(error, 'Error in generate');
  }
}

const initiateConnectWallet = async () => {
  console.log('Runnuing iniititaitse', window.ethereum)
  if (window.ethereum === null) {
    // If MetaMask is not installed, we use the default provider,
    // which is backed by a variety of third-party services (such
    // as INFURA). They do not have private keys installed so are
    // only have read-only access
    console.log("MetaMask not installed; using read-only defaults");
    provider = ethers.getDefaultProvider();
  } else {
    console.log('ch 1');
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log('ch 2', provider);
    signer = await provider.getSigner();
    console.log('ch 3', signer);
    console.log(signer.address, 'Sginerfer');
    const currentWalletAddress = signer.address;
    walletAddress = currentWalletAddress;

    console.log(currentWalletAddress, 'wallet address');
  }
}

const getEth = async () => {
  console.log('called');
  // Initiate wallet connect
  await initiateConnectWallet();

  setTimeout(() => {
    console.log('Executing@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    generate();
  }, 5000);
}

console.log('runing injected');
getEth();