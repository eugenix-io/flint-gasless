import { ethers } from 'ethers';
import { getSourceCode } from './scan';
import SushiRouteProcessorAbi from '../abis/sushiRouteProcessor.json';
import { signSushiSwap } from './signature';

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

export const transformInputDataForFlint = (request) => {
    console.log(request, 'transformInputDataForFlint');
    /* request: {
        chainId: 0x89,
        id: 'sddsa-sda1232-dsada-12313',
        state: "intercepted",
        walletMessage: {
            method: "eth_sendTransaction",
            params: [
                {
                    data: '0xkjdjbakjdbjkbkewjbk...ijskna909',
                    from: '0xasda9029231..233nk',
                    gas: '232412',
                    to: 'contract_address'

                }
            ]
        }
    }
    */
   const { decodedInput, functionData } = getInputData({ data: request?.params[0].data, abi: SushiRouteProcessorAbi });
   console.log(decodedInput, 'Decoded input...$$$');

   /*
        DecodedInput
        amountIn: "400000"
        amountOutMin: "1298"
        route: 
            "0x0301d02b870c556480491c70aaf98c297fddd93f6f5c0000000000000000000000000000000000000000000000000000000000061a800ad02b870c556480491c70aaf98c297fddd93f6f5c2791bca1f2de4661ed88a30c99a7a9449aa8417400d7c9f3b280d4690c3232469f3bcb4361632bfc77"
        to: "0xd7C9F3b280D4690C3232469F3BCb4361632bfC77"
        tokenIn: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
        tokenOut: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"
   */

    
    // Make EIP-721 format and send eth sign to metamask
    const { amountIn, amountOutMin, route, to, tokenIn, tokenOut } = decodedInput;
    const message = {
        amountIn,
        amountOutMin,
        route,
        to,
        tokenIn,
        tokenOut,
        nonce: 0
    };

    const dataToSign = signSushiSwap(message);

    return dataToSign;

}

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
