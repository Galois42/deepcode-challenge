import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ExternalLink,
  Shield,
  History,
  AlertOctagon,
} from "lucide-react";
import type { HighRiskDomainsProps } from "@/types/dashboard";

const HighRiskDomains: React.FC<HighRiskDomainsProps> = ({ domains }) => {
  // Get risk level with enhanced styling
  const getRiskLevel = (
    score: number
  ): { level: string; color: string; bgColor: string } => {
    if (score >= 80)
      return {
        level: "Critical",
        color: "text-red-400",
        bgColor: "bg-red-500/10",
      };
    if (score >= 60)
      return {
        level: "High",
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
      };
    if (score >= 40)
      return {
        level: "Medium",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
      };
    return {
      level: "Low",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    };
  };

  return (
    <Card className="bg-gray-800 border-red-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-400">
          <AlertOctagon className="h-5 w-5" />
          High Risk Domains
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {domains.map((domain) => {
            const { level, color, bgColor } = getRiskLevel(domain.riskScore);
            return (
              <div
                key={domain.domain}
                className={`
                  relative overflow-hidden
                  ${bgColor} rounded-lg border border-gray-700
                  transition-all duration-300
                  hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10
                `}
              >
                {/* Glowing side indicator */}
                <div
                  className={`absolute left-0 top-0 w-1 h-full ${color.replace(
                    "text",
                    "bg"
                  )}`}
                  style={{
                    boxShadow: "0 0 10px currentColor",
                  }}
                />

                <div className="p-4 pl-6">
                  {/* Domain and Risk Level */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className={color} />
                      <span className="font-medium text-gray-200">
                        {domain.domain}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${color} border-current`}
                    >
                      {level} Risk
                    </Badge>
                  </div>

                  {/* Risk Score Bar */}
                  <div className="relative h-2 w-full bg-gray-700 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all duration-500 ${color.replace(
                        "text",
                        "bg"
                      )}`}
                      style={{
                        width: `${domain.riskScore}%`,
                        boxShadow: "0 0 10px currentColor",
                      }}
                    />
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className={`flex items-center gap-1 ${color}`}>
                        <AlertTriangle className="h-4 w-4" />
                        {domain.breachCount} breaches
                      </span>
                      {domain.lastBreachDate && (
                        <span className="text-gray-400 flex items-center gap-1">
                          <History className="h-4 w-4" />
                          Last:{" "}
                          {new Date(domain.lastBreachDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <button
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                      onClick={() =>
                        window.open(`https://${domain.domain}`, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {domains.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              No high-risk domains detected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HighRiskDomains;
