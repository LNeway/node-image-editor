import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setSelectedNode } from '../../store/uiSlice';

interface CustomNodeData {
  label: string;
  category: string;
  inputs?: Array<{ key: string; label: string; dataType: string }>;
  outputs?: Array<{ key: string; label: string; dataType: string }>;
  params?: Record<string, any>;
  outputsData?: Record<string, any>;
}

// 定义端口类型颜色
const portColors: Record<string, string> = {
  image: '#00b894',
  mask: '#dfe6e9',
  number: '#0984e3',
  color: '#fdcb6e',
  bbox: '#e17055',
};

function CustomNode({ id, data, selected }: NodeProps<CustomNodeData>) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(setSelectedNode(id));
  }, [dispatch, id]);

  // 获取端口数据
  const inputs = data?.inputs || [];
  const outputs = data?.outputs || [];

  return (
    <div 
      className={`
        min-w-[180px] bg-bg-secondary rounded-lg border-2 transition-all
        ${selected ? 'border-node-image shadow-lg shadow-node-image/20' : 'border-border-color'}
      `}
      onClick={handleClick}
    >
      {/* 节点标题 */}
      <div className="px-3 py-2 border-b border-border-color bg-bg-tertiary rounded-t-lg">
        <div className="text-sm font-semibold text-text-primary">
          {t(data?.label || 'node.common.node')}
        </div>
        <div className="text-xs text-text-secondary">
          {data?.category || 'unknown'}
        </div>
      </div>

      {/* 端口区域 */}
      <div className="px-3 py-2">
        {/* 输入端口 */}
        {inputs.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {inputs.map((input, index) => (
              <div key={`input-${index}`} className="flex items-center">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={input.key}
                  className="!w-3 !h-3 !border-2 !border-bg-primary"
                  style={{ 
                    backgroundColor: portColors[input.dataType] || '#00b894',
                  }}
                />
                <span className="ml-2 text-xs text-text-secondary">
                  {t(input.label)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 输出端口 */}
        {outputs.length > 0 && (
          <div className="flex flex-col gap-2">
            {outputs.map((output, index) => (
              <div key={`output-${index}`} className="flex items-center justify-end">
                <span className="mr-2 text-xs text-text-secondary">
                  {t(output.label)}
                </span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={output.key}
                  className="!w-3 !h-3 !border-2 !border-bg-primary"
                  style={{ 
                    backgroundColor: portColors[output.dataType] || '#00b894',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 如果没有预定义端口，显示默认的输入/输出端口 */}
      {inputs.length === 0 && outputs.length === 0 && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            className="!w-3 !h-3 !bg-node-image !border-2 !border-bg-primary"
          />
          <Handle
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 !bg-node-image !border-2 !border-bg-primary"
          />
        </>
      )}
    </div>
  );
}

export default memo(CustomNode);
