import { ethers } from 'ethers';
import axios from 'axios';
import Web3 from 'web3';
import tokenAbi from '../abis/ERC20.json';
import arbitrumABI from '../abis/ArbitrumABI.json';
import $ from 'jquery';

import {
    getCurrenyNetwork,
    getGaslessContractAddress,
} from '../injected/store/store';
import { getScanBaseUrl } from './scan';

export const getTokenBalance = async (
    tokenAddress,
    walletAddress,
    returnInLeastUnit = false
) => {
    try {
        const web3 = new Web3(window.ethereum);
        const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
        let bal = await tokenContract.methods.balanceOf(walletAddress).call();
        const bigNumber = ethers.toBigInt(bal);
        return bigNumber;
    } catch (err) {
        console.error('FAILED TO GET BALANCE - ', err);
        throw err;
    }
};

export const isTokenApproved = async (tokenAddress, walletAddress) => {
    try {
        console.log(tokenAddress, walletAddress, 'LOG+++++');
        const web3 = new Web3(window.ethereum);
        let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
        const add = await getGaslessContractAddress();
        console.log(add, 'CONT ADD');
        return await tokenContract.methods.allowance(walletAddress, add).call();
    } catch (err) {
        console.error('FAILED TO GET APPROVAL - ', err);
        throw err;
    }
};

export const getNonce = async (
    tokenAddress,
    walletAddress,
    arbitrum = false
) => {
    //update method to check if ABI has getNonce or nonces
    console.log('GETTING NONCE');
    const web3 = new Web3(window.ethereum);
    let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
    if (arbitrum) {
        tokenContract = new web3.eth.Contract(arbitrumABI, tokenAddress);
    }
    try {
        return await tokenContract.methods.getNonce(walletAddress).call();
    } catch (err) {
        //in case there is no getNonce function then try with this
        return await tokenContract.methods.nonces(walletAddress).call();
    }
};

export const getName = async (tokenAddress) => {
    //update method to check if ABI has getNonce or nonces
    console.log('GET NAME CALLED');
    const web3 = new Web3(window.ethereum);
    let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
    return await tokenContract.methods.name().call();
};

export const getVersion = async (tokenAddress) => {
    try {
        //update method to check if ABI has getNonce or nonces
        console.log('GET VERSION CALLED');
        const web3 = new Web3(window.ethereum);
        let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
        return await tokenContract.methods.version().call();
    } catch (err) {
        console.log('got this error in getting version - ', err);
        return '1';
    }
};

export const approve = async (tokenAddress, walletAddress) => {
    //update method to check if ABI has getNonce or nonces
    console.log(
        'APPROVE CALLED for token',
        tokenAddress,
        'wallet -',
        walletAddress
    );
    const web3 = new Web3(window.ethereum);
    let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
    console.log('THIS IS APPROVE AMOUNT - ', web3.utils.toWei('1000', 'ether'));
    const chainId = getCurrenyNetwork();
    let response = await axios.get(
        `https://${getScanBaseUrl(
            chainId
        )}/api?module=proxy&action=eth_gasPrice`
    );
    let gasPrice = Number(response.data.result);

    await tokenContract.methods
        .approve(
            await getGaslessContractAddress(),
            web3.utils.toWei('100000000000000', 'ether')
        )
        .send({
            from: walletAddress,
            gasPrice: gasPrice,
        });
    return;
};

export async function isTokenEligible(tokenAddress) {
    try {
        console.log('CHECKING IF TOKEN IS ELIGIBLE - ', tokenAddress);
        const chainId = getCurrenyNetwork();

        const sourceCodeResponse = await axios.get(
            `${process.env.REACT_APP_BACKEND_BASE_URL}/v1/scan/source-code?address=${tokenAddress}&chainId=${chainId}`
        );
        const sourceCode = sourceCodeResponse.data.result[0];

        console.log('got the source code', sourceCode);
        let implementationAddress = tokenAddress;

        if (sourceCode.Proxy == '1') {
            console.log(
                "it's an implementation with address",
                implementationAddress
            );
            implementationAddress = sourceCode.Implementation;
        }

        let promises = [
            getName(implementationAddress),
            axios.get(
                `${process.env.REACT_APP_BACKEND_BASE_URL}/v1/scan/abi?address=${implementationAddress}&chainId=${chainId}`
            ),
        ];
        const [name, tokenAbiResponse] = await Promise.all(promises);
        const abi = tokenAbiResponse.data.result;
        console.log('This is tokenAbi - ', abi);
        return {
            isEMT: isEMTContract(abi),
            isPermit: isPermitContract(abi),
            name: name,
        };
    } catch (err) {
        console.error(err, 'error in TOKEN ABI FETCH');
        return { isEMT: false };
    }
}

function isEMTContract(abi) {
    return abi.filter((obj) => obj.name == 'executeMetaTransaction').length > 0;
}

function isPermitContract(abi) {
    return abi.filter((obj) => obj.name == 'permit').length > 0;
}
