import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Grid,
  Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  OpenInNew as ExternalLinkIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { License } from '../../hooks/useLicenseManagement';

interface LicenseCardProps {
  license: License;
  onViewAsset?: (license: License) => void;
  onDownloadAsset?: (license: License) => void;
}

export default function LicenseCard({ 
  license, 
  onViewAsset, 
  onDownloadAsset 
}: LicenseCardProps) {
  const getLicenseStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case 'BASIC': return 'info';
      case 'COMMERCIAL': return 'success';
      case 'EXCLUSIVE': return 'error';
      case 'CUSTOM': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleViewAsset = () => {
    if (onViewAsset) {
      onViewAsset(license);
    } else if (license.asset?.cid) {
      window.open(`https://gateway.pinata.cloud/ipfs/${license.asset.cid}`, '_blank');
    }
  };

  const handleDownloadAsset = () => {
    if (onDownloadAsset) {
      onDownloadAsset(license);
    } else if (license.asset?.cid) {
      const link = document.createElement('a');
      link.href = `https://gateway.pinata.cloud/ipfs/${license.asset.cid}?download=true`;
      link.download = license.asset.fileName || 'asset';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card sx={{ 
      borderRadius: 4, 
      background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(50, 50, 50, 0.7) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(187, 134, 252, 0.2)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease',
      '&:hover': { 
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 60px rgba(187, 134, 252, 0.2)',
        border: '1px solid rgba(187, 134, 252, 0.4)',
      } 
    }}>
      <CardHeader
        avatar={
          <Avatar sx={{ 
            background: 'linear-gradient(135deg, #bb86fc 0%, #03dac6 100%)', 
            width: 56, 
            height: 56,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(187, 134, 252, 0.3)',
          }}>
            {license.asset?.fileName?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
              {license.asset?.fileName || `Asset ${license.assetId.substring(0, 8)}...`}
            </Typography>
            <Chip
              label={license.licenseType}
              color={getLicenseTypeColor(license.licenseType) as any}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
            <Chip
              label={license.status.toUpperCase()}
              color={getLicenseStatusColor(license.status) as any}
              size="small"
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              Purchased: {format(new Date(license.purchasedAt), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Asset">
              <IconButton 
                onClick={handleViewAsset}
                disabled={!license.asset?.cid}
                size="small"
                sx={{
                  bgcolor: 'rgba(187, 134, 252, 0.1)',
                  color: '#bb86fc',
                  '&:hover': {
                    bgcolor: 'rgba(187, 134, 252, 0.2)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ExternalLinkIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Asset">
              <IconButton 
                onClick={handleDownloadAsset}
                disabled={!license.asset?.cid}
                size="small"
                sx={{
                  bgcolor: 'rgba(3, 218, 198, 0.1)',
                  color: '#03dac6',
                  '&:hover': {
                    bgcolor: 'rgba(3, 218, 198, 0.2)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Payment Amount
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #03dac6 0%, #00a693 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {formatCurrency(license.paymentAmount)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Asset Type
            </Typography>
            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
              {license.asset?.assetType || 'Unknown'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              License ID
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                wordBreak: 'break-all'
              }}
            >
              {license.licenseId.substring(0, 16)}...
            </Typography>
          </Grid>
        </Grid>
        
        {license.confirmedAt && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Confirmed At
            </Typography>
            <Typography variant="body2">
              {format(new Date(license.confirmedAt), 'MMM dd, yyyy HH:mm:ss')}
            </Typography>
          </Box>
        )}
        
        {license.transactionHash && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Transaction Hash
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace',
                color: 'primary.main',
                cursor: 'pointer',
                fontSize: '0.75rem',
                wordBreak: 'break-all',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
              onClick={() => window.open(`https://explorer.story.foundation/tx/${license.transactionHash}`, '_blank')}
            >
              {license.transactionHash}
            </Typography>
          </Box>
        )}

        {license.asset?.metadata?.description && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {license.asset.metadata.description}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}