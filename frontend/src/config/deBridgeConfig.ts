// deBridge configuration for cross-chain payments and asset licensing
// Based on official deBridge documentation: https://docs.debridge.finance/
export const DEBRIDGE_CONFIG = {
  // deBridge API endpoints
  DEBRIDGE_API_URL: 'https://stats-api.dln.trade/api',
  DEBRIDGE_EXPLORER_URL: 'https://explorer.dln.trade',
  DLN_API_URL: 'https://dln.debridge.finance/v1.0/dln/order/create-tx',
  
  // Environment configuration
  ENVIRONMENT: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT || 'testnet',
  
  // deBridge contract addresses (same across all supported chains)
  CONTRACTS: {
    DEBRIDGE_GATE: '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA',
    DLN_SOURCE: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
    DLN_DESTINATION: '0xe7351fd770a37282b91d153ee690b63579d6dd7f',
    CALL_PROXY: '0x8a0C79F5532f3b2a16AD1E4282A5DAF81928a824',
    SIGNATURE_VERIFIER: '0x949b3B3c098348b879C9e4F15cecc8046d9C8A8c',
  },
  
  // All officially supported deBridge chains with native fees
  SUPPORTED_CHAINS: [
    // Testnet chains (enabled when ENVIRONMENT is testnet)
    {
      chainId: 11155111,
      name: 'Ethereum Sepolia',
      currency: 'ETH',
      nativeFee: '0.001', // 0.001 ETH
      blockFinality: 12,
      rpcUrl: 'https://sepolia.llamarpc.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT !== 'mainnet',
      isTestnet: true,
    },
    {
      chainId: 421614,
      name: 'Arbitrum Sepolia',
      currency: 'ETH',
      nativeFee: '0.001', // 0.001 ETH
      blockFinality: 12,
      rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT !== 'mainnet',
      isTestnet: true,
    },
    {
      chainId: 80002,
      name: 'Polygon Amoy',
      currency: 'MATIC',
      nativeFee: '0.5', // 0.5 MATIC
      blockFinality: 256,
      rpcUrl: 'https://rpc-amoy.polygon.technology',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT !== 'mainnet',
      isTestnet: true,
    },
    {
      chainId: 11155420,
      name: 'Optimism Sepolia',
      currency: 'ETH',
      nativeFee: '0.001', // 0.001 ETH
      blockFinality: 12,
      rpcUrl: 'https://sepolia.optimism.io',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT !== 'mainnet',
      isTestnet: true,
    },
    {
      chainId: 84532,
      name: 'Base Sepolia',
      currency: 'ETH',
      nativeFee: '0.001', // 0.001 ETH
      blockFinality: 12,
      rpcUrl: 'https://sepolia.base.org',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT !== 'mainnet',
      isTestnet: true,
    },
    {
      chainId: 1315,
      name: 'Story Aeneid Testnet',
      currency: 'IP',
      nativeFee: '0.01', // 0.01 IP
      blockFinality: 12,
      rpcUrl: 'https://aeneid.storyrpc.io',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT !== 'mainnet',
      isTestnet: true,
    },
    // Mainnet chains (enabled when ENVIRONMENT is mainnet)
    {
      chainId: 1,
      name: 'Ethereum',
      currency: 'ETH',
      nativeFee: '0.001', // 0.001 ETH
      blockFinality: 12,
      rpcUrl: 'https://eth.llamarpc.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 42161,
      name: 'Arbitrum',
      currency: 'ETH',
      nativeFee: '0.001', // 0.001 ETH
      blockFinality: 12,
      rpcUrl: 'https://arbitrum.llamarpc.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 43114,
      name: 'Avalanche',
      currency: 'AVAX',
      nativeFee: '0.05', // 0.05 AVAX
      blockFinality: 12,
      rpcUrl: 'https://avalanche.llamarpc.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 56,
      name: 'BNB Chain',
      currency: 'BNB',
      nativeFee: '0.005', // 0.005 BNB
      blockFinality: 12,
      rpcUrl: 'https://bsc.llamarpc.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 137,
      name: 'Polygon',
      currency: 'MATIC',
      nativeFee: '0.5', // 0.5 MATIC
      blockFinality: 256,
      rpcUrl: 'https://polygon.llamarpc.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 250,
      name: 'Fantom',
      currency: 'FTM',
      nativeFee: '4', // 4 FTM
      blockFinality: 12,
      rpcUrl: 'https://fantom.llamarpc.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 59144,
      name: 'Linea',
      currency: 'ETH',
      nativeFee: '0.001', // 0.001 ETH
      blockFinality: 12,
      rpcUrl: 'https://linea.llamarpc.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 10,
      name: 'Optimism',
      currency: 'ETH',
      nativeFee: '0.001', // 0.001 ETH
      blockFinality: 12,
      rpcUrl: 'https://optimism.llamarpc.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 8453,
      name: 'Base',
      currency: 'ETH',
      nativeFee: '0.001', // 0.001 ETH
      blockFinality: 12,
      rpcUrl: 'https://base.llamarpc.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 245022934,
      name: 'Neon',
      currency: 'NEON',
      nativeFee: '0.75', // 0.75 NEON
      blockFinality: 32,
      rpcUrl: 'https://neon-proxy-mainnet.solana.p2p.org',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 100,
      name: 'Gnosis',
      currency: 'xDAI',
      nativeFee: '1', // 1 xDAI
      blockFinality: 12,
      rpcUrl: 'https://gnosis.llamarpc.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 1088,
      name: 'Metis',
      currency: 'METIS',
      nativeFee: '0.02', // 0.02 METIS
      blockFinality: 12,
      rpcUrl: 'https://metis.llamarpc.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 7171,
      name: 'Bitrock',
      currency: 'BROCK',
      nativeFee: '20', // 20 BROCK
      blockFinality: 12,
      rpcUrl: 'https://connect.bit-rock.io',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 146,
      name: 'Sonic',
      currency: 'S',
      nativeFee: '1', // 1 S
      blockFinality: 24,
      rpcUrl: 'https://rpc.soniclabs.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 4158,
      name: 'CrossFi',
      currency: 'XFI',
      nativeFee: '1', // 1 XFI
      blockFinality: 12,
      rpcUrl: 'https://rpc.crossfi.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 388,
      name: 'Cronos zkEVM',
      currency: 'zkCRO',
      nativeFee: '7', // 7 zkCRO
      blockFinality: 12,
      rpcUrl: 'https://mainnet.zkevm.cronos.org',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 2741,
      name: 'Abstract',
      currency: 'ETH',
      nativeFee: '0.0004', // 0.0004 ETH
      blockFinality: 12,
      rpcUrl: 'https://api.abstract.money',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 80094,
      name: 'Berachain',
      currency: 'BERA',
      nativeFee: '0.02', // 0.02 BERA
      blockFinality: 12,
      rpcUrl: 'https://rpc.berachain.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 1514,
      name: 'Story',
      currency: 'IP',
      nativeFee: '0.01', // 0.01 IP
      blockFinality: 12,
      rpcUrl: 'https://odyssey.storyrpc.io',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 999,
      name: 'HyperEVM',
      currency: 'WHYPE',
      nativeFee: '0.05', // 0.05 WHYPE
      blockFinality: 12,
      rpcUrl: 'https://api.hyperevm.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 48900,
      name: 'Zircuit',
      currency: 'ETH',
      nativeFee: '0.001', // 0.001 ETH
      blockFinality: 12,
      rpcUrl: 'https://zircuit1-mainnet.p2pify.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 747,
      name: 'Flow',
      currency: 'FLOW',
      nativeFee: '2.5', // 2.5 FLOW
      blockFinality: 12,
      rpcUrl: 'https://mainnet.evm.nodes.onflow.org',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 32769,
      name: 'Zilliqa',
      currency: 'ZIL',
      nativeFee: '50', // 50 ZIL
      blockFinality: 12,
      rpcUrl: 'https://api.zilliqa.com',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 60808,
      name: 'BOB',
      currency: 'ETH',
      nativeFee: '0.001', // 0.001 ETH
      blockFinality: 12,
      rpcUrl: 'https://rpc.gobob.xyz',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 5000,
      name: 'Mantle',
      currency: 'MNT',
      nativeFee: '2', // 2 MNT
      blockFinality: 12,
      rpcUrl: 'https://rpc.mantle.xyz',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 98866,
      name: 'Plume',
      currency: 'PLUME',
      nativeFee: '7', // 7 PLUME
      blockFinality: 12,
      rpcUrl: 'https://rpc.plumenetwork.xyz',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
    {
      chainId: 50104,
      name: 'Sophon',
      currency: 'SOPH',
      nativeFee: '1', // 1 SOPH
      blockFinality: 12,
      rpcUrl: 'https://rpc.sophon.xyz',
      enabled: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet',
      isTestnet: false,
    },
  ] as const,

  // License pricing tiers (in USD)
  LICENSE_PRICING: {
    BASIC: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet' ? 10 : 2, // Basic usage license
    COMMERCIAL: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet' ? 50 : 10, // Commercial license  
    EXCLUSIVE: process.env.NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT === 'mainnet' ? 200 : 25, // Exclusive rights
  },

  // Native token addresses (0x0 for native tokens)
  NATIVE_TOKEN_ADDRESS: '0x0000000000000000000000000000000000000000',

  // Cross-chain messaging flags
  FLAGS: {
    UNWRAP_ETH: 0,
    REVERT_IF_EXTERNAL_FAIL: 1,
    PROXY_WITH_SENDER: 2,
    SEND_HASHED_DATA: 3,
    SEND_EXTERNAL_CALL_GAS_LIMIT: 4,
    MULTI_SEND: 5,
  },

  // Transaction settings
  TRANSACTION_SETTINGS: {
    TIMEOUT_MS: 300000, // 5 minutes
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 5000,
    DEFAULT_GAS_LIMIT: 500000,
  },
};

// Helper function to get chain info by ID
export function getChainInfo(chainId: number) {
  return DEBRIDGE_CONFIG.SUPPORTED_CHAINS.find(chain => chain.chainId === chainId);
}

// Helper function to check if we're in testnet mode
export function isTestnetMode(): boolean {
  return DEBRIDGE_CONFIG.ENVIRONMENT === 'testnet';
}

// Helper function to get enabled chains
export function getEnabledChains() {
  return DEBRIDGE_CONFIG.SUPPORTED_CHAINS.filter(chain => chain.enabled);
}

// Helper function to calculate native fee in Wei
export function getNativeFeeInWei(chainId: number): bigint {
  const chain = getChainInfo(chainId);
  if (!chain) return BigInt(0);
  
  // Convert fee to Wei (18 decimals for most native tokens)
  const fee = parseFloat(chain.nativeFee);
  return BigInt(Math.floor(fee * Math.pow(10, 18)));
}

// Helper function to set flags
export function setFlag(flags: number, flag: number, value: boolean): number {
  if (value) {
    return flags | (1 << flag);
  } else {
    return flags & ~(1 << flag);
  }
}

// Export types for use in components
export type SupportedChain = typeof DEBRIDGE_CONFIG.SUPPORTED_CHAINS[number];
export type LicenseType = keyof typeof DEBRIDGE_CONFIG.LICENSE_PRICING;