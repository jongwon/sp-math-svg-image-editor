import React from 'react';
import { FunctionGraph } from '@/types';
import { generateFunctionPath, generateConicPath } from '@/lib/mathUtils';

interface FunctionRendererProps {
  functions: FunctionGraph[];
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  scale: number;
}

export default function FunctionRenderer({
  functions,
  width,
  height,
  centerX,
  centerY,
  scale,
}: FunctionRendererProps) {
  return (
    <g>
      {functions.map((func) => {
        const domain = func.domain || {
          min: -width / 2,
          max: width / 2,
        };

        // 이차곡선 처리
        if (['ellipse-curve', 'hyperbola', 'parabola'].includes(func.type)) {
          const path = generateConicPath(
            func.type as 'ellipse-curve' | 'hyperbola' | 'parabola',
            func.coefficients,
            width,
            height,
            centerX,
            centerY,
            scale
          );

          return (
            <path
              key={func.id}
              d={path}
              stroke={func.color}
              strokeWidth={func.strokeWidth}
              fill="none"
              opacity={func.opacity || 1}
            />
          );
        }

        // 일반 함수 그래프
        const points = generateFunctionPath(
          func.type,
          func.coefficients,
          domain,
          width,
          height,
          centerX,
          centerY,
          scale,
          1
        );

        if (points.length === 0) return null;

        const pathData = points
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
          .join(' ');

        return (
          <path
            key={func.id}
            d={pathData}
            stroke={func.color}
            strokeWidth={func.strokeWidth}
            fill="none"
            opacity={func.opacity || 1}
          />
        );
      })}
    </g>
  );
}
