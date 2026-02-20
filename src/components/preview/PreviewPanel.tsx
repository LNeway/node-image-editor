import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function PreviewPanel() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resolution, setResolution] = useState<'720' | '1080' | '1440' | 'full'>('1080');

  // 绘制预览
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    canvas.width = 1920;
    canvas.height = 1080;

    // 显示占位符
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 显示提示文字
    ctx.fillStyle = '#b0b0b0';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('preview.placeholder'), canvas.width / 2, canvas.height / 2);
  }, [t]);

  const resolutionOptions = [
    { value: '720', label: '720p' },
    { value: '1080', label: '1080p' },
    { value: '1440', label: '2K' },
    { value: 'full', label: t('preview.full') },
  ];

  return (
    <div className="w-80 bg-bg-secondary border-l border-border-color flex flex-col">
      {/* 标题栏 */}
      <div className="p-4 border-b border-border-color flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          {t('panel.preview')}
        </h2>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value as typeof resolution)}
          className="px-2 py-1 bg-bg-tertiary border border-border-color rounded text-sm text-text-primary"
        >
          {resolutionOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 预览画布 */}
      <div className="flex-1 p-4 overflow-hidden flex items-center justify-center bg-bg-primary">
        <div className="relative max-w-full max-h-full border border-border-color rounded overflow-hidden">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[400px] object-contain"
          />
        </div>
      </div>

      {/* 底部信息 */}
      <div className="p-3 border-t border-border-color text-xs text-text-secondary">
        <div className="flex justify-between">
          <span>{t('preview.size')}:</span>
          <span>1920 × 1080</span>
        </div>
      </div>
    </div>
  );
}
