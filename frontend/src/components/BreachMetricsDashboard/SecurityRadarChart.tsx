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
import type { VulnerabilityRadarData } from '@/types/dashboard';

interface SecurityRadarChartProps {
  data: VulnerabilityRadarData[];
}

const SecurityRadarChart: React.FC<SecurityRadarChartProps> = ({ data }) => {
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
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis domain={[0, 1500]} />
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