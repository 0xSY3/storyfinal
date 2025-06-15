# CreativeIP 🎨✨

**Cross-Chain IP Licensing Platform for Digital Creators**

CreativeIP is a revolutionary platform that combines blockchain-based intellectual property protection with cross-chain licensing capabilities, enabling creators to upload, protect, and monetize their digital assets across multiple blockchain networks.

## 🚀 Features

- **Digital Asset Management**: Upload and organize your creative content with comprehensive metadata support
- **Story Protocol Integration**: Register your IP with immutable blockchain technology and smart contracts
- **Cross-Chain Licensing**: License your content across multiple blockchains using deBridge infrastructure
- **Revenue Sharing**: Automated payment distribution with 90% to creators, 10% platform fee
- **Yakoa Verification**: Content authenticity and verification engine
- **Multi-Chain Support**: Ethereum, Polygon, Arbitrum, Optimism, Base, and Story Protocol networks

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.2.4 with React 19
- **Backend**: Express.js with Firebase integration
- **Styling**: TailwindCSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **Animations**: Framer Motion with morphing text effects
- **Blockchain**: 
  - Wagmi for Web3 integration
  - Story Protocol for IP registration
  - deBridge for cross-chain transfers
  - Tomo Network for transactions
- **Storage**: IPFS via Pinata for decentralized file storage
- **TypeScript**: Full type safety throughout

## 🎯 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- MetaMask or Tomo Wallet

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd story
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Start the backend server:
```bash
npm run dev
# Backend runs on http://localhost:3001
```

5. Start the frontend development server:
```bash
cd ../frontend
npm run dev
# Frontend runs on http://localhost:3000
```

6. Open [http://localhost:3000/landing](http://localhost:3000/landing) to view the application

## 📁 Project Structure

```
story/
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   │   ├── dashboard/ # Creator dashboard
│   │   │   ├── gallery/   # Asset marketplace
│   │   │   ├── landing/   # Landing page
│   │   │   ├── licenses/  # License management
│   │   │   └── upload/    # Asset upload interface
│   │   ├── components/    # Reusable UI components
│   │   │   ├── CrossChain/     # Cross-chain payment components
│   │   │   ├── IPRegistration/ # IP registration components
│   │   │   ├── Search/         # Asset search components
│   │   │   └── ui/            # Base UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Utility functions
├── backend/               # Express.js backend
│   ├── src/
│   │   ├── api/          # API endpoints
│   │   ├── config/       # Database and service configs
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Backend utilities
└── public/               # Static assets
```

## 🎨 Design System

CreativeIP uses a modern design system built on TailwindCSS:

- **Colors**: Green-focused palette with professional grays
- **Typography**: Clean, modern fonts with proper hierarchy
- **Components**: Modern cards with subtle shadows and borders
- **Animations**: Morphing text effects and smooth transitions
- **Responsive**: Mobile-first design approach

## 🔗 Key Pages

- **`/landing`**: Marketing landing page with morphing hero text and tech stack scroll
- **`/dashboard`**: Creator dashboard with asset management and analytics
- **`/gallery`**: Asset marketplace with search and filtering
- **`/upload`**: Multi-format asset upload with metadata management
- **`/licenses`**: License management and purchase history

## 🌟 Key Features Implementation

### IP Registration with Story Protocol
- Upload digital assets to IPFS
- Generate metadata for IP and NFT registration
- Smart contract interactions for IP registration
- Immutable ownership verification

### Cross-Chain Licensing with deBridge
- Multi-chain license purchases
- Automated payment distribution
- Cross-chain message passing
- Real-time transaction monitoring

### Asset Management
- Multi-format file support (images, videos, audio, documents, 3D models)
- Comprehensive metadata extraction
- Asset verification with Yakoa
- Portfolio analytics and tracking

### Payment System
- MetaMask and Tomo Wallet integration
- Automatic currency conversion (USD to ETH)
- Revenue sharing (90% creator, 10% platform)
- Cross-chain payment processing

## 🚀 Deployment

### Development
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

### Production Build
```bash
# Build frontend
cd frontend && npm run build && npm run start

# Start backend in production
cd backend && npm start
```

### Linting
```bash
cd frontend && npm run lint
cd backend && npm run lint
```

## 🔧 Configuration

### Environment Variables

Frontend (.env.local):
```
NEXT_PUBLIC_DEBRIDGE_ENVIRONMENT=testnet
NEXT_PUBLIC_STORY_PROTOCOL_RPC=https://testnet.storyrpc.io
```

Backend (.env):
```
FIREBASE_DATABASE_URL=your_firebase_url
PINATA_API_KEY=your_pinata_key
PINATA_API_SECRET=your_pinata_secret
```

## 🌐 Supported Networks

- **Ethereum Sepolia** (Chain ID: 11155111)
- **Polygon Amoy** (Chain ID: 80002)  
- **Arbitrum Sepolia** (Chain ID: 421614)
- **Optimism Sepolia** (Chain ID: 11155420)
- **Base Sepolia** (Chain ID: 84532)
- **Story Protocol Aeneid** (Chain ID: 1315)

## 💰 License Pricing

- **Basic License**: $2 (testnet) / $10 (mainnet)
- **Commercial License**: $10 (testnet) / $50 (mainnet)
- **Exclusive License**: $25 (testnet) / $200 (mainnet)

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌐 Community

- **GitHub**: Follow for updates and contributions
- **Demo**: Built for hackathon demonstration

---

*Empowering creators to own, protect, and profit from their digital assets across multiple blockchains.*