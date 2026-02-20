import { useTranslation } from 'react-i18next';
import { NodeTypeDefinition } from '../../core/nodes/types';

interface NodeItemProps {
  node: NodeTypeDefinition;
  onAdd: () => void;
}

// 类别图标
const categoryIcons: Record<string, string> = {
  input: '📥',
  adjust: '🎨',
  filter: '✨',
  transform: '🔄',
  composite: '🎭',
  channel: '📊',
  mask: '🎭',
  text: '🔤',
  output: '📤',
  utility: '🔧',
};

export default function NodeItem({ node, onAdd }: NodeItemProps) {
  const { t } = useTranslation();

  return (
    <button
      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-text-primary hover:bg-bg-tertiary rounded transition-colors group"
      onClick={onAdd}
      title={t(node.description || '')}
    >
      <span className="text-base">{categoryIcons[node.category] || '📦'}</span>
      <span className="flex-1 text-left truncate">{t(node.label)}</span>
      <span className="opacity-0 group-hover:opacity-100 text-node-image text-xs">+</span>
    </button>
  );
}
