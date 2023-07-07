import { AbiCoder, ethers } from 'ethers';
import Web3 from 'web3';
import { getInputData } from '../utils/extractInput';
import { getAbi } from '../utils/getAbi';

export const quickSwapDecoder = async (request) => {
    console.log('request to decode on quicswap', request);
    const data = request?.params[0]?.data;
    // const toContractAddress = request?.params[0]?.to; //sushiswap in this case
    const toContractAddress = '0x369f8f07b90d5cb64c9cff3ec6dffa2f9a193985'; // this is quickswaps implementation contract address

    let abiData;
    try {
        abiData = await getAbi(toContractAddress);
    } catch (error) {
        console.log('failed to fetch abi of the swapper contract', error);
    }

    const abi = JSON.parse(abiData.data.result);

    const { decodedInput, functionData } = await getInputData({ data, abi });
    console.log('DECODED INFO', decodedInput, functionData, toContractAddress);
    console.log('done extracting input for quick swap');
    
};
