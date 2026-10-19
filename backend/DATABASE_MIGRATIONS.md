# Migrations de base de données

Le backend utilise Flyway pour gérer le schéma MySQL. Les migrations versionnées
sont dans `src/main/resources/db/migration` et suivent le nommage
`V<version>__<description>.sql`.

## Initialisation

Sur une base vide, Flyway applique `V1__create_initial_schema.sql` avant le
démarrage de JPA. Hibernate est en mode `validate` : il vérifie les mappings
sans créer, modifier ni supprimer de tables ou de colonnes.

La migration V1 décrit les entités JPA actuelles, y compris l'héritage JOINED
des utilisateurs et les relations vers les tables parentes. Les identifiants
UUID sont stockés en `BINARY(16)`, comme attendu par le mapping Hibernate MySQL.

## Base existante

Pour permettre une transition sans réexécuter V1 sur des tables existantes,
`baseline-on-migrate` est activé à la version `1`. Lors du premier lancement,
Flyway marque à cette version un schéma déjà non vide qui n'a pas d'historique
Flyway. Il ne convertit pas et ne supprime pas les données existantes.

Avant ce premier lancement sur une base existante :

1. Faire une sauvegarde complète.
2. Comparer le schéma existant aux entités et à V1, notamment les types UUID,
   colonnes obligatoires, clés étrangères et unicité de l'email.
3. Démarrer l'application. Hibernate doit valider le schéma; en cas d'écart, le
   démarrage échoue avant l'exécution du `DataSeeder`.

Le baseline ne prouve pas que toutes les contraintes et tous les index d'une
base existante correspondent à V1. Les écarts repérés doivent être corrigés
dans une migration versionnée dédiée après sauvegarde, pas en réactivant
`ddl-auto=update`.

## Ajouter une migration

Créer la prochaine migration (`V2__...sql`, puis `V3__...sql`, etc.) sans
modifier une migration déjà appliquée. Préserver les données avec des
changements progressifs et tester la migration sur une copie de la base avant
déploiement. Garder `spring.jpa.hibernate.ddl-auto=validate` afin que les
mappings restent vérifiés au démarrage.

La migration `V3__archive_anonymized_members.sql` ajoute le marqueur
`member.archived`. L'archivage anonymise le profil et conserve les journaux
d'accès liés, qui affichent alors l'identité anonymisée.

La migration `V4__add_google_identity.sql` ajoute une table séparée pour les
identités Google. Elle ne modifie ni ne migre les comptes existants : ceux-ci
doivent être associés depuis le profil après authentification Gate. La table
impose une identité unique par compte et une unicité de la paire issuer/subject.
Avant déploiement, sauvegarder la base et vérifier V4 sur une copie du schéma
réel, en particulier si la base existante n'a pas été migrée par Flyway.

Les migrations V5 et V6 ajoutent respectivement la disponibilité des formules
et leurs noms anglais/arabe. V7 crée `coach_note`, avec les clés étrangères
vers le coach et le membre ainsi qu'un index par propriétaire, membre et date.
Cette table ne donne aucun accès au membre; le service ne retourne les notes
qu'au coach propriétaire. Ne jamais réutiliser un numéro de migration déjà
présent dans le dépôt, même si le changement demandé mentionne une version
occupée; créer la prochaine version disponible pour éviter les collisions
Flyway.
