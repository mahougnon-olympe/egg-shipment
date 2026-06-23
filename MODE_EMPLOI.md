# Mode d'emploi — Plateforme de vente d'œufs en ligne

---

## Présentation générale

Cette plateforme est un système complet de gestion de commandes d'œufs en plateaux.
Elle se compose de **trois interfaces web distinctes**, chacune accessible par une URL propre :

| Interface | Lien | Pour qui |
|-----------|------|----------|
| Clients | https://egg-shipment.vercel.app | Les acheteurs d'œufs |
| Vendeur | https://egg-shipment-seller.vercel.app | Le/la gérant(e) de la boutique |
| Fournisseurs | https://egg-shipment-fournisseur.vercel.app | Les livreurs de plateaux |

Toutes les interfaces sont connectées en temps réel : une action d'un côté se reflète immédiatement de l'autre côté, sans avoir besoin de rafraîchir la page.

---

## 1. Interface Vendeur
**Lien :** https://egg-shipment-seller.vercel.app

C'est le cœur de la boutique. Le vendeur s'y connecte pour gérer toute l'activité.

### Première utilisation
1. Aller sur le lien vendeur
2. Cliquer sur **"Créer le compte vendeur"**
3. Remplir le formulaire (prénom, nom, numéro de téléphone, mot de passe)
4. Une fois connecté, commencer par configurer la boutique

### Ce que le vendeur peut faire

**Tableau de bord**
- Voir toutes les commandes du jour en temps réel
- Recevoir une notification sonore à chaque nouvelle commande
- Changer le statut d'une commande : Nouvelle → Confirmée → En livraison → Terminée
- Contacter un client directement via **WhatsApp**, **Appel téléphonique** ou **SMS**
- Être alerté automatiquement quand un fournisseur livre du stock

**Tarifs**
- Créer les différents tarifs de vente (ex : tarif normal, tarif gros acheteur…)
- Définir le prix par plateau et le nombre minimum de plateaux par tarif
- Activer ou désactiver un tarif — seuls les tarifs actifs sont visibles par les clients

**Stock**
- Voir le solde de plateaux disponibles en temps réel
- Définir un seuil d'alerte : quand le stock passe en dessous, une alerte rouge apparaît
- Le stock se met à jour automatiquement quand un fournisseur enregistre une livraison

**Disponibilités**
- Indiquer si la boutique est ouverte ou fermée
- Quand la boutique est fermée, les clients ne peuvent pas passer de commande

**Modes de paiement**
- Configurer les modes de paiement acceptés (Mobile Money, Espèces)
- Ces modes s'affichent au client au moment de la commande

**Commandes**
- Voir l'historique complet de toutes les commandes
- Filtrer par statut

---

## 2. Interface Clients
**Lien :** https://egg-shipment.vercel.app

C'est la boutique que voient les acheteurs d'œufs.

### Première utilisation
1. Aller sur le lien client
2. Cliquer sur **"S'inscrire"**
3. Remplir le formulaire (prénom, nom, numéro de téléphone, mot de passe)
   > Il est recommandé d'utiliser un numéro WhatsApp afin que le vendeur puisse vous contacter directement par WhatsApp.
4. Une fois inscrit, le client est automatiquement connecté

### Ce que le client peut faire

**Accueil / Boutique**
- Voir si la boutique est ouverte ou fermée
- Consulter les tarifs disponibles et les prix
- Passer une commande en quelques étapes :
  1. Choisir un tarif
  2. Indiquer le nombre de plateaux souhaité
  3. Choisir entre **livraison** (avec indication du lieu) ou **retrait sur place**
  4. Choisir le mode de paiement (Mobile Money ou Espèces)
  5. Valider la commande

**Mes commandes**
- Suivre l'état de ses commandes en temps réel (Nouvelle, Confirmée, En livraison, Terminée)
- Confirmer la réception d'une commande une fois livrée
- Laisser un avis avec une note de 1 à 5 étoiles et un commentaire

**Profil**
- Consulter ses informations de compte

---

## 3. Interface Fournisseurs
**Lien :** https://egg-shipment-fournisseur.vercel.app

C'est l'espace réservé aux personnes qui livrent les plateaux d'œufs au vendeur.

### Première utilisation
1. Aller sur le lien fournisseur
2. Cliquer sur **"Créer un compte fournisseur"**
3. Remplir le formulaire (prénom, nom, numéro de téléphone, mot de passe)
   > Attention : une fois le compte créé, ces informations ne peuvent plus être modifiées. Vérifiez bien avant de valider.
4. Une fois inscrit, le fournisseur est automatiquement connecté

### Ce que le fournisseur peut faire

**Tableau de bord**
- Voir son stock disponible (nombre de plateaux qu'il lui reste à livrer)
- Voir le total de plateaux livrés depuis le début
- Voir la valeur totale de ses livraisons en FCFA
- **Réapprovisionner** : déclarer un nouveau stock reçu avant de faire une livraison

**Livraisons**
- Enregistrer une nouvelle livraison : indiquer la quantité, le prix unitaire et une note optionnelle
- Le montant total se calcule automatiquement avant validation
- Chaque livraison enregistrée **met à jour le stock du vendeur en temps réel**
- Consulter l'historique complet de toutes ses livraisons

> **Comment ça fonctionne :** Le fournisseur doit d'abord déclarer son stock disponible (via "Réapprovisionner"), puis enregistrer ses livraisons dans la limite de ce stock. Dès qu'une livraison est validée, le vendeur en est notifié instantanément et son stock augmente automatiquement.

---

## 4. Comment tout démarrer (ordre recommandé)

Voici l'ordre logique pour lancer la plateforme depuis zéro :

1. **Créer le compte vendeur** sur https://egg-shipment-seller.vercel.app
2. **Configurer les tarifs** (au moins un tarif actif pour que les clients puissent commander)
3. **Configurer les modes de paiement** acceptés
4. **Définir le seuil d'alerte de stock**
5. **Ouvrir la boutique** via la page Disponibilités
6. **Créer les comptes fournisseurs** (ou les laisser s'inscrire eux-mêmes)
7. **Les fournisseurs déclarent leur stock** et enregistrent les premières livraisons
8. **Les clients s'inscrivent** et passent commande

---

## 5. Informations techniques

- Le backend (serveur) est hébergé sur **Render**
- Les trois frontends sont hébergés sur **Vercel**
- La base de données est sur **MongoDB Atlas**
- Les notifications en temps réel fonctionnent via **Socket.io**
- Les numéros de téléphone doivent être au format béninois : **+229 01 XX XX XX XX**

---

*Fait par Olympe HOUNKPEVI*
