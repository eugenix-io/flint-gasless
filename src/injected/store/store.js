import axios from 'axios';
import Web3 from 'web3';
import {
    hideMaxAmountErrorMessage,
    showMaxAmountErrorMessage,
} from '../jqueryUITransformer';

let currentNetwork;
let gasPayVersion = '0.0.0';
let config = {
    liveNetworks: [],
    faucetActive: false,
    gaslessAddress: {},
    instructions: [],
    fetched: false,
    gasPayVersion,
};

export const getGasPayVersion = () => {
    return gasPayVersion;
};

window.addEventListener('set_gaspay_version', function (msg) {
    gasPayVersion = msg.detail.version;
});

export async function getGaslessContractAddress() {
    await loadConfig();

    console.log('this is the config - ', config);

    const web3 = new Web3(window.ethereum);
    const id = await web3.eth.getChainId();
    return config.gaslessAddress[id].address;
}

export async function getSupportedNetworks() {
    await loadConfig();
    return config.liveNetworks;
}

export function getCurrenyNetwork() {
    return currentNetwork;
}

export function setCurrentNetwork(network) {
    currentNetwork = network;

    if (network == 42161) {
        showMaxAmountErrorMessage();
    } else {
        hideMaxAmountErrorMessage();
    }
}

const loadConfig = async () => {
    if (config.fetched && gasPayVersion == config.gasPayVersion) {
        return;
    }
    const result = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/v1/config/config?version=${gasPayVersion}`
    );
    config = { ...result.data, fetched: true, gasPayVersion: gasPayVersion };
};
