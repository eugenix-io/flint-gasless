import { ethers } from 'ethers';
import { proxyToObject } from './helperFunctions';

export const getInputData = async ({ data, abi }) => {
    // console.log(data, abi, 'DATA DECODED');
    try {
        // console.log('data and abi to decode', data, abi);
        let decodedRequest;

        // Process the decoded input data as per your requirements
        // console.log('decoded request look like', decodedRequest);
        // console.log('decode args proxy object', decodedRequest.args);
        // console.log('decode function data look like', decodedRequest.fragment);
        try {
            const abiInterface = new ethers.Interface(abi);
            // console.log('abiInterface', abiInterface);
            decodedRequest = abiInterface.parseTransaction({ data: data });
            // let contractInterface = new ethers.Interface(abi);
            // let decodedArgumentsProxy = contractInterface.decodeFunctionData(
            //     data.substring(0, 10),
            //     data
            // );
            // console.log('decodedArgumentsProxy', decodedRequest);
        } catch (error) {
            console.log('decoding request failed', error);
        }

        let decodedInput = proxyToObject(decodedRequest.args);
        decodedInput = JSON.parse(
            JSON.stringify(
                decodedInput,
                (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value // return everything else unchanged
            )
        );
        // let functionData = contractInterface.getFunction(data.substring(0, 10));
        let functionData = decodedRequest.fragment;
        // console.log('function data in the request', functionData);

        // console.log('this is the decoded input - DATA DECODED', decodedInput);
        // functionData.inputs.forEach((param, index) => {
        //     decodedInput[param.name] = decodedArguments[index];
        // });
        // console.log('This is the final abi - DATA DECODED', abi);
        return { decodedInput, functionData };
    } catch (err) {
        console.error('failed to decode with err - DATA DECODED', err);
        return { failedDecode: true };
    }
};
