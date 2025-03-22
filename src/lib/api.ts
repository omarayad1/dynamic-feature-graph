
import { toast } from "sonner";

export interface FeatureDataPoint {
  name: string;
  value: number;
  timestamp: string;
}

export interface FeatureData {
  [key: string]: FeatureDataPoint[];
}

export const fetchFeatures = async (): Promise<FeatureData> => {
  try {
    const response = await fetch('/api/features');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching feature data:', error);
    toast.error('Failed to fetch feature data');
    return {};
  }
};

// Mock data generator for development
export const generateMockFeatureData = (): FeatureData => {
  const features = ['CPU Usage', 'Memory Usage', 'Network Traffic', 'Disk I/O', 'Response Time'];
  const now = new Date();
  
  const mockData: FeatureData = {};
  
  features.forEach(feature => {
    const dataPoints: FeatureDataPoint[] = [];
    
    // Generate 20 data points for each feature
    for (let i = 19; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 30000); // 30 second intervals
      const value = feature.includes('Usage') 
        ? Math.random() * 100 // Usage metrics go from 0-100
        : feature === 'Response Time'
          ? Math.random() * 500 // Response time in ms
          : Math.random() * 1000; // Other metrics
      
      dataPoints.push({
        name: feature,
        value: Number(value.toFixed(2)),
        timestamp: timestamp.toISOString()
      });
    }
    
    mockData[feature] = dataPoints;
  });
  
  return mockData;
};

// Utility to format the timestamp
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};

// Utility to format values based on the feature type
export const formatValue = (feature: string, value: number): string => {
  if (feature.includes('Usage')) {
    return `${value.toFixed(1)}%`;
  } else if (feature === 'Response Time') {
    return `${value.toFixed(0)}ms`;
  } else if (feature === 'Network Traffic') {
    return `${(value / 1000).toFixed(2)}MB/s`;
  } else if (feature === 'Disk I/O') {
    return `${value.toFixed(1)}MB/s`;
  }
  return value.toString();
};
