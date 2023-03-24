import axios from 'axios';
import Web3 from 'web3';

let contractAddress;
let currentNetwork;
let supportedNetworks;

export async function getGaslessContractAddress() {
    const web3 = new Web3(window.ethereum);
    if (contractAddress) {
        return contractAddress[web3.eth.getChainId()];
    }
    let result = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/mtx/v2/get-gasless-address`
    );
    console.log('THIS IS RESULT - ', result);
    if (result.data.message != 'success') {
        throw 'Failed to get contract address';
    }
    contractAddress = result.data.address;
    return contractAddress[await web3.eth.getChainId()];
}

export async function getSupportedNetworks() {
    if (supportedNetworks) {
        return supportedNetworks;
    }
    let result = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/mtx/get-supported-networks`
    );
    if (result.data.message != 'success') {
        throw 'Failed to get supported netowrks';
    }
    console.log('setting supported networks - ', result.data.supportedNetworks);
    supportedNetworks = result.data.supportedNetworks;
    return supportedNetworks;
}

export function getCurrenyNetwork() {
    return currentNetwork;
}

export function setCurrentNetwork(network) {
    currentNetwork = network;
}
