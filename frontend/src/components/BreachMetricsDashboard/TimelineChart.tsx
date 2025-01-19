import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { HistoricalImpactData } from "@/types/dashboard";

interface TimelineProps {
  data: HistoricalImpactData[];
}

const TimelineChart: React.FC<TimelineProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/95 backdrop-blur border border-blue-500/30 p-4 rounded-lg shadow-lg">
          <p className="text-blue-400 font-medium mb-3">
            {new Date(label).toLocaleDateString('en-US', { 
              month: 'long',
              year: 'numeric'
            })}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.stroke }} />
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm">{entry.name}</span>
                <span className="text-blue-300 font-bold">
                  {entry.name === "Recovery Time (hrs)"
                    ? `${entry.value} hours`
                    : entry.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800 border border-blue-500/30 shadow-lg shadow-blue-500/20">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          Breach Impact Timeline
        </CardTitle>
        <CardDescription className="text-gray-400">
          Analysis of breach impacts and recovery trends over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                {/* Primary Gradient - Accounts Affected */}
                <linearGradient id="areaAccounts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                {/* Secondary Gradient - Critical Systems */}
                <linearGradient id="areaSystems" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                </linearGradient>
                {/* Tertiary Gradient - Recovery Time */}
                <linearGradient id="areaRecovery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#93C5FD" stopOpacity={0} />
                </linearGradient>
              </defs>

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
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  month: 'short',
                  year: '2-digit'
                })}
              />

              <YAxis
                stroke="#60A5FA"
                tick={{ fill: "#60A5FA" }}
                tickLine={{ stroke: "#60A5FA" }}
                axisLine={{ stroke: "#60A5FA" }}
                tickFormatter={(value) => value.toLocaleString()}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "rgba(96, 165, 250, 0.2)",
                  strokeWidth: 1,
                  fill: "rgba(96, 165, 250, 0.1)",
                }}
              />

              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                }}
                formatter={(value) => (
                  <span className="text-blue-400">{value}</span>
                )}
              />

              <Area
                type="monotone"
                dataKey="accountsAffected"
                name="Accounts Affected"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#areaAccounts)"
                fillOpacity={1}
                activeDot={{
                  r: 6,
                  stroke: "#3B82F6",
                  strokeWidth: 2,
                  fill: "#3B82F6",
                }}
              />

              <Area
                type="monotone"
                dataKey="criticalSystems"
                name="Critical Systems"
                stroke="#60A5FA"
                strokeWidth={2}
                fill="url(#areaSystems)"
                fillOpacity={1}
                activeDot={{
                  r: 6,
                  stroke: "#60A5FA",
                  strokeWidth: 2,
                  fill: "#60A5FA",
                }}
              />

              <Area
                type="monotone"
                dataKey="recoveryTime"
                name="Recovery Time (hrs)"
                stroke="#93C5FD"
                strokeWidth={2}
                fill="url(#areaRecovery)"
                fillOpacity={1}
                activeDot={{
                  r: 6,
                  stroke: "#93C5FD",
                  strokeWidth: 2,
                  fill: "#93C5FD",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Decorative Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
              mixBlendMode: "overlay",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineChart;