import axios from 'axios';

const BASE_URL = `${process.env.REACT_APP_BACKEND_BASE_URL}/v1`;

const getTokensList = async ({ chainId }) => {
    console.log('Getting token list...');
    try {
        const tokenListUrl = `${BASE_URL}/swap/get-tokens?chainId=${chainId}`;
        // console.log(tokenListUrl, 'tokenListUrl');
        const resp = await axios.get(tokenListUrl);
        const tokenList = resp.data;
        return tokenList;
    } catch (error) {
        console.log(error, 'getTokensList Error');
        throw new Error(error);
    }
};

export { getTokensList };
