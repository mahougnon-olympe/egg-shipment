# Présentation de la plateforme

**Egg Shipment** est une application web complète de commande et livraison d'œufs, composée de deux interfaces distinctes et déployées séparément.

**Interface client** — Le client s'inscrit en quelques secondes (prénom, nom, numéro WhatsApp, mot de passe), puis accède à une boutique où il voit les tarifs disponibles, choisit sa quantité, son mode de réception (livraison à domicile ou retrait sur place) et son mode de paiement (Mobile Money ou espèces), avant de confirmer sa commande et de suivre son avancement en temps réel.

**Interface vendeur** — Le vendeur crée son compte (une seule boutique possible par plateforme), configure ses tarifs avec les stocks disponibles par gamme, définit ses jours et horaires d'ouverture ainsi que ses modes de paiement acceptés, puis gère les commandes entrantes depuis un tableau de bord mis à jour en temps réel, avec notifications sonores à chaque nouvelle commande.

**Connexion et inscription** — Les deux interfaces ont chacune leur propre page de connexion et d'inscription ; aucun compte partagé n'est possible entre client et vendeur. Un client ne peut pas accéder à l'espace vendeur, et vice-versa.

**Ce qui est inclus dans la livraison** — Le code source complet (backend Node.js/MongoDB, frontend React pour le client, frontend React pour le vendeur), la configuration de déploiement Vercel et Railway, et toutes les fonctionnalités déjà opérationnelles : gestion des stocks par tarif, confirmation de réception côté client, système d'avis avec note en étoiles, intégration WhatsApp, et notifications en temps réel via Socket.io.
