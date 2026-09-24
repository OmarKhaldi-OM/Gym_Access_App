const variants = {
  positive: 'bg-teal/20 text-teal',
  negative: 'bg-coral/20 text-coral',
  neutral: 'bg-graphite-hover text-text-muted',
}

export default function StatusChip({ children, variant = 'neutral' }) {
  return (
    <span
      className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-base font-medium whitespace-nowrap ${variants[variant]}`}
    >
      {children}
    </span>
  )
}
