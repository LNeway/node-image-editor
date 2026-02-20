import { useTranslation } from 'react-i18next';
import { ParamDefinition } from '../../../core/nodes/types';

interface FileParamProps {
  param: ParamDefinition;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
}

export default function FileParam({ param, value, onChange, accept = 'image/*' }: FileParamProps) {
  const { t } = useTranslation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to data URL for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm text-text-primary mb-1">
        {t(param.label)}
      </label>
      <div className="flex gap-2">
        <label className="flex-1 flex items-center justify-center px-3 py-2 bg-bg-tertiary border border-border-color rounded text-sm text-text-primary hover:border-node-image cursor-pointer transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          {value ? '更换图片' : '选择图片'}
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-2 bg-bg-tertiary border border-border-color rounded text-sm text-text-secondary hover:text-red-400"
          >
            清除
          </button>
        )}
      </div>
      {value && (
        <div className="mt-2 p-2 bg-bg-tertiary rounded border border-border-color">
          <img src={value} alt="Preview" className="max-w-full h-24 object-contain rounded" />
        </div>
      )}
    </div>
  );
}
