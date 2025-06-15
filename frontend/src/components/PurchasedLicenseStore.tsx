"use client";

// Simple client-side store for purchased licenses (since we don't have backend)
export interface PurchasedLicense {
  submissionId: string;
  assetId: string;
  assetName: string;
  licenseType: 'BASIC' | 'COMMERCIAL' | 'EXCLUSIVE';
  purchasePrice: number;
  purchaseDate: string;
  buyerAddress: string;
  creatorAddress: string;
  sourceChain: string;
  destinationChain: string;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
}

class PurchasedLicenseStore {
  private storageKey = 'purchasedLicenses';

  // Get all purchased licenses
  getLicenses(): PurchasedLicense[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading stored licenses:', error);
      return [];
    }
  }

  // Get licenses for a specific wallet address
  getLicensesForAddress(address: string): PurchasedLicense[] {
    return this.getLicenses().filter(license => 
      license.buyerAddress.toLowerCase() === address.toLowerCase()
    );
  }

  // Add a new license purchase
  addLicense(license: Omit<PurchasedLicense, 'purchaseDate' | 'status'>): void {
    if (typeof window === 'undefined') return;

    const newLicense: PurchasedLicense = {
      ...license,
      purchaseDate: new Date().toISOString(),
      status: 'confirmed' // For demo purposes, all are confirmed
    };

    const licenses = this.getLicenses();
    licenses.push(newLicense);
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(licenses));
    } catch (error) {
      console.error('Error storing license:', error);
    }
  }

  // Update license status
  updateLicenseStatus(submissionId: string, status: PurchasedLicense['status']): void {
    if (typeof window === 'undefined') return;

    const licenses = this.getLicenses();
    const licenseIndex = licenses.findIndex(l => l.submissionId === submissionId);
    
    if (licenseIndex !== -1) {
      licenses[licenseIndex].status = status;
      
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(licenses));
      } catch (error) {
        console.error('Error updating license status:', error);
      }
    }
  }

  // Clear all licenses (for testing)
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }
}

export const purchasedLicenseStore = new PurchasedLicenseStore();