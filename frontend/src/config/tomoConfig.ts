import { getDefaultConfig } from '@tomo-inc/tomo-evm-kit';
import { metaMaskWallet, rainbowWallet, walletConnectWallet } from '@tomo-inc/tomo-evm-kit/wallets';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { defineChain } from 'viem';

// Story Protocol Aeneid Testnet
export const storyAeneidTestnet = defineChain({
  id: 1315,
  name: "Story Aeneid Testnet",
  nativeCurrency: {
    name: "Story IP",
    symbol: "IP",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://aeneid.storyrpc.io"],
    },
    public: {
      http: ["https://aeneid.storyrpc.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "StoryScan",
      url: "https://aeneid.storyscan.io",
    },
  },
  testnet: true,
});

// Tomo configuration with Story Protocol support
export const tomoConfig = getDefaultConfig({
  clientId: process.env.NEXT_PUBLIC_TOMO_CLIENT_ID || 'DEMO_CLIENT_ID',
  appName: 'Story IP Marketplace',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [
    storyAeneidTestnet, // Primary chain for Story Protocol
    mainnet, 
    polygon, 
    optimism, 
    arbitrum, 
    base
  ],
  ssr: true,
  wallets: [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
      ],
    },
  ],
  metadata: {
    name: 'Story IP Marketplace',
    description: 'Decentralized IP marketplace powered by Story Protocol',
    url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    icons: ['https://walletconnect.com/walletconnect-logo.png'],
  },
});

export default tomoConfig;