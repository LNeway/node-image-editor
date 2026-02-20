import { useTranslation } from 'react-i18next';

interface NodeSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function NodeSearch({ value, onChange }: NodeSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('panel.search_nodes')}
        className="w-full px-3 py-2 pl-8 bg-bg-tertiary border border-border-color rounded text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-node-image"
      />
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary">
        🔍
      </span>
      {value && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
          onClick={() => onChange('')}
        >
          ✕
        </button>
      )}
    </div>
  );
}
