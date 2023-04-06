import axios from 'axios';
import Web3 from 'web3';

let contractAddress;
let currentNetwork;
let supportedNetworks;

export async function getGaslessContractAddress() {
    const web3 = new Web3(window.ethereum);
    console.log('contractAddress', contractAddress);
    if (contractAddress) {
        return contractAddress[await web3.eth.getChainId()];
    }
    let result = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/mtx/v2/get-gasless-address`
    );
    console.log('THIS IS RESULT - ', result);
    if (result.data.message != 'success') {
        throw 'Failed to get contract address';
    }
    contractAddress = result.data.address;
    const id = await web3.eth.getChainId();
    console.log('contractAddress', contractAddress, id, contractAddress[id]);
    return contractAddress[id];
}

let gasPayVersion = '0.0.0';

export const getGasPayVersion = () => {
    return gasPayVersion;
};

window.addEventListener('set_gaspay_version', function (msg) {
    gasPayVersion = msg.detail.version;
});

export async function getSupportedNetworks() {
    if (supportedNetworks) {
        return supportedNetworks;
    }
    const result = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/faucet/v1/config/config?version=${gasPayVersion}`
    );
    // if (result.data.message != 'success') {
    //     throw 'Failed to get supported netowrks';
    // }
    console.log('setting supported networks - ', result.data.liveNetworks);
    supportedNetworks = result.data.liveNetworks;
    return supportedNetworks;
}

export function getCurrenyNetwork() {
    return currentNetwork;
}

export function setCurrentNetwork(network) {
    currentNetwork = network;
}
