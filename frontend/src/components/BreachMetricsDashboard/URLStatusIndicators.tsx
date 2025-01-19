import React from 'react';
import { Shield, Globe, Lock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';

interface URLStatusProps {
  isAccessible: boolean;
  hasLoginForm: boolean;
  loginType?: 'basic' | 'captcha' | 'otp';
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
  return (
    <div className="flex flex-wrap gap-2">
      {/* Accessibility Status */}
      <Tooltip content={`Status Code: ${isAccessible ? '200' : 'Not accessible'}`}>
        <Badge 
          variant={isAccessible ? "default" : "secondary"}
          className="flex items-center gap-1"
        >
          <Globe className="h-3 w-3" />
          {isAccessible ? 'Accessible' : 'Inaccessible'}
        </Badge>
      </Tooltip>

      {/* Login Form Status */}
      {hasLoginForm && (
        <Tooltip content={`Login type: ${loginType || 'Basic'}`}>
          <Badge 
            variant="outline" 
            className="flex items-center gap-1"
          >
            <Lock className="h-3 w-3" />
            {loginType === 'captcha' ? 'CAPTCHA' : 
             loginType === 'otp' ? 'OTP/2FA' : 
             'Basic Auth'}
          </Badge>
        </Tooltip>
      )}

      {/* Application Type */}
      {applicationName && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          {applicationName}
        </Badge>
      )}

      {/* Parked Domain */}
      {isParked && (
        <Badge variant="secondary">Parked Domain</Badge>
      )}

      {/* Previously Breached */}
      {wasBreached && (
        <Tooltip content="Domain previously involved in a breach">
          <Badge 
            variant="destructive"
            className="flex items-center gap-1"
          >
            <AlertTriangle className="h-3 w-3" />
            Previously Breached
          </Badge>
        </Tooltip>
      )}

      {/* URL Title */}
      {title && (
        <Tooltip content={title}>
          <Badge variant="outline" className="max-w-xs truncate">
            {title}
          </Badge>
        </Tooltip>
      )}
    </div>
  );
};

export default URLStatusIndicators;