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
  if (!boutique) return <p className="text-muted mt-2">Chargement…</p>;

  const { ouvert, stock, tarifs, disponibilites: dispo } = boutique;
  const auMoinsUnTarifDispo = tarifs.some(t => (t.stockDisponible ?? 0) > 0);

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <h1>Boutique œufs frais</h1>

      <div className="card">
        <div className="flex justify-between items-center">
          <span style={{ fontWeight: 600 }}>Statut</span>
          <span className="badge" style={{ background: ouvert ? '#3A7D44' : '#B0413E' }}>
            {ouvert ? 'Ouvert' : 'Fermé'}
          </span>
        </div>
        {dispo && (
          <p className="text-muted" style={{ marginTop: 6 }}>
            {dispo.jours.join(', ')} · {dispo.heureDebut} – {dispo.heureFin}
          </p>
        )}
      </div>

      <div className="card">
        <span style={{ fontWeight: 600, fontSize: '.875rem', color: '#8B7355', textTransform: 'uppercase', letterSpacing: '.04em' }}>Stock disponible</span>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2rem', fontWeight: 700, color: '#E0A516', marginTop: 4, lineHeight: 1 }}>
          {stock.soldeDisponible}
          <span style={{ fontSize: '1rem', fontWeight: 400, color: '#8B7355', marginLeft: 6 }}>plateau{stock.soldeDisponible > 1 ? 'x' : ''}</span>
        </p>
      </div>

      <h2>Tarifs disponibles</h2>
      {tarifs.length === 0 && <p className="text-muted">Aucun tarif actif pour le moment.</p>}
      {tarifs.map(t => (
        <div className="card flex justify-between items-center" key={t._id}>
          <div>
            <strong style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{t.label}</strong>
            <p style={{ color: '#E0A516', fontWeight: 700, marginTop: 2 }}>
              {t.prixUnitaire.toLocaleString('fr-FR')} FCFA
              <span style={{ color: '#8B7355', fontWeight: 400, fontSize: '.875rem' }}> / plateau</span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {t.stockDisponible > 0
              ? <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, color: '#3A7D44', fontSize: '1.1rem' }}>{t.stockDisponible}</span>
              : <span style={{ fontWeight: 600, color: '#B0413E', fontSize: '.82rem' }}>Rupture</span>
            }
            {t.stockDisponible > 0 && <p style={{ fontSize: '.75rem', color: '#8B7355', marginTop: 1 }}>dispo</p>}
          </div>
        </div>
      ))}

      <button
        className="btn-primary mt-2"
        onClick={() => navigate('/commander')}
        disabled={!ouvert || !auMoinsUnTarifDispo}
      >
        {!ouvert ? 'Boutique fermée' : !auMoinsUnTarifDispo ? 'Rupture de stock' : 'Commander'}
      </button>
    </div>
  );
}
