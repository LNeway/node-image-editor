import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateNode } from '../../store/graphSlice';
import { useMemo } from 'react';
import { nodeRegistry } from '../../core/nodes/NodeRegistry';
import SliderParam from './params/SliderParam';
import SelectParam from './params/SelectParam';
import ColorParam from './params/ColorParam';
import CheckboxParam from './params/CheckboxParam';
import NumberParam from './params/NumberParam';
import TextParam from './params/TextParam';

export default function PropertiesPanel() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const selectedNodeId = useSelector((state: RootState) => state.ui.selectedNodeId);
  const nodes = useSelector((state: RootState) => state.graph.nodes);

  // 获取选中的节点
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId);
  }, [nodes, selectedNodeId]);

  // 获取节点定义
  const nodeDef = useMemo(() => {
    if (!selectedNode?.type) return null;
    return nodeRegistry.get(selectedNode.type);
  }, [selectedNode?.type]);

  // 更新参数
  const handleParamChange = (key: string, value: any) => {
    if (!selectedNodeId) return;
    dispatch(updateNode({
      id: selectedNodeId,
      data: { params: { ...selectedNode?.data?.params, [key]: value } },
    }));
  };

  if (!selectedNode) {
    return (
      <div className="w-72 bg-bg-secondary border-l border-border-color flex flex-col h-full">
        <div className="p-4 border-b border-border-color">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('panel.properties')}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-text-secondary text-sm text-center">
            {t('properties.select_node')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-bg-secondary border-l border-border-color flex flex-col h-full overflow-y-auto">
      {/* 节点标题 */}
      <div className="p-4 border-b border-border-color">
        <h2 className="text-lg font-semibold text-text-primary">
          {t(nodeDef?.label || 'node.common.node')}
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          {t(nodeDef?.description || '')}
        </p>
      </div>

      {/* 节点预览 */}
      <div className="p-4 border-b border-border-color">
        <div className="text-xs text-text-secondary mb-2">{t('properties.preview')}</div>
        <div className="aspect-video bg-bg-primary rounded border border-border-color flex items-center justify-center">
          <span className="text-text-secondary text-sm">{t('properties.no_preview')}</span>
        </div>
      </div>

      {/* 输入端口 */}
      {nodeDef?.inputs && nodeDef.inputs.length > 0 && (
        <div className="p-4 border-b border-border-color">
          <div className="text-xs text-text-secondary mb-2">{t('properties.inputs')}</div>
          <div className="space-y-1">
            {nodeDef.inputs.map((input) => (
              <div key={input.key} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">{t(input.label)}</span>
                <span className="text-text-secondary text-xs">{input.dataType}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 输出端口 */}
      {nodeDef?.outputs && nodeDef.outputs.length > 0 && (
        <div className="p-4 border-b border-border-color">
          <div className="text-xs text-text-secondary mb-2">{t('properties.outputs')}</div>
          <div className="space-y-1">
            {nodeDef.outputs.map((output) => (
              <div key={output.key} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">{t(output.label)}</span>
                <span className="text-text-secondary text-xs">{output.dataType}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 参数控件 */}
      {nodeDef?.params && nodeDef.params.length > 0 && (
        <div className="p-4">
          <div className="text-xs text-text-secondary mb-3">{t('properties.params')}</div>
          <div className="space-y-4">
            {nodeDef.params.map((param) => {
              const value = selectedNode?.data?.params?.[param.key] ?? param.default;
              
              switch (param.type) {
                case 'slider':
                  return (
                    <SliderParam
                      key={param.key}
                      param={param}
                      value={value}
                      onChange={(v) => handleParamChange(param.key, v)}
                    />
                  );
                case 'select':
                  return (
                    <SelectParam
                      key={param.key}
                      param={param}
                      value={value}
                      onChange={(v) => handleParamChange(param.key, v)}
                    />
                  );
                case 'color':
                  return (
                    <ColorParam
                      key={param.key}
                      param={param}
                      value={value}
                      onChange={(v) => handleParamChange(param.key, v)}
                    />
                  );
                case 'checkbox':
                  return (
                    <CheckboxParam
                      key={param.key}
                      param={param}
                      value={value}
                      onChange={(v) => handleParamChange(param.key, v)}
                    />
                  );
                case 'number':
                  return (
                    <NumberParam
                      key={param.key}
                      param={param}
                      value={value}
                      onChange={(v) => handleParamChange(param.key, v)}
                    />
                  );
                case 'text':
                  return (
                    <TextParam
                      key={param.key}
                      param={param}
                      value={value}
                      onChange={(v) => handleParamChange(param.key, v)}
                    />
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
}
