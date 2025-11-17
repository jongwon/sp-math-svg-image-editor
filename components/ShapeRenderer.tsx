import React from 'react';
import { Shape } from '@/types';

interface ShapeRendererProps {
  shapes: Shape[];
  selectedShapeId: string | null;
  onShapeClick: (id: string) => void;
  onPointDragStart: (shapeId: string, pointIndex: number, e: React.MouseEvent) => void;
  onShapeDragStart: (shapeId: string, e: React.MouseEvent) => void;
}

export default function ShapeRenderer({
  shapes,
  selectedShapeId,
  onShapeClick,
  onPointDragStart,
  onShapeDragStart,
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
                  onMouseDown={(e) => onShapeDragStart(shape.id, e)}
                  style={{ cursor: 'move' }}
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
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onPointDragStart(shape.id, idx, e);
                      }}
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
                  onMouseDown={(e) => onShapeDragStart(shape.id, e)}
                  style={{ cursor: 'move' }}
                />
                {isSelected && (
                  <>
                    <circle
                      cx={center.x}
                      cy={center.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onPointDragStart(shape.id, 0, e);
                      }}
                    />
                    <circle
                      cx={edge.x}
                      cy={edge.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onPointDragStart(shape.id, 1, e);
                      }}
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
                  onMouseDown={(e) => onShapeDragStart(shape.id, e)}
                  style={{ cursor: 'move' }}
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
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onPointDragStart(shape.id, idx, e);
                      }}
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
                  onMouseDown={(e) => onShapeDragStart(shape.id, e)}
                  style={{ cursor: 'move' }}
                />
                {isSelected && (
                  <>
                    <circle
                      cx={center.x}
                      cy={center.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onPointDragStart(shape.id, 0, e);
                      }}
                    />
                    <circle
                      cx={edge.x}
                      cy={edge.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onPointDragStart(shape.id, 1, e);
                      }}
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
                  onMouseDown={(e) => onShapeDragStart(shape.id, e)}
                  style={{ cursor: 'move' }}
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
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onPointDragStart(shape.id, idx, e);
                      }}
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
                  onMouseDown={(e) => onShapeDragStart(shape.id, e)}
                  style={{ cursor: 'move', userSelect: 'none' }}
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
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onPointDragStart(shape.id, 0, e);
                    }}
                  />
                )}
              </g>
            );
          }

          case 'dimension': {
            // 치수선: 두 점 사이에 타원형 점선과 거리 표시
            if (shape.points.length < 2) return null;
            const p1 = shape.points[0];
            const p2 = shape.points[1];

            // 두 점 사이의 거리 계산
            const distance = Math.sqrt(
              Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
            );

            // 중점 계산
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            // 오프셋 (타원형 곡선을 위한 제어점)
            const offset = shape.distanceOffset || 30;
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const length = Math.sqrt(dx * dx + dy * dy);

            // 수직 방향 벡터
            const perpX = -dy / length * offset;
            const perpY = dx / length * offset;

            // 곡선의 제어점
            const controlX = midX + perpX;
            const controlY = midY + perpY;

            // 타원형 곡선 경로
            const path = `M ${p1.x},${p1.y} Q ${controlX},${controlY} ${p2.x},${p2.y}`;

            return (
              <g key={shape.id}>
                {/* 타원형 점선 */}
                <path
                  d={path}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth}
                  strokeDasharray="5,5"
                  fill="none"
                  opacity={shape.opacity || 1}
                  onClick={() => onShapeClick(shape.id)}
                  onMouseDown={(e) => onShapeDragStart(shape.id, e)}
                  style={{ cursor: 'move' }}
                />

                {/* 거리 텍스트 */}
                {shape.showDistance !== false && (
                  <text
                    x={controlX}
                    y={controlY}
                    fill={shape.color}
                    fontSize={shape.fontSize || 14}
                    textAnchor="middle"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {shape.text || distance.toFixed(1)}
                  </text>
                )}

                {/* 선택 시 제어점 */}
                {isSelected && (
                  <>
                    <circle
                      cx={p1.x}
                      cy={p1.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onPointDragStart(shape.id, 0, e);
                      }}
                    />
                    <circle
                      cx={p2.x}
                      cy={p2.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onPointDragStart(shape.id, 1, e);
                      }}
                    />
                  </>
                )}
              </g>
            );
          }

          case 'angle': {
            // 각도 표시: 세 점으로 각도 표시 (중심점, 시작점, 끝점)
            if (shape.points.length < 3) return null;
            const vertex = shape.points[0];  // 꼭지점
            const p1 = shape.points[1];      // 첫 번째 선
            const p2 = shape.points[2];      // 두 번째 선

            // 각도 계산
            const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
            const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
            let angleDiff = (angle2 - angle1) * (180 / Math.PI);

            // 각도를 0-360 범위로 정규화
            if (angleDiff < 0) angleDiff += 360;
            if (angleDiff > 360) angleDiff -= 360;

            const radius = shape.arcRadius || 40;
            const isRightAngle = shape.angleType === 'right';

            // 각도 호의 시작/끝 각도 (라디안)
            const startAngle = angle1;
            const endAngle = angle2;

            // 호 그리기
            const largeArcFlag = Math.abs(angleDiff) > 180 ? 1 : 0;
            const arcEndX = vertex.x + radius * Math.cos(endAngle);
            const arcEndY = vertex.y + radius * Math.sin(endAngle);
            const arcStartX = vertex.x + radius * Math.cos(startAngle);
            const arcStartY = vertex.y + radius * Math.sin(startAngle);

            return (
              <g key={shape.id}>
                {/* 각도를 이루는 두 선 */}
                <line
                  x1={vertex.x}
                  y1={vertex.y}
                  x2={p1.x}
                  y2={p1.y}
                  stroke={shape.color}
                  strokeWidth={1}
                  opacity={0.3}
                />
                <line
                  x1={vertex.x}
                  y1={vertex.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={shape.color}
                  strokeWidth={1}
                  opacity={0.3}
                />

                {isRightAngle ? (
                  /* 직각 표시 (사각형) */
                  <>
                    <path
                      d={`M ${vertex.x + 15 * Math.cos(startAngle)},${vertex.y + 15 * Math.sin(startAngle)}
                          L ${vertex.x + 15 * Math.cos(startAngle) + 15 * Math.cos(endAngle)},${vertex.y + 15 * Math.sin(startAngle) + 15 * Math.sin(endAngle)}
                          L ${vertex.x + 15 * Math.cos(endAngle)},${vertex.y + 15 * Math.sin(endAngle)}`}
                      stroke={shape.color}
                      strokeWidth={shape.strokeWidth}
                      fill="none"
                      onClick={() => onShapeClick(shape.id)}
                      onMouseDown={(e) => onShapeDragStart(shape.id, e)}
                      style={{ cursor: 'move' }}
                    />
                  </>
                ) : (
                  /* 일반 각도 표시 (호) */
                  <>
                    <path
                      d={`M ${arcStartX},${arcStartY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${arcEndX},${arcEndY}`}
                      stroke={shape.color}
                      strokeWidth={shape.strokeWidth}
                      fill="none"
                      onClick={() => onShapeClick(shape.id)}
                      onMouseDown={(e) => onShapeDragStart(shape.id, e)}
                      style={{ cursor: 'move' }}
                    />

                    {/* 각도 값 표시 */}
                    {shape.showAngleValue !== false && (
                      <text
                        x={vertex.x + (radius + 10) * Math.cos((startAngle + endAngle) / 2)}
                        y={vertex.y + (radius + 10) * Math.sin((startAngle + endAngle) / 2)}
                        fill={shape.color}
                        fontSize={shape.fontSize || 14}
                        textAnchor="middle"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                      >
                        {shape.text || `${angleDiff.toFixed(1)}°`}
                      </text>
                    )}
                  </>
                )}

                {/* 선택 시 제어점 */}
                {isSelected && (
                  <>
                    <circle
                      cx={vertex.x}
                      cy={vertex.y}
                      r={5}
                      fill="red"
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onPointDragStart(shape.id, 0, e);
                      }}
                    />
                    <circle
                      cx={p1.x}
                      cy={p1.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onPointDragStart(shape.id, 1, e);
                      }}
                    />
                    <circle
                      cx={p2.x}
                      cy={p2.y}
                      r={5}
                      fill="blue"
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onPointDragStart(shape.id, 2, e);
                      }}
                    />
                  </>
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
