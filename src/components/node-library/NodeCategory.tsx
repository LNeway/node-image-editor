import { TFunction } from 'i18next';
import { NodeTypeDefinition } from '../../core/nodes/types';

// Category color palette - professional node editor style
const categoryColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  input: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: '#3b82f6', // Blue
  },
  adjust: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    icon: '#8b5cf6', // Purple
  },
  filter: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
    icon: '#ec4899', // Pink
  },
  transform: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    icon: '#06b6d4', // Cyan
  },
  composite: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    icon: '#f97316', // Orange
  },
  channel: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    icon: '#eab308', // Yellow
  },
  mask: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    icon: '#64748b', // Slate
  },
  text: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: '#10b981', // Emerald
  },
  output: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    icon: '#22c55e', // Green
  },
  utility: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
    icon: '#6b7280', // Gray
  },
};

// SVG Icons for categories
const CategoryIcons: Record<string, React.ReactNode> = {
  input: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  adjust: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  transform: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M5 3v4h4M3 5h4v4M15 19v4h4M19 21h-4v-4M21 3h-4v4M5 15H3v4" />
    </svg>
  ),
  composite: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  output: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
};

// Node type icons
const NodeIcons: Record<string, React.ReactNode> = {
  image_import: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  brightness_contrast: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  gaussian_blur: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="12" r="5" opacity="0.5" />
      <circle cx="12" cy="12" r="8" opacity="0.25" />
    </svg>
  ),
  blend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  ),
  image_export: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  preview_output: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
};

// Chevron Icon
const ChevronIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    className={`w-3.5 h-3.5 transition-transform duration-150 ${isCollapsed ? '' : 'rotate-90'}`}
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// Plus Icon
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

interface NodeCategoryProps {
  name: string;
  nodes: NodeTypeDefinition[];
  isCollapsed: boolean;
  onToggle: () => void;
  onAddNode: (nodeType: string) => void;
  t: TFunction;
}

export default function NodeCategory({
  name,
  nodes,
  isCollapsed,
  onToggle,
  onAddNode,
  t,
}: NodeCategoryProps) {
  // Get category key for colors
  const getCategoryKey = (): string => {
    const keyMap: Record<string, string> = {
      '输入': 'input',
      '调整': 'adjust',
      '滤镜': 'filter',
      '变换': 'transform',
      '合成': 'composite',
      '通道': 'channel',
      '蒙版': 'mask',
      '文字': 'text',
      '输出': 'output',
      '工具': 'utility',
    };
    for (const [cn, en] of Object.entries(keyMap)) {
      if (name.includes(cn)) return en;
    }
    return name.toLowerCase();
  };

  const categoryKey = getCategoryKey();
  const colors = categoryColors[categoryKey] || categoryColors.utility;

  // Get icon for node type
  const getNodeIcon = (nodeType: string): React.ReactNode => {
    const shortType = nodeType.replace(/^(node_|image_)/, '');
    return NodeIcons[shortType] || NodeIcons[nodeType.split('_').pop() || ''];
  };

  return (
    <div className="mb-1">
      {/* Category Header */}
      <button
        type="button"
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between px-2 py-2 rounded-lg
          text-sm font-medium transition-colors duration-150
          hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]
          ${colors.text} ${colors.bg}
        `}
        aria-expanded={!isCollapsed}
        aria-label={`${name} category, ${nodes.length} nodes`}
      >
        <span className="flex items-center gap-2">
          <span 
            className="flex-shrink-0" 
            style={{ color: colors.icon }}
            aria-hidden="true"
          >
            {CategoryIcons[categoryKey]}
          </span>
          <span className="truncate">{name}</span>
          <span className="text-xs opacity-60 ml-1">({nodes.length})</span>
        </span>
        <ChevronIcon isCollapsed={isCollapsed} />
      </button>

      {/* Node List */}
      {!isCollapsed && (
        <div className="mt-1 ml-2 space-y-0.5">
          {nodes.map((node) => (
            <button
              key={node.type}
              type="button"
              onClick={() => onAddNode(node.type)}
              className={`
                w-full flex items-center gap-2 px-3 py-2 rounded-md
                text-sm text-[#e5e5e5] transition-all duration-150
                hover:bg-white/5 hover:translate-x-0.5
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]
                group
              `}
              title={node.description ? t(node.description) : undefined}
            >
              <span 
                className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ color: colors.icon }}
                aria-hidden="true"
              >
                {getNodeIcon(node.type)}
              </span>
              <span className="flex-1 text-left truncate">
                {t(node.label)}
              </span>
              <span 
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: colors.icon }}
                aria-hidden="true"
              >
                <PlusIcon />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
