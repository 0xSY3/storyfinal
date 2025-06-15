import { DEBRIDGE_CONFIG, getChainInfo, getEnabledChains, getNativeFeeInWei, setFlag, isTestnetMode, type SupportedChain, type LicenseType } from '../config/deBridgeConfig';

// Define OrderStatus enum for tracking cross-chain messages
export enum MessageStatus {
  Created = 'Created',
  Sent = 'Sent',
  Confirmed = 'Confirmed',
  Claimed = 'Claimed',
  Failed = 'Failed'
}

export interface CrossChainLicenseRequest {
  assetId: string;
  licenseType: LicenseType;
  buyerAddress: string;
  creatorAddress: string;
  sourceChainId: number;
  destinationChainId: number;
}

export interface LicensePaymentEstimate {
  licensePrice: number; // In USD
  protocolFee: number; // deBridge native fee in source chain currency
  totalCost: number; // Total in source chain currency
  estimatedTime: number; // In seconds
}

export interface CrossChainLicenseResult {
  submissionId: string;
  status: MessageStatus;
  transactionHash?: string;
  estimatedTime: number;
  protocolFee: string; // In Wei
}

export class DeBridgeLicenseService {
  private environment: string;

  constructor() {
    this.environment = DEBRIDGE_CONFIG.ENVIRONMENT;
    console.log('🚀 Initializing deBridge License Service...', {
      environment: this.environment,
      isTestnet: isTestnetMode(),
      supportedChains: getEnabledChains().length
    });
  }

  /**
   * Get estimate for cross-chain license purchase
   */
  async estimateLicensePurchase(request: CrossChainLicenseRequest): Promise<LicensePaymentEstimate> {
    try {
      console.log('🔍 Estimating cross-chain license purchase...', request);

      const sourceChain = getChainInfo(request.sourceChainId);
      const destinationChain = getChainInfo(request.destinationChainId);

      if (!sourceChain || !destinationChain) {
        throw new Error('Unsupported chain in request');
      }

      // Get license price in USD
      const licensePrice = DEBRIDGE_CONFIG.LICENSE_PRICING[request.licenseType];
      
      // Get protocol fee for source chain (in native currency)
      const protocolFeeNative = parseFloat(sourceChain.nativeFee);
      
      // Calculate estimated transfer time based on block finality
      const estimatedTime = this.calculateTransferTime(sourceChain, destinationChain);

      console.log('✅ License purchase estimate:', {
        licensePrice,
        protocolFee: `${protocolFeeNative} ${sourceChain.currency}`,
        estimatedTime: `${estimatedTime}s`
      });

      return {
        licensePrice,
        protocolFee: protocolFeeNative,
        totalCost: licensePrice + protocolFeeNative, // Total cost is license price + protocol fee
        estimatedTime,
      };

    } catch (error) {
      console.error('❌ License purchase estimation failed:', error);
      throw error;
    }
  }

  /**
   * Create cross-chain license purchase transaction
   */
  async createLicensePurchase(request: CrossChainLicenseRequest): Promise<CrossChainLicenseResult> {
    try {
      console.log('🚀 Creating cross-chain license purchase...', request);

      const sourceChain = getChainInfo(request.sourceChainId);
      const destinationChain = getChainInfo(request.destinationChainId);

      if (!sourceChain || !destinationChain) {
        throw new Error('Unsupported chain in request');
      }

      // Get protocol fee in Wei
      const protocolFeeWei = getNativeFeeInWei(request.sourceChainId);
      
      // Build the cross-chain message payload for license purchase
      const licenseData = this.buildLicenseMessage(request);
      
      // Build autoParams for deBridge send call
      const autoParams = this.buildAutoParams(licenseData, request.creatorAddress);
      
      // Generate a submission ID (in real implementation, this would come from the blockchain)
      const submissionId = this.generateSubmissionId();
      
      // Calculate estimated time
      const estimatedTime = this.calculateTransferTime(sourceChain, destinationChain);

      console.log('✅ License purchase transaction created:', {
        submissionId,
        protocolFee: protocolFeeWei.toString(),
        destinationChain: destinationChain.name
      });

      return {
        submissionId,
        status: MessageStatus.Created,
        estimatedTime,
        protocolFee: protocolFeeWei.toString(),
      };

    } catch (error) {
      console.error('❌ License purchase creation failed:', error);
      throw error;
    }
  }

