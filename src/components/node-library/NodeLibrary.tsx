import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { nodeRegistry } from '../../core/nodes/NodeRegistry';
import NodeCategory from './NodeCategory';
import NodeSearch from './NodeSearch';

interface NodeLibraryProps {
  onAddNode: (nodeType: string) => void;
}

export default function NodeLibrary({ onAddNode }: NodeLibraryProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // 获取所有节点，按类别分组
  const nodesByCategory = useMemo(() => {
    const categories: Record<string, any[]> = {};
    
    nodeRegistry.getAll().forEach((node) => {
      const category = node.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      
      // 过滤搜索
      const label = t(node.label);
      if (searchQuery && !label.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }
      
      categories[category].push(node);
    });

    return categories;
  }, [t, searchQuery]);

  // 类别显示顺序
  const categoryOrder = ['input', 'adjust', 'filter', 'transform', 'composite', 'channel', 'mask', 'text', 'output', 'utility'];

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // 类别翻译
  const categoryLabels: Record<string, string> = {
    input: t('panel.categories.input'),
    adjust: t('panel.categories.adjust'),
    filter: t('panel.categories.filter'),
    transform: t('panel.categories.transform'),
    composite: t('panel.categories.composite'),
    channel: t('panel.categories.channel'),
    mask: t('panel.categories.mask'),
    text: t('panel.categories.text'),
    output: t('panel.categories.output'),
    utility: t('panel.categories.utility'),
  };

  return (
    <div className="w-64 bg-bg-secondary border-r border-border-color flex flex-col h-full">
      {/* 标题 */}
      <div className="p-4 border-b border-border-color">
        <h2 className="text-lg font-semibold text-text-primary mb-3">
          {t('panel.node_library')}
        </h2>
        <NodeSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* 节点列表 */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(nodesByCategory)
          .sort(([a], [b]) => {
            const aIndex = categoryOrder.indexOf(a);
            const bIndex = categoryOrder.indexOf(b);
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
          })
          .map(([category, nodes]) => (
            <NodeCategory
              key={category}
              name={categoryLabels[category] || category}
              nodes={nodes}
              isCollapsed={collapsedCategories.has(category)}
              onToggle={() => toggleCategory(category)}
              onAddNode={onAddNode}
            />
          ))}
        
        {Object.keys(nodesByCategory).length === 0 && (
          <div className="text-center text-text-secondary py-8">
            {searchQuery ? t('panel.no_results') : t('panel.no_nodes')}
          </div>
        )}
      </div>
    </div>
  );
}
