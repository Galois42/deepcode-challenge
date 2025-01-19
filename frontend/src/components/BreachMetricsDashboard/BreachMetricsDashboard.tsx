import React, { useState, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import SummaryCards from "./SummaryCards";
import SecurityRadarChart from "./SecurityRadarChart";
import TimelineChart from "./TimelineChart";
import DistributionCharts from "./DistributionCharts";
import type { DashboardData } from "@/types/dashboard";
import AdvancedSearch from "./AdvancedSearch";
import axios from "axios";

interface BreachMetricsDashboardProps {
  apiEndpoint?: string;
  onDataUpdate?: (data: DashboardData) => void;
}

const mockData: DashboardData = {
  securityMetrics: {
    total: 1500,
    resolved: 600,
    unresolved: 900,
    accessible: 1200,
    inaccessible: 300,
    loginForms: 800,
    parked: 150,
    previouslyBreached: 400,
  },
  vulnerabilityRadar: [
    { category: "Unresolved Issues", value: 900, fullMark: 1500 },
    { category: "Login Forms", value: 800, fullMark: 1500 },
    { category: "Previously Breached", value: 400, fullMark: 1500 },
    { category: "Active Sites", value: 1200, fullMark: 1500 },
    { category: "Critical Services", value: 600, fullMark: 1500 },
    { category: "High-Risk Domains", value: 450, fullMark: 1500 },
  ],
  loginFormDistribution: {
    basic: 400,
    captcha: 200,
    otp: 150,
    other: 50,
  },
  timelineData: [
    { date: "2024-01", newBreaches: 120, resolved: 80 },
    { date: "2024-02", newBreaches: 150, resolved: 100 },
    { date: "2024-03", newBreaches: 90, resolved: 130 },
    { date: "2024-04", newBreaches: 200, resolved: 150 },
  ],
  topApplications: [
    { name: "WordPress", count: 300 },
    { name: "Citrix", count: 200 },
    { name: "Exchange", count: 150 },
    { name: "SharePoint", count: 100 },
    { name: "Custom", count: 250 },
  ],
};

const BreachMetricsDashboard: React.FC<BreachMetricsDashboardProps> = ({
  apiEndpoint = "/api/statistics",
  onDataUpdate,
}) => {
  const [data, setData] = useState<DashboardData>(mockData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const response = await axios.get(apiEndpoint);

      if (response.status === 200) {
        const statisticsData = response.data;

        const updatedData: DashboardData = {
          securityMetrics: {
            total: statisticsData.total_records,
            resolved: statisticsData.resolved_cases,
            unresolved:
              statisticsData.total_records - statisticsData.resolved_cases,
            accessible: statisticsData.accessible_domains,
            inaccessible:
              statisticsData.total_records -
              statisticsData.accessible_domains,
            loginForms: statisticsData.login_forms,
            parked: 0,
            previouslyBreached: 0,
          },
          vulnerabilityRadar: mockData.vulnerabilityRadar,
          loginFormDistribution:
            statisticsData.login_form_types || mockData.loginFormDistribution,
          timelineData: mockData.timelineData,
          topApplications: mockData.topApplications,
        };

        setData(updatedData);
        onDataUpdate?.(updatedData);
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to fetch dashboard data. Using mock data instead.");
      setData(mockData);
      onDataUpdate?.(mockData);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [apiEndpoint, onDataUpdate]);

  // Initial data fetch
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

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
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Section */}
      <AdvancedSearch />

      {/* Summary Cards */}
      <SummaryCards metrics={data.securityMetrics} />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecurityRadarChart data={data.vulnerabilityRadar} />
        <TimelineChart data={data.timelineData} />
        <DistributionCharts
          loginFormData={data.loginFormDistribution}
          applicationData={data.topApplications}
        />
      </div>
    </div>
  );
};

export default BreachMetricsDashboard;