# 🛡️ CyberShield — Plateforme Anti-Cybercriminalité

Plateforme web citoyenne et policière dédiée à la lutte contre les cyber-escroqueries locales à Pointe-Noire (Congo).

## 📌 Description

CyberShield remplit deux rôles majeurs :

- **Côté Victimes** : Permettre aux citoyens de signaler anonymement une cyber-escroquerie et d'y adjoindre des preuves numériques.
- **Côté Brigade** : Fournir aux enquêteurs un outil collaboratif pour analyser les preuves, corréler les signalements et suivre les investigations.

## 🔗 Liens

- Frontend : https://stevenslikibi.github.io/Cybershield_project/
- Backend : https://cybershieldproject-production.up.railway.app

## 🏗️ Architecture du Système

    Cybershield_project/
    ├── Frontend/          → Interface publique (HTML, CSS, JS)
    ├── Backend/           → API REST (Node.js, Express)
    ├── Conception/        → Modélisation UML et MCD
    ├── index.html         → Formulaire de signalement public
    ├── dashboard.html     → Tableau de bord enquêteurs
    ├── login.html         → Authentification enquêteurs
    ├── server.js          → Serveur Node.js principal
    └── api.js             → Routes API

## 💻 Technologies

| Couche | Technologie |
|--------|-------------|
| Frontend | HTML5, CSS3, JavaScript Vanilla |
| Backend | Node.js, Express.js |
| Base de données | PostgreSQL |
| Authentification | JWT (JSON Web Token) |
| Hébergement Frontend | GitHub Pages |
| Hébergement Backend | Railway |

## 🗄️ Dictionnaire des Données PostgreSQL

### Table `workspaces`
| Champ | Type | Description |
|-------|------|-------------|
| id_workspace | SERIAL | Identifiant unique |
| nom | VARCHAR(100) | Nom de la cellule d'enquête |

### Table `signalements`
| Champ | Type | Description |
|-------|------|-------------|
| id_signalement | SERIAL | Identifiant unique |
| code_suivi | VARCHAR(20) | Code anonyme de suivi |
| type_arnaque | VARCHAR(50) | Type : phishing, fraude, usurpation, mobile_money |
| description | TEXT | Description de l'arnaque |
| quartier | VARCHAR(100) | Quartier de Pointe-Noire |
| plateforme | VARCHAR(50) | Plateforme utilisée |
| numero_escroc | VARCHAR(20) | Numéro de téléphone de l'escroc |
| est_anonyme | BOOLEAN | Dépôt anonyme ou non |
| nom_victime | VARCHAR(100) | Nom de la victime (si non anonyme) |
| telephone_victime | VARCHAR(20) | Téléphone de la victime |
| email_victime | VARCHAR(100) | Email de la victime |
| statut | VARCHAR(50) | nouveau / encours / cloture |
| date_depot | TIMESTAMP | Date du signalement |
| id_workspace | INT | Cellule d'enquête assignée |

### Table `enqueteurs`
| Champ | Type | Description |
|-------|------|-------------|
| id_enqueteur | SERIAL | Identifiant unique |
| nom | VARCHAR(100) | Nom de l'enquêteur |
| prenom | VARCHAR(100) | Prénom |
| email | VARCHAR(100) | Email (unique) |
| mot_de_passe | TEXT | Mot de passe |
| role | VARCHAR(50) | Rôle : admin, enqueteur |
| id_workspace | INT | Cellule d'appartenance |

### Table `preuves`
| Champ | Type | Description |
|-------|------|-------------|
| id_preuve | SERIAL | Identifiant unique |
| id_signalement | INT | Signalement associé |
| type_preuve | VARCHAR(50) | Type de preuve |
| valeur | TEXT | Contenu de la preuve |

### Table `suspects`
| Champ | Type | Description |
|-------|------|-------------|
| id_suspect | SERIAL | Identifiant unique |
| numero_telephone | VARCHAR(20) | Numéro du suspect |
| nom_suspect | VARCHAR(100) | Nom du suspect |
| nombre_signalements | INT | Nombre de signalements liés |

## 🔒 Mesures de Sécurité

- **Authentification JWT** : Accès au dashboard réservé aux enquêteurs authentifiés
- **Validation des fichiers** : Seuls les formats JPEG et PNG sont acceptés côté backend
- **Protection CORS** : Contrôle des origines autorisées
- **Données anonymisées** : Option de dépôt anonyme pour protéger les victimes
- **Token expirant** : Les sessions JWT expirent après 8 heures

## 🚀 Installation locale

    git clone https://github.com/Stevenslikibi/Cybershield_project.git
    cd Cybershield_project
    npm install
    node server.js

## 👤 Auteur

Projet académique — Brigade Cybercriminalité Pointe-Noire
