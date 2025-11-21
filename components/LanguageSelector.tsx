import React from 'react';
import { Language } from '../types';
import { LANGUAGE_CONFIGS } from '../constants';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  disabled: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange, disabled }) => {
  return (
    <div className="flex gap-2 p-2 bg-gray-900 overflow-x-auto">
      {(Object.values(Language) as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          disabled={disabled}
          className={`
            flex-1 py-3 px-4 rounded-lg font-bold text-lg whitespace-nowrap transition-colors
            ${currentLanguage === lang 
              ? 'bg-yellow-400 text-black border-4 border-white' 
              : 'bg-gray-800 text-white border-2 border-gray-600'}
            disabled:opacity-50
          `}
          aria-label={`Select ${lang}`}
          aria-pressed={currentLanguage === lang}
        >
          {LANGUAGE_CONFIGS[lang].label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
