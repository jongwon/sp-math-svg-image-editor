import React from 'react';
import { ToolType } from '@/types';

interface ToolbarProps {
  selectedTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onBackgroundImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleBackgroundImage: () => void;
  onRemoveBackgroundImage: () => void;
  hasBackgroundImage: boolean;
  showBackgroundImage: boolean;
}

export default function Toolbar({
  selectedTool,
  onToolChange,
  onBackgroundImageUpload,
  onToggleBackgroundImage,
  onRemoveBackgroundImage,
  hasBackgroundImage,
  showBackgroundImage,
}: ToolbarProps) {
  const tools: { id: ToolType; label: string; icon: string }[] = [
    { id: 'select', label: '선택', icon: '↖' },
    { id: 'pan', label: '이동', icon: '✋' },
    { id: 'line', label: '선', icon: '/' },
    { id: 'circle', label: '원', icon: '○' },
    { id: 'rectangle', label: '사각형', icon: '□' },
    { id: 'ellipse', label: '타원', icon: '⬭' },
    { id: 'polygon', label: '다각형', icon: '⬡' },
    { id: 'text', label: '텍스트', icon: 'T' },
    { id: 'function', label: '함수', icon: 'ƒ' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">도구</h2>

      {/* 도구 버튼들 */}
      <div className="space-y-2 mb-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-colors ${
              selectedTool === tool.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span className="text-2xl">{tool.icon}</span>
            <span className="font-medium">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* 배경 이미지 섹션 */}
      <div className="border-t pt-4">
        <h3 className="font-bold mb-3">배경 이미지</h3>

        <div className="space-y-2">
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={onBackgroundImageUpload}
              className="hidden"
              id="background-upload"
            />
            <div className="w-full px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600 text-center">
              이미지 업로드
            </div>
          </label>

          {hasBackgroundImage && (
            <>
              <button
                onClick={onToggleBackgroundImage}
                className={`w-full px-4 py-2 rounded-lg ${
                  showBackgroundImage
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {showBackgroundImage ? '이미지 숨기기' : '이미지 보기'}
              </button>

              <button
                onClick={onRemoveBackgroundImage}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                이미지 제거
              </button>
            </>
          )}
        </div>
      </div>

      {/* 도구 설명 */}
      <div className="border-t pt-4 mt-4">
        <h3 className="font-bold mb-2">사용 방법</h3>
        <div className="text-sm text-gray-600 space-y-1">
          {selectedTool === 'select' && <p>도형을 클릭하여 선택하고 점을 드래그하여 편집</p>}
          {selectedTool === 'pan' && <p>캔버스를 드래그하여 이동</p>}
          {selectedTool === 'line' && <p>시작점과 끝점을 클릭하여 선 그리기</p>}
          {selectedTool === 'circle' && <p>중심점과 반지름을 클릭하여 원 그리기</p>}
          {selectedTool === 'rectangle' && <p>대각선의 두 점을 클릭하여 사각형 그리기</p>}
          {selectedTool === 'ellipse' && <p>중심점과 모서리를 클릭하여 타원 그리기</p>}
          {selectedTool === 'polygon' && <p>점들을 클릭하고 더블클릭으로 완성</p>}
          {selectedTool === 'text' && <p>텍스트를 배치할 위치 클릭</p>}
          {selectedTool === 'function' && <p>오른쪽 패널에서 함수 추가</p>}
        </div>
      </div>
    </div>
  );
}
