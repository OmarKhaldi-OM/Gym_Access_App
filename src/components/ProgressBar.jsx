export default function ProgressBar({ value, target }) {
  const percentage = Math.min(100, Math.max(0, target ? (value / target) * 100 : 0))
  return <div className="h-2 w-full overflow-hidden rounded-full bg-graphite-hover"><div className="h-full rounded-full bg-coral transition-all" style={{ width: `${percentage}%` }} /></div>
}
