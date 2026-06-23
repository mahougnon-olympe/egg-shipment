import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { socket } from '../socket';
import { lienWhatsApp } from '../../../shared/whatsapp';

const STATUTS = {
  nouvelle:     { label: 'Nouvelle',     bg: '#E0A516' },
  confirmée:    { label: 'Confirmée',    bg: '#3A7D44' },
  en_livraison: { label: 'En livraison', bg: '#D97706' },
  terminée:     { label: 'Terminée',     bg: '#8B7355' },
  annulée:      { label: 'Annulée',      bg: '#B0413E' },
};

const TRANSITIONS = {
  nouvelle:     ['confirmée', 'annulée'],
  confirmée:    ['en_livraison', 'annulée'],
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
    setCommandes(prev => prev.map(c => c._id === id ? { ...c, statut } : c));
    if (statut === 'confirmée') charger();
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
    const onReception = ({ commandeId }) => {
      setCommandes(prev => prev.map(c => c._id === commandeId ? { ...c, receptionConfirmee: true } : c));
    };
    const onAvis = ({ commandeId, avis }) => {
      setCommandes(prev => prev.map(c => c._id === commandeId ? { ...c, avis } : c));
    };
    socket.on('nouvelle_commande', onNouvelle);
    socket.on('statut_commande', onStatut);
    socket.on('maj_boutique', onBoutique);
    socket.on('reception_confirmee', onReception);
    socket.on('avis_commande', onAvis);
    return () => {
      socket.off('nouvelle_commande', onNouvelle);
      socket.off('statut_commande', onStatut);
      socket.off('maj_boutique', onBoutique);
      socket.off('reception_confirmee', onReception);
      socket.off('avis_commande', onAvis);
    };
  }, []);

  const aujourd = commandes.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString());
  const totalJour = aujourd.filter(c => c.statut !== 'annulée').reduce((s, c) => s + c.montantTotal, 0);

  const stockColor = stock
    ? stock.soldeDisponible <= stock.seuilAlerte ? '#B0413E' : '#E0A516'
    : '#E0A516';

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
          <div className="value" style={{ color: stockColor }}>{stock?.soldeDisponible ?? '—'}</div>
          <div className="label">Plateaux en stock</div>
        </div>
      </div>

      {stock && stock.soldeDisponible <= stock.seuilAlerte && (
        <div className="alert alert-warning">Stock bas — il reste {stock.soldeDisponible} plateau(x).</div>
      )}

      <h2>Commandes récentes</h2>
      {commandes.length === 0 && <p className="text-muted">Aucune commande pour l'instant.</p>}
      {commandes.map(c => (
        <div className="card" key={c._id}>
          <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
            <div>
              <strong style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{c.clientPrenom} {c.clientNom}</strong>
              <span className="text-muted" style={{ marginLeft: 8, fontSize: '.8rem' }}>
                {new Date(c.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <span className="badge" style={{ background: STATUTS[c.statut]?.bg }}>{STATUTS[c.statut]?.label}</span>
          </div>
          <p style={{ fontSize: '.9rem' }}>
            {c.nbPlateaux} plateau{c.nbPlateaux > 1 ? 'x' : ''} · {c.tarifLabel} ·{' '}
            <strong style={{ color: '#E0A516' }}>{c.montantTotal.toLocaleString('fr-FR')} FCFA</strong>
          </p>
          <p className="text-muted" style={{ marginTop: 2 }}>
            {c.modeReception === 'livraison' ? `Livraison : ${c.lieuLivraison}` : 'Retrait sur place'}
            {c.modePaiement && (
              <span style={{ marginLeft: 8 }}>
                · {c.modePaiement === 'mobile_money' ? 'Mobile Money' : c.modePaiement === 'liquide' ? 'Espèces' : c.modePaiement}
              </span>
            )}
          </p>
          <div className="flex gap-1" style={{ marginTop: 10, flexWrap: 'wrap' }}>
            {(TRANSITIONS[c.statut] || []).map(s => (
              <button key={s} className="btn-primary btn-sm" onClick={() => changerStatut(c._id, s)}>
                {STATUTS[s]?.label}
              </button>
            ))}
            <a href={lienWhatsApp(c.clientWhatsapp, `Bonjour ${c.clientPrenom}, votre commande de ${c.nbPlateaux} plateau(x) est ${STATUTS[c.statut]?.label?.toLowerCase()}.`)} target="_blank" rel="noopener noreferrer">
              <button className="btn-ghost btn-sm">WhatsApp</button>
            </a>
          </div>
          {c.avis?.note && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(61,47,35,0.08)' }}>
              <span style={{ fontSize: '.8rem', color: '#8B7355' }}>Avis client : </span>
              <span style={{ color: '#E0A516' }}>{'★'.repeat(c.avis.note)}{'☆'.repeat(5 - c.avis.note)}</span>
              {c.avis.commentaire && <p style={{ fontSize: '.82rem', color: '#8B7355', marginTop: 3 }}>« {c.avis.commentaire} »</p>}
            </div>
          )}
          {c.statut === 'terminée' && !c.receptionConfirmee && (
            <p style={{ fontSize: '.78rem', color: '#D97706', marginTop: 8 }}>En attente de confirmation client</p>
          )}
          {c.receptionConfirmee && !c.avis?.note && (
            <p style={{ fontSize: '.78rem', color: '#3A7D44', marginTop: 8 }}>Réception confirmée — avis en attente</p>
          )}
        </div>
      ))}
    </>
  );
}
