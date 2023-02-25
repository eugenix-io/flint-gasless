import axios from 'axios';

let contractAddress;
let currentNetwork;

export async function getGaslessContractAddress() {
    if (contractAddress) {
        return contractAddress;
    }
    let result = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/mtx/get-gasless-address`
    );
    console.log('THIS IS RESULT - ', result);
    if (result.data.message != 'success') {
        throw 'Failed to get contract address';
    }
    contractAddress = result.data.address;
    return contractAddress;
}

export function getCurrenyNetwork() {
    return currentNetwork;
}

export function setCurrentNetwork(network) {
    currentNetwork = network;
}
