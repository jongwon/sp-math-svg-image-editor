import React, { useState } from 'react';
import { FunctionGraph, FunctionType } from '@/types';

interface FunctionPanelProps {
  functions: FunctionGraph[];
  onAddFunction: (func: FunctionGraph) => void;
  onRemoveFunction: (id: string) => void;
}

export default function FunctionPanel({
  functions,
  onAddFunction,
  onRemoveFunction,
}: FunctionPanelProps) {
  const [functionType, setFunctionType] = useState<FunctionType>('linear');
  const [coefficients, setCoefficients] = useState<string>('1,0');
  const [color, setColor] = useState('#FF0000');

  const functionTypes: { value: FunctionType; label: string; example: string }[] = [
    { value: 'linear', label: '1차 함수', example: 'y = ax + b (예: 1,0)' },
    { value: 'quadratic', label: '2차 함수', example: 'y = ax² + bx + c (예: 1,0,0)' },
    { value: 'polynomial', label: '고차 다항식', example: 'y = aₙxⁿ + ... + a₀ (예: 1,0,0,0)' },
    { value: 'sine', label: '사인', example: 'y = a·sin(bx + c) + d (예: 1,1,0,0)' },
    { value: 'cosine', label: '코사인', example: 'y = a·cos(bx + c) + d (예: 1,1,0,0)' },
    { value: 'tangent', label: '탄젠트', example: 'y = a·tan(bx + c) + d (예: 1,1,0,0)' },
    { value: 'exponential', label: '지수함수', example: 'y = a·e^(bx) + c (예: 1,1,0)' },
    { value: 'logarithmic', label: '로그함수', example: 'y = a·ln(bx) + c (예: 1,1,0)' },
    { value: 'ellipse-curve', label: '타원', example: '(x-h)²/a² + (y-k)²/b² = 1 (예: 0,0,3,2)' },
    { value: 'hyperbola', label: '쌍곡선', example: '(x-h)²/a² - (y-k)²/b² = 1 (예: 0,0,3,2)' },
    { value: 'parabola', label: '포물선', example: 'y = ax² + bx + c (예: 1,0,0)' },
  ];

  const handleAddFunction = () => {
    try {
      const coeffArray = coefficients.split(',').map((c) => parseFloat(c.trim()));

      if (coeffArray.some(isNaN)) {
        alert('계수는 숫자로 입력해주세요 (쉼표로 구분)');
        return;
      }

      const newFunction: FunctionGraph = {
        id: `func-${Date.now()}`,
        type: functionType,
        coefficients: coeffArray,
        color: color,
        strokeWidth: 2,
        opacity: 1,
      };

      onAddFunction(newFunction);
    } catch (error) {
      alert('계수 입력 형식이 올바르지 않습니다');
    }
  };

  return (
    <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">함수 그래프</h2>

      {/* 함수 추가 폼 */}
      <div className="space-y-4 mb-6 pb-6 border-b">
        <div>
          <label className="block text-sm font-medium mb-2">함수 타입</label>
          <select
            value={functionType}
            onChange={(e) => setFunctionType(e.target.value as FunctionType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {functionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-700 mt-1">
            {functionTypes.find((t) => t.value === functionType)?.example}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">계수 (쉼표로 구분)</label>
          <input
            type="text"
            value={coefficients}
            onChange={(e) => setCoefficients(e.target.value)}
            placeholder="예: 1,0 또는 1,0,0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">색상</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleAddFunction}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          함수 추가
        </button>
      </div>

      {/* 함수 목록 */}
      <div>
        <h3 className="font-bold mb-3">추가된 함수 ({functions.length})</h3>
        {functions.length === 0 ? (
          <p className="text-sm text-gray-700">추가된 함수가 없습니다</p>
        ) : (
          <div className="space-y-2">
            {functions.map((func) => (
              <div
                key={func.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: func.color }}
                    />
                    <span className="font-medium text-sm">
                      {functionTypes.find((t) => t.value === func.type)?.label}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveFunction(func.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    삭제
                  </button>
                </div>
                <div className="text-xs text-gray-800">
                  계수: [{func.coefficients.join(', ')}]
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 함수 설명 */}
      <div className="border-t pt-4 mt-6">
        <h3 className="font-bold mb-2 text-sm">함수 예제</h3>
        <div className="text-xs text-gray-800 space-y-2">
          <div>
            <strong>1차 함수:</strong> y = 2x + 1 → 계수: 2,1
          </div>
          <div>
            <strong>2차 함수:</strong> y = x² - 2x + 1 → 계수: 1,-2,1
          </div>
          <div>
            <strong>사인:</strong> y = sin(x) → 계수: 1,1,0,0
          </div>
          <div>
            <strong>타원:</strong> 중심(0,0), a=3, b=2 → 계수: 0,0,3,2
          </div>
        </div>
      </div>
    </div>
  );
}
