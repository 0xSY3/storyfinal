"use client";

import React from 'react';
import ModernLicensesPage from './ModernLicensesPage';
import MetaMaskGuard from '../../components/guards/MetaMaskGuard';

export default function LicensesPage() {
  return (
    <MetaMaskGuard>
      <ModernLicensesPage />
    </MetaMaskGuard>
  );
}