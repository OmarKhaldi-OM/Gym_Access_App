import Header from './Header.jsx'

export default function Layout({ role = 'admin', children }) {
  return (
    <div className="management-shell">
      <Header role={role} />
      <main className="management-main">{children}</main>
    </div>
  )
}
