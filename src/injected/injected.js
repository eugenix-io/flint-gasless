import { ethers } from 'ethers';
import {
    addFlintUILayer,
    getFromCurrency,
    getFromInput,
    setNativeTokenNameAndLogo,
} from './jqueryUITransformer';
import { interceptRequests } from './requestInterceptor';
import {
    setWalletAddress,
    buttonClick,
    handleTokenChange,
} from './flintButtonState';
import axios from 'axios';

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

import { setCurrentNetwork } from './store/store';
import { getGasFee } from '../utils/FlintGasless';

let contractGasPrice;

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
        console.log('ch 1');
        const provider = new ethers.BrowserProvider(window.ethereum);
        console.log('ch 2', provider);
        signer = await provider.getSigner();
        console.log('ch 3', signer);
        console.log(signer.address, 'Sginerfer');
        const currentWalletAddress = signer.address;
        walletAddress = currentWalletAddress;
        setWalletAddress(walletAddress);
        console.log(currentWalletAddress, 'wallet address');
        window.ethereum.on('chainChanged', handleChainChange);
        handleChainChange(); //first time
    }
};

async function getChainId() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    let network = await provider.getNetwork();
    return parseInt(network.chainId);
}

const handleChainChange = async () => {
    let chainId = await getChainId();
    const USDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
    var searchParams = new URLSearchParams(window.location.search);
    if (
        chainId != 137 &&
        window.location.href.includes(`inputCurrency=${USDT}`)
    ) {
        if (searchParams.get('inputCurrency') != 'ETH') {
            searchParams.set('inputCurrency', 'ETH');
            window.location.href = `https://app.uniswap.org/#/swap?inputCurrency=ETH`;
            window.location.reload();
            // window.location.search = searchParams.toString();
        }
    } else if (
        chainId == 137 &&
        window.location.href.includes(`inputCurrency=ETH`)
    ) {
        if (searchParams.get('inputCurrency') != USDT) {
            searchParams.set('inputCurrency', USDT);
            window.location.href = `https://app.uniswap.org/#/swap?inputCurrency=${USDT}`;
            window.location.reload();
            // window.location.search = searchParams.toString();
        }
    }
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

const getGasPriceFromContract = async () => {
    contractGasPrice = await getGasFee();
    console.log('CONTRACT GAS PRICE', contractGasPrice);
};

const attachUI = (i) => {
    console.log('INSIDE ATTACH UI');
    if (i <= 100) {
        console.log('THIS IS I - ', i);
        setTimeout(() => {
            const len = addFlintUILayer(buttonClick);
            if (len === 0) {
                attachUI(i + 1);
            } else {
                getEth();
            }
        }, 50);
    }
};

// getEth();
attachUI(0);
interceptRequests();
setTimeout(() => {
    getGasPriceFromContract();
}, 1000);
