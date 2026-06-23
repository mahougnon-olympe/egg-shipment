let admin;

function getAdmin() {
  if (admin) return admin;
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
  try {
    const firebaseAdmin = require('firebase-admin');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (!firebaseAdmin.apps.length) {
      firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(serviceAccount) });
    }
    admin = firebaseAdmin;
    return admin;
  } catch (e) {
    console.warn('FCM non configuré :', e.message);
    return null;
  }
}

exports.envoyerNotifVendeur = async (fcmToken, commande) => {
  const a = getAdmin();
  if (!a) return;
  await a.messaging().send({
    token: fcmToken,
    notification: {
      title: 'Nouvelle commande !',
      body: `${commande.clientPrenom} ${commande.clientNom} — ${commande.nbPlateaux} plateau(x) — ${commande.montantTotal} FCFA`,
    },
    data: { commandeId: String(commande._id), type: 'nouvelle_commande' },
  });
};

exports.envoyerNotifClient = async (fcmToken, commande, statut) => {
  const a = getAdmin();
  if (!a) return;
  const messages = {
    confirmée: 'Votre commande a été confirmée !',
    en_livraison: 'Votre commande est en cours de livraison.',
    terminée: 'Votre commande a été livrée. Merci !',
    annulée: 'Votre commande a été annulée.',
  };
  await a.messaging().send({
    token: fcmToken,
    notification: {
      title: 'Mise à jour de commande',
      body: messages[statut] || `Statut : ${statut}`,
    },
    data: { commandeId: String(commande._id), statut },
  });
};
