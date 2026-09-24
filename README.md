# Gate — Static UI

UI statique pour le système de contrôle d'accès "Gate". Aucune logique métier,
aucun appel API — contenu 100% codé en dur, prêt à être branché sur le backend
Spring Boot.

## Démarrer

```bash
npm install
npm run dev
```

## Structure

```
src/
├── components/        # primitives réutilisables (Header, Layout, StatCard, StatusChip, Avatar, Button, Panel)
├── pages/
│   ├── Login.jsx       # écran de connexion, point d'entrée ("/")
│   ├── admin/          # Tableau de bord, Journal d'activité, Membres, Planning, Réservations coach
│   ├── member/          # vue Membre : Mon statut, Mes cours, Mes séances coach, Profil (routes sous /membre/*)
│   ├── coach/           # vue Coach : Mon planning, Mes clients, Profil
│   └── reception/       # vue Réceptionniste : Accueil (activité du jour, recherche, file d'enrôlement)
├── App.jsx              # routes React Router — 4 groupes : /admin, /membre, /coach, /reception
└── main.jsx             # point d'entrée
```

## Rôles / routes

| Rôle | Route racine | Utilisateur démo |
|---|---|---|
| Admin | `/admin/dashboard` | Amine Ferjani |
| Membre | `/membre/dashboard` | Sana Mabrouk |
| Coach | `/coach/planning` | Rania Sfar |
| Réceptionniste | `/reception/accueil` | Ines Cherni |

Le bouton "Se connecter" sur l'écran de connexion redirige vers `/admin/dashboard` (aucune auth réelle) ; pour voir les autres rôles pendant le développement, navigue directement vers `/membre`, `/coach` ou `/reception`. Chaque en-tête n'affiche que la navigation propre à son rôle — il n'y a pas de sélecteur de rôle dans l'UI.

## Prochaines étapes (à faire par toi)

- Remplacer les tableaux hardcodés dans chaque page par des appels à `api/services/*`
- Brancher le formulaire de connexion sur `POST /auth/login`, stocker le JWT, et faire dépendre la redirection du rôle renvoyé par l'API
- Rendre le formulaire de recherche des membres, les filtres du journal d'activité, et les boutons "Inscrire" fonctionnels
- Brancher `MemberProfile` (admin) sur l'id de l'URL (`/admin/members/:id`)
