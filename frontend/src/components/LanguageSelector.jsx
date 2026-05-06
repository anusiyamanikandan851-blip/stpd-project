import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'te', label: 'తెలుగు (Telugu)' }
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-green-200 text-green-800 rounded-full px-3 py-1 shadow-sm hover:shadow-md transition-shadow">
      <Globe size={16} className="text-green-600" />
      <select
        onChange={changeLanguage}
        value={i18n.resolvedLanguage || 'en'}
        className="bg-transparent border-none focus:outline-none text-sm font-semibold cursor-pointer appearance-none pr-3 py-1"
        style={{ backgroundImage: 'linear-gradient(45deg, transparent 50%, gray 50%), linear-gradient(135deg, gray 50%, transparent 50%)', backgroundPosition: 'calc(100% - 2px) calc(1em + 2px), calc(100% - 7px) calc(1em + 2px)', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat' }}
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
