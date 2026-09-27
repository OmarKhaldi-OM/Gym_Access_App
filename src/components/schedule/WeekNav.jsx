import { useState } from 'react'
import { useT } from '../../context/I18nContext.jsx'

export default function WeekNav({ label = 'Semaine du 21 au 26 septembre 2026', weekOffset, onWeekChange }) {
  const t = useT()
  const [internalOffset, setInternalOffset] = useState(0)
  const offset = weekOffset ?? internalOffset
  const changeWeek = (nextOffset) => {
    if (onWeekChange) onWeekChange(nextOffset)
    else setInternalOffset(nextOffset)
  }
  const start = new Date(2026, 8, 21 + offset * 7)
  const end = new Date(start)
  end.setDate(start.getDate() + 5)
  const format = (date) => date.toLocaleDateString(document.documentElement.lang || 'fr', { day: '2-digit', month: 'short', year: 'numeric' })
  const currentLabel = offset === 0 ? label : `${format(start)} — ${format(end)}`
  return (
    <div className="schedule-nav management-panel flex items-center justify-between mb-6 rounded-xl border border-graphite-line bg-graphite-panel px-4 py-3">
      <button className="schedule-nav-button px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-primary border border-graphite-line" onClick={() => changeWeek(offset - 1)}>
        <span aria-hidden="true">←</span> {t('previousWeek')}
      </button>
      <div className="text-center">
        <p className="text-lg font-bold">{currentLabel}</p>
        <p className="text-sm font-medium text-text-muted">{t('currentWeek')}</p>
      </div>
      <button className="schedule-nav-button px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-primary border border-graphite-line" onClick={() => changeWeek(offset + 1)}>
        {t('nextWeek')} <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}
