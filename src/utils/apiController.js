import axios from 'axios';

const BASE_URL = `${process.env.REACT_APP_BACKEND_BASE_URL}/v1`;

const getTokensList = async ({ chainId }) => {
    console.log('Getting token list...');
    try {
        const tokenListUrl = `${BASE_URL}/swap/get-tokens?chainId=${chainId}`;
        console.log(tokenListUrl, 'tokenListUrl');
        const resp = await axios.get(tokenListUrl);
        const tokenList = resp.data;
        return tokenList;
    } catch (error) {
        console.log(error, 'getTokensList Error');
        throw new Error(error);
    }
};

const getApproximateAmountData = async ({ chainId }) => {
    console.log('getApproximateAmountForRoute chainId', chainId);
    try {
        const resp = await axios.get(
            `${BASE_URL}/swap/get-amount-config?chainId=${chainId}`
        );
        const amount = resp.data;
        console.log(resp.data, 'Response getApproximateAmountForRoute');
        return amount;
    } catch (error) {}
};

const getLatestArbGasPrice = async () => {
    try {
        const url =
            'https://api.arbiscan.io/api?module=proxy&action=eth_gasPrice&apikey=WUP7FAH8JGUXKT6MZ78ZJ7KDHYN96PPZSA';
        const result = await axios.get(url);
        arbGasPrice = Number(result.data.result);
        return arbGasPrice;
    } catch (error) {
        arbGasPrice = 100000000;
        return arbGasPrice
    }
};

export { getTokensList, getApproximateAmountData, getLatestArbGasPrice };
