import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// SVG Icons
const Icons = {
  add: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  delete: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  group: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
};

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const { t } = useTranslation();

  const handleClickOutside = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleClickOutside}
      />
      
      {/* Menu */}
      <div
        className="fixed z-50 bg-bg-secondary border border-border-color rounded-lg shadow-xl py-1 min-w-[160px]"
        style={{ left: x, top: y }}
      >
        <button
          className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary flex items-center gap-2"
          onClick={() => {
            onClose();
          }}
        >
          <span className="text-[#00b894]">{Icons.add}</span>
          {t('context_menu.add_node')}
        </button>
        <button
          className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary flex items-center gap-2"
          onClick={() => {
            onClose();
          }}
        >
          {Icons.copy}
          {t('context_menu.copy')}
        </button>
        <button
          className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary flex items-center gap-2"
          onClick={() => {
            onClose();
          }}
        >
          <span className="text-red-400">{Icons.delete}</span>
          {t('context_menu.delete')}
        </button>
        <div className="border-t border-border-color my-1" />
        <button
          className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary flex items-center gap-2"
          onClick={() => {
            onClose();
          }}
        >
          {Icons.group}
          {t('context_menu.group')}
        </button>
      </div>
    </>
  );
}
