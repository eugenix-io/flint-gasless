import { ethers } from 'ethers';

export const getInputData = ({ data, abi }) => {
    // console.log(data, abi, 'DATA DECODED');
    try {
        const abiInterface = new ethers.Interface(abi);
        const decodedRequest = abiInterface.parseTransaction({ data: data });

        // Process the decoded input data as per your requirements
        console.log('decoded request look like', decodedRequest);
        console.log('decode args proxy object', decodedRequest.args);
        // console.log('decode function data look like', decodedRequest.fragment);

        // let contractInterface = new ethers.Interface(abi);
        // let decodedArgumentsProxy = contractInterface.decodeFunctionData(
        //     data.substring(0, 10),
        //     data
        // );
        // console.log('decodedArgumentsProxy', decodedArgumentsProxy);

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
        console.log('function data in the request', functionData);

        // console.log('this is the decoded input - DATA DECODED', decodedInput);
        // functionData.inputs.forEach((param, index) => {
        //     decodedInput[param.name] = decodedArguments[index];
        // });
        // console.log('This is the final abi - DATA DECODED', abi);
        return { abi, decodedInput, functionData };
    } catch (err) {
        console.error('failed to decode with err - DATA DECODED', err);
        return { failedDecode: true };
    }
};

const proxyToObject = (proxy) => {
    // console.log('this is proxy - ', proxy);
    let data;
    try {
        data = proxy.toObject();
        if (Object.entries(data).length == 1 && data['_'] != undefined) {
            throw "it's an array";
        }
    } catch (err) {
        // array inputs cannot be converted to objects
        return proxy.toArray();
    }
    Object.entries(data).map(([key, value]) => {
        if (typeof value == 'object' && typeof value.toObject == 'function') {
            data[key] = proxyToObject(value);
        }
    });
    return data;
};
