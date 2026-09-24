export default function StatCard({ label, value, tone = 'coral' }) {
  const toneClass = tone === 'teal' ? 'text-teal' : 'text-coral'
  return (
    <div className="rounded-xl border border-graphite-line bg-graphite-panel px-5 py-4">
      <p className="text-base font-medium text-text-muted">{label}</p>
      <p className={`mt-1.5 text-3xl leading-tight font-bold ${toneClass}`}>{value}</p>
    </div>
  )
}
