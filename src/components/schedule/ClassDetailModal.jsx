export default function ClassDetailModal({ block, onClose, children }) {
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
        <p className="text-xl font-bold">{block.title}</p>
        {block.subtitle && (
          <p className="text-base font-medium text-text-muted mt-1">{block.subtitle}</p>
        )}
        <div className="mt-4 pt-4 border-t border-graphite-line space-y-2">
          <p className="text-base font-mono text-text-muted">
            {block.day.charAt(0).toUpperCase() + block.day.slice(1)} · {block.start} – {block.end}
          </p>
          {block.meta && <p className="text-base font-mono text-text-muted">{block.meta}</p>}
        </div>

        {children && <div className="mt-5 flex flex-col gap-3">{children}</div>}

        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-base font-medium text-text-muted hover:text-text-primary"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}
