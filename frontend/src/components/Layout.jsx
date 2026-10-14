import Header from './Header.jsx'

export default function Layout({ role = 'admin', children }) {
  return (
    <div className="management-shell min-h-screen bg-graphite-bg">
      <Header role={role} />
      <main className="management-main max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
