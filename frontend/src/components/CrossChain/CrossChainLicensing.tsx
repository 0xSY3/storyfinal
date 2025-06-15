import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Grid,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  SwapHoriz as CrossChainIcon,
  Payment as PaymentIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { useAccount } from 'wagmi';
import CrossChainPayment from './CrossChainPayment';
import { useDeBridgeConfig } from '../../hooks/useCrossChainPayment';
import { DEBRIDGE_CONFIG, type LicenseType } from '../../config/deBridgeConfig';

interface Asset {
  id: string;
  fileName: string;
  creatorAddress: string;
  assetType: string;
  metadata: {
    description?: string;
    category?: string;
  };
  cid: string;
}

interface CrossChainLicensingProps {
  asset: Asset;
  onLicensePurchased?: (assetId: string, orderId: string) => void;
}

const CrossChainLicensing: React.FC<CrossChainLicensingProps> = ({
  asset,
  onLicensePurchased,
}) => {
  const { isConnected, chain } = useAccount();
  const { getSupportedChains } = useDeBridgeConfig();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedLicenseType, setSelectedLicenseType] = useState<LicenseType>('BASIC');

  const supportedChains = getSupportedChains();
  const isCurrentChainSupported = chain && supportedChains.some(c => c.chainId === chain.id);

  const handleOpenPayment = (licenseType: LicenseType) => {
    setSelectedLicenseType(licenseType);
    setPaymentDialogOpen(true);
  };

  const handlePaymentComplete = (orderId: string) => {
    setPaymentDialogOpen(false);
    if (onLicensePurchased) {
      onLicensePurchased(asset.id, orderId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getLicenseDescription = (type: LicenseType) => {
    switch (type) {
      case 'BASIC':
        return 'Personal use, non-commercial projects, educational purposes';
      case 'COMMERCIAL':
        return 'Commercial use, business projects, revenue generation allowed';
      case 'EXCLUSIVE':
        return 'Exclusive rights, no other licensing, full ownership transfer';
      case 'CUSTOM':
        return 'Custom licensing terms negotiated with creator';
      default:
        return '';
    }
  };

  if (!isConnected) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cross-Chain Licensing
          </Typography>
          <Typography color="text.secondary">
            Connect your wallet to purchase licenses for this asset across different blockchains.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!isCurrentChainSupported) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cross-Chain Licensing
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Your current network is not supported for cross-chain payments.
          </Typography>
          <Typography variant="body2">
            Supported networks: {supportedChains.map(c => c.name).join(', ')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CrossChainIcon color="primary" />
            <Typography variant="h6">
              Cross-Chain Licensing
            </Typography>
            <Tooltip title="Purchase licenses using any supported blockchain">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Purchase licensing rights for this asset with cross-chain payments. 
            Pay from any supported blockchain and receive your license on Story Protocol.
          </Typography>

          <Grid container spacing={2}>
            {/* Basic License */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Basic</Typography>
                    <Chip label={formatCurrency(DEBRIDGE_CONFIG.LICENSE_PRICING.BASIC)} color="primary" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {getLicenseDescription('BASIC')}
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleOpenPayment('BASIC')}
                    startIcon={<PaymentIcon />}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Commercial License */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Commercial</Typography>
                    <Chip label={formatCurrency(DEBRIDGE_CONFIG.LICENSE_PRICING.COMMERCIAL)} color="secondary" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {getLicenseDescription('COMMERCIAL')}
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleOpenPayment('COMMERCIAL')}
                    startIcon={<PaymentIcon />}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Exclusive License */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Exclusive</Typography>
                    <Chip label={formatCurrency(DEBRIDGE_CONFIG.LICENSE_PRICING.EXCLUSIVE)} color="warning" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {getLicenseDescription('EXCLUSIVE')}
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleOpenPayment('EXCLUSIVE')}
                    startIcon={<PaymentIcon />}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Supported Networks:
            </Typography>
            {supportedChains.slice(0, 5).map((chain) => (
              <Chip
                key={chain.chainId}
                label={chain.name}
                size="small"
                variant="outlined"
              />
            ))}
            {supportedChains.length > 5 && (
              <Chip
                label={`+${supportedChains.length - 5} more`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Powered by deBridge Protocol
            </Typography>
            <IconButton
              size="small"
              onClick={() => window.open('https://debridge.finance/', '_blank')}
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <CrossChainPayment
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        assetId={asset.id}
        assetTitle={asset.fileName}
        creatorAddress={asset.creatorAddress}
        defaultLicenseType={selectedLicenseType}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
};

export default CrossChainLicensing;