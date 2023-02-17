const { ethers, Contract } = require('ethers');
const axios = require('axios');

const POLYGONSCAN_API_KEY = "DDZ33H8RZYENMTDX5KCM67FW1HBJD5CRUC";

export default async function isTokenEligible(tokenAddress) {
    try {
        let tokenResult = await axios.get(`https://api.polygonscan.com/api?module=contract&action=getabi&address=${tokenAddress}&apikey=${POLYGONSCAN_API_KEY}`);
        let tokenAbi = JSON.parse(tokenResult.data.result);
        let implementationExists = tokenAbi.filter((obj) => obj.name == 'implementation').length > 0;

        //CHANGE THIS CODE
        let provider = new ethers.JsonRpcProvider('https://polygon-mainnet.g.alchemy.com/v2/OUyLer3Ubv9iwexAqckuwyPtJ_KczKRD');
        //CHANGE THIS CODE

        //if not an implem
        if (implementationExists) {
            let proxyContract = await new ethers.Contract(tokenAddress, tokenAbi, provider);
            let implementationAddress = await proxyContract.implementation();
            let implementationResult = await axios.get(`https://api.polygonscan.com/api?module=contract&action=getabi&address=${implementationAddress}&apikey=${POLYGONSCAN_API_KEY}`);
            tokenAbi = JSON.parse(implementationResult.data.result);
        }



        let isEMT = isEMTContract(tokenAbi);
        if (!isEMT) {
            return { isEMT: false };
        }

        //passing tokenAddress instead of implementationAddress as they can have different names
        let name = await getContractName(tokenAddress, tokenAbi, provider);
        return {
            isEMT: true,
            name: name
        };
    } catch (err) {
        console.error(err);
        return { isEMT: false };
    }

}

function isEMTContract(abi) {
    return abi.filter((obj) => obj.name == 'executeMetaTransaction').length > 0
}

async function getContractName(tokenAddress, tokenAbi, provider) {
    let proxyContract = await new ethers.Contract(tokenAddress, tokenAbi, provider);
    return await proxyContract.name();
}