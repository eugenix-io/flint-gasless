import axios from 'axios';
import NETWORK_CONFIG from '../config/networks';

export const getTransactions = async (network, address) => {
    let response = await axios.get(
        `https://${NETWORK_CONFIG[network].scanBaseUrl}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=999999999999&page=1&offset=10000&sort=desc&apikey=${NETWORK_CONFIG[network].scanApiKey}`
    );
    return response.data;
};

export const getERC20Transactions = async (network, address) => {
    console.log('this is the network - ', network);
    let response = await axios.get(
        `https://${NETWORK_CONFIG[network].scanBaseUrl}/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999999&page=1&offset=10000&sort=desc&apikey=${NETWORK_CONFIG[network].scanApiKey}`
    );
    return response.data;
};

export const getTransaction = async (network, hash) => {
    let response = await axios.get(
        `https://${NETWORK_CONFIG[network].scanBaseUrl}/api?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${NETWORK_CONFIG[network].scanApiKey}`
    );
    return response.data;
};

export const getAbi = async (network, address) => {
    return await axios.get(
        `https://${NETWORK_CONFIG[network].scanBaseUrl}/api?module=contract&action=getabi&address=${address}&apikey=${NETWORK_CONFIG[network].scanApiKey}`
    );
};

export const getSourceCode = async (network, address) => {
    let response = await axios.get(
        `https://${NETWORK_CONFIG[network].scanBaseUrl}/api?module=contract&action=getsourcecode&address=${address}&apikey=${NETWORK_CONFIG[network].scanApiKey}`
    );
    return response.data.result;
};