  /**
   * Build the cross-chain message payload for license recording
   */
  private buildLicenseMessage(request: CrossChainLicenseRequest): string {
    // In a real implementation, this would be the encoded function call
    // to a smart contract on the destination chain that records the license
    const licenseRecord = {
      assetId: request.assetId,
      licenseType: request.licenseType,
      buyer: request.buyerAddress,
      creator: request.creatorAddress,
      sourceChain: request.sourceChainId,
      timestamp: Math.floor(Date.now() / 1000),
      price: DEBRIDGE_CONFIG.LICENSE_PRICING[request.licenseType]
    };

    // This would be ABI-encoded in a real implementation
    return JSON.stringify(licenseRecord);
  }

  /**
   * Build autoParams structure for deBridge send call
   */
  private buildAutoParams(data: string, fallbackAddress: string) {
    let flags = 0;
    
    // Set flags for proper message handling
    flags = setFlag(flags, DEBRIDGE_CONFIG.FLAGS.REVERT_IF_EXTERNAL_FAIL, true);
    flags = setFlag(flags, DEBRIDGE_CONFIG.FLAGS.PROXY_WITH_SENDER, true);

    return {
      executionFee: 0, // No execution fee for simple recording
      flags,
      fallbackAddress: this.encodeAddress(fallbackAddress),
      data: this.encodeData(data)
    };
  }

  /**
   * Encode address to bytes format required by deBridge
   */
  private encodeAddress(address: string): string {
    // Remove 0x prefix if present and ensure proper format
    return address.startsWith('0x') ? address.slice(2) : address;
  }

  /**
   * Encode data to bytes format required by deBridge
   */
  private encodeData(data: string): string {
    // Convert string to hex bytes
    return Buffer.from(data, 'utf8').toString('hex');
  }

  /**
   * Calculate estimated transfer time between chains
   */
  private calculateTransferTime(sourceChain: SupportedChain, destinationChain: SupportedChain): number {
    // Base time: max finality of both chains
    const baseTime = Math.max(sourceChain.blockFinality, destinationChain.blockFinality) * 15; // ~15s per block
    
    // Add processing time
    const processingTime = 60; // 1 minute processing
    
    // Add extra time for high-finality chains
    let extraTime = 0;
    if (sourceChain.blockFinality > 100 || destinationChain.blockFinality > 100) {
      extraTime += 120; // 2 minutes extra for high-finality chains
    }

    return baseTime + processingTime + extraTime;
  }

