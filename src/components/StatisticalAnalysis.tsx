
import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatValue } from "@/lib/api";

interface StatisticalAnalysisProps {
  data: Array<{ timestamp: string | number; value: number }>;
  title: string;
}

const StatisticalAnalysis: React.FC<StatisticalAnalysisProps> = ({ data, title }) => {
  // Calculate statistics
  const values = data.map(item => item.value);
  const count = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = count % 2 === 0 
    ? (sortedValues[count / 2 - 1] + sortedValues[count / 2]) / 2 
    : sortedValues[Math.floor(count / 2)];
  
  // Calculate standard deviation
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  // Generate distribution data
  const generateDistributionData = () => {
    const bucketCount = 10;
    const bucketSize = (max - min) / bucketCount;
    const buckets = Array(bucketCount).fill(0).map((_, i) => ({
      range: `${formatValue(title, min + i * bucketSize)}-${formatValue(title, min + (i + 1) * bucketSize)}`,
      count: 0,
      midpoint: min + (i + 0.5) * bucketSize
    }));

    values.forEach(val => {
      const bucketIndex = Math.min(Math.floor((val - min) / bucketSize), bucketCount - 1);
      buckets[bucketIndex].count++;
    });

    return buckets;
  };

  const distributionData = generateDistributionData();

  // Generate cumulative distribution data
  const cumulativeData = distributionData.map((item, index, arr) => ({
    range: item.range,
    midpoint: item.midpoint,
    cumulative: arr.slice(0, index + 1).reduce((sum, i) => sum + i.count, 0) / count * 100
  }));

  // Calculate moving average
  const calculateMovingAverages = () => {
    const periods = [5, 10, 20];
    return periods.map(period => {
      const maData = data.map((item, index, arr) => {
        if (index < period - 1) return { ...item, ma: null };
        const slice = arr.slice(index - period + 1, index + 1);
        const average = slice.reduce((sum, i) => sum + i.value, 0) / period;
        return {
          timestamp: item.timestamp,
          ma: average
        };
      }).filter(item => item.ma !== null);
      return { period, data: maData };
    });
  };

  const movingAverages = calculateMovingAverages();

  // Calculate percentage change
  const percentageChangeData = data.map((item, index, arr) => {
    if (index === 0) return { timestamp: item.timestamp, percentChange: 0 };
    const prevValue = arr[index - 1].value;
    const percentChange = ((item.value - prevValue) / prevValue) * 100;
    return {
      timestamp: item.timestamp,
      percentChange
    };
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics for {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card/60 p-4 rounded-lg border border-border/30">
              <div className="text-muted-foreground text-sm">Mean</div>
              <div className="text-xl font-semibold">{formatValue(title, mean)}</div>
            </div>
            <div className="bg-card/60 p-4 rounded-lg border border-border/30">
              <div className="text-muted-foreground text-sm">Median</div>
              <div className="text-xl font-semibold">{formatValue(title, median)}</div>
            </div>
            <div className="bg-card/60 p-4 rounded-lg border border-border/30">
              <div className="text-muted-foreground text-sm">Std. Deviation</div>
              <div className="text-xl font-semibold">{formatValue(title, stdDev)}</div>
            </div>
            <div className="bg-card/60 p-4 rounded-lg border border-border/30">
              <div className="text-muted-foreground text-sm">Range</div>
              <div className="text-xl font-semibold">{formatValue(title, max - min)}</div>
            </div>
            <div className="bg-card/60 p-4 rounded-lg border border-border/30">
              <div className="text-muted-foreground text-sm">Min</div>
              <div className="text-xl font-semibold">{formatValue(title, min)}</div>
            </div>
            <div className="bg-card/60 p-4 rounded-lg border border-border/30">
              <div className="text-muted-foreground text-sm">Max</div>
              <div className="text-xl font-semibold">{formatValue(title, max)}</div>
            </div>
            <div className="bg-card/60 p-4 rounded-lg border border-border/30">
              <div className="text-muted-foreground text-sm">Data Points</div>
              <div className="text-xl font-semibold">{count}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="distribution">
        <TabsList className="w-full">
          <TabsTrigger value="distribution" className="flex-1">Distribution</TabsTrigger>
          <TabsTrigger value="cumulative" className="flex-1">Cumulative</TabsTrigger>
          <TabsTrigger value="moving-average" className="flex-1">Moving Averages</TabsTrigger>
          <TabsTrigger value="percentage" className="flex-1">% Change</TabsTrigger>
        </TabsList>
        
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Value Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="range" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} occurrences`, 'Frequency']}
                      labelFormatter={(label) => `Range: ${label}`}
                    />
                    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cumulative">
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cumulativeData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="range" angle={-45} textAnchor="end" height={70} />
                    <YAxis domain={[0, 100]} label={{ value: 'Percent (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Cumulative %']}
                      labelFormatter={(label) => `Range: ${label}`}
                    />
                    <Area type="monotone" dataKey="cumulative" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCumulative)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="moving-average">
          <Card>
            <CardHeader>
              <CardTitle>Moving Averages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    {movingAverages.map((ma, index) => (
                      <Line 
                        key={ma.period}
                        data={ma.data}
                        type="monotone" 
                        dataKey="ma"
                        name={`${ma.period}-period MA`} 
                        stroke={index === 0 ? "var(--primary)" : index === 1 ? "var(--accent)" : "var(--destructive)"}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                    <Line 
                      data={data} 
                      type="monotone" 
                      dataKey="value" 
                      name="Original" 
                      stroke="var(--muted-foreground)" 
                      strokeWidth={1}
                      dot={false}
                      opacity={0.5}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="percentage">
          <Card>
            <CardHeader>
              <CardTitle>Percentage Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={percentageChangeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'Change']}
                    />
                    <Bar dataKey="percentChange" fill="var(--primary)" radius={[4, 4, 0, 0]} name="% Change">
                      {percentageChangeData.map((entry, index) => (
                        <Bar 
                          key={`cell-${index}`} 
                          dataKey="percentChange"
                          fill={entry.percentChange >= 0 ? "var(--primary)" : "var(--destructive)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticalAnalysis;
