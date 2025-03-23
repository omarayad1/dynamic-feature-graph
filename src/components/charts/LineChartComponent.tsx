
import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { formatTimestamp } from "@/lib/api";

interface LineChartComponentProps {
  data: any[];
  timeRange: string;
  formatYAxis: (value: number) => string;
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({
  data,
  timeRange,
  formatYAxis,
}) => {
  const formatXAxis = (timestamp: number) => {
    return formatTimestamp(timestamp, timeRange);
  };

  return (
    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
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
      <Line 
        type="monotone" 
        dataKey="value" 
        name="Price"
        stroke="var(--primary)" 
        dot={false}
        activeDot={{ r: 5, strokeWidth: 0 }}
        strokeWidth={2}
      />
      {data[0]?.volume && (
        <Line 
          type="monotone" 
          dataKey="volume" 
          name="Volume"
          stroke="var(--accent)" 
          dot={false}
          strokeWidth={1.5}
          opacity={0.7}
          yAxisId="right"
        />
      )}
    </LineChart>
  );
};

export default LineChartComponent;
