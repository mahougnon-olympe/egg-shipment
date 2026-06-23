import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { socket } from '../socket';

export default function Livraisons() {
  const [livraisons, setLivraisons] = useState([]);
  const [stock, setStock] = useState(0);
  const [form, setForm] = useState({ quantite: '', prixUnitaire: '', note: '' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const charger = async () => {
    const [l, s] = await Promise.all([
      api.get('/livraisons'),
      api.get('/livraisons/stats'),
    ]);
    setLivraisons(l);
    setStock(s.soldeDisponible);
  };

  useEffect(() => {
    charger();
    const onLivraison = () => charger();
    socket.on('nouvelle_livraison', onLivraison);
    return () => socket.off('nouvelle_livraison', onLivraison);
  }, []);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const montantPreview = form.quantite && form.prixUnitaire
    ? (Number(form.quantite) * Number(form.prixUnitaire)).toLocaleString('fr-FR')
    : null;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const q = Number(form.quantite);
    const p = Number(form.prixUnitaire);
    if (!q || q < 1) return setErr('Quantité invalide');
    if (!p || p < 0) return setErr('Prix invalide');
    if (q > stock) return setErr(`Stock insuffisant — ${stock} plateau(x) disponible(s)`);
    setSubmitting(true);
    try {
      await api.post('/livraisons', { quantite: q, prixUnitaire: p, note: form.note });
      setForm({ quantite: '', prixUnitaire: '', note: '' });
      setMsg('Livraison enregistrée avec succès');
      setTimeout(() => setMsg(''), 3000);
      charger();
    } catch (e) { setErr(e.message); }
    finally { setSubmitting(false); }
  };

  const totalPlateaux = livraisons.reduce((s, l) => s + l.quantite, 0);
  const totalValeur = livraisons.reduce((s, l) => s + l.montantTotal, 0);

  return (
    <>
      <h1>Livraisons</h1>

      <div className="card" style={{ maxWidth: 480 }}>
        <h2>Enregistrer une livraison</h2>
        <p className="text-muted" style={{ marginBottom: 14 }}>
          Stock disponible : <strong style={{ color: stock === 0 ? '#B0413E' : '#3D2F23' }}>{stock} plateau{stock !== 1 ? 'x' : ''}</strong>
        </p>

        {stock === 0 && (
          <div className="alert alert-warning" style={{ marginBottom: 12 }}>
            Stock épuisé. Allez au tableau de bord pour réapprovisionner avant d'enregistrer une livraison.
          </div>
        )}

        <form onSubmit={submit}>
          <div className="flex gap-1" style={{ marginBottom: '.75rem' }}>
            <div style={{ flex: 1 }}>
              <label>Quantité livrée (plateaux)</label>
              <input
                type="number" min={1} max={stock || undefined}
                value={form.quantite}
                onChange={set('quantite')}
                placeholder="Ex : 20"
                disabled={stock === 0}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Prix unitaire (FCFA)</label>
              <input
                type="number" min={0}
                value={form.prixUnitaire}
                onChange={set('prixUnitaire')}
                placeholder="Ex : 1500"
                disabled={stock === 0}
                required
              />
            </div>
          </div>

          {montantPreview && (
            <p style={{ marginBottom: 10, fontSize: '.9rem' }}>
              Montant total :{' '}
              <strong style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#E0A516' }}>
                {montantPreview} FCFA
              </strong>
            </p>
          )}

          <div className="form-group">
            <label>Note (optionnel)</label>
            <input
              value={form.note}
              onChange={set('note')}
              placeholder="Ex : Livraison du matin, œufs calibre A…"
              disabled={stock === 0}
            />
          </div>

          {err && <p className="error">{err}</p>}
          {msg && <p style={{ color: '#3A7D44', marginBottom: 8, fontSize: '.875rem' }}>{msg}</p>}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={submitting || stock === 0}
          >
            {submitting ? 'Enregistrement…' : 'Enregistrer la livraison'}
          </button>
        </form>
      </div>

      {livraisons.length > 0 && (
        <>
          <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
            <h2 style={{ marginBottom: 0 }}>Historique ({livraisons.length})</h2>
            <span className="text-muted">
              {totalPlateaux} plateaux · {totalValeur.toLocaleString('fr-FR')} FCFA
            </span>
          </div>

          {livraisons.map(l => (
            <div className="card" key={l._id}>
              <div className="flex justify-between items-center">
                <div>
                  <strong style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                    {l.quantite} plateau{l.quantite > 1 ? 'x' : ''}
                  </strong>
                  <span className="text-muted" style={{ marginLeft: 8 }}>
                    à {l.prixUnitaire.toLocaleString('fr-FR')} FCFA/u
                  </span>
                </div>
                <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, color: '#E0A516' }}>
                  {l.montantTotal.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              {l.note && (
                <p className="text-muted" style={{ marginTop: 4 }}>{l.note}</p>
              )}
              <p style={{ color: '#8B7355', fontSize: '.78rem', marginTop: 4 }}>
                {new Date(l.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
          ))}
        </>
      )}

      {livraisons.length === 0 && (
        <p className="text-muted" style={{ marginTop: '1rem' }}>Aucune livraison enregistrée pour l'instant.</p>
      )}
    </>
  );
}
