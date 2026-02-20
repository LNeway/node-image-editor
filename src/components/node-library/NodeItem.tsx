import { useTranslation } from 'react-i18next';
import { NodeTypeDefinition } from '../../core/nodes/types';

interface NodeItemProps {
  node: NodeTypeDefinition;
  onAdd: () => void;
}

// SVG 图标组件
const Icons = {
  input: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  adjust: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  transform: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="5 3 12 3 19 3" />
      <polyline points="12 3 12 10 19 10" />
      <path d="M20 16.5A2.5 2.5 0 0017.5 14h-3" />
      <path d="M4 7.5A2.5 2.5 0 006.5 5h11" />
    </svg>
  ),
  composite: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
      <path d="M11 7h6v6" />
    </svg>
  ),
  channel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M4 4h4v4H4z" />
      <path d="M10 10h4v4h-4z" />
      <path d="M16 16h4v4h-4z" />
      <path d="M4 16h4v4H4z" />
    </svg>
  ),
  mask: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" opacity="0.3" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  output: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  utility: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  add: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

const categoryIcons: Record<string, JSX.Element> = {
  input: Icons.input,
  adjust: Icons.adjust,
  filter: Icons.filter,
  transform: Icons.transform,
  composite: Icons.composite,
  channel: Icons.channel,
  mask: Icons.mask,
  text: Icons.text,
  output: Icons.output,
  utility: Icons.utility,
};

export default function NodeItem({ node, onAdd }: NodeItemProps) {
  const { t } = useTranslation();

  return (
    <button
      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-text-primary hover:bg-bg-tertiary rounded transition-colors group"
      onClick={onAdd}
      title={t(node.description || '')}
    >
      <span className="text-[#00b894]">{categoryIcons[node.category] || Icons.utility}</span>
      <span className="flex-1 text-left truncate">{t(node.label)}</span>
      <span className="opacity-0 group-hover:opacity-100 text-[#00b894] text-xs">{Icons.add}</span>
    </button>
  );
}
