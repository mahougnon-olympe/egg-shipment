import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { socket } from '../socket';

const STATUTS = {
  nouvelle:     { label: 'Nouvelle',     bg: '#E0A516' },
  confirmée:    { label: 'Confirmée',    bg: '#3A7D44' },
  en_livraison: { label: 'En livraison', bg: '#D97706' },
  terminée:     { label: 'Terminée',     bg: '#8B7355' },
  annulée:      { label: 'Annulée',      bg: '#B0413E' },
};

export default function MesCommandes() {
  const [commandes, setCommandes] = useState([]);

  const charger = () => api.get('/commandes').then(setCommandes).catch(console.error);

  useEffect(() => {
    charger();
    const onStatut = ({ commandeId, statut }) => {
      setCommandes(prev => prev.map(c => c._id === commandeId ? { ...c, statut } : c));
    };
    socket.on('statut_commande', onStatut);
    return () => socket.off('statut_commande', onStatut);
  }, []);

  if (!commandes.length) return <p className="text-muted" style={{ paddingTop: '2rem' }}>Aucune commande pour l'instant.</p>;

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <h1>Mes commandes</h1>
      {commandes.map(c => (
        <div className="card" key={c._id}>
          <div className="flex justify-between items-center">
            <strong style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {c.nbPlateaux} plateau{c.nbPlateaux > 1 ? 'x' : ''} · {c.montantTotal.toLocaleString('fr-FR')} FCFA
            </strong>
            <span className="badge" style={{ background: STATUTS[c.statut]?.bg || '#8B7355' }}>
              {STATUTS[c.statut]?.label || c.statut}
            </span>
          </div>
          <p className="text-muted" style={{ marginTop: 6 }}>
            {c.tarifLabel} · {c.modeReception === 'livraison' ? `Livraison : ${c.lieuLivraison}` : 'Retrait sur place'}
          </p>
          <p style={{ color: '#8B7355', fontSize: '.8rem', marginTop: 4 }}>{new Date(c.createdAt).toLocaleString('fr-FR')}</p>
        </div>
      ))}
    </div>
  );
}
