export default function Avatar({ name, size = 'md' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const sizeClass = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-12 w-12 text-lg'

  return (
    <div
      className={`${sizeClass} rounded-full bg-graphite-hover border border-graphite-line flex items-center justify-center font-semibold text-text-primary shrink-0`}
    >
      {initials}
    </div>
  )
}
