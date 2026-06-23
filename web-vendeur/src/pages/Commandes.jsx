import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { socket } from '../socket';
import { lienWhatsApp } from '../../../shared/whatsapp';

const STATUTS = {
  nouvelle: { label: 'Nouvelle', bg: '#3B82F6' },
  confirmée: { label: 'Confirmée', bg: '#10B981' },
  en_livraison: { label: 'En livraison', bg: '#F59E0B' },
  terminée: { label: 'Terminée', bg: '#6B7280' },
  annulée: { label: 'Annulée', bg: '#EF4444' },
};

const TRANSITIONS = {
  nouvelle: ['confirmée', 'annulée'],
  confirmée: ['en_livraison', 'annulée'],
  en_livraison: ['terminée', 'annulée'],
};

export default function Commandes() {
  const [commandes, setCommandes] = useState([]);
  const [filtre, setFiltre] = useState('');

  const charger = () => api.get('/commandes').then(setCommandes).catch(console.error);
  const changerStatut = async (id, statut) => {
    await api.patch(`/commandes/${id}/statut`, { statut });
  };

  useEffect(() => {
    charger();
    const onNouvelle = (cmd) => setCommandes(prev => [cmd, ...prev]);
    const onStatut = ({ commandeId, statut }) =>
      setCommandes(prev => prev.map(c => c._id === commandeId ? { ...c, statut } : c));
    socket.on('nouvelle_commande', onNouvelle);
    socket.on('statut_commande', onStatut);
    return () => { socket.off('nouvelle_commande', onNouvelle); socket.off('statut_commande', onStatut); };
  }, []);

  const liste = filtre ? commandes.filter(c => c.statut === filtre) : commandes;

  return (
    <>
      <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Commandes</h1>
        <select value={filtre} onChange={e => setFiltre(e.target.value)} style={{ width: 'auto' }}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {liste.length === 0 && <p className="text-muted">Aucune commande.</p>}
      {liste.map(c => (
        <div className="card" key={c._id}>
          <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
            <strong>{c.clientPrenom} {c.clientNom}</strong>
            <span className="badge" style={{ background: STATUTS[c.statut]?.bg }}>{STATUTS[c.statut]?.label}</span>
          </div>
          <p>{c.nbPlateaux} plateau{c.nbPlateaux > 1 ? 'x' : ''} · {c.tarifLabel} · <strong>{c.montantTotal.toLocaleString('fr-FR')} FCFA</strong></p>
          <p className="text-muted">{c.modeReception === 'livraison' ? `Livraison : ${c.lieuLivraison}` : 'Retrait'} · {new Date(c.createdAt).toLocaleString('fr-FR')}</p>
          <div className="flex gap-1" style={{ marginTop: 8, flexWrap: 'wrap' }}>
            {(TRANSITIONS[c.statut] || []).map(s => (
              <button key={s} className="btn-primary btn-sm" onClick={() => changerStatut(c._id, s)}>
                → {STATUTS[s]?.label}
              </button>
            ))}
            <a href={lienWhatsApp(c.clientWhatsapp, `Bonjour ${c.clientPrenom} !`)} target="_blank" rel="noopener noreferrer">
              <button className="btn-ghost btn-sm">WhatsApp ({c.clientWhatsapp})</button>
            </a>
          </div>
        </div>
      ))}
    </>
  );
}
