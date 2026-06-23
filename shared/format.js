export const formatFCFA = (montant) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(montant);

export const STATUTS = {
  nouvelle:    { label: 'Nouvelle',     color: '#E0A516' },
  confirmée:   { label: 'Confirmée',    color: '#3A7D44' },
  en_livraison:{ label: 'En livraison', color: '#D97706' },
  terminée:    { label: 'Terminée',     color: '#8B7355' },
  annulée:     { label: 'Annulée',      color: '#B0413E' },
};
