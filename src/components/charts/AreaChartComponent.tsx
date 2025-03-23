
import React from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { formatTimestamp } from "@/lib/api";

interface AreaChartComponentProps {
  data: any[];
  timeRange: string;
  formatYAxis: (value: number) => string;
}

const AreaChartComponent: React.FC<AreaChartComponentProps> = ({
  data,
  timeRange,
  formatYAxis,
}) => {
  const formatXAxis = (timestamp: number) => {
    return formatTimestamp(timestamp, timeRange);
  };

  return (
    <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
      <defs>
        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
          <stop offset="75%" stopColor="var(--primary)" stopOpacity={0.05} />
        </linearGradient>
        {data[0]?.volume && (
          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
            <stop offset="75%" stopColor="var(--accent)" stopOpacity={0.05} />
          </linearGradient>
        )}
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
      <XAxis 
        dataKey="timestamp" 
        tickFormatter={formatXAxis}
        stroke="var(--muted-foreground)"
        tickLine={false}
        axisLine={false}
        minTickGap={30}
      />
      <YAxis 
        tickFormatter={formatYAxis}
        stroke="var(--muted-foreground)"
        tickLine={false}
        axisLine={false}
        width={60}
      />
      {data[0]?.volume && (
        <YAxis 
          yAxisId="right"
          orientation="right"
          tickFormatter={formatYAxis}
          stroke="var(--accent)"
          tickLine={false}
          axisLine={false}
          width={60}
          opacity={0.7}
        />
      )}
      <Tooltip content={<ChartTooltip />} />
      <Area
        type="monotone"
        dataKey="value"
        name="Price"
        stroke="var(--primary)"
        fill="url(#colorPrice)"
        activeDot={{ r: 5, strokeWidth: 0 }}
        strokeWidth={2}
      />
      {data[0]?.volume && (
        <Area
          type="monotone"
          dataKey="volume"
          name="Volume"
          stroke="var(--accent)"
          fill="url(#colorVolume)"
          strokeWidth={1.5}
          opacity={0.8}
          yAxisId="right"
        />
      )}
    </AreaChart>
  );
};

export default AreaChartComponent;
