import { useTranslation } from 'react-i18next';
import { ParamDefinition } from '../../../core/nodes/types';

interface SliderParamProps {
  param: ParamDefinition;
  value: number;
  onChange: (value: number) => void;
}

export default function SliderParam({ param, value, onChange }: SliderParamProps) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm text-text-primary">
          {t(param.label)}
        </label>
        <span className="text-xs text-text-secondary">
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
      </div>
      <input
        type="range"
        min={param.min ?? 0}
        max={param.max ?? 100}
        step={param.step ?? 0.01}
        value={value ?? param.default}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-node-image"
      />
      <div className="flex justify-between text-xs text-text-secondary mt-0.5">
        <span>{param.min ?? 0}</span>
        <span>{param.max ?? 100}</span>
      </div>
    </div>
  );
}
