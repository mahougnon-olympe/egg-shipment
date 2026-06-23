import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { socket } from '../socket';

const STATUTS = {
  nouvelle:     { label: 'Nouvelle',     bg: '#E0A516' },
  confirmée:    { label: 'Confirmée',    bg: '#3A7D44' },
  en_livraison: { label: 'En livraison', bg: '#D97706' },
  terminée:     { label: 'Livrée',       bg: '#8B7355' },
  annulée:      { label: 'Annulée',      bg: '#B0413E' },
};

function Etoiles({ note, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange && onChange(n)}
          style={{
            background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default',
            fontSize: '1.5rem', padding: '0 1px', lineHeight: 1,
            color: n <= note ? '#E0A516' : 'rgba(61,47,35,0.18)',
          }}
        >★</button>
      ))}
    </div>
  );
}

function CarteCommande({ c, onConfirmer, onAvis }) {
  const [afficherAvis, setAfficherAvis] = useState(false);
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [errAvis, setErrAvis] = useState('');

  const peutConfirmer = c.statut === 'terminée' && !c.receptionConfirmee;
  const peutDonnerAvis = c.receptionConfirmee && !c.avis?.note;

  const soumettre = async (e) => {
    e.preventDefault();
    if (note === 0) { setErrAvis('Choisissez une note'); return; }
    setErrAvis('');
    await onAvis(c._id, note, commentaire);
  };

  return (
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

      {peutConfirmer && (
        <button
          className="btn-primary btn-sm"
          style={{ marginTop: 12 }}
          onClick={() => onConfirmer(c._id)}
        >
          Confirmer la réception
        </button>
      )}

      {c.receptionConfirmee && (
        <p style={{ marginTop: 10, fontSize: '.82rem', color: '#3A7D44', fontWeight: 600 }}>
          Réception confirmée
        </p>
      )}

      {peutDonnerAvis && !afficherAvis && (
        <button
          className="btn-ghost btn-sm"
          style={{ marginTop: 6 }}
          onClick={() => setAfficherAvis(true)}
        >
          Laisser un avis
        </button>
      )}

      {peutDonnerAvis && afficherAvis && (
        <form onSubmit={soumettre} style={{ marginTop: 12, borderTop: '1px solid rgba(61,47,35,0.08)', paddingTop: 12 }}>
          <p style={{ fontSize: '.875rem', fontWeight: 600, marginBottom: 8 }}>Votre avis</p>
          <Etoiles note={note} onChange={setNote} />
          <div className="form-group" style={{ marginTop: 10 }}>
            <label>Commentaire (optionnel)</label>
            <textarea
              value={commentaire}
              onChange={e => setCommentaire(e.target.value)}
              rows={2}
              style={{ resize: 'vertical' }}
              placeholder="Qualité, livraison, service…"
            />
          </div>
          {errAvis && <p className="error">{errAvis}</p>}
          <button type="submit" className="btn-primary btn-sm">Envoyer</button>
        </form>
      )}

      {c.avis?.note && (
        <div style={{ marginTop: 12, borderTop: '1px solid rgba(61,47,35,0.08)', paddingTop: 12 }}>
          <Etoiles note={c.avis.note} />
          {c.avis.commentaire && (
            <p className="text-muted" style={{ marginTop: 4, fontSize: '.85rem' }}>{c.avis.commentaire}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function MesCommandes() {
  const [commandes, setCommandes] = useState([]);

  const charger = () => api.get('/commandes').then(setCommandes).catch(console.error);

  useEffect(() => {
    charger();
    const onStatut = ({ commandeId, statut }) => {
      setCommandes(prev => prev.map(c => c._id === commandeId ? { ...c, statut } : c));
    };
    const onReception = ({ commandeId }) => {
      setCommandes(prev => prev.map(c => c._id === commandeId ? { ...c, receptionConfirmee: true } : c));
    };
    const onAvis = ({ commandeId, avis }) => {
      setCommandes(prev => prev.map(c => c._id === commandeId ? { ...c, avis } : c));
    };
    socket.on('statut_commande', onStatut);
    socket.on('reception_confirmee', onReception);
    socket.on('avis_commande', onAvis);
    return () => {
      socket.off('statut_commande', onStatut);
      socket.off('reception_confirmee', onReception);
      socket.off('avis_commande', onAvis);
    };
  }, []);

  const confirmerReception = async (id) => {
    try {
      await api.patch(`/commandes/${id}/confirmer`);
      setCommandes(prev => prev.map(c => c._id === id ? { ...c, receptionConfirmee: true } : c));
    } catch (e) {
      alert(e.message);
    }
  };

  const soumettreAvis = async (id, note, commentaire) => {
    try {
      const updated = await api.post(`/commandes/${id}/avis`, { note, commentaire });
      setCommandes(prev => prev.map(c => c._id === id ? { ...c, avis: updated.avis } : c));
    } catch (e) {
      alert(e.message);
    }
  };

  if (!commandes.length) return <p className="text-muted" style={{ paddingTop: '2rem' }}>Aucune commande pour l'instant.</p>;

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <h1>Mes commandes</h1>
      {commandes.map(c => (
        <CarteCommande key={c._id} c={c} onConfirmer={confirmerReception} onAvis={soumettreAvis} />
      ))}
    </div>
  );
}
