import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const roleHome = {
  admin: '/admin/dashboard',
  membre: '/membre/dashboard',
  coach: '/coach/planning',
  reception: '/reception/accueil',
}

const roleButtons = [
  { role: 'admin', label: 'Admin' },
  { role: 'membre', label: 'Membre' },
  { role: 'coach', label: 'Coach' },
  { role: 'reception', label: 'Réceptionniste' },
]

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleDemoLogin = async (role) => {
    await login(role)
    navigate(roleHome[role])
  }

  return (
    <div className="min-h-screen bg-graphite-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-md bg-coral flex items-center justify-center mb-3">
            <span className="text-graphite-bg font-bold text-xl">G</span>
          </div>
          <h1 className="text-2xl font-bold">Gate</h1>
          <p className="text-base font-medium text-text-muted mt-1 text-center">
            Contrôle d'accès par reconnaissance faciale
          </p>
        </div>

        <div className="rounded-xl border border-graphite-line bg-graphite-panel p-6">
          <h2 className="text-xl font-bold mb-6 text-center">Connexion</h2>

          <label className="block text-base font-medium text-text-muted mb-2">
            Adresse e-mail
          </label>
          <input
            type="email"
            placeholder="vous@exemple.com"
            className="w-full bg-graphite-hover border border-graphite-line rounded-md px-4 py-2.5 text-base mb-5 placeholder:text-text-muted"
          />

          <label className="block text-base font-medium text-text-muted mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-graphite-hover border border-graphite-line rounded-md px-4 py-2.5 text-base mb-6 placeholder:text-text-muted"
          />

          <div className="border-t border-graphite-line pt-5">
            <p className="text-sm font-medium text-text-muted mb-3 text-center">
              Aperçu — choisir un compte de démonstration
            </p>
            <div className="grid grid-cols-2 gap-2">
              {roleButtons.map((r) => (
                <button
                  key={r.role}
                  onClick={() => handleDemoLogin(r.role)}
                  className="bg-coral text-graphite-bg rounded-md py-2.5 text-base font-semibold"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
