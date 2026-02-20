import { useTranslation } from 'react-i18next';

interface NodeSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function NodeSearch({ value, onChange }: NodeSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          className="w-4 h-4 text-[#666]"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('panel.search_nodes')}
        className="
          w-full pl-10 pr-10 py-2 
          bg-[#252525] border border-[#333] rounded-lg
          text-sm text-white placeholder-[#666]
          focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]
          transition-colors duration-150
        "
        aria-label={t('panel.search_nodes')}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#666] hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
