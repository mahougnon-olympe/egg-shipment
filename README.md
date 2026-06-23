# Plateforme de commande d'œufs

Plateforme permettant à des clients de commander des plateaux d'œufs (livraison ou retrait), et au vendeur de gérer ses commandes, son stock, ses tarifs et ses disponibilités.

## Structure

```
egg-shipment/
├── backend/         → API REST Node.js + Express + Socket.IO
├── web-client/      → Interface client (React + Vite, port 3000)
├── web-vendeur/     → Dashboard vendeur (React + Vite, port 3001)
└── shared/          → Utilitaires partagés (WhatsApp, formatage)
```

## Démarrage rapide

### 1. Backend

```bash
cd backend
cp .env.example .env
# Remplir MONGODB_URI et JWT_SECRET dans .env
npm install
npm run dev
```

### 2. Web client

```bash
cd web-client
cp .env.example .env
npm install
npm run dev
# → http://localhost:3000
```

### 3. Web vendeur

```bash
cd web-vendeur
cp .env.example .env
npm install
npm run dev
# → http://localhost:3001
```

## Créer le compte vendeur

Faire un `POST /auth/register` avec `role: "vendeur"` (via Postman ou Thunder Client) avant de vous connecter sur le dashboard.

```json
{
  "role": "vendeur",
  "nom": "Votre Nom",
  "prenom": "Votre Prénom",
  "whatsapp": "+22900000000",
  "password": "motdepasse"
}
```

## Variables d'environnement backend (`.env`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | URI MongoDB Atlas |
| `JWT_SECRET` | Clé secrète JWT (longue et aléatoire) |
| `JWT_EXPIRES_IN` | Durée du token (défaut: 30d) |
| `CLIENT_ORIGINS` | URLs autorisées par CORS (séparées par des virgules) |
| `FIREBASE_SERVICE_ACCOUNT` | JSON du compte de service Firebase (optionnel, pour les push) |

## Notifications push Firebase (optionnel)

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com)
2. Générer une clé de compte de service (Project Settings → Service accounts)
3. Coller le JSON complet (sur une ligne) dans `FIREBASE_SERVICE_ACCOUNT`

## Déploiement

- **Backend** → Railway ou Render (pointer sur `/backend`)
- **Web client** → Vercel ou Netlify (pointer sur `/web-client`, variable `VITE_API_URL`)
- **Web vendeur** → Vercel ou Netlify (pointer sur `/web-vendeur`, variable `VITE_API_URL`)
