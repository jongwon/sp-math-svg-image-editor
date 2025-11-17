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
  const [history, setHistory] = useState<EditorState[]>([INITIAL_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPoint: { x: 0, y: 0 },
    currentPoint: { x: 0, y: 0 },
    draggedShapeId: null,
    draggedPointIndex: null,
  });
  const [tempPoints, setTempPoints] = useState<Point[]>([]);
  const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
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
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5;

  // History 관리 헬퍼 함수
  const updateStateWithHistory = useCallback((newState: EditorState) => {
    setState(newState);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setState(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setState(history[newIndex]);
    }
  }, [history, historyIndex]);

  // 선택된 도형 삭제
  const handleDeleteSelected = useCallback(() => {
    if (state.selectedShapeId) {
      const newState = {
        ...state,
        shapes: state.shapes.filter((shape) => shape.id !== state.selectedShapeId),
        selectedShapeId: null,
      };
      updateStateWithHistory(newState);
    }
  }, [state, updateStateWithHistory]);

  // 전체 클리어
  const handleClearAll = useCallback(() => {
    if (window.confirm('모든 도형과 함수를 삭제하시겠습니까?')) {
      const newState = {
        ...state,
        shapes: [],
        functions: [],
        selectedShapeId: null,
      };
      updateStateWithHistory(newState);
    }
  }, [state, updateStateWithHistory]);

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
          // 점 드래그 (개별 점 이동)
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
        } else if (state.selectedShapeId && dragState.draggedShapeId === null) {
          // 도형 전체 드래그 (모든 점 이동)
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

      // 도형 그리기 중일 때 마우스 위치 추적 (미리보기용)
      if (tempPoints.length > 0 && !dragState.isDragging) {
        setCurrentMousePos(point);
      }
    },
    [dragState, state, getSVGPoint, tempPoints]
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
        updateStateWithHistory({
          ...state,
          shapes: [...state.shapes, newShape],
        });
        setTempPoints([]);
        setCurrentMousePos(null);
      } else if (state.selectedTool === 'circle' && tempPoints.length === 1) {
        const newShape: Shape = {
          id: `circle-${Date.now()}`,
          type: 'circle',
          points: [tempPoints[0], point],
          color: '#000000',
          strokeWidth: 2,
        };
        updateStateWithHistory({
          ...state,
          shapes: [...state.shapes, newShape],
        });
        setTempPoints([]);
        setCurrentMousePos(null);
      } else if (state.selectedTool === 'rectangle' && tempPoints.length === 1) {
        const newShape: Shape = {
          id: `rectangle-${Date.now()}`,
          type: 'rectangle',
          points: [tempPoints[0], point],
          color: '#000000',
          strokeWidth: 2,
        };
        updateStateWithHistory({
          ...state,
          shapes: [...state.shapes, newShape],
        });
        setTempPoints([]);
        setCurrentMousePos(null);
      } else if (state.selectedTool === 'ellipse' && tempPoints.length === 1) {
        const newShape: Shape = {
          id: `ellipse-${Date.now()}`,
          type: 'ellipse',
          points: [tempPoints[0], point],
          color: '#000000',
          strokeWidth: 2,
        };
        updateStateWithHistory({
          ...state,
          shapes: [...state.shapes, newShape],
        });
        setTempPoints([]);
        setCurrentMousePos(null);
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
        updateStateWithHistory({
          ...state,
          shapes: [...state.shapes, newShape],
        });
        setTempPoints([]);
        setCurrentMousePos(null);
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
        updateStateWithHistory({
          ...state,
          shapes: [...state.shapes, newShape],
        });
        setTempPoints([]);
        setCurrentMousePos(null);
      } else if (dragState.isDragging && (dragState.draggedShapeId !== null || state.selectedShapeId)) {
        // 드래그가 끝났을 때 history에 추가
        updateStateWithHistory(state);
      }

      setDragState({
        isDragging: false,
        startPoint: { x: 0, y: 0 },
        currentPoint: { x: 0, y: 0 },
        draggedShapeId: null,
        draggedPointIndex: null,
      });
    },
    [state, tempPoints, getSVGPoint, updateStateWithHistory, dragState]
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
      updateStateWithHistory({
        ...state,
        shapes: [...state.shapes, newShape],
      });
      setTempPoints([]);
      setCurrentMousePos(null);
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
      updateStateWithHistory({
        ...state,
        shapes: [...state.shapes, newShape],
      });
      setTempPoints([]);
      setCurrentMousePos(null);
    }
  }, [state, tempPoints, updateStateWithHistory]);

  // 도형 선택
  const handleShapeClick = useCallback(
    (id: string) => {
      setState({ ...state, selectedShapeId: id });
    },
    [state]
  );

  // 점 드래그 시작
  const handlePointDragStart = useCallback(
    (shapeId: string, pointIndex: number, e: React.MouseEvent) => {
      const point = getSVGPoint(e);
      setState({ ...state, selectedShapeId: shapeId });
      setDragState({
        isDragging: true,
        startPoint: point,
        currentPoint: point,
        draggedShapeId: shapeId,
        draggedPointIndex: pointIndex,
      });
    },
    [state, getSVGPoint]
  );

  // 도형 전체 드래그 시작
  const handleShapeDragStart = useCallback(
    (shapeId: string, e: React.MouseEvent) => {
      const point = getSVGPoint(e);
      setState({ ...state, selectedShapeId: shapeId });
      setDragState({
        isDragging: true,
        startPoint: point,
        currentPoint: point,
        draggedShapeId: null,
        draggedPointIndex: null,
      });
    },
    [state, getSVGPoint]
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
      updateStateWithHistory({
        ...state,
        functions: [...state.functions, func],
      });
    },
    [state, updateStateWithHistory]
  );

  // 함수 삭제
  const handleRemoveFunction = useCallback(
    (id: string) => {
      updateStateWithHistory({
        ...state,
        functions: state.functions.filter((f) => f.id !== id),
      });
    },
    [state, updateStateWithHistory]
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

  // 좌표축 토글
  const handleToggleAxes = useCallback(() => {
    setState({
      ...state,
      showAxes: !state.showAxes,
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
      updateStateWithHistory({
        ...state,
        shapes: [...state.shapes, newShape],
      });
    }
    setIsEditingText(false);
    setTextInput('');
  }, [state, textInput, textPosition, textFontSize, updateStateWithHistory]);

  // 텍스트 입력 취소
  const handleTextInputCancel = useCallback(() => {
    setIsEditingText(false);
    setTextInput('');
  }, []);

  // 마우스 휠로 줌
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.zoom + delta));
      setState({
        ...state,
        zoom: newZoom,
      });
    },
    [state, MIN_ZOOM, MAX_ZOOM]
  );

  // 줌 인
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(MAX_ZOOM, state.zoom + 0.2);
    setState({
      ...state,
      zoom: newZoom,
    });
  }, [state, MAX_ZOOM]);

  // 줌 아웃
  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(MIN_ZOOM, state.zoom - 0.2);
    setState({
      ...state,
      zoom: newZoom,
    });
  }, [state, MIN_ZOOM]);

  // 줌 리셋
  const handleZoomReset = useCallback(() => {
    setState({
      ...state,
      zoom: 1,
    });
  }, [state]);

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

  // 키보드 이벤트 리스너 (Delete, Backspace, Undo, Redo)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 텍스트 입력 중이면 무시
      if (isEditingText) return;

      // Delete 또는 Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
      }
      // Ctrl+Z (Undo)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Shift+Z 또는 Ctrl+Y (Redo)
      else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditingText, handleDeleteSelected, handleUndo, handleRedo]);

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
        showAxes={state.showAxes}
        onToggleAxes={handleToggleAxes}
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
            onWheel={handleWheel}
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
            <g transform={`translate(${centerX}, ${centerY}) scale(${state.zoom}) translate(${-centerX}, ${-centerY})`}>
              <ShapeRenderer
                shapes={state.shapes}
                selectedShapeId={state.selectedShapeId}
                onShapeClick={handleShapeClick}
                onPointDragStart={handlePointDragStart}
                onShapeDragStart={handleShapeDragStart}
              />
            </g>

            {/* 임시 도형 (그리는 중) */}
            {tempPoints.length > 0 && (
              <g transform={`translate(${centerX}, ${centerY}) scale(${state.zoom}) translate(${-centerX}, ${-centerY})`}>
                {/* 임시 점들 표시 */}
                {tempPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={3} fill="red" />
                ))}

                {/* 가이드선 (미리보기) */}
                {currentMousePos && tempPoints.length === 1 && (
                  <>
                    {/* 직선, 치수선: 점선 */}
                    {(state.selectedTool === 'line' || state.selectedTool === 'dimension') && (
                      <line
                        x1={tempPoints[0].x}
                        y1={tempPoints[0].y}
                        x2={currentMousePos.x}
                        y2={currentMousePos.y}
                        stroke="#999"
                        strokeWidth={1}
                        strokeDasharray="5,5"
                        opacity={0.7}
                      />
                    )}

                    {/* 원: 반지름 점선 원 */}
                    {state.selectedTool === 'circle' && (() => {
                      const dx = currentMousePos.x - tempPoints[0].x;
                      const dy = currentMousePos.y - tempPoints[0].y;
                      const radius = Math.sqrt(dx * dx + dy * dy);
                      return (
                        <circle
                          cx={tempPoints[0].x}
                          cy={tempPoints[0].y}
                          r={radius}
                          stroke="#999"
                          strokeWidth={1}
                          strokeDasharray="5,5"
                          fill="none"
                          opacity={0.7}
                        />
                      );
                    })()}

                    {/* 사각형: 점선 사각형 */}
                    {state.selectedTool === 'rectangle' && (
                      <rect
                        x={Math.min(tempPoints[0].x, currentMousePos.x)}
                        y={Math.min(tempPoints[0].y, currentMousePos.y)}
                        width={Math.abs(currentMousePos.x - tempPoints[0].x)}
                        height={Math.abs(currentMousePos.y - tempPoints[0].y)}
                        stroke="#999"
                        strokeWidth={1}
                        strokeDasharray="5,5"
                        fill="none"
                        opacity={0.7}
                      />
                    )}

                    {/* 타원: 점선 타원 */}
                    {state.selectedTool === 'ellipse' && (() => {
                      const cx = (tempPoints[0].x + currentMousePos.x) / 2;
                      const cy = (tempPoints[0].y + currentMousePos.y) / 2;
                      const rx = Math.abs(currentMousePos.x - tempPoints[0].x) / 2;
                      const ry = Math.abs(currentMousePos.y - tempPoints[0].y) / 2;
                      return (
                        <ellipse
                          cx={cx}
                          cy={cy}
                          rx={rx}
                          ry={ry}
                          stroke="#999"
                          strokeWidth={1}
                          strokeDasharray="5,5"
                          fill="none"
                          opacity={0.7}
                        />
                      );
                    })()}
                  </>
                )}

                {/* 폴리곤/각도: 마지막 점에서 마우스까지 점선 */}
                {currentMousePos && tempPoints.length > 0 &&
                 (state.selectedTool === 'polygon' || state.selectedTool === 'angle') && (
                  <line
                    x1={tempPoints[tempPoints.length - 1].x}
                    y1={tempPoints[tempPoints.length - 1].y}
                    x2={currentMousePos.x}
                    y2={currentMousePos.y}
                    stroke="#999"
                    strokeWidth={1}
                    strokeDasharray="5,5"
                    opacity={0.7}
                  />
                )}
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

          {/* 편집 컨트롤 (Undo/Redo/Clear) */}
          <div className="absolute bottom-2 left-2 flex gap-2">
            <div className="flex flex-col gap-1 bg-white rounded-lg shadow-lg p-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="실행 취소 (Ctrl+Z)"
              >
                ↶
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="다시 실행 (Ctrl+Y)"
              >
                ↷
              </button>
              <button
                onClick={handleClearAll}
                className="w-9 h-9 bg-red-100 hover:bg-red-200 rounded flex items-center justify-center text-xs font-medium text-red-700 transition-colors"
                title="전체 삭제"
              >
                🗑
              </button>
            </div>

            {/* 줌 컨트롤 */}
            <div className="flex flex-col gap-1 bg-white rounded-lg shadow-lg p-2">
              <button
                onClick={handleZoomIn}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center font-bold text-gray-700 transition-colors"
                title="줌 인 (마우스 휠 위로)"
              >
                +
              </button>
              <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-800">
                {Math.round(state.zoom * 100)}%
              </div>
              <button
                onClick={handleZoomOut}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center font-bold text-gray-700 transition-colors"
                title="줌 아웃 (마우스 휠 아래로)"
              >
                −
              </button>
              <button
                onClick={handleZoomReset}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-xs font-medium text-gray-700 transition-colors"
                title="줌 리셋 (100%)"
              >
                1:1
              </button>
            </div>
          </div>

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
        <div className="mt-4 text-sm text-gray-800">
          도구: {state.selectedTool} | 도형: {state.shapes.length} | 함수: {state.functions.length} | 캔버스: {canvasWidth}x{canvasHeight}px | 줌: {Math.round(state.zoom * 100)}%
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
