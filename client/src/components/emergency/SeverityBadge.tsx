import React from 'react';
import type { EmergencySeverity } from '@shared/types/index';
import { Badge } from '../ui/Badge';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, HelpCircle } from 'lucide-react';

interface SeverityBadgeProps {
  severity: EmergencySeverity | string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const sev = (severity || 'unknown').toLowerCase();

  switch (sev) {
    case 'critical':
      return (
        <Badge variant="critical" size={size}>
          <AlertCircle className="w-3.5 h-3.5" />
          Critical Severity
        </Badge>
      );
    case 'high':
      return (
        <Badge variant="high" size={size}>
          <AlertTriangle className="w-3.5 h-3.5" />
          High Severity
        </Badge>
      );
    case 'moderate':
      return (
        <Badge variant="moderate" size={size}>
          <Info className="w-3.5 h-3.5" />
          Moderate Severity
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="low" size={size}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Low Severity
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size={size}>
          <HelpCircle className="w-3.5 h-3.5" />
          Unknown Severity
        </Badge>
      );
  }
};
