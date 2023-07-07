import { getInputData } from '../utils/extractInput';
import { getAbi } from '../utils/getAbi';

export const sushiSwapDecoder = async (request) => {
    // console.log('request to decode on sushiSwap', request);
    const data = request?.params[0]?.data;
    const toContractAddress = request?.params[0]?.to; //sushiswap in this case
    // console.log(data, toContractAddress);

    const abiData = await getAbi(toContractAddress);
    const abi = JSON.parse(abiData.data.result);

    const { decodedInput, functionData } = await getInputData({ data, abi });
    // console.log('DECODED INFO', decodedInput, functionData, toContractAddress);

    // custom logic from here
    try {
        const { amountIn, amountOutMin, route, to, tokenIn, tokenOut } =
            decodedInput;
        const message = {
            amountIn,
            amountOutMin,
            route,
            to,
            tokenIn,
            tokenOut,
        };
        return message;
    } catch (error) {
        console.log('error while decoding input data for sushiswap', error);
    }
};
