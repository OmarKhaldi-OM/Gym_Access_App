import { days as weekdayKeys, getDaysForWeek, OPEN_HOUR, HOUR_HEIGHT, TOTAL_HEIGHT, hourMarks, toDecimal } from '../../data/scheduleData.js'
import { useT } from '../../context/I18nContext.jsx'

function Badge({ badge }) {
  if (!badge) return null
  if (badge.tone === 'solid') {
    return (
      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-sm font-semibold bg-coral text-graphite-bg">
        {badge.text}
      </span>
    )
  }
  if (badge.tone === 'muted') {
    return (
      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-sm font-semibold bg-graphite-hover text-text-muted">
        {badge.text}
      </span>
    )
  }
  return (
    <span className="inline-block mt-1 text-sm font-mono font-semibold text-teal">
      {badge.text}
    </span>
  )
}

function getLayouts(blocks) {
  const layouts = new Map()
  const byDay = weekdayKeys.map((day) => blocks.filter((block) => block.day === day.key))

  byDay.forEach((dayBlocks) => {
    const ordered = [...dayBlocks].sort((a, b) => toDecimal(a.start) - toDecimal(b.start))
    let cluster = []
    let clusterEnd = -Infinity

    const commitCluster = () => {
      const lanes = []
      cluster.forEach((block) => {
        let lane = lanes.findIndex((end) => end <= toDecimal(block.start))
        if (lane === -1) {
          lane = lanes.length
          lanes.push(toDecimal(block.end))
        } else {
          lanes[lane] = toDecimal(block.end)
        }
        layouts.set(block.id, { column: lane, columns: lanes.length })
      })
      cluster.forEach((block) => {
        const layout = layouts.get(block.id)
        layout.columns = lanes.length
      })
      cluster = []
    }

    ordered.forEach((block) => {
      const start = toDecimal(block.start)
      if (cluster.length > 0 && start >= clusterEnd) commitCluster()
      cluster.push(block)
      clusterEnd = Math.max(clusterEnd, toDecimal(block.end))
    })
    if (cluster.length > 0) commitCluster()
  })

  return layouts
}

function Block({ b, onClick, layout }) {
  const top = (toDecimal(b.start) - OPEN_HOUR) * HOUR_HEIGHT + 4
  const height = Math.max(34, (toDecimal(b.end) - toDecimal(b.start)) * HOUR_HEIGHT - 8)
  const columnWidth = 100 / layout.columns

  return (
    <div
      style={{
        top,
        height,
        left: `calc(${layout.column * columnWidth}% + 4px)`,
        width: `calc(${columnWidth}% - 8px)`,
      }}
      onClick={onClick ? () => onClick(b) : undefined}
      className={`schedule-block absolute rounded-md border-l-4 px-2.5 py-1.5 overflow-hidden ${
        onClick ? 'cursor-pointer hover:brightness-125' : ''
      } ${b.muted ? 'bg-graphite-hover border-coral' : 'bg-coral/10 border-coral'}`}
    >
      <p className="text-base font-bold leading-tight truncate">{b.title}</p>
      {b.subtitle && (
        <p className="text-sm font-medium text-text-muted leading-tight truncate mt-0.5">{b.subtitle}</p>
      )}
      {b.meta && <p className="text-sm font-mono text-text-muted leading-tight truncate">{b.meta}</p>}
      <Badge badge={b.badge} />
    </div>
  )
}

function MobileCard({ b, onClick }) {
  return (
    <div
      onClick={onClick ? () => onClick(b) : undefined}
      className={`rounded-md border-l-4 px-3 py-2.5 ${onClick ? 'cursor-pointer' : ''} ${
        b.muted ? 'bg-graphite-hover border-coral' : 'bg-coral/10 border-coral'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-bold truncate">{b.title}</p>
        <span className="text-sm font-mono text-text-muted whitespace-nowrap">
          {b.start} – {b.end}
        </span>
      </div>
      {(b.subtitle || b.meta) && (
        <p className="text-sm font-medium text-text-muted mt-0.5">
          {[b.subtitle, b.meta].filter(Boolean).join(' · ')}
        </p>
      )}
      <Badge badge={b.badge} />
    </div>
  )
}

export default function ScheduleGrid({ blocks, onBlockClick, emptyMessage = 'Aucun créneau cette semaine', weekOffset = 0 }) {
  const t = useT()
  const visibleDays = getDaysForWeek(weekOffset)
  const hasDates = blocks.some((block) => block.date)
  const visibleDateValues = new Set(visibleDays.map((day) => day.dateValue))
  const visibleBlocks = hasDates ? blocks.filter((block) => visibleDateValues.has(block.date)) : (weekOffset === 0 ? blocks : [])
  const hasAny = visibleBlocks.length > 0
  const layouts = getLayouts(visibleBlocks)

  return (
    <>
      {/* Grille hebdomadaire — tablette et plus */}
      <div className="management-panel hidden md:block rounded-xl border border-graphite-line bg-graphite-panel overflow-x-auto">
        <div className="min-w-[880px]">
          <div className="flex border-b border-graphite-line">
            <div className="w-16 shrink-0" />
            {visibleDays.map((d) => (
              <div key={d.key} className="flex-1 text-center py-3 border-l border-graphite-line">
                <p className="text-base font-bold">{d.label}</p>
                <p className="text-sm font-mono text-text-muted">{d.date}</p>
              </div>
            ))}
          </div>

          <div className="flex">
            <div className="w-16 shrink-0 relative" style={{ height: TOTAL_HEIGHT }}>
              {hourMarks.map((h) => (
                <span
                  key={h}
                  style={{ top: (h - OPEN_HOUR) * HOUR_HEIGHT - 8 }}
                  className="absolute right-2 text-sm font-mono text-text-muted"
                >
                  {h}h
                </span>
              ))}
            </div>

            {visibleDays.map((d) => (
              <div
                key={d.key}
                className="flex-1 relative border-l border-graphite-line"
                style={{
                  height: TOTAL_HEIGHT,
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${HOUR_HEIGHT - 1}px, #C6CABB ${HOUR_HEIGHT - 1}px, #C6CABB ${HOUR_HEIGHT}px)`,
                }}
              >
                {visibleBlocks
                  .filter((b) => b.day === d.key)
                  .map((b) => (
                    <Block key={b.id} b={b} layout={layouts.get(b.id) || { column: 0, columns: 1 }} onClick={onBlockClick} />
                  ))}
              </div>
            ))}
          </div>
          {!hasAny && <p className="schedule-empty-state">{emptyMessage === 'Aucun créneau cette semaine' ? t('noSlots') : emptyMessage}</p>}
        </div>
      </div>

      {/* Liste par jour — mobile */}
      <div className="md:hidden space-y-6">
        {!hasAny && (
          <p className="text-base font-medium text-text-muted">{emptyMessage === 'Aucun créneau cette semaine' ? t('noSlots') : emptyMessage}</p>
        )}
        {visibleDays.map((d) => {
          const dayBlocks = visibleBlocks.filter((b) => b.day === d.key)
          if (dayBlocks.length === 0) return null
          return (
            <div key={d.key}>
              <h2 className="text-xl font-bold mb-3">
                {d.label} <span className="text-text-muted font-mono text-base">{d.date}</span>
              </h2>
              <div className="space-y-3">
                {dayBlocks.map((b) => (
                  <MobileCard key={b.id} b={b} onClick={onBlockClick} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
