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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-blue-500/30 p-3 rounded-lg shadow-lg">
          <p className="text-blue-400 font-medium mb-1">{payload[0].payload.category}</p>
          <p className="text-white font-bold">{payload[0].value} instances</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800 border border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-blue-400">Security Risk Distribution</CardTitle>
        <CardDescription className="text-gray-400">
          Comprehensive view of security metrics across different categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid 
                stroke="rgba(96, 165, 250, 0.2)"
                strokeDasharray="3 3"
              />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: '#60A5FA', fontSize: 12 }}
                stroke="rgba(96, 165, 250, 0.2)"
              />
              <PolarRadiusAxis
                stroke="rgba(96, 165, 250, 0.2)"
                tick={{ fill: '#60A5FA' }}
                angle={30}
              />
              <Radar
                name="Security Metrics"
                dataKey="value"
                stroke="#60A5FA"
                fill="#60A5FA"
                fillOpacity={0.3}
                strokeWidth={2}
                animationBegin={200}
                animationDuration={800}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px'
                }}
                formatter={(value) => (
                  <span className="text-blue-400">{value}</span>
                )}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityRadarChart;