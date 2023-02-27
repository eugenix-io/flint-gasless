import Web3 from 'web3';
import FlintGaslessAbi from '../abis/FlintGasless.json';
import { getGaslessContractAddress } from '../injected/store/store';

const getContract = async () => {
    const web3 = new Web3(window.ethereum);
    return new web3.eth.Contract(
        FlintGaslessAbi,
        await getGaslessContractAddress()
    );
};

export const getName = async () => {
    let contract = await getContract();
    return await contract.methods.name().call();
};

export const getNonce = async (walletAddress) => {
    let contract = await getContract();
    return await contract.methods.nonces(walletAddress).call();
};

export const getGasFee = async () => {
    let contract = await getContract();
    return await contract?.methods?.gasForSwap().call();
};
