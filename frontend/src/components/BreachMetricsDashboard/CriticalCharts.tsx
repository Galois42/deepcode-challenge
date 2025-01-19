import React from "react";
import {
  PieChart,
  Pie,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Line,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type {
  RiskSeverityData,
  BreachResolutionData,
  HistoricalImpactData,
  AuthPatternData,
} from "@/types/dashboard";

interface ChartProps<T> {
  data: T[];
}

const COLORS = ["#FF4560", "#FF8C00", "#FFC000", "#00E396"];
const BG_COLORS = [
  "rgba(255, 69, 96, 0.2)",
  "rgba(255, 140, 0, 0.2)",
  "rgba(255, 192, 0, 0.2)",
  "rgba(0, 227, 150, 0.2)",
];

// Risk Severity Distribution
export const RiskSeverityChart: React.FC<ChartProps<RiskSeverityData>> = ({
  data,
}) => {
  const COLORS = ["#dc2626", "#ea580c", "#d97706", "#65a30d"];

  return (
    <Card className="bg-gray-800 border border-blue-500/30 shadow-md shadow-blue-500/20">
      <CardHeader>
        <CardTitle className="text-blue-400">
          Risk Severity Distribution
        </CardTitle>
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
                fill="#8884d8"
                dataKey="count"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke={BG_COLORS[index % BG_COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0F1A",
                  borderColor: COLORS[0],
                  color: "#FFF",
                  boxShadow: "0 0 10px rgba(255, 69, 96, 0.5)",
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "10px",
                }}
                formatter={(value, _) => (
                  <span className="text-white text-sm font-medium">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Animated glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 69, 96, 0.4) 0%, rgba(255, 69, 96, 0) 70%)",
              zIndex: 0,
              animation: "pulseGlow 3s infinite",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Breach Resolution Status
export const BreachResolutionChart: React.FC<
  ChartProps<BreachResolutionData>
> = ({ data }) => {
  // Enhanced color scheme for cyber theme
  const getBarColor = (category: string) => {
    switch (category) {
      case "Resolved":
        return "#22c55e"; // Success green
      case "In Progress":
        return "#3b82f6"; // Processing blue
      case "Pending":
        return "#f59e0b"; // Warning amber
      case "Requires Attention":
        return "#ef4444"; // Critical red
      default:
        return "#60A5FA"; // Default blue
    }
  };

  // Custom tooltip component
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
            <p className="text-white font-bold">{data.count} breaches</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-blue-400">
          Breach Resolution Progress
        </CardTitle>
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
                dataKey="category"
                type="category"
                width={120}
                stroke="#60A5FA"
                tick={{ fill: "#60A5FA" }}
                tickLine={{ stroke: "#60A5FA" }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(96, 165, 250, 0.1)" }}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                className="transition-all duration-300"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.category)}
                    fillOpacity={0.8}
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
export const HistoricalImpactChart: React.FC<
  ChartProps<HistoricalImpactData>
> = ({ data }) => {
  return (
    <Card className="bg-gray-800 border border-blue-500/30 shadow-md shadow-blue-500/20">
      <CardHeader>
        <CardTitle className="text-blue-400">
          Historical Breach Impact
        </CardTitle>
        <CardDescription className="text-gray-400">
          Trend analysis of breach impacts over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id="accountsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="systemsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="recoveryGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <XAxis dataKey="date" stroke="#FFF" />
              <YAxis stroke="#FFF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0F1A",
                  borderColor: "#8884d8",
                  color: "#FFF",
                  boxShadow: "0 0 10px rgba(136, 132, 216, 0.5)",
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "10px",
                }}
                formatter={(value, _) => (
                  <span className="text-white text-sm font-medium">
                    {value}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="accountsAffected"
                stroke="#8884d8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#accountsGradient)"
                name="Accounts Affected"
                activeDot={{
                  r: 5,
                  fill: "#8884d8",
                  stroke: "#8884d8",
                  strokeWidth: 2,
                }}
              />
              <Area
                type="monotone"
                dataKey="criticalSystems"
                stroke="#82ca9d"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#systemsGradient)"
                name="Critical Systems"
                activeDot={{
                  r: 5,
                  fill: "#82ca9d",
                  stroke: "#82ca9d",
                  strokeWidth: 2,
                }}
              />
              <Area
                type="monotone"
                dataKey="recoveryTime"
                stroke="#ffc658"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#recoveryGradient)"
                name="Recovery Time (hrs)"
                activeDot={{
                  r: 5,
                  fill: "#ffc658",
                  stroke: "#ffc658",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Animated glow */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle, rgba(136, 132, 216, 0.3) 0%, rgba(136, 132, 216, 0) 70%)",
              zIndex: 0,
              animation: "pulseGlow 3s infinite",
            }}
          />
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
              <span className="text-gray-300">
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
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(96, 165, 250, 0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#60A5FA"
                tick={{ fill: "#60A5FA" }}
                tickLine={{ stroke: "#60A5FA" }}
              />
              <YAxis
                yAxisId="left"
                stroke="#60A5FA"
                tick={{ fill: "#60A5FA" }}
                tickLine={{ stroke: "#60A5FA" }}
                label={{
                  value: "Auth Attempts",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#60A5FA",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#22c55e"
                tick={{ fill: "#22c55e" }}
                tickLine={{ stroke: "#22c55e" }}
                label={{
                  value: "Success Rate %",
                  angle: 90,
                  position: "insideRight",
                  fill: "#22c55e",
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
                fill="#3b82f6"
                fillOpacity={0.8}
                radius={[4, 4, 0, 0]}
                name="Auth Attempts"
                className="hover:fill-opacity-100 transition-opacity duration-300"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="successRate"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#22c55e",
                  stroke: "#22c55e",
                }}
                activeDot={{
                  r: 6,
                  stroke: "#22c55e",
                  strokeWidth: 2,
                  fill: "#22c55e",
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
