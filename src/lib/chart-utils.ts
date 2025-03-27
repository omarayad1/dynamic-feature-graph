
import { 
  createChart, 
  ColorType, 
  LineStyle, 
  CrosshairMode, 
  ChartOptions, 
  SeriesType,
  SeriesOptionsMap,
  IChartApi,
  ISeriesApi,
  Time,
  LayoutOptions,
  DeepPartial
} from 'lightweight-charts';

export const createLightweightChart = (container: HTMLElement, options: DeepPartial<ChartOptions> = {}) => {
  const defaultOptions: DeepPartial<ChartOptions> = {
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: 'var(--muted-foreground)',
      fontSize: 12,
      fontFamily: 'inherit',
    },
    grid: {
      vertLines: { color: 'rgba(120, 120, 120, 0.2)', style: LineStyle.Solid, visible: true },
      horzLines: { color: 'rgba(120, 120, 120, 0.2)', style: LineStyle.Solid, visible: true },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        width: 1,
        color: 'var(--muted-foreground)',
        style: LineStyle.Dashed,
        visible: true,
        labelVisible: false,
        labelBackgroundColor: 'rgba(120, 120, 120, 0.2)'
      },
      horzLine: {
        width: 1,
        color: 'var(--muted-foreground)',
        style: LineStyle.Dashed,
        visible: true,
        labelVisible: false,
        labelBackgroundColor: 'rgba(120, 120, 120, 0.2)'
      },
    },
    timeScale: {
      borderColor: 'rgba(120, 120, 120, 0.2)',
      timeVisible: true,
      rightOffset: 5,
    },
    rightPriceScale: {
      borderColor: 'rgba(120, 120, 120, 0.2)',
      autoScale: true,
      alignLabels: true,
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: true,
    },
    handleScale: {
      mouseWheel: true,
      pinch: true,
      axisPressedMouseMove: true,
      axisDoubleClickReset: true,
    },
  };

  return createChart(container, { ...defaultOptions, ...options });
};

export const getChartColors = () => {
  return {
    primary: 'var(--primary)',
    accent: 'var(--accent)',
    background: 'var(--background)',
    border: 'var(--border)',
    muted: 'var(--muted)',
    card: 'var(--card)',
  };
};

// Format volume data to be compatible with the Time type
export const formatVolumeData = (data: any[]) => {
  return data.map(item => ({
    time: formatTimestamp(item.timestamp),
    value: item.volume || 0,
  }));
};

// Format price data to be compatible with the Time type
export const formatPriceData = (data: any[]) => {
  return data.map(item => ({
    time: formatTimestamp(item.timestamp),
    value: item.value || 0,
  }));
};

// Helper function to convert timestamp to proper Time format
const formatTimestamp = (timestamp: string | number): Time => {
  const date = typeof timestamp === 'string' 
    ? new Date(timestamp) 
    : new Date(timestamp);
  
  // Format as UTC timestamp in seconds (Time type compatible)
  return Math.floor(date.getTime() / 1000) as Time;
};

// Fixed addSeriesWithType function that properly handles TypeScript types
export const addSeriesWithType = (chart: IChartApi, type: SeriesType, options: any = {}) => {
  switch (type) {
    case 'Line':
      return chart.addSeries('Line' as keyof SeriesOptionsMap, options);
    case 'Area':
      return chart.addSeries('Area' as keyof SeriesOptionsMap, options);
    case 'Bar':
      return chart.addSeries('Bar' as keyof SeriesOptionsMap, options);
    case 'Candlestick':
      return chart.addSeries('Candlestick' as keyof SeriesOptionsMap, options);
    case 'Histogram':
      return chart.addSeries('Histogram' as keyof SeriesOptionsMap, options);
    default:
      throw new Error(`Unsupported series type: ${type}`);
  }
};
