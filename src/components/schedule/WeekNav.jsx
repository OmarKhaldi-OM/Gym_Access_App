import { useT } from '../../context/I18nContext.jsx'

export default function WeekNav({ label = 'Semaine du 21 au 26 septembre 2026' }) {
  const t = useT()
  return (
    <div className="management-panel flex items-center justify-between mb-6 rounded-xl border border-graphite-line bg-graphite-panel px-4 py-3">
      <button className="px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-primary border border-graphite-line">
        ‹ {t('previousWeek')}
      </button>
      <div className="text-center">
        <p className="text-lg font-bold">{label}</p>
        <p className="text-sm font-medium text-text-muted">{t('currentWeek')}</p>
      </div>
      <button className="px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-primary border border-graphite-line">
        {t('nextWeek')} ›
      </button>
    </div>
  )
}
