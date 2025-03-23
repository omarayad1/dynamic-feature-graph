
import React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { formatTimestamp } from "@/lib/api";

interface BarChartComponentProps {
  data: any[];
  timeRange: string;
  formatYAxis: (value: number) => string;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  data,
  timeRange,
  formatYAxis,
}) => {
  const formatXAxis = (timestamp: number) => {
    return formatTimestamp(timestamp, timeRange);
  };

  return (
    <BarChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
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
      <Bar 
        dataKey="value" 
        name="Price"
        fill="var(--primary)" 
        radius={[4, 4, 0, 0]}
        barSize={timeRange === '1h' ? 4 : timeRange === '1d' ? 8 : 12}
      />
      {data[0]?.volume && (
        <Bar 
          dataKey="volume" 
          name="Volume"
          fill="var(--accent)" 
          radius={[4, 4, 0, 0]}
          opacity={0.7}
          barSize={timeRange === '1h' ? 4 : timeRange === '1d' ? 8 : 12}
          yAxisId="right"
        />
      )}
    </BarChart>
  );
};

export default BarChartComponent;
