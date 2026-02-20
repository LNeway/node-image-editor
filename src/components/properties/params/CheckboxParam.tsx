import { useTranslation } from 'react-i18next';
import { ParamDefinition } from '../../../core/nodes/types';

interface CheckboxParamProps {
  param: ParamDefinition;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function CheckboxParam({ param, value, onChange }: CheckboxParamProps) {
  const { t } = useTranslation();

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={value ?? param.default}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-border-color bg-bg-tertiary text-node-image focus:ring-node-image focus:ring-offset-0"
      />
      <span className="text-sm text-text-primary">{t(param.label)}</span>
    </label>
  );
}
