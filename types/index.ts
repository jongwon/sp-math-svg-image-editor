// 기본 좌표 타입
export interface Point {
  x: number;
  y: number;
}

// 도형 타입
export type ShapeType =
  | 'line'
  | 'circle'
  | 'rectangle'
  | 'ellipse'
  | 'polygon'
  | 'path'
  | 'text';

// 함수 그래프 타입
export type FunctionType =
  | 'linear'           // 1차 함수
  | 'quadratic'        // 2차 함수
  | 'polynomial'       // 고차 다항식
  | 'sine'            // 사인
  | 'cosine'          // 코사인
  | 'tangent'         // 탄젠트
  | 'exponential'     // 지수함수
  | 'logarithmic'     // 로그함수
  | 'ellipse-curve'   // 타원
  | 'hyperbola'       // 쌍곡선
  | 'parabola';       // 포물선

// 도형 객체
export interface Shape {
  id: string;
  type: ShapeType;
  points: Point[];
  color: string;
  strokeWidth: number;
  fill?: string;
  opacity?: number;
  text?: string;
  fontSize?: number;
}

// 함수 그래프 객체
export interface FunctionGraph {
  id: string;
  type: FunctionType;
  coefficients: number[]; // 계수 배열
  color: string;
  strokeWidth: number;
  domain?: { min: number; max: number };
  opacity?: number;
}

// 에디터 상태
export interface EditorState {
  shapes: Shape[];
  functions: FunctionGraph[];
  backgroundImage: string | null;
  showBackgroundImage: boolean;
  selectedTool: ToolType;
  selectedShapeId: string | null;
  zoom: number;
  pan: Point;
  gridSize: number;
  showGrid: boolean;
  showAxes: boolean;
}

// 도구 타입
export type ToolType =
  | 'select'
  | 'pan'
  | 'line'
  | 'circle'
  | 'rectangle'
  | 'ellipse'
  | 'polygon'
  | 'text'
  | 'function'
  | 'background';

// 드래그 상태
export interface DragState {
  isDragging: boolean;
  startPoint: Point;
  currentPoint: Point;
  draggedShapeId: string | null;
  draggedPointIndex: number | null;
}
