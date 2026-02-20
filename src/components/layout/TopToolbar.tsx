import { useTranslation } from 'react-i18next';

// SVG Icons
const Icons = {
  new: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  open: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  save: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
};

export default function TopToolbar() {
  const { t } = useTranslation();

  return (
    <div className="h-12 bg-bg-secondary border-b border-border-color flex items-center px-4 gap-4">
      <div className="font-semibold text-lg text-text-primary">Node Image Editor</div>
      <div className="flex-1" />
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary rounded text-sm text-text-primary hover:bg-[#00b894] hover:text-white transition-colors">
        {Icons.new}
        {t('toolbar.new')}
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary rounded text-sm text-text-primary hover:bg-[#00b894] hover:text-white transition-colors">
        {Icons.open}
        {t('toolbar.open')}
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary rounded text-sm text-text-primary hover:bg-[#00b894] hover:text-white transition-colors">
        {Icons.save}
        {t('toolbar.save')}
      </button>
    </div>
  );
}
