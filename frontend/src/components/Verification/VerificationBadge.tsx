"use client";

import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Info,
  Shield,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import {
  YakoaVerificationResult,
  getVerificationStatusColor,
  getVerificationStatusLabel,
  getTrustScoreLabel,
  getTrustScoreColor,
} from "../../hooks/useYakoaVerification";

interface VerificationBadgeProps {
  verification: YakoaVerificationResult | null;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  onClick?: () => void;
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verification,
  size = 'medium',
  showDetails = false,
  onClick,
  className,
}) => {
  if (!verification) {
    return (
      <Badge variant="outline" className={cn("text-gray-500 border-gray-300", className)}>
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  }

  const getStatusIcon = (status: string) => {
    const iconSize = size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4';
    
    switch (status) {
      case 'verified':
        return <CheckCircle className={cn(iconSize, "mr-1")} />;
      case 'pending':
        return <Clock className={cn(iconSize, "mr-1")} />;
      case 'flagged':
        return <AlertTriangle className={cn(iconSize, "mr-1")} />;
      case 'failed':
        return <XCircle className={cn(iconSize, "mr-1")} />;
      default:
        return <Info className={cn(iconSize, "mr-1")} />;
    }
  };

  const getBadgeClassName = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'flagged':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'failed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const { verificationStatus, trustScore } = verification;
  const badgeClass = getBadgeClassName(verificationStatus);
  
  const label = showDetails ? 
    `${getVerificationStatusLabel(verificationStatus)} (${(trustScore * 100).toFixed(0)}%)` :
    getVerificationStatusLabel(verificationStatus);

  return (
    <Badge 
      className={cn(
        badgeClass,
        size === 'small' ? 'text-xs px-2 py-1' : 
        size === 'large' ? 'text-sm px-3 py-2' : 'text-sm px-2 py-1',
        onClick ? 'cursor-pointer hover:opacity-80' : '',
        className
      )}
      onClick={onClick}
      title={`Status: ${getVerificationStatusLabel(verificationStatus)} | Trust Score: ${(trustScore * 100).toFixed(0)}% | Infringements: ${verification.infringements.external.length + verification.infringements.inNetwork.length} | Authorizations: ${verification.authorizations.length}`}
    >
      {getStatusIcon(verificationStatus)}
      {label}
    </Badge>
  );
};

export default VerificationBadge;