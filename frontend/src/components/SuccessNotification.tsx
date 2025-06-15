"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SuccessNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  onViewLicenses: () => void;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  isOpen,
  onClose,
  submissionId,
  onViewLicenses
}) => {
  const [copied, setCopied] = useState(false);

  const copySubmissionId = () => {
    navigator.clipboard.writeText(submissionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0 shadow-none">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">🎉 Purchase Successful!</h3>
                    <p className="text-sm text-gray-600">Your cross-chain license is ready</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">License Purchased Successfully</span>
                  </div>
                  <p className="text-xs text-green-700">
                    Your cross-chain payment has been processed and the license has been recorded on Story Protocol.
                  </p>
                </div>

                {/* Submission ID */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Submission ID</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <code className="flex-1 text-xs font-mono text-gray-800 break-all">
                      {submissionId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copySubmissionId}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* What's Next */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">What's Next?</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Your license is being processed on the blockchain</li>
                    <li>• You can view all your licenses in the dashboard</li>
                    <li>• The license will be available for use shortly</li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={onViewLicenses}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View My Licenses
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SuccessNotification;