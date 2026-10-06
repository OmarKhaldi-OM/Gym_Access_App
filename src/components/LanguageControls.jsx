import { useI18n, useT } from '../context/I18nContext.jsx'

const languages = [
  { code: 'en',  label: 'En' },
  { code: 'fr',  label: 'Fr' },
  { code: 'ar',  label: 'Ar' },
]

export default function LanguageControls() {
  const { language, setLanguage } = useI18n()
  const t = useT()

  return (
    <div className="language-controls">
      <select
        className="language-select"
        aria-label={t('language')}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}
