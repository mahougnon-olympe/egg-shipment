import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { socket } from '../socket';

export default function Accueil() {
  const [boutique, setBoutique] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const charger = async () => {
    try { setBoutique(await api.get('/boutique')); }
    catch (e) { setError(e.message); }
  };

  useEffect(() => {
    charger();
    socket.on('maj_boutique', charger);
    return () => socket.off('maj_boutique', charger);
  }, []);

  if (error) return <p className="error mt-2">{error}</p>;
  if (!boutique) return <p className="mt-2">Chargement…</p>;

  const { vendeur, ouvert, stock, tarifs, disponibilites: dispo } = boutique;

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <h1>🥚 Boutique œufs</h1>

      <div className="card">
        <div className="flex justify-between items-center">
          <span style={{ fontWeight: 600 }}>Statut</span>
          <span className="badge" style={{ background: ouvert ? '#10B981' : '#EF4444' }}>
            {ouvert ? 'Ouvert' : 'Fermé'}
          </span>
        </div>
        {dispo && (
          <p style={{ color: '#6B7280', fontSize: '.85rem', marginTop: 4 }}>
            {dispo.jours.join(', ')} · {dispo.heureDebut} – {dispo.heureFin}
          </p>
        )}
      </div>

      <div className="card">
        <span style={{ fontWeight: 600 }}>Stock disponible</span>
        <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F97316', marginTop: 4 }}>
          {stock.soldeDisponible} plateau{stock.soldeDisponible > 1 ? 'x' : ''}
        </p>
      </div>

      <h2>Tarifs disponibles</h2>
      {tarifs.length === 0 && <p style={{ color: '#9CA3AF' }}>Aucun tarif actif pour le moment.</p>}
      {tarifs.map(t => (
        <div className="card flex justify-between items-center" key={t._id}>
          <div>
            <strong>{t.label}</strong>
            <p style={{ color: '#F97316', fontWeight: 700 }}>{t.prixUnitaire.toLocaleString('fr-FR')} FCFA / plateau</p>
          </div>
        </div>
      ))}

      <button
        className="btn-primary mt-2"
        onClick={() => navigate('/commander')}
        disabled={!ouvert || stock.soldeDisponible === 0}
      >
        {!ouvert ? 'Boutique fermée' : stock.soldeDisponible === 0 ? 'Rupture de stock' : 'Commander'}
      </button>
    </div>
  );
}
