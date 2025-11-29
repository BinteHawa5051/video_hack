'use client';

import { Language } from '@/types';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onChange: (languageCode: string) => void;
  supportedLanguages: Language[];
}

export default function LanguageSelector({
  selectedLanguage,
  onChange,
  supportedLanguages,
}: LanguageSelectorProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="text-sm font-medium text-gray-300">
        Caption Language:
      </label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={handleChange}
        className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {supportedLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
}
