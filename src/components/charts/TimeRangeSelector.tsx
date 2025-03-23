
import React from "react";
import { Button } from "@/components/ui/button";

export const timeRanges = [
  { label: "1H", value: "1h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
  { label: "All", value: "all" }
];

interface TimeRangeSelectorProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ 
  selectedRange, 
  onRangeChange 
}) => {
  return (
    <div className="flex bg-secondary/50 rounded-md p-0.5">
      {timeRanges.map(range => (
        <Button
          key={range.value}
          variant={selectedRange === range.value ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs px-2"
          onClick={(e) => {
            e.stopPropagation();
            onRangeChange(range.value);
          }}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;
