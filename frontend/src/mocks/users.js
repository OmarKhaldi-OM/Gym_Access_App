// Comptes de démonstration — un par rôle. En vrai, ceci viendrait de POST /auth/login.
// memberId permet de relier le compte "membre" à son enregistrement Member.
export const users = [
  { id: 'user-admin', nom: 'Amine Ferjani', email: 'admin@gym.com', role: 'admin' },
  { id: 'user-membre', nom: 'Sana Mabrouk', email: 'sana.mabrouk@example.com', role: 'membre', memberId: 'mem-1' },
  { id: 'user-coach', nom: 'Rania Sfar', email: 'rania.sfar@gym.com', role: 'coach' },
  { id: 'user-reception', nom: 'Ines Cherni', email: 'ines.cherni@gym.com', role: 'reception' },
]
