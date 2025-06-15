"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  CreditCard, 
  Calendar, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Search,
  TrendingUp,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { purchasedLicenseStore, type PurchasedLicense } from '../../components/PurchasedLicenseStore';
import { useMetaMask } from '../../components/MetaMaskProvider';

// Function to get Tomo wallet address from localStorage or other source
const getTomoAddress = (): string | null => {
  if (typeof window !== 'undefined') {
    // Check if there's a stored Tomo address
    // This would depend on how Tomo stores the address
    // For now, we'll return null since we're focusing on MetaMask purchases
    return null;
  }
  return null;
};

const ModernLicensesPage: React.FC = () => {
  const { address: metaMaskAddress, isConnected: isMetaMaskConnected } = useMetaMask();
  const [tomoAddress, setTomoAddress] = useState<string | null>(null);
  const [licenses, setLicenses] = useState<PurchasedLicense[]>([]);
  const [filteredLicenses, setFilteredLicenses] = useState<PurchasedLicense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load wallet addresses and licenses
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Get Tomo wallet address
      const tomo = getTomoAddress();
      setTomoAddress(tomo);
      
      // Load licenses for all connected wallets
      const allLicenses: PurchasedLicense[] = [];
      
      // Add licenses from Tomo wallet
      if (tomo) {
        const tomoLicenses = purchasedLicenseStore.getLicensesForAddress(tomo);
        allLicenses.push(...tomoLicenses);
      }
      
      // Add licenses from MetaMask wallet
      if (metaMaskAddress) {
        const metaMaskLicenses = purchasedLicenseStore.getLicensesForAddress(metaMaskAddress);
        allLicenses.push(...metaMaskLicenses);
      }
      
      // Remove duplicates by submission ID
      const uniqueLicenses = allLicenses.filter((license, index, self) => 
        index === self.findIndex(l => l.submissionId === license.submissionId)
      );
      
      setLicenses(uniqueLicenses);
      setIsLoading(false);
    };

    loadData();
  }, [metaMaskAddress]); // Re-run when MetaMask address changes

  // Filter licenses based on search and filters
  useEffect(() => {
    let filtered = licenses;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(license =>
        license.assetName.toLowerCase().includes(searchLower) ||
        license.submissionId.toLowerCase().includes(searchLower) ||
        license.licenseType.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(license => license.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(license => license.licenseType === typeFilter);
    }

    setFilteredLicenses(filtered);
  }, [licenses, searchTerm, statusFilter, typeFilter]);

  const refreshLicenses = async () => {
    setIsLoading(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reload data
    const tomo = getTomoAddress();
    setTomoAddress(tomo);
    
    const allLicenses: PurchasedLicense[] = [];
    
    if (tomo) {
      const tomoLicenses = purchasedLicenseStore.getLicensesForAddress(tomo);
      allLicenses.push(...tomoLicenses);
    }
    
    if (metaMaskAddress) {
      const metaMaskLicenses = purchasedLicenseStore.getLicensesForAddress(metaMaskAddress);
      allLicenses.push(...metaMaskLicenses);
    }
    
    const uniqueLicenses = allLicenses.filter((license, index, self) => 
      index === self.findIndex(l => l.submissionId === license.submissionId)
    );
    
    setLicenses(uniqueLicenses);
    setIsLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownloadAsset = (license: PurchasedLicense) => {
    // Since we don't have the actual asset CID stored in the license,
    // we'll show a placeholder for now
    // In a real implementation, we would fetch the asset details using the assetId
    alert(`Download functionality for ${license.assetName} would be implemented here. Asset ID: ${license.assetId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case 'BASIC': return 'bg-gray-100 text-gray-800';
      case 'COMMERCIAL': return 'bg-green-100 text-green-800';
      case 'EXCLUSIVE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const analytics = {
    totalLicenses: licenses.length,
    totalSpent: licenses.reduce((sum, license) => sum + license.purchasePrice, 0),
    averagePrice: licenses.length > 0 ? licenses.reduce((sum, license) => sum + license.purchasePrice, 0) / licenses.length : 0,
    typeBreakdown: licenses.reduce((acc, license) => {
      acc[license.licenseType] = (acc[license.licenseType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // If no wallets connected
  if (!tomoAddress && !isMetaMaskConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your Tomo or MetaMask wallet to view your purchased licenses and manage your digital assets.
            </p>
            <Alert className="max-w-md mx-auto">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>No Wallet Connected</AlertTitle>
              <AlertDescription>
                Please connect your wallet using the navigation menu to access your licenses.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Licenses</h1>
              <p className="text-gray-600">
                Manage your purchased content licenses and track your digital asset portfolio
              </p>
            </div>
            <Button onClick={refreshLicenses} disabled={isLoading} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Wallet Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {tomoAddress && (
              <Card className="border-l-4 border-l-emerald-500 bg-white/80 backdrop-blur-sm shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Tomo Wallet Connected</p>
                      <p className="text-sm text-gray-600 font-mono">{formatAddress(tomoAddress)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {metaMaskAddress && (
              <Card className="border-l-4 border-l-teal-500 bg-white/80 backdrop-blur-sm shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">MetaMask Connected</p>
                      <p className="text-sm text-gray-600 font-mono">{formatAddress(metaMaskAddress)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Tabs defaultValue="licenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="licenses" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              My Licenses ({licenses.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="licenses" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search licenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                      <SelectItem value="EXCLUSIVE">Exclusive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Licenses List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your licenses...</p>
              </div>
            ) : filteredLicenses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Licenses Found</h3>
                  <p className="text-gray-600 mb-6">
                    {licenses.length === 0 
                      ? "You haven't purchased any licenses yet. Start exploring the marketplace!"
                      : "No licenses match your current filters. Try adjusting your search criteria."
                    }
                  </p>
                  <Button asChild>
                    <a href="/gallery">
                      <Eye className="w-4 h-4 mr-2" />
                      Explore Gallery
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredLicenses.map((license) => (
                  <motion.div
                    key={license.submissionId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{license.assetName}</h3>
                              <Badge className={getLicenseTypeColor(license.licenseType)}>
                                {license.licenseType}
                              </Badge>
                              <Badge className={getStatusColor(license.status)}>
                                {license.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <p className="font-medium text-gray-900">Purchase Date</p>
                                <p className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(license.purchaseDate)}
                                </p>
                              </div>
                              
                              <div>
                                <p className="font-medium text-gray-900">Price Paid</p>
                                <p className="text-green-600 font-semibold">
                                  ${license.purchasePrice.toFixed(2)}
                                </p>
                              </div>
                              
                              <div>
                                <p className="font-medium text-gray-900">Payment Route</p>
                                <p>{license.sourceChain} → {license.destinationChain}</p>
                              </div>
                              
                              <div>
                                <p className="font-medium text-gray-900">Submission ID</p>
                                <button
                                  onClick={() => copyToClipboard(license.submissionId)}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                >
                                  <span className="font-mono text-xs">
                                    {license.submissionId.substring(0, 8)}...
                                  </span>
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {license.transactionHash && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={`https://sepolia.etherscan.io/tx/${license.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  View TX
                                </a>
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadAsset(license)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Licenses</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalLicenses}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">${analytics.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Price</p>
                      <p className="text-2xl font-bold text-gray-900">${analytics.averagePrice.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <div className="text-lg font-bold text-orange-600">$</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Most Common</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Object.keys(analytics.typeBreakdown).length > 0 
                          ? Object.entries(analytics.typeBreakdown).sort(([,a], [,b]) => b - a)[0][0]
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* License Type Breakdown */}
            {Object.keys(analytics.typeBreakdown).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>License Type Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.typeBreakdown).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={getLicenseTypeColor(type)}>{type}</Badge>
                          <span className="text-gray-600">{count} licenses</span>
                        </div>
                        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / analytics.totalLicenses) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round((count / analytics.totalLicenses) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModernLicensesPage;