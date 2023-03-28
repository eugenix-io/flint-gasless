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

const POLYGONSCAN_API_KEY = 'DDZ33H8RZYENMTDX5KCM67FW1HBJD5CRUC';

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
        // const decimals = await tokenContract.methods.decimals().call();
        // console.log('BEFORE DIVIDE', bal, bigNumber / 10 ** decimals);
        // if (!returnInLeastUnit) {
        //     bal = bal / 10 ** decimals;
        // }
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
    let response = await axios.get(
        `https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice&apikey=${POLYGONSCAN_API_KEY}`
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

    // try {
    //     await tokenContract.methods
    //         .approve(
    //             await getGaslessContractAddress(),
    //             web3.utils.toWei('100000000000000', 'ether')
    //         )
    //         .send({
    //             from: walletAddress,
    //             gasPrice: gasPrice,
    //         });
    // } catch (error) {
    //     console.log('APPROVE ERROR', error);
    // }
    return;
};

export async function isTokenEligible(tokenAddress) {
    try {
        console.log('CHECKING IF TOKEN IS ELIGIBLE - ', tokenAddress);
        const chainId = getCurrenyNetwork();
        let tokenResult = await axios.get(
            chainId == 137
                ? `https://api.polygonscan.com/api?module=contract&action=getabi&address=${tokenAddress}&apikey=${POLYGONSCAN_API_KEY}`
                : `https://api.arbiscan.io/api?module=contract&action=getabi&address=${tokenAddress}&apikey=9Y8HRFVU5396NM63YQ8P2Y1K49DTC9H1MW`
        );
        let tokenAbi = JSON.parse(tokenResult.data.result);
        let implementationExists =
            tokenAbi.filter((obj) => obj.name == 'implementation').length > 0;

        const web3 = new Web3(window.ethereum);
        console.log(implementationExists, 'implementationExists');

        //if not an implem
        if (implementationExists) {
            console.log(chainId);
            let proxyContract = new web3.eth.Contract(tokenAbi, tokenAddress);
            let implementationAddress;
            try {
                implementationAddress = await proxyContract.methods
                    .implementation()
                    .call();
            } catch (error) {
                console.log('error me aaya', error);
                const web3 = new Web3(window.ethereum);

                const hexAddressCode = await web3.eth.getStorageAt(
                    tokenAddress,
                    '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
                );

                console.log(hexAddressCode, 'hexAddressCode');

                implementationAddress =
                    '0x' + hexAddressCode.substring(26, hexAddressCode.length);
            }
            console.log(implementationAddress, 'implementationAddress');
            let implementationResult = await axios.get(
                chainId == 137
                    ? `https://api.polygonscan.com/api?module=contract&action=getabi&address=${implementationAddress}&apikey=${POLYGONSCAN_API_KEY}`
                    : `https://api.arbiscan.io/api?module=contract&action=getabi&address=${implementationAddress}&apikey=9Y8HRFVU5396NM63YQ8P2Y1K49DTC9H1MW`
            );
            console.log(implementationResult, 'implementationResult');
            tokenAbi = JSON.parse(implementationResult.data.result);
        }
        //passing tokenAddress instead of implementationAddress as they can have different names
        let name = await getName(tokenAddress);
        console.log('THIS IS TOKEN ABI - ', tokenAbi);
        return {
            isEMT: isEMTContract(tokenAbi),
            isPermit: isPermitContract(tokenAbi),
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
