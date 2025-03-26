
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
  Time
} from 'lightweight-charts';

export const createLightweightChart = (container: HTMLElement, options: Partial<ChartOptions> = {}) => {
  const defaultOptions: Partial<ChartOptions> = {
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
      },
      horzLine: {
        width: 1,
        color: 'var(--muted-foreground)',
        style: LineStyle.Dashed,
        visible: true,
        labelVisible: false,
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

export const formatVolumeData = (data: any[]) => {
  return data.map(item => ({
    time: typeof item.timestamp === 'string' 
      ? new Date(item.timestamp).getTime() / 1000 
      : item.timestamp / 1000,
    value: item.volume || 0,
  }));
};

export const formatPriceData = (data: any[]) => {
  return data.map(item => ({
    time: typeof item.timestamp === 'string' 
      ? new Date(item.timestamp).getTime() / 1000 
      : item.timestamp / 1000,
    value: item.value || 0,
  }));
};

export const addSeriesWithType = (chart: IChartApi, type: SeriesType, options: any = {}) => {
  return chart.addSeries(type, options);
};

