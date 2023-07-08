import { ethers } from 'ethers';
import { proxyToObject } from './helperFunctions';

export const getInputData = async ({ data, abi, quickSwap = false }) => {
    try {
        console.log('is quick swap', quickSwap);
        // console.log('data and abi to decode', data, abi);
        let decodedRequest;

        try {
            const abiInterface = new ethers.Interface(abi);
            // console.log('abiInterface', abiInterface);
            decodedRequest = await abiInterface.parseTransaction({
                data: data,
            });

            console.log('decoderd request data', decodedRequest);
        } catch (error) {
            console.log('decoding request failed', error);
        }
        // console.log('decoded args', decodedRequest.args);

        let decodedInput = proxyToObject(decodedRequest.args);
        // console.log('converted proxy object', decodedInput);
        decodedInput = JSON.parse(
            JSON.stringify(
                decodedInput,
                (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value // return everything else unchanged
            )
        );
        console.log('removed bigint', decodedInput);
        // decodedInput = decodedInput.data;
        let functionData = decodedRequest.fragment;

        return { decodedInput, functionData };
    } catch (err) {
        console.error('failed to decode with err - DATA DECODED', err);
        return { failedDecode: true };
    }
};
