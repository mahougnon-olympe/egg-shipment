import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { socket } from '../socket';

const STATUTS = {
  nouvelle: { label: 'Nouvelle', bg: '#3B82F6' },
  confirmée: { label: 'Confirmée', bg: '#10B981' },
  en_livraison: { label: 'En livraison', bg: '#F59E0B' },
  terminée: { label: 'Terminée', bg: '#6B7280' },
  annulée: { label: 'Annulée', bg: '#EF4444' },
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

  if (!commandes.length) return <p style={{ paddingTop: '2rem', color: '#9CA3AF' }}>Aucune commande pour l'instant.</p>;

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <h1>Mes commandes</h1>
      {commandes.map(c => (
        <div className="card" key={c._id}>
          <div className="flex justify-between items-center">
            <strong>{c.nbPlateaux} plateau{c.nbPlateaux > 1 ? 'x' : ''} · {c.montantTotal.toLocaleString('fr-FR')} FCFA</strong>
            <span className="badge" style={{ background: STATUTS[c.statut]?.bg || '#9CA3AF' }}>
              {STATUTS[c.statut]?.label || c.statut}
            </span>
          </div>
          <p style={{ color: '#6B7280', fontSize: '.85rem', marginTop: 4 }}>
            {c.tarifLabel} · {c.modeReception === 'livraison' ? `Livraison : ${c.lieuLivraison}` : 'Retrait sur place'}
          </p>
          <p style={{ color: '#9CA3AF', fontSize: '.8rem' }}>{new Date(c.createdAt).toLocaleString('fr-FR')}</p>
        </div>
      ))}
    </div>
  );
}
