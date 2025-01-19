import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SummaryCards from './SummaryCards';
import SecurityRadarChart from './SecurityRadarChart';
import TimelineChart from './TimelineChart';
import DistributionCharts from './DistributionCharts';
import type { DashboardData } from '@/types/dashboard';
import AdvancedSearch from './AdvancedSearch';

interface BreachMetricsDashboardProps {
  data?: DashboardData;
  apiEndpoint?: string;
  refreshInterval?: number;
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
    { category: 'Unresolved Issues', value: 900, fullMark: 1500 },
    { category: 'Login Forms', value: 800, fullMark: 1500 },
    { category: 'Previously Breached', value: 400, fullMark: 1500 },
    { category: 'Active Sites', value: 1200, fullMark: 1500 },
    { category: 'Critical Services', value: 600, fullMark: 1500 },
    { category: 'High-Risk Domains', value: 450, fullMark: 1500 },
  ],
  loginFormDistribution: {
    basic: 400,
    captcha: 200,
    otp: 150,
    other: 50,
  },
  timelineData: [
    { date: '2024-01', newBreaches: 120, resolved: 80 },
    { date: '2024-02', newBreaches: 150, resolved: 100 },
    { date: '2024-03', newBreaches: 90, resolved: 130 },
    { date: '2024-04', newBreaches: 200, resolved: 150 },
  ],
  topApplications: [
    { name: 'WordPress', count: 300 },
    { name: 'Citrix', count: 200 },
    { name: 'Exchange', count: 150 },
    { name: 'SharePoint', count: 100 },
    { name: 'Custom', count: 250 },
  ],
};

const BreachMetricsDashboard: React.FC<BreachMetricsDashboardProps> = ({
  data: propData,
  apiEndpoint,
  refreshInterval = 30000,
  onDataUpdate,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propData) {
      setData(propData);
      setLoading(false);
      onDataUpdate?.(propData);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (apiEndpoint) {
          const response = await fetch(apiEndpoint);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const newData = await response.json();
          setData(newData);
          onDataUpdate?.(newData);
        } else {
          // Use mock data
          setData(mockData);
          onDataUpdate?.(mockData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (apiEndpoint && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [propData, apiEndpoint, refreshInterval, onDataUpdate]);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading dashboard data: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
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