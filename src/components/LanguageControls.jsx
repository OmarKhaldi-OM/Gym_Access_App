import { useI18n, useT } from '../context/I18nContext.jsx'

const languages = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'ar', flag: '🇹🇳', label: 'العربية' },
]

export default function LanguageControls() {
  const { language, setLanguage } = useI18n()
  const t = useT()

  return (
    <div className="language-controls" role="group" aria-label={t('language')}>
      {languages.map((item) => (
        <button
          key={item.code}
          type="button"
          className={`language-flag ${language === item.code ? 'selected' : ''}`}
          aria-label={item.label}
          aria-pressed={language === item.code}
          title={item.label}
          onClick={() => setLanguage(item.code)}
        >
          {item.flag}
        </button>
      ))}
    </div>
  )
}
