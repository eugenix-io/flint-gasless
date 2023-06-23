import Web3 from 'web3';

export const proxyToObject = (proxy) => {
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

export const getSignatureParameters = (signature) => {
    if (!Web3.utils.isHexStrict(signature)) {
        throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
        );
    }
    var r = signature.slice(0, 66);
    var s = '0x'.concat(signature.slice(66, 130));
    var v = '0x'.concat(signature.slice(130, 132));
    v = Web3.utils.hexToNumber(v);
    if (![27, 28].includes(v)) v += 27;
    return {
        r: r,
        s: s,
        v: v,
    };
};

export async function getSignature({
    walletAddress,
    message,
    messageType,
    domainType,
    domainData,
}) {
    const dataToSign = {
        types: {
            EIP712Domain: domainType,
        },
        domain: domainData,
        primaryType: messageType.name,
        message: message,
    };

    dataToSign.types[messageType.name] = messageType.types;

    console.log('This is data to sign - ', dataToSign);

    const signature = await ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [walletAddress, JSON.stringify(dataToSign)],
    });

    return getSignatureParameters(signature);
}

export async function getChainId() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    let network = await provider.getNetwork();
    return parseInt(network.chainId);
}
