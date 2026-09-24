export default function CameraFeed({ live = true, className = '' }) {
  return (
    <div
      className={`relative rounded-lg bg-gradient-to-br from-graphite-hover to-graphite-bg h-36 overflow-hidden ${className}`}
    >
      <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-graphite-bg/80 px-2 py-1">
        <span
          className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-teal' : 'bg-text-muted'}`}
        />
        <span className="text-xs font-mono text-text-muted">
          {live ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>
    </div>
  )
}
