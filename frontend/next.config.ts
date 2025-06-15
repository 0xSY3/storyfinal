/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    emotion: true,
  },
  images: {
    domains: ['gateway.pinata.cloud'],
  },
  transpilePackages: [
    '@tomo-inc/tomo-evm-kit', 
    '@tomo-wallet/uikit-lite', 
    '@tomo-inc/shared-type'
  ],
};

export default nextConfig;