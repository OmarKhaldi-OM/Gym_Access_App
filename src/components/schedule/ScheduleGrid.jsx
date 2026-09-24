import { days, OPEN_HOUR, HOUR_HEIGHT, TOTAL_HEIGHT, hourMarks, toDecimal } from '../../data/scheduleData.js'

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

function Block({ b }) {
  const top = (toDecimal(b.start) - OPEN_HOUR) * HOUR_HEIGHT
  const height = (toDecimal(b.end) - toDecimal(b.start)) * HOUR_HEIGHT

  return (
    <div
      style={{ top, height }}
      className={`absolute left-1 right-1 rounded-md border-l-4 px-2.5 py-1.5 overflow-hidden ${
        b.muted ? 'bg-graphite-hover border-coral' : 'bg-coral/10 border-coral'
      }`}
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

function MobileCard({ b }) {
  return (
    <div
      className={`rounded-md border-l-4 px-3 py-2.5 ${
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

export default function ScheduleGrid({ blocks, emptyMessage = 'Aucun créneau cette semaine' }) {
  const hasAny = blocks.length > 0

  return (
    <>
      {/* Grille hebdomadaire — tablette et plus */}
      <div className="hidden md:block rounded-xl border border-graphite-line bg-graphite-panel overflow-x-auto">
        <div className="min-w-[880px]">
          <div className="flex border-b border-graphite-line">
            <div className="w-16 shrink-0" />
            {days.map((d) => (
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

            {days.map((d) => (
              <div
                key={d.key}
                className="flex-1 relative border-l border-graphite-line"
                style={{
                  height: TOTAL_HEIGHT,
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${HOUR_HEIGHT - 1}px, #404040 ${HOUR_HEIGHT - 1}px, #404040 ${HOUR_HEIGHT}px)`,
                }}
              >
                {blocks
                  .filter((b) => b.day === d.key)
                  .map((b) => (
                    <Block key={b.id} b={b} />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liste par jour — mobile */}
      <div className="md:hidden space-y-6">
        {!hasAny && (
          <p className="text-base font-medium text-text-muted">{emptyMessage}</p>
        )}
        {days.map((d) => {
          const dayBlocks = blocks.filter((b) => b.day === d.key)
          if (dayBlocks.length === 0) return null
          return (
            <div key={d.key}>
              <h2 className="text-xl font-bold mb-3">
                {d.label} <span className="text-text-muted font-mono text-base">{d.date}</span>
              </h2>
              <div className="space-y-3">
                {dayBlocks.map((b) => (
                  <MobileCard key={b.id} b={b} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
