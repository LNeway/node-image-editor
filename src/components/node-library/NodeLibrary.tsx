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
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set(['transform', 'channel', 'mask', 'text', 'utility']));

  // Get all nodes, grouped by category
  const nodesByCategory = useMemo(() => {
    const categories: Record<string, any[]> = {};
    
    nodeRegistry.getAll().forEach((node) => {
      const category = node.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      
      // Filter by search
      const label = t(node.label);
      if (searchQuery && !label.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }
      
      categories[category].push(node);
    });

    return categories;
  }, [t, searchQuery]);

  // Category display order
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

  // Get category label
  const getCategoryLabel = (category: string): string => {
    return t(`panel.categories.${category}`);
  };

  return (
    <aside 
      className="w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col h-full"
      aria-label="Node library"
    >
      {/* Header */}
      <header className="p-4 border-b border-[#2a2a2a]">
        <h2 className="text-base font-semibold text-white mb-3">
          {t('panel.node_library')}
        </h2>
        <NodeSearch value={searchQuery} onChange={setSearchQuery} />
      </header>

      {/* Node List */}
      <nav className="flex-1 overflow-y-auto p-2" role="list">
        {Object.entries(nodesByCategory)
          .sort(([a], [b]) => {
            const aIndex = categoryOrder.indexOf(a);
            const bIndex = categoryOrder.indexOf(b);
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
          })
          .map(([category, nodes]) => (
            <NodeCategory
              key={category}
              name={getCategoryLabel(category)}
              nodes={nodes}
              isCollapsed={collapsedCategories.has(category)}
              onToggle={() => toggleCategory(category)}
              onAddNode={onAddNode}
              t={t}
            />
          ))}
        
        {Object.keys(nodesByCategory).length === 0 && (
          <div className="text-center text-[#666] py-8 text-sm">
            {searchQuery ? t('panel.no_results') : t('panel.no_nodes')}
          </div>
        )}
      </nav>
    </aside>
  );
}
