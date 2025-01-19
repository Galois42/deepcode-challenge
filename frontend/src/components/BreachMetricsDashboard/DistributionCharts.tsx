import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer, Legend, Tooltip,
  XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Layout } from 'lucide-react';
import type { LoginFormDistribution } from '@/types/dashboard';

interface DistributionChartsProps {
  loginFormData: LoginFormDistribution;
  applicationData: Array<{
    name: string;
    count: number;
  }>;
}

const BLUE_SHADES = [
  '#3B82F6', // Medium blue
  '#60A5FA', // Light blue
  '#2563EB', // Deep blue
  '#93C5FD', // Very light blue
];

const DistributionCharts: React.FC<DistributionChartsProps> = ({
  loginFormData,
  applicationData
}) => {
  // Transform login form data for pie chart
  const authData = Object.entries(loginFormData).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }));

  const authTotal = authData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / authTotal) * 100).toFixed(1);
      return (
        <div className="bg-gray-800/95 backdrop-blur border border-blue-500/30 p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: payload[0].color }}
            />
            <span className="text-blue-400 font-medium">{payload[0].payload.type}</span>
          </div>
          <div className="space-y-1">
            <p className="text-blue-300">
              <span className="text-2xl font-bold">{percentage}%</span>
            </p>
            <p className="text-gray-400 text-sm">
              {payload[0].value.toLocaleString()} forms
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = applicationData.reduce((sum, item) => sum + item.count, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-gray-800/95 backdrop-blur border border-blue-500/30 p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: payload[0].color }}
            />
            <span className="text-blue-400 font-medium">{payload[0].payload.name}</span>
          </div>
          <div className="space-y-1">
            <p className="text-blue-300">
              <span className="text-2xl font-bold">{percentage}%</span>
            </p>
            <p className="text-gray-400 text-sm">
              {payload[0].value.toLocaleString()} instances
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Authentication Methods Chart */}
      <Card className="bg-gray-800 border border-blue-500/30 shadow-lg shadow-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Authentication Methods
          </CardTitle>
          <CardDescription className="text-gray-400">
            Distribution of login form types across detected services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {BLUE_SHADES.map((color, index) => (
                    <linearGradient
                      key={`gradient-${index}`}
                      id={`auth-gradient-${index}`}
                      x1="0" y1="0" x2="0" y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={authData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  paddingAngle={4}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {authData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#auth-gradient-${index})`}
                      stroke={BLUE_SHADES[index % BLUE_SHADES.length]}
                      strokeWidth={2}
                      className="transition-opacity duration-200 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  formatter={(value) => <span className="text-blue-300 text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center statistics */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {authTotal.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Forms</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Distribution Chart */}
      <Card className="bg-gray-800 border border-blue-500/30 shadow-lg shadow-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Applications Distribution
          </CardTitle>
          <CardDescription className="text-gray-400">
            Distribution of detected web applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={applicationData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3"
                  stroke="rgba(96, 165, 250, 0.1)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="#60A5FA"
                  tick={{ fill: "#60A5FA" }}
                  tickLine={{ stroke: "#60A5FA" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#60A5FA"
                  tick={{ fill: "#60A5FA" }}
                  tickLine={{ stroke: "#60A5FA" }}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  className="transition-all duration-300"
                >
                  {applicationData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={BLUE_SHADES[index % BLUE_SHADES.length]}
                      className="hover:opacity-80 transition-opacity duration-300"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DistributionCharts;