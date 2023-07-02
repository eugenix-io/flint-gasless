import { ethers } from 'ethers';

import { getInputData } from '../utils/extractInput';
import { getAbi } from '../utils/getAbi';

export const quickSwapDecoder = async (request) => {
    console.log('request to decode on sushiSwap', request);
    const data = request?.params[0]?.data;
    const toContractAddress = request?.params[0]?.to; //sushiswap in this case

    // ABI for QuickSwap swap function
    const abiTest = [
        'function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data)',
    ];

    // Create a new ethers.js instance
    const provider = new ethers.providers.JsonRpcProvider(
        'https://rpc-mainnet.maticvigil.com'
    );

    // Get the contract interface
    const iface = new ethers.utils.Interface(abiTest);

    // Decode input data
    const decodedData = iface.parseTransaction({ data: data });

    console.log('Decoded Input Data: testingggg', decodedData);

    return;
    // console.log(data, toContractAddress);
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

    // custom logic from here
    // try {
    //     const { amountIn, amountOutMin, route, to, tokenIn, tokenOut } =
    //         decodedInput;
    //     const message = {
    //         amountIn,
    //         amountOutMin,
    //         route,
    //         to,
    //         tokenIn,
    //         tokenOut,
    //     };
    //     return message;
    // } catch (error) {
    //     console.log('error while decoding input data for sushiswap', error);
    // }
};
