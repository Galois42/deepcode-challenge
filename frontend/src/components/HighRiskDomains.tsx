import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ExternalLink, Shield, History } from 'lucide-react';
import type { HighRiskDomainsProps } from '@/types/dashboard';

const HighRiskDomains: React.FC<HighRiskDomainsProps> = ({ domains }) => {
  // Get risk level and corresponding styles
  const getRiskLevel = (score: number): { level: string; color: string } => {
    if (score >= 80) return { level: 'Critical', color: 'text-red-500' };
    if (score >= 60) return { level: 'High', color: 'text-orange-500' };
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-blue-500' };
  };

  // Get progress bar styles
  const getProgressStyle = (score: number): string => {
    return `
      w-[${score}%]
      h-2 
      rounded-full 
      ${score >= 80 ? 'bg-red-500' : 
        score >= 60 ? 'bg-orange-500' : 
        score >= 40 ? 'bg-yellow-500' : 
        'bg-blue-500'}
    `;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          High Risk Domains
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {domains.map((domain) => {
            const { level, color } = getRiskLevel(domain.riskScore);
            return (
              <div
                key={domain.name}
                className="group relative rounded-lg border p-3 hover:bg-gray-50 transition-colors"
              >
                {/* Domain and Risk Level */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${color}`} />
                    <span className="font-medium">{domain.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${color} border-current`}
                  >
                    {level} Risk
                  </Badge>
                </div>

                {/* Risk Score Bar */}
                <div className="relative h-2 w-full bg-gray-100 rounded-full">
                  <div 
                    className={getProgressStyle(domain.riskScore)}
                    style={{ width: `${domain.riskScore}%` }}
                  />
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <History className="h-4 w-4" />
                      {domain.breachCount} breaches
                    </span>
                    {domain.lastBreachDate && (
                      <span>Last breach: {new Date(domain.lastBreachDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  <button 
                    className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => window.open(`https://${domain.name}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default HighRiskDomains;