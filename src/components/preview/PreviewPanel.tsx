import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useTranslation } from 'react-i18next';

export default function PreviewPanel() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Initial position: center of canvas (calculated after mount)
  const [position, setPosition] = useState({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  
  const previewTexture = useSelector((state: RootState) => state.ui.previewTexture);
  const previewSize = useSelector((state: RootState) => state.ui.previewSize);

  // Calculate initial position on first render
  useEffect(() => {
    if (position.x === -1 && typeof window !== 'undefined') {
      // Center in canvas area: left sidebar (256px) + right panel (288px) = 544px total
      const canvasWidth = window.innerWidth - 544;
      const canvasHeight = window.innerHeight - 80; // toolbar + statusbar
      const panelWidth = 490;
      const panelHeight = 320;
      
      const initialX = 256 + (canvasWidth - panelWidth) / 2;
      const initialY = 48 + (canvasHeight - panelHeight) / 2;
      
      setPosition({ x: initialX, y: initialY });
    }
  }, [position.x]);

  // Show panel when there's an image
  useEffect(() => {
    if (previewTexture && typeof previewTexture === 'string' && previewTexture.startsWith('data:')) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setIsMinimized(false);
    }
  }, [previewTexture]);

  // Draw preview when texture changes
  useEffect(() => {
    if (!isVisible) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 480;
    canvas.height = 270;
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    if (previewTexture && typeof previewTexture === 'string' && previewTexture.startsWith('data:')) {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min((canvas.width - 20) / img.width, (canvas.height - 20) / img.height, 1);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        ctx.fillStyle = '#000';
        ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
        ctx.drawImage(img, x, y, w, h);
      };
      img.src = previewTexture;
    }
  }, [previewTexture, previewSize, isVisible]);

  // Constrain position to canvas area
  const constrainPosition = (x: number, y: number) => {
    const panelWidth = 490;
    const panelHeight = isMinimized ? 32 : 320;
    
    const canvasLeft = 256;
    const canvasRight = window.innerWidth - 288;
    const canvasTop = 48;
    const canvasBottom = window.innerHeight - 32;
    
    const minX = canvasLeft + 10;
    const maxX = canvasRight - panelWidth - 10;
    const minY = canvasTop + 10;
    const maxY = canvasBottom - panelHeight - 10;
    
    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY))
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const constrained = constrainPosition(position.x, position.y);
    setDragOffset({ x: e.clientX - constrained.x, y: e.clientY - constrained.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newPos = constrainPosition(
        e.clientX - dragOffset.x,
        e.clientY - dragOffset.y
      );
      setPosition(newPos);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  if (!isVisible) return null;

  return (
    <div 
      ref={panelRef}
      className="fixed z-50"
      style={{ 
        left: position.x > 0 ? position.x : undefined, 
        top: position.y > 0 ? position.y : undefined,
        transition: isDragging ? 'none' : 'all 0.2s ease'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header - drag handle */}
      <div 
        className="flex items-center justify-between px-3 py-1.5 rounded-t-lg cursor-move select-none bg-[#252525] border border-[#333] border-b-0"
        onMouseDown={handleMouseDown}
      >
        <span className="text-xs font-medium text-white">{t('panel.preview')}</span>
        <button onClick={() => setIsMinimized(!isMinimized)} className="text-[#666] hover:text-white text-xs">
          {isMinimized ? '□' : '—'}
        </button>
      </div>

      {/* Canvas Preview */}
      {!isMinimized && (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-b-lg">
          <canvas ref={canvasRef} className="block max-w-[480px] max-h-[270px]" />
          <div className="px-3 py-1.5 bg-[#252525] border-t border-[#333] flex justify-between text-xs text-[#666]">
            <span>{previewSize ? `${previewSize.width} × ${previewSize.height}` : '-'}</span>
            <span className="text-green-500">已加载</span>
          </div>
        </div>
      )}
    </div>
  );
}
