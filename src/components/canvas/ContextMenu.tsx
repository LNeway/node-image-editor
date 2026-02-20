import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
            // TODO: Add node from context menu
            onClose();
          }}
        >
          <span className="text-node-image">+</span>
          {t('context_menu.add_node')}
        </button>
        <button
          className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary flex items-center gap-2"
          onClick={() => {
            // TODO: Copy node
            onClose();
          }}
        >
          <span>📋</span>
          {t('context_menu.copy')}
        </button>
        <button
          className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary flex items-center gap-2"
          onClick={() => {
            // TODO: Delete node
            onClose();
          }}
        >
          <span className="text-red-400">🗑️</span>
          {t('context_menu.delete')}
        </button>
        <div className="border-t border-border-color my-1" />
        <button
          className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary flex items-center gap-2"
          onClick={() => {
            // TODO: Group nodes
            onClose();
          }}
        >
          <span>📦</span>
          {t('context_menu.group')}
        </button>
      </div>
    </>
  );
}
