export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'button button-primary',
    secondary: 'button button-secondary',
    ghost: 'button button-ghost',
    danger: 'button button-danger',
  }

  return (
    <button className={`${variants[variant] || variants.primary} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
