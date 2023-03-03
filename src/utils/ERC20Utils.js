import ethers from 'ethers';
import axios from 'axios';
import Web3 from 'web3';
import tokenAbi from '../abis/ERC20.json';
import { getGaslessContractAddress } from '../injected/store/store';

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
        const decimals = await tokenContract.methods.decimals().call();
        if (!returnInLeastUnit) {
            bal = bal / 10 ** decimals;
        }
        return bal;
    } catch (err) {
        console.error('FAILED TO GET BALANCE - ', err);
        throw err;
    }
};

export const isTokenApproved = async (tokenAddress, walletAddress) => {
    try {
        const web3 = new Web3(window.ethereum);
        let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
        return await tokenContract.methods
            .allowance(walletAddress, await getGaslessContractAddress())
            .call();
    } catch (err) {
        console.error('FAILED TO GET APPROVAL - ', err);
        throw err;
    }
};

export const getNonce = async (tokenAddress, walletAddress) => {
    //update method to check if ABI has getNonce or nonces
    console.log('CHECKING IF TOKEN IS APPROVED!');
    const web3 = new Web3(window.ethereum);
    let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
    try {
        return await tokenContract.methods.getNonce(walletAddress).call();
    } catch (err) {
        //in case there is no getNonce function then try with this
        return await tokenContract.methods.nonces(walletAddress).call();
    }
};

export const getName = async (tokenAddress) => {
    //update method to check if ABI has getNonce or nonces
    console.log('CHECKING IF TOKEN IS APPROVED!');
    const web3 = new Web3(window.ethereum);
    let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
    return await tokenContract.methods.name().call();
};

export const approve = async (tokenAddress, walletAddress) => {
    //update method to check if ABI has getNonce or nonces
    console.log('CHECKING IF TOKEN IS APPROVED!');
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
    return;
};

export async function isTokenEligible(tokenAddress) {
    try {
        console.log('CHECKING IF TOKEN IS ELIGIBLE - ', tokenAddress);
        let tokenResult = await axios.get(
            `https://api.polygonscan.com/api?module=contract&action=getabi&address=${tokenAddress}&apikey=${POLYGONSCAN_API_KEY}`
        );
        let tokenAbi = JSON.parse(tokenResult.data.result);
        let implementationExists =
            tokenAbi.filter((obj) => obj.name == 'implementation').length > 0;

        const web3 = new Web3(window.ethereum);

        //if not an implem
        if (implementationExists) {
            let proxyContract = new web3.eth.Contract(tokenAbi, tokenAddress);
            let implementationAddress = await proxyContract.methods
                .implementation()
                .call();
            let implementationResult = await axios.get(
                `https://api.polygonscan.com/api?module=contract&action=getabi&address=${implementationAddress}&apikey=${POLYGONSCAN_API_KEY}`
            );
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
        console.error(err);
        return { isEMT: false };
    }
}

function isEMTContract(abi) {
    return abi.filter((obj) => obj.name == 'executeMetaTransaction').length > 0;
}

function isPermitContract(abi) {
    return abi.filter((obj) => obj.name == 'permit').length > 0;
}
