import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { socket } from '../socket';

export default function Dashboard() {
  const [stats, setStats] = useState({ soldeDisponible: 0, totalLivre: 0, valeurLivree: 0 });
  const [recentes, setRecentes] = useState([]);
  const [appro, setAppro] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const charger = async () => {
    const [s, l] = await Promise.all([
      api.get('/livraisons/stats'),
      api.get('/livraisons'),
    ]);
    setStats(s);
    setRecentes(l.slice(0, 5));
  };

  useEffect(() => {
    charger();
    const onLivraison = () => charger();
    socket.on('nouvelle_livraison', onLivraison);
    return () => socket.off('nouvelle_livraison', onLivraison);
  }, []);

  const approvisionner = async (e) => {
    e.preventDefault();
    setErr('');
    const q = Number(appro);
    if (!q || q < 1) return setErr('Quantité invalide');
    try {
      await api.post('/livraisons/approvisionner', { quantite: q });
      setAppro('');
      setMsg(`+${q} plateau(x) ajoutés au stock`);
      setTimeout(() => setMsg(''), 2500);
      charger();
    } catch (e) { setErr(e.message); }
  };

  const stockColor = stats.soldeDisponible === 0 ? '#B0413E' : stats.soldeDisponible < 10 ? '#D97706' : '#E0A516';

  return (
    <>
      <h1>Tableau de bord</h1>

      <div className="grid-3">
        <div className="stat-card">
          <div className="value" style={{ color: stockColor }}>{stats.soldeDisponible}</div>
          <div className="label">Stock disponible (plateaux)</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.totalLivre}</div>
          <div className="label">Total livré (plateaux)</div>
        </div>
        <div className="stat-card">
          <div className="value" style={{ fontSize: '1.4rem' }}>{stats.valeurLivree.toLocaleString('fr-FR')}</div>
          <div className="label">Valeur livrée (FCFA)</div>
        </div>
      </div>

      {stats.soldeDisponible === 0 && (
        <div className="alert alert-warning">Stock épuisé — approvisionnez avant d'enregistrer une livraison.</div>
      )}

      <div className="card" style={{ maxWidth: 400 }}>
        <h2>Réapprovisionner</h2>
        <p className="text-muted" style={{ marginBottom: 12 }}>Ajoutez des plateaux reçus à votre stock disponible.</p>
        <form onSubmit={approvisionner} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Quantité reçue (plateaux)</label>
            <input
              type="number" min={1}
              value={appro}
              onChange={e => setAppro(e.target.value)}
              placeholder="Ex : 50"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Ajouter</button>
        </form>
        {msg && <p style={{ color: '#3A7D44', marginTop: 8, fontSize: '.875rem' }}>{msg}</p>}
        {err && <p className="error" style={{ marginTop: 8 }}>{err}</p>}
      </div>

      {recentes.length > 0 && (
        <>
          <h2>Livraisons récentes</h2>
          {recentes.map(l => (
            <div className="card" key={l._id}>
              <div className="flex justify-between items-center">
                <strong style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                  {l.quantite} plateau{l.quantite > 1 ? 'x' : ''}
                </strong>
                <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, color: '#E0A516' }}>
                  {l.montantTotal.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <p className="text-muted" style={{ marginTop: 4 }}>
                {l.prixUnitaire.toLocaleString('fr-FR')} FCFA/plateau
                {l.note && <span> · {l.note}</span>}
              </p>
              <p style={{ color: '#8B7355', fontSize: '.78rem', marginTop: 4 }}>
                {new Date(l.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
          ))}
        </>
      )}
    </>
  );
}
