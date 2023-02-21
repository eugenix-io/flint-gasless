import ethers from 'ethers';
import axios from "axios";
import Web3 from "web3";
import tokenAbi from '../abis/ERC20.json';

const POLYGONSCAN_API_KEY = "DDZ33H8RZYENMTDX5KCM67FW1HBJD5CRUC";

export const isTokenApproved = async (tokenAddress, walletAddress) => {
    console.log("CHECKING IF TOKEN IS APPROVED!");
    const web3 = new Web3(window.ethereum);
    let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
    return await tokenContract.methods.allowance(walletAddress, process.env.REACT_APP_GASLESS_CONTRACT_ADDRESS).call();;
}

export const getNonce = async (tokenAddress, walletAddress) => {
    //update method to check if ABI has getNonce or nonces
    console.log("CHECKING IF TOKEN IS APPROVED!");
    const web3 = new Web3(window.ethereum);
    let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
    try {
        return await tokenContract.methods.getNonce(walletAddress).call();
    } catch (err) {
        //in case there is no getNonce function then try with this
        return await tokenContract.methods.nonces(walletAddress).call();
    }

}

export const getName = async (tokenAddress) => {
    //update method to check if ABI has getNonce or nonces
    console.log("CHECKING IF TOKEN IS APPROVED!");
    const web3 = new Web3(window.ethereum);
    let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
    return await tokenContract.methods.name().call();
}

export async function isTokenEligible(tokenAddress) {
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
