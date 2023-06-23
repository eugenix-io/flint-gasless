import axios from 'axios';
import { getAbi } from '../getAbi';
import { getInputData } from '../extractInput';
import { ethers } from 'ethers';
import { proxyToObject } from '../helperFunctions';

export const uniswapDecoder = async (request) => {
    console.log('request to decode', request);
    const data = request?.params[0].data;
    const toContractAddress = request?.params[0].to; //uniswap in this case
    // console.log(data, toContractAddress);

    const abiData = await getAbi(toContractAddress);
    const abi = JSON.parse(abiData.data.result);
    const { decodedInput, functionData } = await getInputData({ data, abi });
    console.log('DECODED INFO', decodedInput, functionData, toContractAddress);

    try {
        const inputs = decodedInput.inputs;
        // console.log('DATA DECODED INPUTS', inputs);
        let abiCode = new ethers.AbiCoder();
        let types = ['address', 'uint256', 'uint256', 'bytes', 'bool'];
        // decoding first input for approve
        // let decoded1 = abiCode.decode(types, inputs[0][0]);
        // console.log('using index0', decoded1);
        let decodeed;
        if (inputs[0][1]) {
            decodeed = abiCode.decode(types, inputs[0][1]);
        } else {
            decodeed = abiCode.decode(types, inputs[0][0]);
        }
        decodeed = proxyToObject(decodeed);
        decodeed = JSON.parse(
            JSON.stringify(
                decodeed,
                (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value // return everything else unchanged
            )
        );

        console.log('proxy converted to input object', decodeed);

        // console.log(decodeed[0][0], 'DATA DECODED address'); // dont use this its in uniswap's convention
        console.log(decodeed[0][1], ' DECODED amount in');
        console.log(decodeed[0][2], ' DECODED min amount out');
        const { path, feesArr } = extractPathFromV3(decodeed[0][3]);
        console.log(path, feesArr, ' DECODED path and fees');
        console.log(decodeed[0][4], ' DECODED pay is user');

        const swapState = {
            amountIn: String(decodeed[0][1]),
            // routes: extractPathFromV3(decodeed[0][3]),
            fromToken: path[0],
            toToken: path[path.length - 1],
            tokenArray: path,
            feeArr: feesArr,
        };
        return swapState;
    } catch (error) {
        console.log(error, 'DATA DECODED ERROR');
    }
};

function extractPathFromV3(fullPath, reverse = false) {
    const fullPathWithoutHexSymbol = fullPath.substring(2);
    let path = [];
    let currentAddress = '';
    let feesArr = [];
    // console.log('fullpath', fullPath);
    for (let i = 0; i < fullPathWithoutHexSymbol.length; i++) {
        currentAddress += fullPathWithoutHexSymbol[i];
        if (currentAddress.length === 40) {
            path.push('0x' + currentAddress);
            let tempFees = fullPathWithoutHexSymbol.substring(i + 1, i + 7); // this will be in hexadecimal
            if (tempFees) {
                tempFees = parseInt(tempFees, 16);
                console.log(i, 'fee in between', tempFees, typeof tempFees);
                // fees += tempFees;
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
