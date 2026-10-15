# Gate — application de gestion de salle

Application React connectée à l'API Spring Boot. Les pages passent par les
services métier (`src/services/*`), qui utilisent le client HTTP commun
`src/services/api.js` pour l'URL, le JWT, les en-têtes, le parsing et les erreurs.
Les données sous `src/mocks/` restent des fixtures locales et ne remplacent pas
les services branchés à l'API.

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
│                          Services métier, seuls propriétaires des endpoints ;
│                          ils délèguent le transport à services/api.js.
│                          → memberService, classService, activityService,
│                            trainerBookingService, coachService, authService
├── services/api.js        # client HTTP commun et stockage central du JWT
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

## Client API

`api.js` utilise `VITE_API_URL` (par défaut `http://localhost:8080`), ajoute le
Bearer token stocké par `authStorage`, sérialise les corps JSON et laisse les
corps `FormData` gérer leur propre `Content-Type`. Les erreurs réseau et HTTP
sont transformées en erreurs applicatives ; un 401 efface la session et un 403
garde la session tout en signalant l'accès refusé. Aucun client HTTP tiers n'est
nécessaire.
