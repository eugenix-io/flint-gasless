import { ethers } from 'ethers';
import { getSourceCode } from './scan';
import SushiRouteProcessorAbi from '../abis/sushiRouteProcessor.json';
import { formatEIP721SignSushiSwap } from './signature';
import { getWalletAddress } from '../injected/flintButtonState';

const domainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'verifyingContract', type: 'address' },
    { name: 'salt', type: 'bytes32' },
];

export const getInputDataWithoutAbi = async ({ to, data, network }) => {
    let sourceCode = (await getSourceCode(network, to))[0];
    let abiString;
    console.log('this is source code  - ', sourceCode);
    if (sourceCode.Proxy == '1') {
        console.log("Its's an implementation contract");
        let implementationSourceCode = (
            await getSourceCode(network, sourceCode.Implementation)
        )[0];
        abiString = implementationSourceCode.ABI;
    } else {
        abiString = sourceCode.ABI;
    }
    if (!abiString) {
        return { abi: false };
    }
    let abi = JSON.parse(abiString);
    return { ...getInputData({ data, abi }), abi };
};

export const transformInputDataForFlint = async (request) => {
    const { decodedInput, functionData } = getInputData({
        data: request?.params[0].data,
        abi: SushiRouteProcessorAbi,
    });

    // Make EIP-721 format and send eth sign to metamask
    const { amountIn, amountOutMin, route, to, tokenIn, tokenOut } =
        decodedInput;
    const message = {
        amountIn,
        amountOutMin,
        route,
        to,
        tokenIn,
        tokenOut
    };

    const dataToSign = await formatEIP721SignSushiSwap(message);

    const dataForProviderWallet = [
        getWalletAddress(),
        JSON.stringify(dataToSign),
    ];

    console.log('Returning this data...', data);

    return  { dataForProviderWallet, messageParams: message };
};

export const getInputData = ({ data, abi }) => {
    console.log(data, abi, 'Inside getInputData');
    try {
        let contractInterface = new ethers.Interface(abi);
        let decodedArgumentsProxy = contractInterface.decodeFunctionData(
            data.substring(0, 10),
            data
        );

        let decodedInput = proxyToObject(decodedArgumentsProxy);
        decodedInput = JSON.parse(
            JSON.stringify(
                decodedInput,
                (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value // return everything else unchanged
            )
        );
        let functionData = contractInterface.getFunction(data.substring(0, 10));

        console.log('this is the decoded input - ', decodedInput);
        // functionData.inputs.forEach((param, index) => {
        //     decodedInput[param.name] = decodedArguments[index];
        // });
        console.log('This is the final abi - ', abi);
        return { abi, decodedInput, functionData };
    } catch (err) {
        console.error('failed to decode with err - ', err);
        return { failedDecode: true };
    }
};

const proxyToObject = (proxy) => {
    console.log('this is proxy - ', proxy);
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
