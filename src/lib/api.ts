import { toast } from "sonner";

export interface FeatureDataPoint {
  name: string;
  value: number;
  timestamp: string;
}

export interface FeatureData {
  [key: string]: FeatureDataPoint[];
}

export interface Position {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  timestamp: string;
}

export interface Order {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop";
  quantity: number;
  price: number;
  status: "open" | "filled" | "canceled" | "rejected";
  timestamp: string;
}

export interface StrategyConfig {
  name: string;
  description: string;
  parameters: {
    [key: string]: {
      value: number | string | boolean;
      type: "number" | "string" | "boolean";
      description: string;
    };
  };
  enabled: boolean;
  lastUpdated: string;
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

export const fetchPosition = async (): Promise<Position | null> => {
  try {
    const response = await fetch('/api/position');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching position data:', error);
    toast.error('Failed to fetch position data');
    return null;
  }
};

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch('/api/orders');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    toast.error('Failed to fetch orders');
    return [];
  }
};

export const fetchStrategyConfig = async (): Promise<StrategyConfig | null> => {
  try {
    const response = await fetch('/api/strategy-config');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching strategy config:', error);
    toast.error('Failed to fetch strategy config');
    return null;
  }
};

export const generateMockFeatureData = (): FeatureData => {
  const features = ['CPU Usage', 'Memory Usage', 'Network Traffic', 'Disk I/O', 'Response Time'];
  const now = new Date();
  
  const mockData: FeatureData = {};
  
  features.forEach(feature => {
    const dataPoints: FeatureDataPoint[] = [];
    
    for (let i = 19; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 30000);
      const value = feature.includes('Usage') 
        ? Math.random() * 100
        : feature === 'Response Time'
          ? Math.random() * 500
          : Math.random() * 1000;
      
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

export const generateMockPositionData = (): Position => {
  const entryPrice = 45000 + Math.random() * 1000;
  const currentPrice = entryPrice * (1 + (Math.random() * 0.1 - 0.05));
  const quantity = 0.5 + Math.random() * 1.5;
  const pnl = (currentPrice - entryPrice) * quantity;
  const pnlPercentage = ((currentPrice - entryPrice) / entryPrice) * 100;
  
  return {
    symbol: "BTC/USD",
    quantity: Number(quantity.toFixed(4)),
    entryPrice: Number(entryPrice.toFixed(2)),
    currentPrice: Number(currentPrice.toFixed(2)),
    pnl: Number(pnl.toFixed(2)),
    pnlPercentage: Number(pnlPercentage.toFixed(2)),
    timestamp: new Date().toISOString()
  };
};

export const generateMockOrdersData = (): Order[] => {
  const orderTypes: Array<"market" | "limit" | "stop"> = ["market", "limit", "stop"];
  const orderSides: Array<"buy" | "sell"> = ["buy", "sell"];
  const orderStatuses: Array<"open" | "filled" | "canceled" | "rejected"> = ["open", "filled", "canceled", "rejected"];
  
  return Array.from({ length: 5 }, (_, i) => {
    const price = 45000 + Math.random() * 1000;
    return {
      id: `order-${Date.now()}-${i}`,
      symbol: "BTC/USD",
      side: orderSides[Math.floor(Math.random() * orderSides.length)],
      type: orderTypes[Math.floor(Math.random() * orderTypes.length)],
      quantity: Number((0.1 + Math.random() * 1).toFixed(4)),
      price: Number(price.toFixed(2)),
      status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
    };
  });
};

export const generateMockStrategyConfig = (): StrategyConfig => {
  return {
    name: "Moving Average Crossover",
    description: "A strategy based on the crossing of two moving averages",
    parameters: {
      shortPeriod: {
        value: 9,
        type: "number",
        description: "Short period for MA calculation"
      },
      longPeriod: {
        value: 21,
        type: "number",
        description: "Long period for MA calculation"
      },
      tradeSize: {
        value: 0.5,
        type: "number",
        description: "Size of each trade in BTC"
      },
      takeProfit: {
        value: 3.5,
        type: "number",
        description: "Take profit percentage"
      },
      stopLoss: {
        value: 2.0,
        type: "number",
        description: "Stop loss percentage"
      },
      enableTrailing: {
        value: true,
        type: "boolean",
        description: "Enable trailing stop loss"
      }
    },
    enabled: true,
    lastUpdated: new Date().toISOString()
  };
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};

export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

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
