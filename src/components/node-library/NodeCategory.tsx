import { NodeTypeDefinition } from '../../core/nodes/types';
import NodeItem from './NodeItem';

interface NodeCategoryProps {
  name: string;
  nodes: NodeTypeDefinition[];
  isCollapsed: boolean;
  onToggle: () => void;
  onAddNode: (nodeType: string) => void;
}

export default function NodeCategory({
  name,
  nodes,
  isCollapsed,
  onToggle,
  onAddNode,
}: NodeCategoryProps) {
  return (
    <div className="mb-2">
      {/* 类别标题 */}
      <button
        className="w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors"
        onClick={onToggle}
      >
        <span>{name}</span>
        <span className={`transform transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>
          ▶
        </span>
      </button>

      {/* 节点列表 */}
      {!isCollapsed && (
        <div className="mt-1 space-y-1">
          {nodes.map((node) => (
            <NodeItem
              key={node.type}
              node={node}
              onAdd={() => onAddNode(node.type)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
