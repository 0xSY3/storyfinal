"use client";

import React from "react";
import { Button, Typography, Paper, Box, Avatar, Chip } from "@mui/material";
import { 
  AccountBalanceWallet as WalletIcon,
  ExitToApp as DisconnectIcon 
} from "@mui/icons-material";
import { useAccount, useDisconnect } from 'wagmi';
import { 
  useConnectModal, 
  useAccountModal,
  useChainModal
} from '@tomo-inc/tomo-evm-kit';
import { storyAeneidTestnet } from '../config/tomoConfig';

interface TomoWalletConnectProps {
  onWalletConnected: (address: string) => void;
}

const TomoWalletConnect: React.FC<TomoWalletConnectProps> = ({ 
  onWalletConnected 
}) => {
  const { address, isConnected, connector, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();

  // Notify parent component when wallet is connected
  React.useEffect(() => {
    if (isConnected && address) {
      onWalletConnected(address);
    }
  }, [isConnected, address, onWalletConnected]);

  const isStoryChain = chain?.id === storyAeneidTestnet.id;

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (!isConnected) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.1), rgba(79, 195, 247, 0.1))',
          border: '1px solid rgba(123, 97, 255, 0.2)'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <WalletIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Connect with multiple wallets, social logins, or email
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={openConnectModal}
            startIcon={<WalletIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #7b61ff 0%, #4fc3f7 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6f55e6 0%, #47b0df 100%)',
              },
            }}
          >
            Connect Wallet
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(123, 97, 255, 0.1))',
        border: `1px solid ${isStoryChain ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)'}`
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <WalletIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Wallet Connected
              <Chip 
                label={connector?.name || 'Unknown'} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace', 
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={openAccountModal}
            >
              {formatAddress(address!)}
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => disconnect()}
          startIcon={<DisconnectIcon />}
          sx={{ borderRadius: 2 }}
        >
          Disconnect
        </Button>
      </Box>

      {/* Network Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Network:
          </Typography>
          <Chip
            label={chain?.name || 'Unknown'}
            size="small"
            color={isStoryChain ? 'success' : 'warning'}
            onClick={openChainModal}
            sx={{ cursor: 'pointer' }}
          />
        </Box>

        {!isStoryChain && (
          <Button
            variant="outlined"
            size="small"
            onClick={openChainModal}
            sx={{ borderRadius: 2 }}
          >
            Switch to Story
          </Button>
        )}
      </Box>

      {!isStoryChain && (
        <Box 
          sx={{ 
            mt: 2, 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: 'warning.light',
            color: 'warning.contrastText'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            ⚠️ Please switch to Story Aeneid Testnet to interact with Story Protocol features
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TomoWalletConnect;