
import { createChart, ColorType, LineStyle, CrosshairMode, ChartOptions } from 'lightweight-charts';

export const createLightweightChart = (container: HTMLElement, options: Partial<ChartOptions> = {}) => {
  const defaultOptions: Partial<ChartOptions> = {
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: 'var(--muted-foreground)',
    },
    grid: {
      vertLines: { color: 'rgba(120, 120, 120, 0.2)' },
      horzLines: { color: 'rgba(120, 120, 120, 0.2)' },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        width: 1,
        color: 'var(--muted-foreground)',
        style: LineStyle.Dashed,
      },
      horzLine: {
        width: 1,
        color: 'var(--muted-foreground)',
        style: LineStyle.Dashed,
      },
    },
    timeScale: {
      borderColor: 'rgba(120, 120, 120, 0.2)',
      timeVisible: true,
    },
    rightPriceScale: {
      borderColor: 'rgba(120, 120, 120, 0.2)',
    },
    handleScroll: { mouseWheel: true, pressedMouseMove: true },
    handleScale: { mouseWheel: true, pinch: true },
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

