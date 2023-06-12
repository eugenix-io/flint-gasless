export function getScanBaseUrl(chainId) {
    switch (chainId) {
        case 137:
            return 'api.polygonscan.com';
        case 42161:
            return 'api.arbiscan.io';
        case 1:
            return 'api.etherscan.io';
    }
}
