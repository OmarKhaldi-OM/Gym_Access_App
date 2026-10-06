import { useT } from '../../context/I18nContext.jsx'
import { localizedTitle } from './ScheduleGrid.jsx'

export default function ClassDetailModal({ block, onClose, children }) {
  const t = useT()
  if (!block) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-graphite-line bg-graphite-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xl font-bold">{localizedTitle(block.title, t)}</p>
        {block.subtitle && (
          <p className="text-base font-medium text-text-muted mt-1">{localizedTitle(block.subtitle, t)}</p>
        )}
        <div className="mt-4 pt-4 border-t border-graphite-line space-y-2">
          <p className="text-base font-mono text-text-muted">
            {t(({ lundi: 'monday', mardi: 'tuesday', mercredi: 'wednesday', jeudi: 'thursday', vendredi: 'friday', samedi: 'saturday', dimanche: 'sunday' })[block.day])} · {block.start} – {block.end}
          </p>
          {block.meta && <p className="text-base font-mono text-text-muted">{block.meta}</p>}
        </div>

        {children && <div className="mt-5 flex flex-col gap-3">{children}</div>}

        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-base font-medium text-text-muted hover:text-text-primary"
        >
          {t('close')}
        </button>
      </div>
    </div>
  )
}
