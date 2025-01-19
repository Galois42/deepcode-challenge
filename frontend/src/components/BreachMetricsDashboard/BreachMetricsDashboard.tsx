import React, { useState, useCallback, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import SummaryCards from "./SummaryCards";
import SecurityRadarChart from "./SecurityRadarChart";
import TimelineChart from "./TimelineChart";
import DistributionCharts from "./DistributionCharts";
import {
  RiskSeverityChart,
  BreachResolutionChart,
  HistoricalImpactChart,
  AuthSuccessChart,
} from "./CriticalCharts";
import type {
  SecurityMetrics,
  APIStatisticsResponse,
  RiskSeverityData,
  BreachResolutionData,
  HistoricalImpactData,
  AuthPatternData,
} from "@/types/dashboard";
import AdvancedSearch from "./AdvancedSearch";
import axios from "axios";

// Helper functions for mock data generation
const generateHistoricalData = (
  total: number,
  resolved: number
): HistoricalImpactData[] => {
  const months = 6;
  return Array.from({ length: months }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (months - i - 1));
    return {
      date: date.toISOString().slice(0, 7),
      accountsAffected: Math.round(total * (0.7 + Math.random() * 0.3)),
      criticalSystems: Math.round(resolved * (0.7 + Math.random() * 0.3)),
      recoveryTime: Math.round(48 * (0.8 + Math.random() * 0.4)),
    };
  });
};

const generateAuthData = (
  historicalData: HistoricalImpactData[]
): AuthPatternData[] => {
  return historicalData.map((item) => ({
    date: item.date,
    attempts: Math.round(item.accountsAffected * 1.5),
    successRate: Math.round(60 + Math.random() * 30),
  }));
};

// Mock data for development and fallback
const mockMetrics: SecurityMetrics = {
  total: 1500,
  resolved: 600,
  unresolved: 900,
  accessible: 1200,
  inaccessible: 300,
  loginForms: 800,
  parked: 150,
  previouslyBreached: 400,
};

const calculateRiskSeverity = (total: number): RiskSeverityData[] => [
  { name: "Critical", count: Math.round(total * 0.2) },
  { name: "High", count: Math.round(total * 0.3) },
  { name: "Medium", count: Math.round(total * 0.3) },
  { name: "Low", count: Math.round(total * 0.2) },
];

const calculateResolutionStatus = (
  resolved: number,
  unresolved: number
): BreachResolutionData[] => [
  { category: "Resolved", count: resolved },
  { category: "In Progress", count: Math.floor(unresolved * 0.4) },
  { category: "Pending", count: Math.floor(unresolved * 0.3) },
  { category: "Requires Attention", count: Math.floor(unresolved * 0.3) },
];

const BreachMetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>(mockMetrics);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMockData, setIsMockData] = useState<boolean>(true);

  // Derived state for charts
  const [riskData, setRiskData] = useState<RiskSeverityData[]>(
    calculateRiskSeverity(mockMetrics.total)
  );
  const [resolutionData, setResolutionData] = useState<BreachResolutionData[]>(
    calculateResolutionStatus(mockMetrics.resolved, mockMetrics.unresolved)
  );
  const [historicalData, setHistoricalData] = useState<HistoricalImpactData[]>(
    generateHistoricalData(mockMetrics.total, mockMetrics.resolved)
  );
  const [authData, setAuthData] = useState<AuthPatternData[]>(
    generateAuthData(
      generateHistoricalData(mockMetrics.total, mockMetrics.resolved)
    )
  );

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const response = await axios.get<APIStatisticsResponse>(
        "/api/statistics"
      );

      if (response.status === 200) {
        const data = response.data;
        setIsMockData(false);

        // Transform API data into our metrics format
        const securityMetrics: SecurityMetrics = {
          total: data.total_records,
          resolved: data.resolved_cases,
          unresolved: data.total_records - data.resolved_cases,
          accessible: data.accessible_domains,
          inaccessible: data.total_records - data.accessible_domains,
          loginForms: data.login_forms,
          parked: data.is_parked,
          previouslyBreached: data.previously_breached,
        };

        // Update all metrics and chart data
        setMetrics(securityMetrics);
        setRiskData(calculateRiskSeverity(data.total_records));
        setResolutionData(
          calculateResolutionStatus(
            data.resolved_cases,
            data.total_records - data.resolved_cases
          )
        );

        // Generate historical data based on actual metrics
        const historical = generateHistoricalData(
          data.total_records,
          data.resolved_cases
        );
        setHistoricalData(historical);

        // Generate authentication data based on historical data
        setAuthData(generateAuthData(historical));
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to fetch dashboard data. Using mock data.");
      setIsMockData(true);

      // Use mock data as fallback
      setMetrics(mockMetrics);
      setRiskData(calculateRiskSeverity(mockMetrics.total));
      setResolutionData(
        calculateResolutionStatus(mockMetrics.resolved, mockMetrics.unresolved)
      );

      // Generate mock historical and auth data
      const mockHistorical = generateHistoricalData(
        mockMetrics.total,
        mockMetrics.resolved
      );
      setHistoricalData(mockHistorical);
      setAuthData(generateAuthData(mockHistorical));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Security Dashboard</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Advanced Search */}
      <AdvancedSearch />

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <SummaryCards metrics={metrics} />

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskSeverityChart data={riskData} />
            <BreachResolutionChart data={resolutionData} />
            <HistoricalImpactChart data={historicalData} />
            <AuthSuccessChart data={authData} />
            <SecurityRadarChart data={metrics} />
            <TimelineChart data={historicalData} />
            <div className="col-span-2">
              <DistributionCharts
                loginFormData={{
                  basic: metrics.loginForms * 0.4,
                  captcha: metrics.loginForms * 0.3,
                  otp: metrics.loginForms * 0.2,
                  other: metrics.loginForms * 0.1,
                }}
                applicationData={[
                  {
                    name: "WordPress",
                    count: Math.round(metrics.total * 0.25),
                  },
                  { name: "Citrix", count: Math.round(metrics.total * 0.2) },
                  { name: "Exchange", count: Math.round(metrics.total * 0.15) },
                  {
                    name: "SharePoint",
                    count: Math.round(metrics.total * 0.1),
                  },
                  { name: "Custom", count: Math.round(metrics.total * 0.3) },
                ]}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BreachMetricsDashboard;
