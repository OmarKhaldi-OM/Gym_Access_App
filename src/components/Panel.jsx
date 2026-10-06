export function Panel({ children, className = '' }) {
  return (
    <div className={`management-panel rounded-xl border border-graphite-line bg-graphite-panel ${className}`}>
      {children}
    </div>
  )
}

export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-graphite-line section-header">
      <h2 className="text-xl font-bold">{title}</h2>
      {action}
    </div>
  )
}
