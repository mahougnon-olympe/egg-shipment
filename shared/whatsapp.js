export const lienWhatsApp = (numero, message) => {
  const num = numero.replace(/[^0-9]/g, '');
  const texte = encodeURIComponent(message);
  return `https://wa.me/${num}?text=${texte}`;
};

export const lienAppel = (numero) => `tel:${numero.replace(/\s/g, '')}`;

export const lienSMS = (numero, message = '') => {
  const num = numero.replace(/\s/g, '');
  return message ? `sms:${num}?body=${encodeURIComponent(message)}` : `sms:${num}`;
};

export const messageCommande = (commande, adresseRetrait = '') => {
  const mode = commande.modeReception === 'livraison'
    ? `Livraison\nLieu : ${commande.lieuLivraison}`
    : `Retrait sur place\nAdresse : ${adresseRetrait}`;

  return `Bonjour, je souhaite commander ${commande.nbPlateaux} plateau(x) d'œufs à ${commande.prixUnitaire} FCFA/plateau (${commande.tarifLabel}).
Montant total : ${commande.montantTotal} FCFA
Mode : ${mode}
Nom : ${commande.clientPrenom} ${commande.clientNom}
Numéro : ${commande.clientWhatsapp}`;
};
