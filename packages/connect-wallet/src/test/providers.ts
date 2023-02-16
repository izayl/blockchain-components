import {providers} from 'ethers';

/**
 * Copied from @wagmi/chains.
 *
 * This is only temporary because Jest doesn't support ESM.
 * Perhaps we can consider Vitest?
 */
export const mainnet = {
  id: 1,
  network: 'homestead',
  name: 'Ethereum',
  nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
  rpcUrls: {
    alchemy: {
      http: ['https://eth-mainnet.g.alchemy.com/v2'],
      webSocket: ['wss://eth-mainnet.g.alchemy.com/v2'],
    },
    infura: {
      http: ['https://mainnet.infura.io/v3'],
      webSocket: ['wss://mainnet.infura.io/ws/v3'],
    },
    default: {
      http: ['https://cloudflare-eth.com'],
    },
    public: {
      http: ['https://cloudflare-eth.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensUniversalResolver: {
      address: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
      blockCreated: 16172161,
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14353601,
    },
  },
};

// These all get mocked inside of the fetchEns.test.ts file.
export const mainnetAlchemyProvider = new providers.AlchemyProvider(
  mainnet.network,
  'apiKey',
);

export const mainnetPublicProvider = new providers.StaticJsonRpcProvider(
  mainnet.rpcUrls.default.http[0],
  mainnet.network,
);

export const mainnetPublicFallbackProvider = new providers.FallbackProvider([
  mainnetPublicProvider,
  mainnetPublicProvider,
]);

export const mainnetMixedFallbackProvider = new providers.FallbackProvider([
  mainnetAlchemyProvider,
  mainnetPublicProvider,
]);
