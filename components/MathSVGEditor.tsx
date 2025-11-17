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
  const [canvasWidth, setCanvasWidth] = useState(1200);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<Point>({ x: 0, y: 0 });
  const [textFontSize, setTextFontSize] = useState(16);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const centerX = canvasWidth / 2 + state.pan.x;
  const centerY = canvasHeight / 2 + state.pan.y;
  const scale = 40 * state.zoom;

  const MIN_WIDTH = 400;
  const MIN_HEIGHT = 300;
  const MAX_WIDTH = 2400;
  const MAX_HEIGHT = 1600;

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
                 state.selectedTool === 'rectangle' || state.selectedTool === 'ellipse' ||
                 state.selectedTool === 'dimension') {
        setTempPoints([point]);
      } else if (state.selectedTool === 'polygon' || state.selectedTool === 'angle') {
        setTempPoints([...tempPoints, point]);
      } else if (state.selectedTool === 'text') {
        // 텍스트 입력 모드 시작
        setTextPosition(point);
        setTextInput('');
        setIsEditingText(true);
        // 다음 프레임에서 input에 포커스
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 0);
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
        } else if (state.selectedTool === 'select' && state.selectedShapeId) {
          // 도형 전체 드래그
          const dx = point.x - dragState.currentPoint.x;
          const dy = point.y - dragState.currentPoint.y;
          setState({
            ...state,
            shapes: state.shapes.map((shape) => {
              if (shape.id === state.selectedShapeId) {
                return {
                  ...shape,
                  points: shape.points.map((p) => ({
                    x: p.x + dx,
                    y: p.y + dy,
                  })),
                };
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
      } else if (state.selectedTool === 'dimension' && tempPoints.length === 1) {
        // 치수선 생성
        const newShape: Shape = {
          id: `dimension-${Date.now()}`,
          type: 'dimension',
          points: [tempPoints[0], point],
          color: '#666666',
          strokeWidth: 1.5,
          showDistance: true,
          distanceOffset: 30,
        };
        setState({
          ...state,
          shapes: [...state.shapes, newShape],
        });
        setTempPoints([]);
      } else if (state.selectedTool === 'angle' && tempPoints.length === 2) {
        // 각도 표시 생성 (3점째 클릭)
        const newShape: Shape = {
          id: `angle-${Date.now()}`,
          type: 'angle',
          points: [tempPoints[0], tempPoints[1], point],
          color: '#FF6B6B',
          strokeWidth: 2,
          angleType: 'general',
          arcRadius: 40,
          showAngleValue: true,
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
    } else if (state.selectedTool === 'angle' && tempPoints.length === 3) {
      // 각도 표시 생성 (더블클릭으로도 완성 가능)
      const newShape: Shape = {
        id: `angle-${Date.now()}`,
        type: 'angle',
        points: tempPoints,
        color: '#FF6B6B',
        strokeWidth: 2,
        angleType: 'general',
        arcRadius: 40,
        showAngleValue: true,
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

  // 텍스트 입력 완료
  const handleTextInputComplete = useCallback(() => {
    if (textInput.trim()) {
      const newShape: Shape = {
        id: `text-${Date.now()}`,
        type: 'text',
        points: [textPosition],
        color: '#000000',
        strokeWidth: 1,
        text: textInput,
        fontSize: textFontSize,
      };
      setState({
        ...state,
        shapes: [...state.shapes, newShape],
      });
    }
    setIsEditingText(false);
    setTextInput('');
  }, [state, textInput, textPosition, textFontSize]);

  // 텍스트 입력 취소
  const handleTextInputCancel = useCallback(() => {
    setIsEditingText(false);
    setTextInput('');
  }, []);

  // 캔버스 리사이즈 시작
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  // 캔버스 리사이즈
  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(
        MIN_WIDTH,
        Math.min(MAX_WIDTH, e.clientX - containerRect.left)
      );
      const newHeight = Math.max(
        MIN_HEIGHT,
        Math.min(MAX_HEIGHT, e.clientY - containerRect.top)
      );

      setCanvasWidth(newWidth);
      setCanvasHeight(newHeight);
    },
    [isResizing, MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT]
  );

  // 캔버스 리사이즈 종료
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // 리사이즈 이벤트 리스너
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResize, handleResizeEnd]);

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
        <div
          ref={containerRef}
          className="relative bg-white shadow-lg rounded-lg overflow-hidden"
          style={{ width: 'fit-content', height: 'fit-content' }}
        >
          <svg
            ref={svgRef}
            width={canvasWidth}
            height={canvasHeight}
            className="border border-gray-300 block"
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

          {/* 텍스트 입력 박스 */}
          {isEditingText && (
            <div
              className="absolute border-2 border-dashed border-blue-500 bg-white bg-opacity-90 p-2 rounded"
              style={{
                left: `${textPosition.x}px`,
                top: `${textPosition.y - 40}px`,
                minWidth: '200px',
              }}
            >
              <div className="flex flex-col gap-2">
                <input
                  ref={textInputRef}
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTextInputComplete();
                    } else if (e.key === 'Escape') {
                      handleTextInputCancel();
                    }
                  }}
                  placeholder="텍스트 입력..."
                  className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={textFontSize}
                    onChange={(e) => setTextFontSize(parseInt(e.target.value) || 16)}
                    min="8"
                    max="72"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    title="폰트 크기"
                  />
                  <button
                    onClick={handleTextInputComplete}
                    className="flex-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    완료
                  </button>
                  <button
                    onClick={handleTextInputCancel}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 리사이즈 핸들 */}
          <div
            className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-nwse-resize hover:bg-blue-600 transition-colors"
            style={{
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            }}
            onMouseDown={handleResizeStart}
            title="드래그하여 캔버스 크기 조절"
          >
            <div className="absolute bottom-1 right-1 text-white text-xs">⇲</div>
          </div>
        </div>

        {/* 상태 정보 */}
        <div className="mt-4 text-sm text-gray-600">
          도구: {state.selectedTool} | 도형: {state.shapes.length} | 함수: {state.functions.length} | 캔버스: {canvasWidth}x{canvasHeight}px
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
