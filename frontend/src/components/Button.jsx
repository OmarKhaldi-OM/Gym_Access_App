export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'px-4 py-2.5 rounded-md text-base font-semibold'
  const variants = {
    primary: 'bg-coral text-graphite-bg',
    secondary: 'bg-graphite-hover text-text-primary border border-graphite-line',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
