import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const navByRole = {
  admin: [
    { to: '/admin/dashboard', label: 'Tableau de bord' },
    { to: '/admin/activity', label: "Journal d'activité" },
    { to: '/admin/members', label: 'Membres' },
    { to: '/admin/schedule', label: 'Planning' },
    { to: '/admin/trainer-bookings', label: 'Réservations coach' },
  ],
  membre: [
    { to: '/membre/dashboard', label: 'Mon statut' },
    { to: '/membre/bookings', label: 'Mes cours' },
    { to: '/membre/trainer-sessions', label: 'Mes séances coach' },
    { to: '/membre/profile', label: 'Profil' },
  ],
  coach: [
    { to: '/coach/planning', label: 'Mon planning' },
    { to: '/coach/clients', label: 'Mes clients' },
    { to: '/coach/profil', label: 'Profil' },
  ],
  reception: [
    { to: '/reception/accueil', label: 'Accueil' },
    { to: '/reception/planning', label: 'Planning' },
  ],
}

const roleLabel = {
  admin: 'Admin',
  membre: 'Membre',
  coach: 'Coach',
  reception: 'Réceptionniste',
}

const nameByRole = {
  admin: 'Amine Ferjani',
  membre: 'Sana Mabrouk',
  coach: 'Rania Sfar',
  reception: 'Ines Cherni',
}

export default function Header({ role = 'admin' }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const navItems = navByRole[role]
  // Si connecté via l'écran de connexion, on utilise le vrai compte ; sinon
  // (accès direct par URL pendant le développement), on retombe sur le nom de démo.
  const name = user && user.role === role ? user.nom : nameByRole[role]
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="border-b border-graphite-line bg-graphite-bg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-8 w-8 rounded-md bg-coral flex items-center justify-center">
            <span className="text-graphite-bg font-bold text-base">G</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Gate</span>
        </div>

        <nav className="flex items-center gap-6 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-base font-medium pb-1 whitespace-nowrap ${
                  isActive
                    ? 'text-text-primary border-b-2 border-coral'
                    : 'text-text-muted hover:text-text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleLogout}
            className="text-base font-medium text-text-muted hover:text-text-primary underline decoration-graphite-line underline-offset-2"
          >
            Se déconnecter
          </button>
          <div className="text-right hidden md:block">
            <p className="text-base font-semibold leading-tight">{name}</p>
            <p className="text-base font-medium text-text-muted leading-tight">{roleLabel[role]}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-graphite-hover border border-graphite-line flex items-center justify-center text-base font-semibold">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
