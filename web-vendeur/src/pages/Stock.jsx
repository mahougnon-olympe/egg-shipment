import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Stock() {
  const [stock, setStock] = useState({ soldeDisponible: 0, seuilAlerte: 10 });
  const [msg, setMsg] = useState('');

  useEffect(() => { api.get('/stock').then(setStock).catch(console.error); }, []);

  const enregistrer = async (e) => {
    e.preventDefault();
    await api.put('/stock', stock);
    setMsg('Stock mis à jour');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <>
      <h1>Gestion du stock</h1>
      {stock.soldeDisponible <= stock.seuilAlerte && (
        <div className="alert alert-warning">Stock bas ! Il reste {stock.soldeDisponible} plateau(x).</div>
      )}
      <div className="card" style={{ maxWidth: 400 }}>
        <form onSubmit={enregistrer}>
          <div className="form-group">
            <label>Solde disponible (plateaux)</label>
            <input
              type="number" min={0} value={stock.soldeDisponible}
              onChange={e => setStock({ ...stock, soldeDisponible: Number(e.target.value) })}
              required
            />
          </div>
          <div className="form-group">
            <label>Seuil d'alerte</label>
            <input
              type="number" min={0} value={stock.seuilAlerte}
              onChange={e => setStock({ ...stock, seuilAlerte: Number(e.target.value) })}
            />
          </div>
          {msg && <p style={{ color: '#10B981', marginBottom: '.5rem' }}>{msg}</p>}
          <button type="submit" className="btn-primary">Enregistrer</button>
        </form>
      </div>
    </>
  );
}
