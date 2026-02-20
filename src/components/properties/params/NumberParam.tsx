import { useTranslation } from 'react-i18next';
import { ParamDefinition } from '../../../core/nodes/types';

interface NumberParamProps {
  param: ParamDefinition;
  value: number;
  onChange: (value: number) => void;
}

export default function NumberParam({ param, value, onChange }: NumberParamProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-sm text-text-primary mb-1">
        {t(param.label)}
      </label>
      <input
        type="number"
        min={param.min ?? 0}
        max={param.max ?? 9999}
        step={param.step ?? 1}
        value={value ?? param.default}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2 bg-bg-tertiary border border-border-color rounded text-sm text-text-primary focus:outline-none focus:border-node-image"
      />
    </div>
  );
}
