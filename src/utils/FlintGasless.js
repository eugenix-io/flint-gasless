import Web3 from "web3";
import FlintGaslessAbi from '../abis/FlintGasless.json';


export const getName = async () => {
    const web3 = new Web3(window.ethereum);
    let contract = new web3.eth.Contract(FlintGaslessAbi, process.env.REACT_APP_GASLESS_CONTRACT_ADDRESS);
    return await contract.methods.name().call();
}

export const getNonce = async (walletAddress) => {
    const web3 = new Web3(window.ethereum);
    let contract = new web3.eth.Contract(FlintGaslessAbi, process.env.REACT_APP_GASLESS_CONTRACT_ADDRESS);
    return await contract.methods.nonces(walletAddress).call();
}