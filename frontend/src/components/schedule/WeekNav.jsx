import { useState } from 'react'
import { getDaysForWeek } from '../../data/scheduleData.js'
import { useI18n, useT } from '../../context/I18nContext.jsx'

export default function WeekNav({ weekOffset, onWeekChange }) {
  const t = useT()
  const { language } = useI18n()
  const [internalOffset, setInternalOffset] = useState(0)
  const offset = weekOffset ?? internalOffset
  const changeWeek = (nextOffset) => {
    if (onWeekChange) onWeekChange(nextOffset)
    else setInternalOffset(nextOffset)
  }
  const weekDays = getDaysForWeek(offset, language)
  const currentLabel = `${weekDays[0].date} — ${weekDays[6].date}`
  return (
    <div className="schedule-nav management-panel flex items-center justify-between mb-6 rounded-xl border border-graphite-line bg-graphite-panel px-4 py-3">
      <button className="schedule-nav-button px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-primary border border-graphite-line" onClick={() => changeWeek(offset - 1)}>
        <span className="directional-icon" aria-hidden="true">←</span> {t('previousWeek')}
      </button>
      <div className="text-center">
        <p className="text-lg font-bold">{currentLabel}</p>
        <p className="text-sm font-medium text-text-muted">{t('currentWeek')}</p>
      </div>
      <button className="schedule-nav-button px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-primary border border-graphite-line" onClick={() => changeWeek(offset + 1)}>
        {t('nextWeek')} <span className="directional-icon" aria-hidden="true">→</span>
      </button>
    </div>
  )
}
