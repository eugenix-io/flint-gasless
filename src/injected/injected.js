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
        trackEvent('GASPAY_LOAD', { platform: 'UNISWAP', version: getGasPayVersion() });
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

attachUI(0);
interceptRequests();
setTimeout(() => {
    getGasPriceFromContract();
}, 1000);
