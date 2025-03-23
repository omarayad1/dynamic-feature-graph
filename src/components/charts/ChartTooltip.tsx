
import React from "react";
import { formatTimestamp } from "@/lib/api";

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: number;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glassmorphism rounded-lg p-2 text-sm">
        <p className="font-medium">{formatTimestamp(label)}</p>
        <p className="text-primary font-medium">
          ${Number(payload[0].value).toLocaleString()}
        </p>
        {payload[1] && (
          <p className="text-accent font-medium">
            Vol: {Number(payload[1].value).toLocaleString()}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default ChartTooltip;
