import { useTranslation } from 'react-i18next';
import { ParamDefinition } from '../../../core/nodes/types';

interface TextParamProps {
  param: ParamDefinition;
  value: string;
  onChange: (value: string) => void;
}

export default function TextParam({ param, value, onChange }: TextParamProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-sm text-text-primary mb-1">
        {t(param.label)}
      </label>
      <input
        type="text"
        value={value ?? param.default ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-bg-tertiary border border-border-color rounded text-sm text-text-primary focus:outline-none focus:border-node-image"
      />
    </div>
  );
}
