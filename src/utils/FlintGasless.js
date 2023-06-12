import Web3 from 'web3';
import FlintGaslessAbi from '../abis/FlintGasless.json';
import {
    getCurrenyNetwork,
    getGaslessContractAddress,
} from '../injected/store/store';

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

export const getApprovalNonce = async (walletAddress) => {
    let contract = await getContract();
    return await contract.methods.approvalNonces(walletAddress).call();
};

export const getGasForApproval = async () => {
    let contract = await getContract();
    let result = await contract.methods.gasForApproval().call();
    console.log('check these oiginal gas for approval - ', result);
    if (
        getCurrenyNetwork() == 42161 &&
        (await getGaslessContractAddress()) ==
            '0x7474C9aC41eebbFF50De56cbAB2c7E8999746598'
    ) {
        // TODO if result is <= 10 javascript put e- 
        // return 1/10^8
        //hardcoding this because there was a bug in this contract because of which gasForApproval was set to a higher values (normal value * gas price)
        return String(result / 10 ** 8);
    }
    return result;
};

export const getGasFee = async () => {
    let contract = await getContract();
    return await contract?.methods?.gasForSwap().call();
};
