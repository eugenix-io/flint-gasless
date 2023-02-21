import Web3 from "web3";
import tokenAbi from '../abis/ERC20.json';

export const isTokenApproved = async (tokenAddress, walletAddress) => {
    console.log("CHECKING IF TOKEN IS APPROVED!");
    const web3 = new Web3(window.ethereum);
    let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
    return await tokenContract.methods.allowance(walletAddress, process.env.REACT_APP_GASLESS_CONTRACT_ADDRESS).call();;
}