import axios from 'axios';

export const getAbi = async (address) => {
    const REACT_APP_POLYGON_SCAN_API_KEY = 'AHTISJJW688SHR3HYJQ3AF61B3DUY5NEQK';
    return await axios.get(
        `https://api.polygonscan.com/api?module=contract&action=getabi&address=${address}&apikey=${REACT_APP_POLYGON_SCAN_API_KEY}`
    );
};
