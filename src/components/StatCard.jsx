export default function StatCard({ label, value, tone = 'primary' }) {
  const toneClass = {
    primary: 'tone-primary',
    accent: 'tone-accent',
    success: 'tone-success',
  }[tone] || 'tone-primary'

  return (
    <div className={`stat-card ${toneClass}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  )
}