  /**
   * Generate a unique submission ID
   */
  private generateSubmissionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `sub_${timestamp}_${random}`;
  }

  /**
   * Get the transaction data for wallet execution
   */
  async getTransactionData(request: CrossChainLicenseRequest) {
    try {
      const sourceChain = getChainInfo(request.sourceChainId);
      if (!sourceChain) {
        throw new Error('Unsupported source chain');
      }

      const protocolFeeWei = getNativeFeeInWei(request.sourceChainId);
      const licenseData = this.buildLicenseMessage(request);
      const autoParams = this.buildAutoParams(licenseData, request.creatorAddress);

      // Convert license price from USD to ETH (rough approximation for demo)
      const licensePriceUSD = DEBRIDGE_CONFIG.LICENSE_PRICING[request.licenseType];
      const ethPriceUSD = 2000; // Approximate ETH price for demo
      const licensePriceETH = licensePriceUSD / ethPriceUSD;
      
      // Platform takes 10% commission
      const platformFeePercent = 0.10;
      const creatorShare = licensePriceETH * (1 - platformFeePercent);
      const platformFee = licensePriceETH * platformFeePercent;
      
      const licensePriceWei = BigInt(Math.floor(licensePriceETH * 1e18));
      const creatorShareWei = BigInt(Math.floor(creatorShare * 1e18));

      // Total value = protocol fee + license fee in ETH
      const totalValueWei = protocolFeeWei + licensePriceWei;

      // Build transaction data for deBridgeGate.send() call
      const transactionData = {
        to: DEBRIDGE_CONFIG.CONTRACTS.DEBRIDGE_GATE,
        value: totalValueWei.toString(),
        data: this.encodeSendCall({
          tokenAddress: DEBRIDGE_CONFIG.NATIVE_TOKEN_ADDRESS, // Native token
          amount: creatorShareWei.toString(), // Send creator's share (90% of license fee)
          chainIdTo: request.destinationChainId,
          receiver: this.encodeAddress(request.creatorAddress),
          permit: '',
          useAssetFee: false,
          referralCode: 0,
          autoParams: this.encodeAutoParams(autoParams)
        }),
        gasLimit: DEBRIDGE_CONFIG.TRANSACTION_SETTINGS.DEFAULT_GAS_LIMIT
      };

      console.log('💰 Transaction breakdown:', {
        licensePriceUSD,
        licensePriceETH,
        creatorShareETH: creatorShare,
        platformFeeETH: platformFee,
        protocolFeeETH: parseFloat(sourceChain.nativeFee),
        totalETH: (Number(totalValueWei) / 1e18).toFixed(6)
      });

      return transactionData;

    } catch (error) {
      console.error('❌ Transaction data generation failed:', error);
      throw error;
    }
  }

  /**
   * Encode the send function call data
   */
  private encodeSendCall(params: any): string {
    // This would use proper ABI encoding in a real implementation
    // For now, return a placeholder that represents the encoded call
    const functionSignature = '0x0f5287b0'; // send function selector
    
    // In reality, this would be properly ABI-encoded
    return functionSignature + Buffer.from(JSON.stringify(params)).toString('hex').padStart(64, '0');
  }

  /**
   * Encode autoParams structure
   */
  private encodeAutoParams(autoParams: any): string {
    // This would use proper ABI encoding in a real implementation
    return Buffer.from(JSON.stringify(autoParams)).toString('hex');
  }

  /**
   * Check the status of a cross-chain license purchase
   */
  async getLicenseStatus(submissionId: string): Promise<any> {
    try {
      console.log('🔍 Checking license purchase status:', submissionId);

      // Simulate status progression based on time
      const timestamp = parseInt(submissionId.split('_')[1]);
      const elapsed = Date.now() - timestamp;

      let status: MessageStatus;
      if (elapsed < 30000) { // First 30 seconds
        status = MessageStatus.Sent;
      } else if (elapsed < 120000) { // First 2 minutes
        status = MessageStatus.Confirmed;
      } else { // After 2 minutes
        status = MessageStatus.Claimed;
      }

      const statusData = {
        submissionId,
        status,
        confirmations: Math.min(Math.floor(elapsed / 15000), 12), // Block confirmations
        estimatedCompletion: status === MessageStatus.Claimed ? null : timestamp + 180000, // 3 minutes total
      };

      console.log('✅ License status retrieved:', statusData);
      return statusData;

    } catch (error) {
      console.error('❌ License status check failed:', error);
      throw error;
    }
  }

  /**
   * Get all supported chains for cross-chain licensing
   */
  getSupportedChains(): SupportedChain[] {
    const chains = getEnabledChains();
    // Only log once to avoid spam
    if (!this.chainsLogged) {
      console.log(`📋 Available chains for licensing: ${chains.length}`, chains.map(c => `${c.name} (${c.chainId})`));
      this.chainsLogged = true;
    }
    return chains;
  }
  
  private chainsLogged = false;

  /**
   * Get environment information
   */
  getEnvironmentInfo() {
    return {
      environment: this.environment,
      supportedChains: this.getSupportedChains().length,
      deBridgeGate: DEBRIDGE_CONFIG.CONTRACTS.DEBRIDGE_GATE,
    };
  }

  /**
   * Monitor a license purchase until completion
   */
  async monitorLicensePurchase(
    submissionId: string,
    onStatusUpdate?: (status: any) => void
  ): Promise<any> {
    // For testnet/demo: shorter intervals and fewer attempts
    const maxAttempts = 6; // 3 minutes with 30-second intervals  
    const checkInterval = 5000; // Check every 5 seconds for testnet
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const status = await this.getLicenseStatus(submissionId);
          console.log(`🔍 Attempt ${attempts + 1}/${maxAttempts} - Status:`, status.status);

          if (onStatusUpdate) {
            onStatusUpdate(status);
          }

          // Check if purchase is completed
          if (status.status === MessageStatus.Claimed) {
            console.log('✅ License purchase status: CLAIMED');
            resolve(status);
            return;
          }

          // Check if purchase failed
          if (status.status === MessageStatus.Failed) {
            console.log('❌ License purchase status: FAILED');
            reject(new Error('License purchase failed'));
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            console.log('⏰ License purchase monitoring timeout after', attempts, 'attempts');
            reject(new Error('License purchase monitoring timeout'));
            return;
          }

          // Continue monitoring with shorter interval for testnet
          console.log(`⏳ Waiting ${checkInterval/1000}s before next check...`);
          setTimeout(checkStatus, checkInterval);

        } catch (error) {
          console.error('❌ Error checking license status:', error);
          attempts++;
          if (attempts >= maxAttempts) {
            reject(error);
          } else {
            setTimeout(checkStatus, checkInterval);
          }
        }
      };

      // Start monitoring immediately
      console.log('🚀 Starting license purchase monitoring...');
      checkStatus();
    });
  }
}

// Export singleton instance
export const deBridgeService = new DeBridgeLicenseService();