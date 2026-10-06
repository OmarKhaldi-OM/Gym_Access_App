export function Panel({ children, className = '' }) {
  return <div className={`panel ${className}`.trim()}>{children}</div>
}

export function SectionHeader({ title, action }) {
  return (
    <div className="panel-header">
      <h2>{title}</h2>
      {action}
    </div>
  )
}
