import FaucetJson from '../config/faucetTokens.json';

export const getNetworkFromChainId = (chainId) => {
    for (let chainName in FaucetJson.chains) {
        const chObj = FaucetJson.chains[chainName];
        if (chObj.chainId === chainId) {
            return chObj;
        }
    }
    return null;
};
