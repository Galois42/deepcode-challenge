import React from "react";
import {
  PieChart, Pie, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ComposedChart, Line,
} from "recharts";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import type {
  RiskSeverityData,
  BreachResolutionData,
  HistoricalImpactData,
  AuthPatternData,
} from "@/types/dashboard";
import {
  CHART_COLORS,
  STATUS_COLORS,
  SEQUENTIAL_COLORS,
  CHART_CONFIG,
  CHART_THEME,
  getColorWithOpacity,
  COLOR_WITH_OPACITY,
  AREA_GRADIENTS
} from '../../types/chartColors';

interface ChartProps<T> {
  data: T[];
}

// Risk Severity Distribution
export const RiskSeverityChart: React.FC<ChartProps<RiskSeverityData>> = ({
  data,
}) => {
  return (
    <Card className="bg-gray-800 border border-blue-500/30 shadow-md shadow-blue-500/20">
      <CardHeader>
        <CardTitle className="text-blue-400">Risk Severity Distribution</CardTitle>
        <CardDescription className="text-gray-400">
          Overview of breach severity levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill={CHART_COLORS.primary}
                dataKey="count"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SEQUENTIAL_COLORS[index % SEQUENTIAL_COLORS.length]}
                    stroke={CHART_THEME.primary.border}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={CHART_CONFIG.tooltip}
              />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => (
                  <span className="text-blue-400 text-sm font-medium">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Breach Resolution Status
export const BreachResolutionChart: React.FC<ChartProps<BreachResolutionData>> = ({
  data,
}) => {
  const getBarColor = (category: string) => {
    switch (category) {
      case "Resolved":
        return STATUS_COLORS.resolved;
      case "In Progress":
        return STATUS_COLORS.active;
      case "Pending":
        return STATUS_COLORS.pending;
      case "Requires Attention":
        return STATUS_COLORS.critical;
      default:
        return CHART_COLORS.primary;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-blue-500/30 p-3 rounded-lg shadow-lg">
          <p className="text-blue-400 font-medium mb-1">{data.category}</p>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getBarColor(data.category) }}
            />
            <p className="text-blue-300 font-bold">{data.count} breaches</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-blue-400">Breach Resolution Progress</CardTitle>
        <CardDescription className="text-gray-400">
          Current status of identified security breaches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid {...CHART_CONFIG.grid} horizontal={false} />
              <XAxis {...CHART_CONFIG.axis} type="number" />
              <YAxis
                {...CHART_CONFIG.axis}
                dataKey="category"
                type="category"
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                className="transition-all duration-300"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.category)}
                    fillOpacity={COLOR_WITH_OPACITY.active}
                    className="hover:fill-opacity-100 transition-opacity duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Historical Breach Impact
export const HistoricalImpactChart: React.FC<ChartProps<HistoricalImpactData>> = ({
  data,
}) => {
  return (
    <Card className="bg-gray-800 border border-blue-500/30 shadow-md shadow-blue-500/20">
      <CardHeader>
        <CardTitle className="text-blue-400">Historical Breach Impact</CardTitle>
        <CardDescription className="text-gray-400">
          Trend analysis of breach impacts over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                {Object.entries(AREA_GRADIENTS).map(([key, gradient]) => (
                  <linearGradient
                    key={gradient.id}
                    id={gradient.id}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={gradient.color}
                      stopOpacity={gradient.opacity.start}
                    />
                    <stop
                      offset="95%"
                      stopColor={gradient.color}
                      stopOpacity={gradient.opacity.end}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid {...CHART_CONFIG.grid} />
              <XAxis {...CHART_CONFIG.axis} dataKey="date" />
              <YAxis {...CHART_CONFIG.axis} />
              <Tooltip contentStyle={CHART_CONFIG.tooltip} />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => (
                  <span className="text-blue-400 text-sm font-medium">{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="accountsAffected"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${AREA_GRADIENTS.primary.id})`}
                name="Accounts Affected"
                activeDot={{
                  r: 5,
                  fill: CHART_COLORS.primary,
                  stroke: CHART_COLORS.primary,
                  strokeWidth: 2,
                }}
              />
              <Area
                type="monotone"
                dataKey="criticalSystems"
                stroke={CHART_COLORS.secondary}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${AREA_GRADIENTS.secondary.id})`}
                name="Critical Systems"
                activeDot={{
                  r: 5,
                  fill: CHART_COLORS.secondary,
                  stroke: CHART_COLORS.secondary,
                  strokeWidth: 2,
                }}
              />
              <Area
                type="monotone"
                dataKey="recoveryTime"
                stroke={CHART_COLORS.tertiary}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${AREA_GRADIENTS.tertiary.id})`}
                name="Recovery Time (hrs)"
                activeDot={{
                  r: 5,
                  fill: CHART_COLORS.tertiary,
                  stroke: CHART_COLORS.tertiary,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Authentication Success Metrics
export const AuthSuccessChart: React.FC<ChartProps<AuthPatternData>> = ({
  data,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-blue-500/30 p-3 rounded-lg shadow-lg">
          <p className="text-blue-400 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-blue-300">
                {entry.name}:
                <span className="font-bold ml-1">
                  {entry.name === "Success Rate %"
                    ? `${entry.value}%`
                    : entry.value.toLocaleString()}
                </span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-blue-400">Authentication Patterns</CardTitle>
        <CardDescription className="text-gray-400">
          Analysis of authentication attempts and success rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid {...CHART_CONFIG.grid} vertical={false} />
              <XAxis {...CHART_CONFIG.axis} dataKey="date" />
              <YAxis
                {...CHART_CONFIG.axis}
                yAxisId="left"
                label={{
                  value: "Auth Attempts",
                  angle: -90,
                  position: "insideLeft",
                  fill: CHART_COLORS.primary,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={CHART_COLORS.secondary}
                tick={{ fill: CHART_COLORS.secondary }}
                tickLine={{ stroke: CHART_COLORS.secondary }}
                label={{
                  value: "Success Rate %",
                  angle: 90,
                  position: "insideRight",
                  fill: CHART_COLORS.secondary,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => (
                  <span className="text-blue-400">{value}</span>
                )}
              />
              <Bar
                yAxisId="left"
                dataKey="attempts"
                fill={CHART_COLORS.primary}
                fillOpacity={COLOR_WITH_OPACITY.active}
                radius={[4, 4, 0, 0]}
                name="Auth Attempts"
                className="hover:fill-opacity-100 transition-opacity duration-300"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="successRate"
                stroke={CHART_COLORS.secondary}
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: CHART_COLORS.secondary,
                  stroke: CHART_COLORS.secondary,
                }}
                activeDot={{
                  r: 6,
                  stroke: CHART_COLORS.secondary,
                  strokeWidth: 2,
                  fill: CHART_COLORS.secondary,
                }}
                name="Success Rate %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};