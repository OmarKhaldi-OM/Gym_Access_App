import { useI18n, useT } from '../context/I18nContext.jsx'

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ar', label: 'AR', name: 'العربية' },
]

export default function LanguageControls() {
  const { language, setLanguage } = useI18n()
  const t = useT()

  return (
    <div className="language-controls">
      <svg className="language-globe" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="7.25" />
        <path d="M2.9 10h14.2M10 2.75c2 2 2.8 4.4 2.8 7.25s-.8 5.25-2.8 7.25C8 15.25 7.2 12.85 7.2 10s.8-5.25 2.8-7.25Z" />
      </svg>
      <select
        className="language-select"
        aria-label={`${t('language')}: ${language.toUpperCase()}`}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code} aria-label={item.name}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}
