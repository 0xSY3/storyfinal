"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import {
  YakoaVerificationResult,
  getVerificationStatusColor,
  getVerificationStatusLabel,
  getTrustScoreLabel,
  getTrustScoreColor,
  useMarkFalsePositive,
  useUpdateTrustReason,
  useRetryVerification,
} from "../../hooks/useYakoaVerification";

interface VerificationDetailsProps {
  verification: YakoaVerificationResult;
  assetId: string;
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

const VerificationDetails: React.FC<VerificationDetailsProps> = ({
  verification,
  assetId,
  open,
  onClose,
  isAdmin = false,
}) => {
  const [adminMode, setAdminMode] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [falsePositiveReason, setFalsePositiveReason] = useState('');
  const [trustReason, setTrustReason] = useState<'trusted_platform' | 'no_licenses'>('trusted_platform');

  const markFalsePositiveMutation = useMarkFalsePositive();
  const updateTrustMutation = useUpdateTrustReason();
  const retryVerificationMutation = useRetryVerification();

  const handleMarkFalsePositive = async () => {
    if (!falsePositiveReason.trim() || !adminKey.trim()) return;
    
    try {
      await markFalsePositiveMutation.mutateAsync({
        assetId,
        reason: falsePositiveReason,
        adminKey,
      });
      setFalsePositiveReason('');
      setAdminKey('');
      setAdminMode(false);
    } catch (error) {
      console.error('Failed to mark as false positive:', error);
    }
  };

  const handleUpdateTrust = async () => {
    if (!adminKey.trim()) return;
    
    try {
      await updateTrustMutation.mutateAsync({
        assetId,
        trustReason,
        adminKey,
      });
      setAdminKey('');
      setAdminMode(false);
    } catch (error) {
      console.error('Failed to update trust reason:', error);
    }
  };

  const handleRetryVerification = async () => {
    if (!adminKey.trim()) return;
    
    try {
      await retryVerificationMutation.mutateAsync({
        assetId,
        adminKey,
      });
      setAdminKey('');
      setAdminMode(false);
    } catch (error) {
      console.error('Failed to retry verification:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">Content Verification Details</Typography>
          {isAdmin && (
            <Button
              size="small"
              startIcon={<AdminIcon />}
              onClick={() => setAdminMode(!adminMode)}
              sx={{ ml: 'auto' }}
            >
              Admin
            </Button>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Overall Status */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ 
                    color: getVerificationStatusColor(verification.verificationStatus),
                    fontWeight: 'bold',
                    mb: 1
                  }}>
                    {getVerificationStatusLabel(verification.verificationStatus)}
                  </Typography>
                  <Chip
                    label={`Asset ID: ${assetId}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Trust Score
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={verification.trustScore * 100}
                      sx={{
                        width: 200,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.300',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getTrustScoreColor(verification.trustScore),
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {(verification.trustScore * 100).toFixed(0)}% - {getTrustScoreLabel(verification.trustScore)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Infringements */}
        {(verification.infringements.external.length > 0 || verification.infringements.inNetwork.length > 0) && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" />
                <Typography variant="h6">
                  Potential Infringements ({verification.infringements.external.length + verification.infringements.inNetwork.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* External Infringements */}
              {verification.infringements.external.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    External Brand Matches ({verification.infringements.external.length})
                  </Typography>
                  <List dense>
                    {verification.infringements.external.map((infringement: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <BusinessIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={infringement.brand_name || 'Unknown Brand'}
                          secondary={`Confidence: ${(infringement.confidence || 0).toFixed(1)}%`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* In-Network Infringements */}
              {verification.infringements.inNetwork.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    In-Network Matches ({verification.infringements.inNetwork.length})
                  </Typography>
                  <List dense>
                    {verification.infringements.inNetwork.map((infringement: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <SecurityIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Token: ${infringement.token_id?.contract_address || 'Unknown'}`}
                          secondary={`Media: ${infringement.media_id} - Confidence: ${(infringement.confidence || 0).toFixed(1)}%`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Authorizations */}
        {verification.authorizations.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon color="success" />
                <Typography variant="h6">
                  Authorizations ({verification.authorizations.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {verification.authorizations.map((auth: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <GavelIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={auth.brand_name || auth.brand_id || 'Platform Authorization'}
                      secondary={`Type: ${auth.data?.type || 'Unknown'} ${auth.data?.email_address ? `- ${auth.data.email_address}` : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Media Results */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6">
                Media Verification ({verification.mediaResults.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {verification.mediaResults.map((media, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {media.infringementStatus === 'clean' && <CheckIcon color="success" />}
                    {media.infringementStatus === 'flagged' && <WarningIcon color="warning" />}
                    {media.infringementStatus === 'pending' && <SecurityIcon color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={`Media: ${media.mediaId}`}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          Status: {media.infringementStatus} | Fetch: {media.fetchStatus}
                        </Typography>
                        {media.confidence && (
                          <Typography variant="body2">
                            Confidence: {(media.confidence * 100).toFixed(0)}%
                          </Typography>
                        )}
                        {media.brandMatches && media.brandMatches.length > 0 && (
                          <Typography variant="body2">
                            Brands: {media.brandMatches.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Admin Controls */}
        {isAdmin && adminMode && (
          <Card sx={{ mt: 3, bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Admin Controls
              </Typography>
              
              <Alert severity="warning" sx={{ mb: 2 }}>
                Admin actions require authentication and will modify verification status.
              </Alert>

              <TextField
                fullWidth
                label="Admin Key"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />

              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                {/* Mark as False Positive */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Mark as False Positive
                  </Typography>
                  <TextField
                    fullWidth
                    label="Reason"
                    value={falsePositiveReason}
                    onChange={(e) => setFalsePositiveReason(e.target.value)}
                    sx={{ mb: 1 }}
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={handleMarkFalsePositive}
                    disabled={!falsePositiveReason.trim() || !adminKey.trim() || markFalsePositiveMutation.isPending}
                    size="small"
                  >
                    {markFalsePositiveMutation.isPending ? 'Processing...' : 'Mark as Authorized'}
                  </Button>
                </Box>

                {/* Update Trust Reason */}
                <Box>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Update Trust Reason</FormLabel>
                    <RadioGroup
                      value={trustReason}
                      onChange={(e) => setTrustReason(e.target.value as any)}
                    >
                      <FormControlLabel
                        value="trusted_platform"
                        control={<Radio size="small" />}
                        label="Trusted Platform"
                      />
                      <FormControlLabel
                        value="no_licenses"
                        control={<Radio size="small" />}
                        label="No Licenses"
                      />
                    </RadioGroup>
                  </FormControl>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={handleUpdateTrust}
                    disabled={!adminKey.trim() || updateTrustMutation.isPending}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    {updateTrustMutation.isPending ? 'Processing...' : 'Update Trust'}
                  </Button>
                </Box>

                {/* Retry Verification */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Retry Verification
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleRetryVerification}
                    disabled={!adminKey.trim() || retryVerificationMutation.isPending}
                    size="small"
                  >
                    {retryVerificationMutation.isPending ? 'Processing...' : 'Retry Verification'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerificationDetails;