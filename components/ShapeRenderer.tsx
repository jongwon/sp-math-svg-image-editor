import React from 'react';
import { Shape } from '@/types';

interface ShapeRendererProps {
  shapes: Shape[];
  selectedShapeId: string | null;
  onShapeClick: (id: string) => void;
  onPointDragStart: (shapeId: string, pointIndex: number) => void;
}

export default function ShapeRenderer({
  shapes,
  selectedShapeId,
  onShapeClick,
  onPointDragStart,
}: ShapeRendererProps) {
  return (
    <g>
      {shapes.map((shape) => {
        const isSelected = shape.id === selectedShapeId;

        switch (shape.type) {
          case 'line': {
            if (shape.points.length < 2) return null;
            return (
              <g key={shape.id}>
                <line
                  x1={shape.points[0].x}
                  y1={shape.points[0].y}
                  x2={shape.points[1].x}
                  y2={shape.points[1].y}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth}
                  opacity={shape.opacity || 1}
                  onClick={() => onShapeClick(shape.id)}
                  style={{ cursor: 'pointer' }}
                />
                {isSelected &&
                  shape.points.map((point, idx) => (
                    <circle
                      key={`${shape.id}-point-${idx}`}
                      cx={point.x}
                      cy={point.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={() => onPointDragStart(shape.id, idx)}
                    />
                  ))}
              </g>
            );
          }

          case 'circle': {
            if (shape.points.length < 2) return null;
            const center = shape.points[0];
            const edge = shape.points[1];
            const radius = Math.sqrt(
              Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
            );
            return (
              <g key={shape.id}>
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={radius}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth}
                  fill={shape.fill || 'none'}
                  opacity={shape.opacity || 1}
                  onClick={() => onShapeClick(shape.id)}
                  style={{ cursor: 'pointer' }}
                />
                {isSelected && (
                  <>
                    <circle
                      cx={center.x}
                      cy={center.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={() => onPointDragStart(shape.id, 0)}
                    />
                    <circle
                      cx={edge.x}
                      cy={edge.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={() => onPointDragStart(shape.id, 1)}
                    />
                  </>
                )}
              </g>
            );
          }

          case 'rectangle': {
            if (shape.points.length < 2) return null;
            const x = Math.min(shape.points[0].x, shape.points[1].x);
            const y = Math.min(shape.points[0].y, shape.points[1].y);
            const width = Math.abs(shape.points[1].x - shape.points[0].x);
            const height = Math.abs(shape.points[1].y - shape.points[0].y);
            return (
              <g key={shape.id}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth}
                  fill={shape.fill || 'none'}
                  opacity={shape.opacity || 1}
                  onClick={() => onShapeClick(shape.id)}
                  style={{ cursor: 'pointer' }}
                />
                {isSelected &&
                  shape.points.map((point, idx) => (
                    <circle
                      key={`${shape.id}-point-${idx}`}
                      cx={point.x}
                      cy={point.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={() => onPointDragStart(shape.id, idx)}
                    />
                  ))}
              </g>
            );
          }

          case 'ellipse': {
            if (shape.points.length < 2) return null;
            const center = shape.points[0];
            const edge = shape.points[1];
            const rx = Math.abs(edge.x - center.x);
            const ry = Math.abs(edge.y - center.y);
            return (
              <g key={shape.id}>
                <ellipse
                  cx={center.x}
                  cy={center.y}
                  rx={rx}
                  ry={ry}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth}
                  fill={shape.fill || 'none'}
                  opacity={shape.opacity || 1}
                  onClick={() => onShapeClick(shape.id)}
                  style={{ cursor: 'pointer' }}
                />
                {isSelected && (
                  <>
                    <circle
                      cx={center.x}
                      cy={center.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={() => onPointDragStart(shape.id, 0)}
                    />
                    <circle
                      cx={edge.x}
                      cy={edge.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={() => onPointDragStart(shape.id, 1)}
                    />
                  </>
                )}
              </g>
            );
          }

          case 'polygon': {
            if (shape.points.length < 2) return null;
            const pointsStr = shape.points
              .map((p) => `${p.x},${p.y}`)
              .join(' ');
            return (
              <g key={shape.id}>
                <polygon
                  points={pointsStr}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth}
                  fill={shape.fill || 'none'}
                  opacity={shape.opacity || 1}
                  onClick={() => onShapeClick(shape.id)}
                  style={{ cursor: 'pointer' }}
                />
                {isSelected &&
                  shape.points.map((point, idx) => (
                    <circle
                      key={`${shape.id}-point-${idx}`}
                      cx={point.x}
                      cy={point.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={() => onPointDragStart(shape.id, idx)}
                    />
                  ))}
              </g>
            );
          }

          case 'text': {
            if (shape.points.length < 1) return null;
            return (
              <g key={shape.id}>
                <text
                  x={shape.points[0].x}
                  y={shape.points[0].y}
                  fill={shape.color}
                  fontSize={shape.fontSize || 16}
                  opacity={shape.opacity || 1}
                  onClick={() => onShapeClick(shape.id)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {shape.text || 'Text'}
                </text>
                {isSelected && (
                  <circle
                    cx={shape.points[0].x}
                    cy={shape.points[0].y}
                    r={5}
                    fill="blue"
                    style={{ cursor: 'move' }}
                    onMouseDown={() => onPointDragStart(shape.id, 0)}
                  />
                )}
              </g>
            );
          }

          default:
            return null;
        }
      })}
    </g>
  );
}
