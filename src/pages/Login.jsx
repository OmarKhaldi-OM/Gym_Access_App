import { Link } from 'react-router-dom'

export default function Login() {
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

          <Link
            to="/admin/dashboard"
            className="block w-full text-center bg-coral text-graphite-bg rounded-md py-2.5 text-base font-semibold"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
