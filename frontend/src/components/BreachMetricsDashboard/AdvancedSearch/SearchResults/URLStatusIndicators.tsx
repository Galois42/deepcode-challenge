import React from 'react';
import { Shield, Globe, Lock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';

type LoginFormType = 'basic' | 'captcha' | 'otp' | 'other';

interface URLStatusProps {
  isAccessible: boolean;
  hasLoginForm: boolean;
  loginType?: LoginFormType;
  applicationName?: string;
  title?: string;
  isParked: boolean;
  wasBreached: boolean;
}

const URLStatusIndicators: React.FC<URLStatusProps> = ({
  isAccessible,
  hasLoginForm,
  loginType,
  applicationName,
  title,
  isParked,
  wasBreached
}) => {
  // Only render indicators that have truthy values
  return (
    <div className="flex flex-wrap gap-2">
      {/* Accessibility Status - Always show as it's a boolean */}
      <Tooltip content={`Status Code: ${isAccessible ? '200' : 'Not accessible'}`}>
        <Badge 
          variant={isAccessible ? "default" : "secondary"}
          className="flex items-center gap-1 text-blue-400 border-blue-400"
        >
          <Globe className="h-3 w-3 text-blue-400" />
          {isAccessible ? 'Accessible' : 'Inaccessible'}
        </Badge>
      </Tooltip>

      {/* Login Form Status - Only show if hasLoginForm is true */}
      {hasLoginForm && loginType && (
        <Tooltip content={`Login type: ${loginType}`}>
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 text-blue-400 border-blue-400"
          >
            <Lock className="h-3 w-3 text-blue-400" />
            {loginType === 'captcha' ? 'CAPTCHA' : 
             loginType === 'otp' ? 'OTP/2FA' : 
             loginType === 'other' ? 'Other Auth' :
             'Basic Auth'}
          </Badge>
        </Tooltip>
      )}

      {/* Application Type - Only show if applicationName exists and is not empty */}
      {applicationName && applicationName.trim() !== '' && (
        <Badge variant="secondary" className="flex items-center gap-1 text-blue-400 bg-blue-500/10">
          <Shield className="h-3 w-3 text-blue-400" />
          {applicationName}
        </Badge>
      )}

      {/* Parked Domain - Only show if isParked is true */}
      {isParked && (
        <Badge variant="secondary" className="text-blue-400 bg-blue-500/10">
          Parked Domain
        </Badge>
      )}

      {/* Previously Breached - Only show if wasBreached is true */}
      {wasBreached && (
        <Tooltip content="Domain previously involved in a breach">
          <Badge 
            variant="destructive"
            className="flex items-center gap-1 text-red-400 bg-red-500/10 border-red-400"
          >
            <AlertTriangle className="h-3 w-3 text-red-400" />
            Previously Breached
          </Badge>
        </Tooltip>
      )}

      {/* URL Title - Only show if title exists and is not empty */}
      {title && title.trim() !== '' && (
        <Tooltip content={title}>
          <Badge variant="outline" className="max-w-xs truncate text-blue-400 border-blue-400">
            {title}
          </Badge>
        </Tooltip>
      )}
    </div>
  );
};

export default URLStatusIndicators;