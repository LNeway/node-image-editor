import { useTranslation } from 'react-i18next';
import { ParamDefinition } from '../../../core/nodes/types';

interface ColorParamProps {
  param: ParamDefinition;
  value: { r: number; g: number; b: number; a: number };
  onChange: (value: { r: number; g: number; b: number; a: number }) => void;
}

export default function ColorParam({ param, value, onChange }: ColorParamProps) {
  const { t } = useTranslation();

  // 转换为 hex 颜色
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  const hexColor = value ? `#${toHex(value.r)}${toHex(value.g)}${toHex(value.b)}` : '#ffffff';

  const handleChange = (key: 'r' | 'g' | 'b' | 'a', newValue: number) => {
    onChange({ ...value, [key]: newValue / 255 });
  };

  return (
    <div>
      <label className="block text-sm text-text-primary mb-1">
        {t(param.label)}
      </label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={hexColor}
          onChange={(e) => {
            const hex = e.target.value.slice(1);
            onChange({
              r: parseInt(hex.slice(0, 2), 16) / 255,
              g: parseInt(hex.slice(2, 4), 16) / 255,
              b: parseInt(hex.slice(4, 6), 16) / 255,
              a: 1,
            });
          }}
          className="w-10 h-10 rounded border border-border-color cursor-pointer"
        />
        <div className="flex-1 grid grid-cols-3 gap-1">
          {(['r', 'g', 'b'] as const).map((key) => (
            <input
              key={key}
              type="number"
              min={0}
              max={255}
              value={value ? Math.round(value[key] * 255) : 0}
              onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
              className="px-2 py-1 bg-bg-tertiary border border-border-color rounded text-xs text-text-primary text-center"
              placeholder={key.toUpperCase()}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
