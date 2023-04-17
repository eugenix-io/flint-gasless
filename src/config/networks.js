const NETWORK_CONFIG = {
    polygon: {
        name: 'Polygon',
        chainId: 137,
        confirmations: 125,
        scanBaseUrl: 'api.polygonscan.com',
        scanApiKey: process.env.REACT_APP_POLYGON_SCAN_API_KEY,
        coingeckoGasTokenId: 'matic-network',
        bridgeAddress: '0x9632b2A066b95A1521a8774F7367882681C6ACF1',
        image: 'https://polygon-mainnet.g.alchemy.com/v2/seIUYsCMXIFGP8u8qjq-LtPI4Sw3Tl9q',
    },
    arbitrum: {
        name: 'Arbitrum',
        chainId: 42161,
        confirmations: 100,
        scanBaseUrl: 'api.arbiscan.io',
        scanApiKey: process.env.REACT_APP_ABITRRUM_SCAN_API_KEY,
        coingeckoGasTokenId: 'ethereum',
        bridgeAddress: '0x60b4c2297Ae8697867FC8B1c125309328c40785e',
        image: 'https://dnj9s9rkg1f49.cloudfront.net/arbitrum_logo.png',
        providerUrl:
            'https://arb-mainnet.g.alchemy.com/v2/FP37WY4jCMrefI6h4KOoa8tJXj_ws2BM',
    },
    optimism: {
        name: 'Optimism',
        chainId: 10,
        confirmations: 99,
        scanBaseUrl: 'api-optimistic.etherscan.io',
        scanApiKey: process.env.REACT_APP_OPTIMISM_SCAN_API_KEY,
        coingeckoGasTokenId: 'ethereum',
        bridgeAddress: '0x449B2234171568Ddea2420cc88cc758BFFb42266',
        image: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png?1660904599',
        providerUrl:
            'https://opt-mainnet.g.alchemy.com/v2/VhCTrcWFmGjh36BYJhJG-4OOS0dkZ2m6',
    },
    ethereum: {
        name: 'Ethereum',
        chainId: 1,
        confirmations: 12,
        scanBaseUrl: 'api.etherscan.io',
        scanApiKey: process.env.REACT_APP_ETHEREUM_SCAN_API_KEY,
        coingeckoGasTokenId: 'ethereum',
        bridgeAddress: '0x30dB69bdB6fB730438C5f02Ed6adCC5FDc8bd9Ca',
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
        providerUrl:
            'https://eth-mainnet.g.alchemy.com/v2/02hEsLUgS7ViaOoaEWm8xV1tAmNTs7M5',
    },
};

export default NETWORK_CONFIG;
