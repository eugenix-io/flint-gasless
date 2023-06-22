import axios from 'axios';

export const getAbi = async (address) => {
    const uniswapAddress = '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad';
    const REACT_APP_POLYGON_SCAN_API_KEY = 'AHTISJJW688SHR3HYJQ3AF61B3DUY5NEQK';
    let res;
    try {
        res = await axios.get(
            `https://api.polygonscan.com/api?module=contract&action=getabi&address=${address}&apikey=${REACT_APP_POLYGON_SCAN_API_KEY}`
        );
        return res;
    } catch (error) {
        console.log('error fetching abi', error);
    }
};
