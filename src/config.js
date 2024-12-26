const contractPerNetwork = {
  mainnet: ' ',
  testnet: 'near-ign-nft.testnet',
};

const oraclePrice = {
  mainnet: ' ',
  testnet: 'priceoracle.testnet'
}

// Chains for EVM Wallets 
const evmWalletChains = {
  mainnet: {
    chainId: 397,
    name: "Near Mainnet",
    explorer: "https://eth-explorer.near.org",
    rpc: "https://eth-rpc.mainnet.near.org",
  },
  testnet: {
    chainId: 398,
    name: "Near Testnet",
    explorer: "https://eth-explorer-testnet.near.org",
    rpc: "https://eth-rpc.testnet.near.org",
  },
}

export const NetworkId = 'testnet';
export const NftNearContract = contractPerNetwork[NetworkId];
export const PriceOracle = oraclePrice[NetworkId];
export const EVMWalletChain = evmWalletChains[NetworkId];