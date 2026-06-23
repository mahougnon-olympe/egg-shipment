# Spécification complète — Plateforme de commande et livraison d'œufs

## 1. Vue d'ensemble

Plateforme permettant à des clients de commander des plateaux d'œufs (livraison ou retrait sur place), et au vendeur de gérer ces commandes, son stock, ses tarifs et ses disponibilités.

**Quatre interfaces au total**, toutes connectées à une même API backend :

| Acteur | Web | Mobile |
|--------|-----|--------|
| **Client** | Site web responsive | App Android/iOS |
| **Vendeur** | Dashboard web | App Android/iOS |

L'objectif est qu'un client puisse commander aussi bien depuis un navigateur que depuis l'app installée sur son téléphone, et que le vendeur puisse gérer sa boutique depuis son ordinateur ou son mobile, avec une synchronisation en temps réel entre tous les appareils.

### Stack technique recommandée

- **Backend** : Node.js + Express (API REST) + Socket.IO (temps réel)
- **Base de données** : MongoDB Atlas (comme Libero's Multi)
- **Web client & web vendeur** : React (ou HTML/CSS/JS vanilla si tu préfères rester simple)
- **Mobile client & mobile vendeur** : React Native (une seule base de code pour Android + iOS, et réutilise la logique React du web)
- **Notifications push mobile** : Firebase Cloud Messaging (FCM)
- **Authentification** : JWT (token partagé entre web et mobile)

Le gros avantage de React + React Native : une grande partie de la logique (appels API, validation, calculs) est partageable entre le web et le mobile, ce qui réduit le travail.

---

## 2. Côté Client

### 2.1 Inscription / Connexion

**Champs d'inscription :**
- Nom (obligatoire)
- Prénom (obligatoire)
- Numéro WhatsApp (obligatoire, format international +229XXXXXXXX — sert à la livraison et au contact)
- Email (optionnel)
- Mot de passe ou code PIN (à trancher selon le public)

**Validation :**
- Le numéro WhatsApp doit être au format international valide pour générer les liens `wa.me`
- Vérifier l'unicité du numéro WhatsApp (un compte = un numéro)

**Connexion :**
- Par numéro WhatsApp + mot de passe, ou email + mot de passe
- Token JWT renvoyé et stocké (localStorage côté web, SecureStore/AsyncStorage côté mobile)

### 2.2 Écran d'accueil client

- Affichage du statut du vendeur : **ouvert** (dans ses horaires de dispo) ou **fermé**
- Stock disponible affiché (ex: "120 plateaux disponibles") ou simplement "Disponible / Rupture"
- Liste des tarifs actifs proposés par le vendeur
- Bouton principal **Commander**

### 2.3 Tunnel de commande (web + mobile, même logique)

**Étape 1 — Choix du tarif**
- Le vendeur peut proposer plusieurs tarifs simultanément (ex: 2 500 FCFA/plateau standard, 2 600 FCFA/plateau extra)
- Le client sélectionne le tarif voulu
- Seuls les tarifs marqués "actifs" par le vendeur s'affichent

**Étape 2 — Quantité**
- Sélecteur du nombre de plateaux (boutons +/- et saisie directe)
- Calcul automatique en temps réel : montant total = nb plateaux × prix unitaire
- Blocage si la quantité demandée dépasse le stock disponible (message "Stock insuffisant, X plateaux restants")

**Étape 3 — Mode de réception**
- **Livraison** → affiche un champ "Lieu de livraison" (texte libre, ou point sur carte si on intègre Google Maps)
- **Retrait sur place** → affiche l'adresse fixe du point de vente configurée par le vendeur

**Étape 4 — Récapitulatif**
- Quantité, tarif choisi, montant total, mode de réception, lieu si livraison
- Bouton **Confirmer la commande**

**Étape 5 — Confirmation + WhatsApp**
- La commande est enregistrée en base avec le statut "nouvelle"
- Un bouton **Contacter le vendeur sur WhatsApp** ouvre `wa.me/<numéro_vendeur>?text=<message pré-rempli>`
- Message pré-rempli généré automatiquement :
  ```
  Bonjour, je souhaite commander 5 plateaux d'œufs à 2600 FCFA/plateau.
  Montant total : 13000 FCFA
  Mode : Livraison
  Lieu : Calavi, derrière le carrefour X
  Nom : Awessou Olympe
  Numéro : +229XXXXXXXX
  ```

### 2.4 Suivi des commandes (client)

- Liste des commandes passées, avec leur statut en temps réel : **nouvelle**, **confirmée**, **en livraison**, **terminée**, **annulée**
- Mise à jour en direct via Socket.IO quand le vendeur change le statut
- Possibilité de relancer le vendeur par WhatsApp depuis chaque commande
- Côté mobile : notification push quand le statut change (ex: "Votre commande est confirmée !")

### 2.5 Profil client

- Modifier nom, prénom, numéro WhatsApp, email
- Changer mot de passe
- Déconnexion

---

## 3. Côté Vendeur

### 3.1 Tableau de bord (web + mobile)

- Vue d'ensemble : nombre de commandes du jour, montant total attendu, stock restant
- Liste des commandes triées par date (récentes en haut)
- Chaque commande affiche :
  - Nom et prénom du client
  - Numéro WhatsApp (bouton de contact direct)
  - Quantité de plateaux
  - Tarif et montant total
  - Mode de réception (livraison/retrait)
  - Lieu de livraison si applicable
  - Heure de la commande
  - Statut actuel
- Actions par commande : changer le statut (confirmer, marquer en livraison, terminer, annuler), contacter le client sur WhatsApp

### 3.2 Gestion du stock

- Champ "Solde de plateaux disponibles", modifiable manuellement
- Décrémentation automatique à chaque commande confirmée
- Correction manuelle possible à tout moment (ex: casse, réassort)
- Alerte visuelle quand le stock passe sous un seuil défini (ex: < 10 plateaux)
- Historique des mouvements de stock (optionnel mais utile)

### 3.3 Gestion des tarifs

- Ajouter / modifier / supprimer un tarif
- Chaque tarif : prix unitaire (FCFA) + label (ex: "Calibre standard", "Extra gros")
- Activer / désactiver un tarif sans le supprimer (utile en cas de rupture d'une qualité précise)

### 3.4 Disponibilités

- Jours de disponibilité (cases à cocher Lundi → Dimanche)
- Plage horaire (heure de début et de fin, ex: 8h00 - 18h00)
- Adresse du point de vente (pour le mode retrait)
- Ces infos s'affichent côté client et peuvent bloquer la commande hors créneau

### 3.5 Notifications vendeur

**Deux canaux simultanés (comme demandé) :**

1. **Notification dans l'application**
   - Web : badge + son + bannière à l'arrivée d'une commande (via Socket.IO)
   - Mobile : notification push via Firebase Cloud Messaging, même quand l'app est fermée

2. **Lien / message WhatsApp**
   - Le récapitulatif de la commande est aussi envoyé côté vendeur
   - Solution simple sans coût : le message pré-rempli du client arrive sur le WhatsApp du vendeur
   - Solution avancée (si budget) : API WhatsApp Business pour envoi automatique structuré

### 3.6 Profil vendeur

- Modifier ses infos, son numéro WhatsApp de contact, l'adresse du point de vente
- Changer mot de passe

---

## 4. Fonctionnement temps réel (Socket.IO)

Comme dans Libero's Multi, Socket.IO synchronise tout le monde instantanément :

- **Nouvelle commande** → le serveur émet un événement `nouvelle_commande` → le dashboard vendeur (web + mobile) se met à jour sans rechargement
- **Changement de statut** → événement `statut_commande` → le suivi du client se met à jour en direct
- **Mise à jour du stock / tarifs** → événement `maj_boutique` → les clients connectés voient les nouveaux tarifs et le stock à jour immédiatement

---

## 5. Modèle de données (MongoDB)

### Collection `users`
```
{
  _id,
  role: "client" | "vendeur",
  nom,
  prenom,
  whatsapp,            // format international, unique
  email,               // optionnel
  password_hash,
  fcmToken,            // token Firebase pour push mobile (si app installée)
  createdAt
}
```

### Collection `tarifs`
```
{
  _id,
  vendeurId,
  prixUnitaire,        // FCFA par plateau
  label,               // ex: "Calibre standard", "Extra"
  actif: true/false,
  createdAt
}
```

### Collection `commandes`
```
{
  _id,
  clientId,
  clientNom,           // dénormalisé pour affichage rapide
  clientPrenom,
  clientWhatsapp,
  vendeurId,
  tarifId,
  prixUnitaire,        // figé au moment de la commande
  nbPlateaux,
  montantTotal,
  modeReception: "livraison" | "retrait",
  lieuLivraison,       // null si retrait
  statut: "nouvelle" | "confirmée" | "en_livraison" | "terminée" | "annulée",
  createdAt,
  updatedAt
}
```

### Collection `stock`
```
{
  vendeurId,
  soldeDisponible,     // nombre de plateaux
  seuilAlerte,         // ex: 10
  updatedAt
}
```

### Collection `disponibilites`
```
{
  vendeurId,
  jours: ["lundi", "mardi", ...],
  heureDebut,          // ex: "08:00"
  heureFin,            // ex: "18:00"
  adressePointVente
}
```

---

## 6. API REST à développer

### Authentification
- `POST /auth/register` — inscription (client ou vendeur)
- `POST /auth/login` — connexion, renvoie le token JWT
- `GET /auth/me` — profil de l'utilisateur connecté
- `PUT /auth/me` — modifier son profil
- `PUT /auth/fcm-token` — enregistrer/mettre à jour le token push mobile

### Boutique (public, lecture seule pour le client)
- `GET /boutique` — tarifs actifs + stock + disponibilités + statut ouvert/fermé

### Tarifs (vendeur)
- `GET /tarifs` — liste des tarifs du vendeur
- `POST /tarifs` — créer un tarif
- `PUT /tarifs/:id` — modifier
- `DELETE /tarifs/:id` — supprimer
- `PATCH /tarifs/:id/toggle` — activer/désactiver

### Commandes
- `POST /commandes` — créer une commande (client)
- `GET /commandes` — liste (vendeur voit toutes les siennes, client voit les siennes)
- `GET /commandes/:id` — détail
- `PATCH /commandes/:id/statut` — changer le statut (vendeur)

### Stock (vendeur)
- `GET /stock` — solde actuel
- `PUT /stock` — mise à jour manuelle du solde et du seuil

### Disponibilités (vendeur)
- `GET /disponibilites`
- `PUT /disponibilites`

---

## 7. Architecture des dossiers

```
egg-orders/
│
├── backend/
│   ├── models/              → schémas Mongoose (User, Tarif, Commande, Stock, Disponibilite)
│   ├── routes/              → définition des routes API
│   ├── controllers/         → logique métier
│   ├── middleware/          → auth JWT, validation, gestion erreurs
│   ├── sockets/             → événements Socket.IO
│   ├── services/            → notifications FCM, génération liens WhatsApp
│   ├── config/              → connexion MongoDB, variables d'env
│   └── server.js            → point d'entrée
│
├── web-client/              → React, interface client (commande, suivi)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/api.js  → appels API partagés
│   │   └── socket.js
│   └── package.json
│
├── web-vendeur/             → React, dashboard vendeur
│   ├── src/
│   └── package.json
│
├── mobile-client/           → React Native, app client Android/iOS
│   ├── src/
│   └── package.json
│
├── mobile-vendeur/          → React Native, app vendeur Android/iOS
│   ├── src/
│   └── package.json
│
└── shared/                  → code partagé (validation, formatage FCFA, types)
```

Astuce : web-client et mobile-client peuvent partager énormément via le dossier `shared/` (appels API, validation des formulaires, logique de calcul des montants, génération des liens WhatsApp).

---

## 8. Génération des liens WhatsApp

Le cœur de la fonctionnalité de contact. Format universel qui marche sur web et mobile :

```javascript
function lienWhatsApp(numero, message) {
  // numero au format international SANS le +, ex: 229XXXXXXXX
  const num = numero.replace(/[^0-9]/g, '');
  const texte = encodeURIComponent(message);
  return `https://wa.me/${num}?text=${texte}`;
}
```

Sur mobile, ce lien ouvre directement l'app WhatsApp installée. Sur web, il ouvre WhatsApp Web ou propose l'app. C'est la méthode la plus fiable et sans coût.

---

## 9. Notifications push mobile (Firebase Cloud Messaging)

1. Créer un projet Firebase, récupérer les clés
2. Côté app mobile (React Native) : intégrer `@react-native-firebase/messaging`, demander la permission, récupérer le `fcmToken` et l'envoyer au backend via `PUT /auth/fcm-token`
3. Côté backend : quand une nouvelle commande arrive, envoyer une notification push au `fcmToken` du vendeur via l'Admin SDK Firebase
4. Idem pour le client quand son statut de commande change

---

## 10. Étapes de développement (ordre conseillé pour Claude Code)

1. **Backend d'abord** : modèles MongoDB, API REST complète, authentification JWT. Tester avec Postman ou Thunder Client.
2. **Socket.IO** : ajouter le temps réel sur les commandes et la boutique.
3. **Web client** : inscription, tunnel de commande, génération WhatsApp, suivi.
4. **Web vendeur** : dashboard, gestion stock/tarifs/disponibilités, notifications in-app.
5. **Mobile client** (React Native) : reprendre la logique du web client, ajouter les push.
6. **Mobile vendeur** (React Native) : reprendre le dashboard, ajouter les push FCM.
7. **Tests bout en bout** : un client commande → le vendeur reçoit en temps réel sur web ET mobile → change le statut → le client voit la mise à jour.
8. **Déploiement** :
   - Backend → Railway ou Render
   - Web client + web vendeur → Vercel ou Netlify
   - Mobile → build Android (.apk / Play Store) et iOS (TestFlight / App Store)

---

## 11. Points à trancher avant de coder

- **Authentification** : mot de passe classique ou code PIN simple ? (le PIN est plus adapté si les clients sont peu habitués aux applications)
- **Lieu de livraison** : champ texte libre ou sélection sur carte (Google Maps API, coût éventuel) ?
- **Paiement** : tout en cash à la livraison/retrait, ou intégration Mobile Money (MTN, Moov) plus tard ?
- **Multi-vendeurs** : un seul vendeur (ta mère) pour l'instant, ou prévoir dès le départ une architecture où plusieurs vendeurs peuvent s'inscrire ? (cela change la conception de la "boutique")
- **App mobile** : publier sur les stores (compte développeur payant : 25 $ Google une fois, 99 $/an Apple) ou simplement distribuer un .apk Android en direct pour commencer ?