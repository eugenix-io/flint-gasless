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

let responseJson;

export const setResponseJson = (newJson) => {
    responseJson = newJson;
};

let signer = null,
    walletAddress,
    currentNetwork;

const initiateConnectWallet = async () => {
    console.log('Runnuing iniititaitse', window.ethereum);
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
