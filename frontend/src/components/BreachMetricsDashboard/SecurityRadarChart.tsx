import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { SecurityMetrics } from '@/types/dashboard';

interface SecurityRadarChartProps {
  data: SecurityMetrics;
}

const SecurityRadarChart: React.FC<SecurityRadarChartProps> = ({ data }) => {
  const radarData = [
    {
      category: 'Total Breaches',
      value: data.total,
      fullMark: data.total * 1.2
    },
    {
      category: 'Unresolved',
      value: data.unresolved,
      fullMark: data.total
    },
    {
      category: 'Login Forms',
      value: data.loginForms,
      fullMark: data.total
    },
    {
      category: 'Previously Breached',
      value: data.previouslyBreached,
      fullMark: data.total
    },
    {
      category: 'Active Sites',
      value: data.accessible,
      fullMark: data.total
    },
    {
      category: 'Parked Domains',
      value: data.parked,
      fullMark: data.total
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Risk Distribution</CardTitle>
        <CardDescription>
          Comprehensive view of security metrics across different categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis domain={[0, data.total]} />
              <Radar
                name="Security Metrics"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityRadarChart;