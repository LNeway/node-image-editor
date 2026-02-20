import { useTranslation } from 'react-i18next';
import { ParamDefinition } from '../../../core/nodes/types';

interface SelectParamProps {
  param: ParamDefinition;
  value: string;
  onChange: (value: string) => void;
}

export default function SelectParam({ param, value, onChange }: SelectParamProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-sm text-text-primary mb-1">
        {t(param.label)}
      </label>
      <select
        value={value ?? param.default}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-bg-tertiary border border-border-color rounded text-sm text-text-primary focus:outline-none focus:border-node-image"
      >
        {param.options?.map((option: { label: string; value: string }) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
    </div>
  );
}
