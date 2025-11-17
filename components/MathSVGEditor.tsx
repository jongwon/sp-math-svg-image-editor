'use client';

import React, { useState, useRef, useCallback } from 'react';
import { EditorState, Shape, FunctionGraph, Point, ToolType, DragState } from '@/types';
import Grid from './Grid';
import FunctionRenderer from './FunctionRenderer';
import ShapeRenderer from './ShapeRenderer';
import Toolbar from './Toolbar';
import FunctionPanel from './FunctionPanel';

const INITIAL_STATE: EditorState = {
  shapes: [],
  functions: [],
  backgroundImage: null,
  showBackgroundImage: false,
  selectedTool: 'select',
  selectedShapeId: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
  gridSize: 40,
  showGrid: true,
  showAxes: true,
};

export default function MathSVGEditor() {
  const [state, setState] = useState<EditorState>(INITIAL_STATE);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPoint: { x: 0, y: 0 },
    currentPoint: { x: 0, y: 0 },
    draggedShapeId: null,
    draggedPointIndex: null,
  });
  const [tempPoints, setTempPoints] = useState<Point[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasWidth = 1200;
  const canvasHeight = 800;
  const centerX = canvasWidth / 2 + state.pan.x;
  const centerY = canvasHeight / 2 + state.pan.y;
  const scale = 40 * state.zoom;

  // SVG 좌표 변환
  const getSVGPoint = useCallback((e: React.MouseEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // 마우스 다운 핸들러
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const point = getSVGPoint(e);

      if (state.selectedTool === 'select' || state.selectedTool === 'pan') {
        setDragState({
          isDragging: true,
          startPoint: point,
          currentPoint: point,
          draggedShapeId: null,
          draggedPointIndex: null,
        });
      } else if (state.selectedTool === 'line' || state.selectedTool === 'circle' ||
                 state.selectedTool === 'rectangle' || state.selectedTool === 'ellipse') {
        setTempPoints([point]);
      } else if (state.selectedTool === 'polygon') {
        setTempPoints([...tempPoints, point]);
      } else if (state.selectedTool === 'text') {
        const newShape: Shape = {
          id: `text-${Date.now()}`,
          type: 'text',
          points: [point],
          color: '#000000',
          strokeWidth: 1,
          text: 'Text',
          fontSize: 16,
        };
        setState({
          ...state,
          shapes: [...state.shapes, newShape],
        });
      }
    },
    [state, tempPoints, getSVGPoint]
  );

  // 마우스 이동 핸들러
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const point = getSVGPoint(e);

      if (dragState.isDragging) {
        if (state.selectedTool === 'pan') {
          const dx = point.x - dragState.currentPoint.x;
          const dy = point.y - dragState.currentPoint.y;
          setState({
            ...state,
            pan: { x: state.pan.x + dx, y: state.pan.y + dy },
          });
        } else if (dragState.draggedShapeId !== null && dragState.draggedPointIndex !== null) {
          // 점 드래그
          setState({
            ...state,
            shapes: state.shapes.map((shape) => {
              if (shape.id === dragState.draggedShapeId) {
                const newPoints = [...shape.points];
                newPoints[dragState.draggedPointIndex!] = point;
                return { ...shape, points: newPoints };
              }
              return shape;
            }),
          });
        }

        setDragState({
          ...dragState,
          currentPoint: point,
        });
      }
    },
    [dragState, state, getSVGPoint]
  );

  // 마우스 업 핸들러
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const point = getSVGPoint(e);

      if (state.selectedTool === 'line' && tempPoints.length === 1) {
        const newShape: Shape = {
          id: `line-${Date.now()}`,
          type: 'line',
          points: [tempPoints[0], point],
          color: '#000000',
          strokeWidth: 2,
        };
        setState({
          ...state,
          shapes: [...state.shapes, newShape],
        });
        setTempPoints([]);
      } else if (state.selectedTool === 'circle' && tempPoints.length === 1) {
        const newShape: Shape = {
          id: `circle-${Date.now()}`,
          type: 'circle',
          points: [tempPoints[0], point],
          color: '#000000',
          strokeWidth: 2,
        };
        setState({
          ...state,
          shapes: [...state.shapes, newShape],
        });
        setTempPoints([]);
      } else if (state.selectedTool === 'rectangle' && tempPoints.length === 1) {
        const newShape: Shape = {
          id: `rectangle-${Date.now()}`,
          type: 'rectangle',
          points: [tempPoints[0], point],
          color: '#000000',
          strokeWidth: 2,
        };
        setState({
          ...state,
          shapes: [...state.shapes, newShape],
        });
        setTempPoints([]);
      } else if (state.selectedTool === 'ellipse' && tempPoints.length === 1) {
        const newShape: Shape = {
          id: `ellipse-${Date.now()}`,
          type: 'ellipse',
          points: [tempPoints[0], point],
          color: '#000000',
          strokeWidth: 2,
        };
        setState({
          ...state,
          shapes: [...state.shapes, newShape],
        });
        setTempPoints([]);
      }

      setDragState({
        isDragging: false,
        startPoint: { x: 0, y: 0 },
        currentPoint: { x: 0, y: 0 },
        draggedShapeId: null,
        draggedPointIndex: null,
      });
    },
    [state, tempPoints, getSVGPoint]
  );

  // 폴리곤 완성 (더블클릭)
  const handleDoubleClick = useCallback(() => {
    if (state.selectedTool === 'polygon' && tempPoints.length > 2) {
      const newShape: Shape = {
        id: `polygon-${Date.now()}`,
        type: 'polygon',
        points: tempPoints,
        color: '#000000',
        strokeWidth: 2,
      };
      setState({
        ...state,
        shapes: [...state.shapes, newShape],
      });
      setTempPoints([]);
    }
  }, [state, tempPoints]);

  // 도형 선택
  const handleShapeClick = useCallback(
    (id: string) => {
      setState({ ...state, selectedShapeId: id });
    },
    [state]
  );

  // 점 드래그 시작
  const handlePointDragStart = useCallback(
    (shapeId: string, pointIndex: number) => {
      setDragState({
        ...dragState,
        isDragging: true,
        draggedShapeId: shapeId,
        draggedPointIndex: pointIndex,
      });
    },
    [dragState]
  );

  // 도구 변경
  const handleToolChange = useCallback(
    (tool: ToolType) => {
      setState({ ...state, selectedTool: tool, selectedShapeId: null });
      setTempPoints([]);
    },
    [state]
  );

  // 함수 추가
  const handleAddFunction = useCallback(
    (func: FunctionGraph) => {
      setState({
        ...state,
        functions: [...state.functions, func],
      });
    },
    [state]
  );

  // 함수 삭제
  const handleRemoveFunction = useCallback(
    (id: string) => {
      setState({
        ...state,
        functions: state.functions.filter((f) => f.id !== id),
      });
    },
    [state]
  );

  // 배경 이미지 업로드
  const handleBackgroundImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setState({
            ...state,
            backgroundImage: event.target?.result as string,
            showBackgroundImage: true,
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [state]
  );

  // 배경 이미지 토글
  const handleToggleBackgroundImage = useCallback(() => {
    setState({
      ...state,
      showBackgroundImage: !state.showBackgroundImage,
    });
  }, [state]);

  // 배경 이미지 제거
  const handleRemoveBackgroundImage = useCallback(() => {
    setState({
      ...state,
      backgroundImage: null,
      showBackgroundImage: false,
    });
  }, [state]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 툴바 */}
      <Toolbar
        selectedTool={state.selectedTool}
        onToolChange={handleToolChange}
        onBackgroundImageUpload={handleBackgroundImageUpload}
        onToggleBackgroundImage={handleToggleBackgroundImage}
        onRemoveBackgroundImage={handleRemoveBackgroundImage}
        hasBackgroundImage={state.backgroundImage !== null}
        showBackgroundImage={state.showBackgroundImage}
      />

      {/* 메인 캔버스 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <svg
            ref={svgRef}
            width={canvasWidth}
            height={canvasHeight}
            className="border border-gray-300"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            style={{ cursor: state.selectedTool === 'pan' ? 'grab' : 'crosshair' }}
          >
            {/* 배경 이미지 */}
            {state.backgroundImage && state.showBackgroundImage && (
              <image
                href={state.backgroundImage}
                x="0"
                y="0"
                width={canvasWidth}
                height={canvasHeight}
                opacity={0.5}
                preserveAspectRatio="none"
              />
            )}

            {/* 그리드와 좌표축 */}
            <Grid
              width={canvasWidth}
              height={canvasHeight}
              gridSize={state.gridSize}
              showGrid={state.showGrid}
              showAxes={state.showAxes}
              centerX={centerX}
              centerY={centerY}
              scale={scale}
            />

            {/* 함수 그래프 */}
            <FunctionRenderer
              functions={state.functions}
              width={canvasWidth}
              height={canvasHeight}
              centerX={centerX}
              centerY={centerY}
              scale={scale}
            />

            {/* 도형 */}
            <ShapeRenderer
              shapes={state.shapes}
              selectedShapeId={state.selectedShapeId}
              onShapeClick={handleShapeClick}
              onPointDragStart={handlePointDragStart}
            />

            {/* 임시 도형 (그리는 중) */}
            {tempPoints.length > 0 && (
              <g>
                {tempPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={3} fill="red" />
                ))}
              </g>
            )}
          </svg>
        </div>

        {/* 상태 정보 */}
        <div className="mt-4 text-sm text-gray-600">
          도구: {state.selectedTool} | 도형: {state.shapes.length} | 함수: {state.functions.length}
        </div>
      </div>

      {/* 함수 패널 */}
      <FunctionPanel
        functions={state.functions}
        onAddFunction={handleAddFunction}
        onRemoveFunction={handleRemoveFunction}
      />
    </div>
  );
}
