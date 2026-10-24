# Gate

**La gestion de votre salle, de l'inscription au contrôle d'accès.**

![Java 21](https://img.shields.io/badge/Java-21-blue)
![Spring Boot 4.1.0](https://img.shields.io/badge/Spring%20Boot-4.1.0-brightgreen)
![React 18.2](https://img.shields.io/badge/React-18.2-149eca)
![MySQL 8](https://img.shields.io/badge/MySQL-8-4479A1)
![Python 3.11](https://img.shields.io/badge/Python-3.11-yellow)

## Sommaire

1. [Présentation](#1-présentation)
2. [Fonctionnalités par rôle](#2-fonctionnalités-par-rôle)
3. [Stack technique](#3-stack-technique)
4. [Architecture et dépôt](#4-architecture-et-dépôt)
5. [Prérequis](#5-prérequis)
6. [Installation et lancement local](#6-installation-et-lancement-local)
7. [Premier démarrage](#7-premier-démarrage)
8. [Tests](#8-tests)
9. [Tunnel de démonstration Cloudflare](#9-tunnel-de-démonstration-cloudflare)
10. [Sécurité et limites connues](#10-sécurité-et-limites-connues)
11. [Migrations](#11-migrations)
12. [Documentation](#12-documentation)
13. [Perspectives d'amélioration](#13-perspectives-damélioration)
14. [Auteur](#14-auteur)

## 1. Présentation

Gate regroupe les opérations courantes d'une salle de sport dans une application web : gestion des membres, des abonnements, des cours, du coaching et du contrôle d'accès. Elle s'adresse aux équipes de salle (administration, réception et coachs) ainsi qu'aux membres qui gèrent leur activité.

L'application distingue quatre rôles : **Admin**, **Réception**, **Coach** et **Membre**. Les droits sont contrôlés côté API Spring.

## 2. Fonctionnalités par rôle

- **Admin** : gérer les membres, les comptes du personnel, les formules et le planning; consulter le journal d'accès; enrôler un membre et contrôler son accès par reconnaissance faciale.
- **Réception** : consulter les membres et le planning, faciliter l'accueil et effectuer le contrôle d'accès facial.
- **Coach** : consulter son planning et ses clients associés, traiter les demandes de coaching, suivre les séances et ajouter des notes privées.
- **Membre** : créer un compte, gérer son profil et sa photo, consulter son abonnement, réserver des cours, demander des séances de coaching, suivre sa progression et ses objectifs.
- **Authentification et préférences** : connexion par mot de passe ou Google; interface en français, anglais ou arabe (avec écriture de droite à gauche), thèmes clair et sombre.

### Connexion faciale selon le rôle

| Rôle | Connexion par le visage | Autres usages du visage |
|---|---|---|
| Membre | Oui, après enrôlement de son propre visage | Peut être enrôlé par le personnel pour l'accès à la salle |
| Réception | Oui, après enrôlement de son propre visage | Enrôle les membres et effectue le contrôle d'accès |
| Admin | Bloquée par défaut (sécurité) | Enrôle les membres et effectue le contrôle d'accès |
| Coach | Non disponible : connexion par mot de passe ou Google | Aucun |

L'enrôlement d'un membre et le contrôle d'accès à la salle sont réservés à l'Admin et à la Réception.

## 3. Stack technique

| Domaine | Technologies |
|---|---|
| Frontend | React 18.2, React Router 6.23, Vite 5.2, Tailwind CSS 3.4 |
| Backend | Java 21, Spring Boot 4.1.0, Spring Security, Spring Data JPA, Maven Wrapper 3.9.16 |
| Base de données | MySQL 8, Flyway |
| Service facial | Python 3.11, Flask 3.0.3, `face-recognition` 1.3.0, NumPy 2.1.3, Pillow 10.4.0 |
| Tests | JUnit / Spring Boot Test, tests Node intégrés (`node:test`), tests Python `unittest` |

## 4. Architecture et dépôt

```text
Navigateur React
      │ /api (proxy Vite en développement)
      ▼
API REST Spring Boot ─────────► MySQL
      │
      └── API d'embedding facial ──► service Flask
```

Le navigateur capture l'image; l'API Spring applique les règles d'authentification, de rôle et d'accès, puis appelle le service Flask pour calculer une empreinte faciale (embedding). Les empreintes et les journaux associés sont gérés par le backend et stockés dans MySQL.

```text
/
├── AIDE.md                         # Documentation détaillée du comportement et du lancement
├── backend/
│   ├── pom.xml, mvnw, mvnw.cmd     # Dépendances et wrapper Maven
│   ├── DATABASE_MIGRATIONS.md      # Procédure et conventions Flyway
│   └── src/
│       ├── main/java/              # API, sécurité, métier et accès aux données
│       ├── main/resources/         # Configuration et migrations SQL
│       └── test/java/              # Tests backend
├── facial-recognition/
│   ├── main.py                     # API Flask d'embedding et de santé
│   ├── requirements.txt            # Dépendances Python épinglées
│   └── test_main.py                # Tests du service facial
└── frontend/
    ├── package.json                # Scripts et dépendances npm
    ├── vite.config.js              # Port et proxy de développement
    └── src/                        # Application React, pages, contextes et services API
```

## 5. Prérequis

- **Java 21** (le wrapper Maven est inclus).
- **Node.js 24** et npm : version utilisée pour le développement (v24.21.0). Aucune version minimale n'est déclarée dans le projet.
- **Python 3.11** : version utilisée pour le développement (3.11.9). Les versions des bibliothèques figurent dans `facial-recognition/requirements.txt`.
- **MySQL 8** : utilisez un serveur MySQL 8, pas la MariaDB fournie avec certaines installations XAMPP (Hibernate ne la supporte plus correctement).
- La bibliothèque `face-recognition` dépend de dlib. Son installation sous Windows peut être délicate et demande un compilateur C++ et beaucoup de mémoire.
- Une webcam et l'autorisation du navigateur pour les parcours de capture faciale.

## 6. Installation et lancement local

Les exemples sont à exécuter dans des terminaux PowerShell séparés, depuis la racine du dépôt. Définissez les variables d'environnement dans votre environnement local et ne placez aucun secret dans Git. Les fichiers `.env.example` sont des modèles de noms et ne sont pas chargés automatiquement par le backend.

### 6.1 Préparer MySQL

Démarrez MySQL 8, puis créez la base :

```sql
CREATE DATABASE gymbd;
```

Si votre serveur diffère, renseignez `DB_URL`, `DB_USERNAME` et `DB_PASSWORD`. Au démarrage, Flyway applique les migrations et Hibernate valide le schéma.

### 6.2 Variables d'environnement

Les exemples sont laissés vides volontairement.

| Nom | Rôle | Obligatoire ? | Exemple |
|---|---|---:|---|
| `SERVER_PORT` | Port de l'API Spring | Non | *(vide)* |
| `DB_URL` | URL JDBC de MySQL | Non (valeur par défaut) | *(vide)* |
| `DB_USERNAME` | Compte MySQL | Selon la configuration | *(vide)* |
| `DB_PASSWORD` | Mot de passe MySQL | Selon la configuration | *(vide)* |
| `JWT_SECRET` | Signature des sessions (32 caractères minimum) | **Oui** | *(vide)* |
| `GOOGLE_CLIENT_ID` | Vérification de la connexion Google côté API | Seulement si Google est utilisé | *(vide)* |
| `ALLOWED_ORIGINS` | Origines autorisées (CORS) | Non (origines locales par défaut) | *(vide)* |
| `APP_UPLOAD_DIR` | Dossier des photos de profil | Non | *(vide)* |
| `FACE_RECOGNITION_URL` | URL du service Flask appelée par Spring | Non (adresse locale par défaut) | *(vide)* |
| `FACE_SERVICE_KEY` | Clé partagée entre Spring et Flask | Non en local; requise hors local | *(vide)* |
| `SEED_ADMIN_PASSWORD` | Mot de passe du compte Admin créé en profil `dev` | Non | *(vide)* |
| `SEED_RECEPTIONIST_PASSWORD` | Idem pour la Réception | Non | *(vide)* |
| `SEED_TRAINER_PASSWORD` | Idem pour le Coach | Non | *(vide)* |
| `SEED_MEMBER_PASSWORD` | Idem pour le Membre | Non | *(vide)* |
| `VITE_API_URL` | Préfixe API du frontend; vide pour utiliser le proxy Vite `/api` | Non | *(vide)* |
| `VITE_GOOGLE_CLIENT_ID` | Identifiant public Google | Seulement si Google est utilisé | *(vide)* |
| `PORT` | Port du service facial | Non | *(vide)* |
| `HOST` | Adresse d'écoute du service facial | Non | *(vide)* |

Le backend importe facultativement `frontend/.env.local`; Vite y lit aussi ses variables `VITE_*`. Après toute modification, redémarrez les processus concernés.

### 6.3 Démarrer le backend

Le profil `dev` active le seeder de données de développement.

```powershell
Set-Location .\backend
.\mvnw.cmd "-Dspring-boot.run.profiles=dev" spring-boot:run
```

### 6.4 Démarrer le service de reconnaissance faciale

```powershell
Set-Location .\facial-recognition
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

### 6.5 Démarrer le frontend

```powershell
Set-Location .\frontend
npm install
npm run dev
```

### URLs locales

| Service | URL / port |
|---|---|
| Frontend | `http://localhost:5173` |
| API Spring | `http://localhost:8080` |
| Santé du service facial | `http://127.0.0.1:8001/health` |

La webcam fonctionne sur `localhost`; autorisez son accès dans le navigateur lors de la capture.

## 7. Premier démarrage

Pour obtenir un compte Membre, utilisez l'inscription publique et choisissez une formule. En profil `dev`, le seeder crée aussi des comptes de développement pour les rôles prévus. Définissez les variables `SEED_*_PASSWORD` avant le premier démarrage pour connaître leurs mots de passe; n'écrivez ni identifiants ni mots de passe dans ce README.

Si ces variables ne sont pas définies, des mots de passe aléatoires sont générés. Ne partagez pas les journaux de démarrage.

## 8. Tests

Exécutez les commandes dans le dossier du composant concerné :

| Composant | Commande |
|---|---|
| Backend | `.\mvnw.cmd test` depuis `backend/` (MySQL doit être démarré) |
| Frontend | `npm test` depuis `frontend/` |
| Build frontend | `npm run build` depuis `frontend/` |
| Service facial | `python -m unittest discover -s . -p "test_*.py"` depuis `facial-recognition/` |

## 9. Tunnel de démonstration Cloudflare

Le tunnel rapide expose Vite sur le port `5173`; le proxy Vite relaie `/api` vers Spring sur `8080`.
Laissez le backend et le frontend actifs, puis lancez `cloudflared tunnel --url http://localhost:5173` dans un troisième terminal.
Ouvrez l'adresse HTTPS temporaire affichée; elle change à chaque lancement.
N'exposez pas directement les ports `8080` ou `8001`; détails et précautions dans [AIDE.md](./AIDE.md).

## 10. Sécurité et limites connues

- La reconnaissance faciale ne comporte **pas de détection de vivacité** : une photo ou une vidéo présentée à la caméra peut tromper la capture. La connexion faciale des comptes Admin est bloquée par défaut.
- Les abonnements sont une démonstration, sans prestataire ni paiement réel : un statut actif ne signifie pas qu'un paiement a été encaissé.
- Les sessions expirent après **24 heures**.
- Les empreintes faciales sont des données biométriques sensibles : limitez leur accès et ne partagez ni les données ni les journaux.
- Pour tout accès non local au service facial, protégez-le avec `FACE_SERVICE_KEY` et n'exposez pas son port.

## 11. Migrations

Flyway gère le schéma MySQL à partir de migrations versionnées dans `backend/src/main/resources/db/migration`. Hibernate valide le schéma sans le créer ni le modifier. Avant de migrer une base existante, sauvegardez-la et suivez [backend/DATABASE_MIGRATIONS.md](./backend/DATABASE_MIGRATIONS.md).

## 12. Documentation

Pour les routes, rôles, règles métier, détails d'installation et limites, consultez [AIDE.md](./AIDE.md).

## 13. Perspectives d'amélioration

- Ajouter un parcours de paiement réel et son traitement sécurisé.
- Mettre en place une détection de vivacité pour les parcours biométriques.
- Conteneuriser le projet et documenter le déploiement de production.
- Ajouter pagination et filtres pour les grands volumes.
- Ajouter des notifications (réservations, abonnements, demandes de coaching).

## 14. Auteur

- **Auteur :** Khaldi Omar, étudiant à la Faculté des Sciences de Bizerte
- **Année :** 2026