# Gate — UI interactive (données mock)

UI interactive pour le système de contrôle d'accès "Gate" : navigation,
recherche, filtres, réservation de cours et enrôlement fonctionnent réellement,
mais tout passe par des données locales en mémoire (aucun appel réseau réel).
Conçu pour que brancher le backend Spring Boot plus tard soit un simple
remplacement de l'intérieur des services, pas une réécriture.

## Démarrer

```bash
npm install
npm run dev
```

## Structure

```
src/
├── mocks/               # données mock, un fichier par entité, noms de champs
│                          alignés sur les DTO du backend (nom, dateInscription, ...)
│                          → members.js, classes.js, personalSessions.js,
│                            myBookings.js, activityLog.js, trainerBookings.js,
│                            coachClients.js, users.js
├── services/             # SEUL point d'accès aux données depuis les pages.
│                          Chaque fonction est async et retourne une Promise —
│                          remplacer le corps par un fetch('/api/...') suffira.
│                          → memberService, classService, activityService,
│                            trainerBookingService, coachService, authService
├── context/              # état partagé entre plusieurs écrans
│                          → AuthContext (utilisateur connecté),
│                            MembersContext (membres + file d'enrôlement),
│                            ClassesContext (cours + réservations)
├── hooks/useToast.js      # petit hook pour les messages de confirmation
├── components/
│   ├── ...                # primitives (Header, Layout, StatCard, StatusChip, Avatar, Button, Panel, Toast)
│   └── schedule/           # ScheduleGrid, WeekNav, ClassDetailModal (grille + modale de détail/réservation)
├── data/scheduleData.js   # constantes géométriques de la grille (heures, hauteur) — pas des données métier
├── pages/
│   ├── Login.jsx           # écran de connexion, point d'entrée ("/")
│   ├── admin/              # Tableau de bord, Journal d'activité, Membres, Planning, Réservations coach
│   ├── member/              # vue Membre : Mon statut, Mes cours (réservation), Mes séances coach, Profil
│   ├── coach/               # vue Coach : Mon planning, Mes clients, Profil
│   └── reception/           # vue Réceptionniste : Accueil (recherche + file d'enrôlement), Planning
├── App.jsx                  # providers (Auth/Members/Classes) + routes — 4 groupes : /admin, /membre, /coach, /reception
└── main.jsx                 # point d'entrée
```

## Rôles / routes

| Rôle | Route racine | Utilisateur démo |
|---|---|---|
| Admin | `/admin/dashboard` | Amine Ferjani |
| Membre | `/membre/dashboard` | Sana Mabrouk (`mem-1`) |
| Coach | `/coach/planning` | Rania Sfar |
| Réceptionniste | `/reception/accueil` | Ines Cherni |

Sur l'écran de connexion, les 4 boutons de démo appellent `login(role)` (AuthContext)
et redirigent vers la route racine du rôle choisi. Il n'y a pas de vérification
d'identifiants réelle. Chaque en-tête n'affiche que la navigation propre à son rôle.

## Ce qui est déjà interactif

- Recherche (Membres, accueil réception) : filtre la liste en tapant, via `memberService.searchMembers`
- Filtres du journal d'activité (statut + "Aujourd'hui") : filtrent réellement les lignes affichées
- Planning des cours : cliquer sur un cours ouvre une modale de détail
- Réservation (vue Membre → "Mes cours") : réserver décrémente `placesRestantes` et enregistre la réservation ;
  annuler restitue la place — tout est reflété immédiatement ailleurs dans l'app via `ClassesContext`
- File d'enrôlement (Dashboard admin + Accueil réception) : "Inscrire" retire le membre de la file
  (`MembersContext`) et affiche une confirmation (toast)
- Connexion / déconnexion : bascule l'utilisateur affiché dans l'en-tête (`AuthContext`)

## Brancher le vrai backend plus tard

Chaque fonction de `src/services/*.js` a un commentaire indiquant l'endpoint réel
à appeler (ex. `getMembers()` → `GET /api/members`). Remplacer le corps de la
fonction par un `fetch`/`axios` vers cet endpoint, sans toucher aux pages ni aux
contexts, puisqu'ils n'appellent jamais les mocks directement.

## Prochaines étapes (à faire par toi)

- Remplacer l'intérieur des services par de vrais appels réseau + un `axiosClient`
  avec intercepteur JWT
- Brancher le formulaire de connexion sur `POST /auth/login`, stocker le token,
  et faire dépendre la redirection du rôle renvoyé par l'API
- Ajouter des états de chargement/erreur autour des appels `useEffect` (actuellement
  optimistes, sans gestion d'échec réseau puisqu'il n'y a pas de réseau)
