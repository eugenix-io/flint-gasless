import axios from 'axios';
import { getAbi } from '../utils/getAbi';
import { getInputData } from '../utils/extractInput';
import { ethers } from 'ethers';
import { proxyToObject } from '../utils/helperFunctions';

export const uniswapDecoder = async (request) => {
    // console.log('request to decode on uniswap', request);
    const data = request?.params[0]?.data;
    const toContractAddress = request?.params[0]?.to; //uniswap in this case

    const abiData = await getAbi(toContractAddress);
    const abi = JSON.parse(abiData.data.result);
    const { decodedInput, functionData } = await getInputData({ data, abi });
    // console.log('DECODED INFO', decodedInput, functionData, toContractAddress);

    try {
        const inputs = decodedInput.inputs;
        let abiCode = new ethers.AbiCoder();
        let types = ['address', 'uint256', 'uint256', 'bytes', 'bool']; // uniswap exactSwap function arg data types

        let decodeed = null;
        let toTokenNative = false;
        if (decodedInput?.commands?.endsWith('0c')) {
            // command 0x000c i.e. last two chars are "0c"
            // this means tokenOut is Native and uniswap will perform two steps internally
            // in this case input[0][0] is relevant;
            // decodeed = abiCode.decode(types, inputs[0][0]);
            console.log('token out is native native ');
            toTokenNative = true;
        }

        try {
            decodeed = abiCode.decode(types, inputs[0][0]);
            console.log('decoded [0][0]', decodeed);
        } catch (error) {
            console.log('error with decoding [0][0]');
            decodeed = abiCode.decode(types, inputs[0][1]);
            console.log('decoded [0][1]', decodeed);
        }

        decodeed = proxyToObject(decodeed);
        decodeed = JSON.parse(
            JSON.stringify(
                decodeed,
                (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value // return everything else unchanged
            )
        );

        // console.log('proxy converted to input object', decodeed);

        const { path, feesArr } = extractPathFromV3(decodeed[0][3]);

        const swapState = {
            amountIn: String(decodeed[0][1]),
            // routes: extractPathFromV3(decodeed[0][3]),
            fromToken: path[0],
            toToken: path[path.length - 1],
            tokenArray: path,
            feeArr: feesArr,
        };
        return { swapState, toTokenNative };
    } catch (error) {
        console.log('error decoding uniswap request', error);
    }
};

function extractPathFromV3(fullPath, reverse = false) {
    const fullPathWithoutHexSymbol = fullPath.substring(2);
    let path = [];
    let currentAddress = '';
    let feesArr = [];
    for (let i = 0; i < fullPathWithoutHexSymbol.length; i++) {
        currentAddress += fullPathWithoutHexSymbol[i];
        if (currentAddress.length === 40) {
            path.push('0x' + currentAddress);
            let tempFees = fullPathWithoutHexSymbol.substring(i + 1, i + 7); // this will be in hexadecimal
            if (tempFees) {
                tempFees = parseInt(tempFees, 16);
                console.log(i, 'fee in between', tempFees, typeof tempFees);
                feesArr.push(String(tempFees));
            }

            i = i + 6;
            console.log('current address', currentAddress);
            currentAddress = '';
        }
    }
    if (reverse) {
        return path.reverse();
    }
    return { path, feesArr };
}
