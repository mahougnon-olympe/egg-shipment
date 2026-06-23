export const formatFCFA = (montant) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(montant);

export const STATUTS = {
  nouvelle: { label: 'Nouvelle', color: '#3B82F6' },
  confirmée: { label: 'Confirmée', color: '#10B981' },
  en_livraison: { label: 'En livraison', color: '#F59E0B' },
  terminée: { label: 'Terminée', color: '#6B7280' },
  annulée: { label: 'Annulée', color: '#EF4444' },
};
