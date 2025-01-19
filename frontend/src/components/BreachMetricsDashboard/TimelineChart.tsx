import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { HistoricalImpactData } from '@/types/dashboard';

interface TimelineChartProps {
  data: HistoricalImpactData[];
}

const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  // Custom Tooltip styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-blue-500/30 p-3 rounded-lg shadow-lg">
          <p className="text-blue-400 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-blue-400">Breach Impact Timeline</CardTitle>
        <CardDescription className="text-gray-400">
          Historical trend of breach impacts and recovery times
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(96, 165, 250, 0.1)"
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                stroke="#60A5FA"
                tick={{ fill: '#60A5FA' }}
                tickLine={{ stroke: '#60A5FA' }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#60A5FA"
                tick={{ fill: '#60A5FA' }}
                tickLine={{ stroke: '#60A5FA' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                stroke="#60A5FA"
                tick={{ fill: '#60A5FA' }}
                tickLine={{ stroke: '#60A5FA' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span className="text-blue-400">{value}</span>}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="accountsAffected"
                stroke="#60A5FA"
                name="Accounts Affected"
                strokeWidth={2}
                dot={{ 
                  r: 4,
                  fill: '#60A5FA',
                  stroke: '#60A5FA',
                }}
                activeDot={{
                  r: 6,
                  stroke: '#60A5FA',
                  strokeWidth: 2,
                  fill: '#60A5FA'
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="criticalSystems"
                stroke="#34D399"
                name="Critical Systems"
                strokeWidth={2}
                dot={{ 
                  r: 4,
                  fill: '#34D399',
                  stroke: '#34D399'
                }}
                activeDot={{
                  r: 6,
                  stroke: '#34D399',
                  strokeWidth: 2,
                  fill: '#34D399'
                }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="recoveryTime"
                stroke="#F59E0B"
                name="Recovery Time (hrs)"
                strokeWidth={2}
                dot={{ 
                  r: 4,
                  fill: '#F59E0B',
                  stroke: '#F59E0B'
                }}
                activeDot={{
                  r: 6,
                  stroke: '#F59E0B',
                  strokeWidth: 2,
                  fill: '#F59E0B'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineChart;