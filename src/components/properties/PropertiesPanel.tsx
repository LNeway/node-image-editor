import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { updateNode } from '../../store/graphSlice';
import { Node } from 'reactflow';
import { nodeRegistry } from '../../core/nodes/NodeRegistry';
import { getExecutionEngine } from '../../core/engine/ExecutionEngine';
import { useEffect, useState, useRef } from 'react';
import SliderParam from './params/SliderParam';
import SelectParam from './params/SelectParam';
import ColorParam from './params/ColorParam';
import CheckboxParam from './params/CheckboxParam';
import NumberParam from './params/NumberParam';
import TextParam from './params/TextParam';
import FileParam from './params/FileParam';

interface PropertiesPanelProps {
  selectedNode?: Node;
}

export default function PropertiesPanel({ selectedNode }: PropertiesPanelProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 获取节点定义 - use nodeType field from data
  const nodeDef = selectedNode?.data?.nodeType ? nodeRegistry.get(selectedNode.data.nodeType) : null;

  // 更新参数
  const handleParamChange = (key: string, value: any) => {
    if (!selectedNode) return;
    dispatch(updateNode({
      id: selectedNode.id,
      data: { params: { ...selectedNode?.data?.params, [key]: value } },
    }));
  };

  // 获取节点输出预览图
  useEffect(() => {
    if (!selectedNode) {
      setPreviewDataUrl(null);
      return;
    }

    const engine = getExecutionEngine();
    const nodeResult = engine.getNodeResult(selectedNode.id);
    
    if (!nodeResult) {
      setPreviewDataUrl(null);
      return;
    }

    // 查找图像输出
    const imageOutput = nodeResult.image || Object.values(nodeResult)[0] as any;
    if (!imageOutput || !imageOutput.texture) {
      setPreviewDataUrl(null);
      return;
    }

    // 获取 GPU context 来转换纹理
    const gpu = (engine as any).gpuContext;
    if (!gpu) {
      setPreviewDataUrl(null);
      return;
    }

    // 将纹理渲染到 canvas 并转换为 data URL
    const canvas = canvasRef.current;
    if (!canvas) {
      setPreviewDataUrl(null);
      return;
    }

    try {
      // 使用 GPUContext 的 copyToCanvas 方法
      gpu.copyToCanvas(imageOutput.texture, canvas, {
        width: 320,
        height: 180,
      });
      
      // 转换为 data URL
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewDataUrl(dataUrl);
    } catch (error) {
      console.error('Failed to render preview:', error);
      setPreviewDataUrl(null);
    }
  }, [selectedNode?.id, selectedNode?.data?.params]);

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
        <div className="aspect-video bg-bg-primary rounded border border-border-color flex items-center justify-center overflow-hidden">
          {previewDataUrl ? (
            <img 
              src={previewDataUrl} 
              alt="Node output preview" 
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-text-secondary text-sm">{t('properties.no_preview')}</span>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

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
                case 'file':
                  return (
                    <FileParam
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
