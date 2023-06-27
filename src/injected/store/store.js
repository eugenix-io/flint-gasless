import axios from 'axios';
import Web3 from 'web3';

let config = {
    liveNetworks: [],
    faucetActive: false,
    gaslessAddress: {},
    instructions: [],
    fetched: false,
    gasPayVersion,
};
let gasPayVersion = '0.0.0';
let currentNetwork;

window.addEventListener('set_gaspay_version', function (msg) {
    // console.log('event to set gaspay version triggered');
    gasPayVersion = msg.detail.version;
});

export const getGasPayVersion = () => {
    return gasPayVersion;
};

const loadConfig = async () => {
    if (config.fetched && gasPayVersion == config.gasPayVersion) {
        // console.log('already config loaded');
        return;
    }
    try {
        const result = await axios.get(
            `${process.env.REACT_APP_BACKEND_BASE_URL}/v1/config/config?version=${gasPayVersion}`
        );

        config = {
            ...result.data,
            fetched: true,
            gasPayVersion: gasPayVersion,
        };
    } catch (error) {
        console.log('error while fetching config', error);
    }
};

export async function getGaslessContractAddress() {
    await loadConfig();

    // console.log('this is the current config - ', config);

    const web3 = new Web3(window.ethereum);
    const id = await web3.eth.getChainId();
    return config.gaslessAddress[id].address;
}

export function getCurrenyNetwork() {
    return currentNetwork;
}
