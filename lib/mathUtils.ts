import { Point, FunctionType } from '@/types';

// SVG 좌표를 수학 좌표로 변환 (SVG는 y축이 아래로 증가)
export function svgToMath(point: Point, canvasHeight: number): Point {
  return {
    x: point.x,
    y: canvasHeight - point.y,
  };
}

// 수학 좌표를 SVG 좌표로 변환
export function mathToSvg(point: Point, canvasHeight: number): Point {
  return {
    x: point.x,
    y: canvasHeight - point.y,
  };
}

// 함수 값 계산
export function evaluateFunction(
  type: FunctionType,
  x: number,
  coefficients: number[]
): number {
  switch (type) {
    case 'linear':
      // y = ax + b
      return coefficients[0] * x + (coefficients[1] || 0);

    case 'quadratic':
      // y = ax² + bx + c
      return (
        coefficients[0] * x * x +
        (coefficients[1] || 0) * x +
        (coefficients[2] || 0)
      );

    case 'polynomial': {
      // y = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀
      let result = 0;
      for (let i = 0; i < coefficients.length; i++) {
        result += coefficients[i] * Math.pow(x, coefficients.length - 1 - i);
      }
      return result;
    }

    case 'sine':
      // y = a * sin(bx + c) + d
      return (
        (coefficients[0] || 1) *
          Math.sin((coefficients[1] || 1) * x + (coefficients[2] || 0)) +
        (coefficients[3] || 0)
      );

    case 'cosine':
      // y = a * cos(bx + c) + d
      return (
        (coefficients[0] || 1) *
          Math.cos((coefficients[1] || 1) * x + (coefficients[2] || 0)) +
        (coefficients[3] || 0)
      );

    case 'tangent':
      // y = a * tan(bx + c) + d
      return (
        (coefficients[0] || 1) *
          Math.tan((coefficients[1] || 1) * x + (coefficients[2] || 0)) +
        (coefficients[3] || 0)
      );

    case 'exponential':
      // y = a * e^(bx) + c
      return (
        (coefficients[0] || 1) *
          Math.exp((coefficients[1] || 1) * x) +
        (coefficients[2] || 0)
      );

    case 'logarithmic':
      // y = a * ln(bx) + c
      if (x <= 0) return NaN;
      return (
        (coefficients[0] || 1) *
          Math.log((coefficients[1] || 1) * x) +
        (coefficients[2] || 0)
      );

    default:
      return 0;
  }
}

// 함수 그래프의 경로 포인트 생성
export function generateFunctionPath(
  type: FunctionType,
  coefficients: number[],
  domain: { min: number; max: number },
  canvasWidth: number,
  canvasHeight: number,
  centerX: number,
  centerY: number,
  scale: number,
  step: number = 1
): Point[] {
  const points: Point[] = [];

  for (let x = domain.min; x <= domain.max; x += step) {
    const y = evaluateFunction(type, x / scale, coefficients);

    if (!isNaN(y) && isFinite(y)) {
      const svgPoint = {
        x: centerX + x,
        y: centerY - y * scale,
      };

      points.push(svgPoint);
    }
  }

  return points;
}

// 이차곡선 경로 생성
export function generateConicPath(
  type: 'ellipse-curve' | 'hyperbola' | 'parabola',
  coefficients: number[],
  canvasWidth: number,
  canvasHeight: number,
  centerX: number,
  centerY: number,
  scale: number
): string {
  const [a, b, c, d, e, f] = coefficients;

  switch (type) {
    case 'ellipse-curve': {
      // (x-h)²/a² + (y-k)²/b² = 1
      const h = coefficients[0] || 0;
      const k = coefficients[1] || 0;
      const rx = (coefficients[2] || 1) * scale;
      const ry = (coefficients[3] || 1) * scale;

      const cx = centerX + h * scale;
      const cy = centerY - k * scale;

      return `M ${cx - rx} ${cy}
              A ${rx} ${ry} 0 0 0 ${cx} ${cy - ry}
              A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy}
              A ${rx} ${ry} 0 0 0 ${cx} ${cy + ry}
              A ${rx} ${ry} 0 0 0 ${cx - rx} ${cy}`;
    }

    case 'parabola': {
      // y = ax² + bx + c
      const points: string[] = [];
      const minX = -canvasWidth / 2;
      const maxX = canvasWidth / 2;

      for (let x = minX; x <= maxX; x += 2) {
        const realX = x / scale;
        const y = (coefficients[0] || 1) * realX * realX +
                  (coefficients[1] || 0) * realX +
                  (coefficients[2] || 0);
        const svgX = centerX + x;
        const svgY = centerY - y * scale;

        if (points.length === 0) {
          points.push(`M ${svgX} ${svgY}`);
        } else {
          points.push(`L ${svgX} ${svgY}`);
        }
      }

      return points.join(' ');
    }

    case 'hyperbola': {
      // x²/a² - y²/b² = 1
      const h = coefficients[0] || 0;
      const k = coefficients[1] || 0;
      const a = (coefficients[2] || 1) * scale;
      const b = (coefficients[3] || 1) * scale;

      const points: string[] = [];
      const minX = -canvasWidth / 2;
      const maxX = canvasWidth / 2;

      // 오른쪽 곡선
      for (let x = a / scale; x <= maxX / scale; x += 0.1) {
        const y = (b / a) * Math.sqrt(x * x - (a / scale) * (a / scale));
        points.push(`${x >= a / scale ? 'L' : 'M'} ${centerX + x * scale} ${centerY - y * scale}`);
      }

      return points.join(' ');
    }

    default:
      return '';
  }
}

// 두 점 사이의 거리 계산
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// 점이 도형 근처에 있는지 확인
export function isNearPoint(point: Point, target: Point, threshold: number = 10): boolean {
  return distance(point, target) < threshold;
}
