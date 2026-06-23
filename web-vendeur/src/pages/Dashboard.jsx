import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { socket } from '../socket';
import { lienWhatsApp } from '../../../../shared/whatsapp';

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

export default function Dashboard() {
  const [commandes, setCommandes] = useState([]);
  const [stock, setStock] = useState(null);
  const [notifSon] = useState(() => {
    try { return new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'); } catch { return null; }
  });

  const charger = async () => {
    const [c, s] = await Promise.all([api.get('/commandes'), api.get('/stock')]);
    setCommandes(c);
    setStock(s);
  };

  const changerStatut = async (id, statut) => {
    await api.patch(`/commandes/${id}/statut`, { statut });
  };

  useEffect(() => {
    charger();
    const onNouvelle = (cmd) => {
      setCommandes(prev => [cmd, ...prev]);
      notifSon?.play().catch(() => {});
    };
    const onStatut = ({ commandeId, statut }) => {
      setCommandes(prev => prev.map(c => c._id === commandeId ? { ...c, statut } : c));
      if (statut === 'confirmée') charger();
    };
    const onBoutique = ({ type }) => {
      if (type === 'stock_maj') api.get('/stock').then(setStock).catch(() => {});
    };
    socket.on('nouvelle_commande', onNouvelle);
    socket.on('statut_commande', onStatut);
    socket.on('maj_boutique', onBoutique);
    return () => {
      socket.off('nouvelle_commande', onNouvelle);
      socket.off('statut_commande', onStatut);
      socket.off('maj_boutique', onBoutique);
    };
  }, []);

  const aujourd = commandes.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString());
  const totalJour = aujourd.filter(c => c.statut !== 'annulée').reduce((s, c) => s + c.montantTotal, 0);

  return (
    <>
      <h1>Tableau de bord</h1>
      <div className="grid-3">
        <div className="stat-card">
          <div className="value">{aujourd.length}</div>
          <div className="label">Commandes du jour</div>
        </div>
        <div className="stat-card">
          <div className="value">{totalJour.toLocaleString('fr-FR')}</div>
          <div className="label">FCFA attendus</div>
        </div>
        <div className="stat-card">
          <div className="value" style={{ color: stock?.soldeDisponible <= (stock?.seuilAlerte || 10) ? '#EF4444' : '#F97316' }}>
            {stock?.soldeDisponible ?? '—'}
          </div>
          <div className="label">Plateaux en stock</div>
        </div>
      </div>

      {stock && stock.soldeDisponible <= stock.seuilAlerte && (
        <div className="alert alert-warning">Stock bas ! Il reste {stock.soldeDisponible} plateau(x).</div>
      )}

      <h2>Commandes récentes</h2>
      {commandes.length === 0 && <p className="text-muted">Aucune commande pour l'instant.</p>}
      {commandes.map(c => (
        <div className="card" key={c._id}>
          <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
            <div>
              <strong>{c.clientPrenom} {c.clientNom}</strong>
              <span className="text-muted" style={{ marginLeft: 8 }}>{new Date(c.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <span className="badge" style={{ background: STATUTS[c.statut]?.bg }}>{STATUTS[c.statut]?.label}</span>
          </div>
          <p>{c.nbPlateaux} plateau{c.nbPlateaux > 1 ? 'x' : ''} · {c.tarifLabel} · <strong>{c.montantTotal.toLocaleString('fr-FR')} FCFA</strong></p>
          <p className="text-muted">{c.modeReception === 'livraison' ? `Livraison : ${c.lieuLivraison}` : 'Retrait sur place'}</p>
          <div className="flex gap-1" style={{ marginTop: 8, flexWrap: 'wrap' }}>
            {(TRANSITIONS[c.statut] || []).map(s => (
              <button key={s} className="btn-primary btn-sm" onClick={() => changerStatut(c._id, s)}>
                → {STATUTS[s]?.label}
              </button>
            ))}
            <a href={lienWhatsApp(c.clientWhatsapp, `Bonjour ${c.clientPrenom}, votre commande de ${c.nbPlateaux} plateau(x) est ${STATUTS[c.statut]?.label?.toLowerCase()}.`)} target="_blank" rel="noopener noreferrer">
              <button className="btn-ghost btn-sm">WhatsApp</button>
            </a>
          </div>
        </div>
      ))}
    </>
  );
}
