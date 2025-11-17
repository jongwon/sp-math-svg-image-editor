import React from 'react';

interface GridProps {
  width: number;
  height: number;
  gridSize: number;
  showGrid: boolean;
  showAxes: boolean;
  centerX: number;
  centerY: number;
  scale: number;
}

export default function Grid({
  width,
  height,
  gridSize,
  showGrid,
  showAxes,
  centerX,
  centerY,
  scale,
}: GridProps) {
  const lines: React.ReactElement[] = [];

  // 그리드 라인 생성
  if (showGrid) {
    // 수직 그리드 라인
    for (let x = centerX % gridSize; x < width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="#e0e0e0"
          strokeWidth={0.5}
        />
      );
    }

    // 수평 그리드 라인
    for (let y = centerY % gridSize; y < height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#e0e0e0"
          strokeWidth={0.5}
        />
      );
    }
  }

  // 좌표축 생성
  const axes: React.ReactElement[] = [];
  if (showAxes) {
    // X축
    axes.push(
      <g key="x-axis">
        <line
          x1={0}
          y1={centerY}
          x2={width}
          y2={centerY}
          stroke="#000000"
          strokeWidth={2}
        />
        {/* X축 화살표 */}
        <polygon
          points={`${width - 10},${centerY - 5} ${width},${centerY} ${width - 10},${centerY + 5}`}
          fill="#000000"
        />
      </g>
    );

    // Y축
    axes.push(
      <g key="y-axis">
        <line
          x1={centerX}
          y1={0}
          x2={centerX}
          y2={height}
          stroke="#000000"
          strokeWidth={2}
        />
        {/* Y축 화살표 */}
        <polygon
          points={`${centerX - 5},10 ${centerX},0 ${centerX + 5},10`}
          fill="#000000"
        />
      </g>
    );

    // 눈금 추가
    const tickSize = 5;
    const labelOffset = 20;

    // X축 눈금
    for (let x = centerX % (gridSize * 5); x < width; x += gridSize * 5) {
      if (Math.abs(x - centerX) > 5) {
        axes.push(
          <g key={`x-tick-${x}`}>
            <line
              x1={x}
              y1={centerY - tickSize}
              x2={x}
              y2={centerY + tickSize}
              stroke="#000000"
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={centerY + labelOffset}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
            >
              {Math.round((x - centerX) / scale)}
            </text>
          </g>
        );
      }
    }

    // Y축 눈금
    for (let y = centerY % (gridSize * 5); y < height; y += gridSize * 5) {
      if (Math.abs(y - centerY) > 5) {
        axes.push(
          <g key={`y-tick-${y}`}>
            <line
              x1={centerX - tickSize}
              y1={y}
              x2={centerX + tickSize}
              y2={y}
              stroke="#000000"
              strokeWidth={1.5}
            />
            <text
              x={centerX - labelOffset}
              y={y + 4}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
            >
              {Math.round((centerY - y) / scale)}
            </text>
          </g>
        );
      }
    }

    // 원점 표시
    axes.push(
      <text
        key="origin"
        x={centerX + 10}
        y={centerY + 20}
        fontSize="14"
        fill="#666"
      >
        O
      </text>
    );
  }

  return (
    <g>
      {lines}
      {axes}
    </g>
  );
}
