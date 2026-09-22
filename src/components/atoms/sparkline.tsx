import React from 'react';

export interface SparklineProps {
  data: number[];
  normalRange?: [number, number];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({
  data,
  normalRange,
  color = 'var(--chart-primary)',
  width = 96,
  height = 28,
  className = '',
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <div className={`inline-block ${className}`} style={{ width, height }} />;
  }

  const padding = 4;
  const minVal = Math.min(...data, normalRange ? normalRange[0] : Infinity);
  const maxVal = Math.max(...data, normalRange ? normalRange[1] : -Infinity);
  const range = maxVal === minVal ? 1 : maxVal - minVal;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const lastPoint = points[points.length - 1].split(',');
  const lastX = parseFloat(lastPoint[0]);
  const lastY = parseFloat(lastPoint[1]);

  let normalBandY1 = 0;
  let normalBandHeight = 0;
  if (normalRange) {
    const topY = height - padding - ((normalRange[1] - minVal) / range) * (height - padding * 2);
    const bottomY = height - padding - ((normalRange[0] - minVal) / range) * (height - padding * 2);
    normalBandY1 = Math.min(topY, bottomY);
    normalBandHeight = Math.max(Math.abs(bottomY - topY), 4);
  }

  return (
    <svg
      aria-hidden="true"
      className={`overflow-visible ${className}`}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      {normalRange && (
        <rect
          fill="var(--chart-normal)"
          fillOpacity="0.12"
          height={normalBandHeight}
          rx="2"
          width={width}
          x="0"
          y={normalBandY1}
        />
      )}
      <polyline
        fill="none"
        points={points.join(' ')}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <circle
        cx={lastX}
        cy={lastY}
        fill={color}
        r="3"
        stroke="var(--surface)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
