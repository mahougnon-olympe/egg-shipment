import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Tarifs() {
  const [tarifs, setTarifs] = useState([]);
  const [form, setForm] = useState({ prixUnitaire: '', label: '', stockDisponible: '0' });
  const [msg, setMsg] = useState('');

  const charger = () => api.get('/tarifs').then(setTarifs).catch(console.error);

  useEffect(() => { charger(); }, []);

  const ajouter = async (e) => {
    e.preventDefault();
    await api.post('/tarifs', {
      prixUnitaire: Number(form.prixUnitaire),
      label: form.label,
      stockDisponible: Number(form.stockDisponible),
    });
    setForm({ prixUnitaire: '', label: '', stockDisponible: '0' });
    setMsg('Tarif ajouté');
    charger();
    setTimeout(() => setMsg(''), 2000);
  };

  const toggle = async (id) => {
    await api.patch(`/tarifs/${id}/toggle`);
    charger();
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer ce tarif ?')) return;
    await api.delete(`/tarifs/${id}`);
    charger();
  };

  const mettreAJourStock = async (id, stockDisponible) => {
    await api.put(`/tarifs/${id}`, { stockDisponible: Number(stockDisponible) });
    charger();
  };

  return (
    <>
      <h1>Tarifs</h1>

      <div className="card" style={{ maxWidth: 420 }}>
        <h2>Ajouter un tarif</h2>
        <form onSubmit={ajouter}>
          <div className="form-group">
            <label>Label (ex : Calibre standard)</label>
            <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Prix unitaire (FCFA / plateau)</label>
            <input type="number" min={0} value={form.prixUnitaire} onChange={e => setForm({ ...form, prixUnitaire: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Plateaux disponibles</label>
            <input type="number" min={0} value={form.stockDisponible} onChange={e => setForm({ ...form, stockDisponible: e.target.value })} required />
          </div>
          {msg && <p style={{ color: '#3A7D44', marginBottom: '.5rem' }}>{msg}</p>}
          <button type="submit" className="btn-primary">Ajouter</button>
        </form>
      </div>

      {tarifs.map(t => (
        <div className="card" key={t._id}>
          <div className="flex justify-between items-center">
            <div>
              <strong style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{t.label}</strong>
              <p style={{ color: '#E0A516', fontWeight: 600, marginTop: 2 }}>{t.prixUnitaire.toLocaleString('fr-FR')} FCFA / plateau</p>
            </div>
            <div className="flex gap-1">
              <button className={t.actif ? 'btn-ghost btn-sm' : 'btn-primary btn-sm'} onClick={() => toggle(t._id)}>
                {t.actif ? 'Désactiver' : 'Activer'}
              </button>
              <button className="btn-danger btn-sm" onClick={() => supprimer(t._id)}>✕</button>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: '.85rem', color: '#8B7355', whiteSpace: 'nowrap' }}>Plateaux dispo :</label>
            <StockInline
              valeur={t.stockDisponible ?? 0}
              onSave={(val) => mettreAJourStock(t._id, val)}
            />
          </div>
        </div>
      ))}
    </>
  );
}

function StockInline({ valeur, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(valeur));

  const confirmer = () => {
    onSave(val);
    setEditing(false);
  };

  if (!editing) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, color: valeur === 0 ? '#B0413E' : '#E0A516' }}>
          {valeur}
        </span>
        <button className="btn-ghost btn-sm" style={{ fontSize: '.78rem', padding: '2px 8px' }} onClick={() => { setVal(String(valeur)); setEditing(true); }}>
          Modifier
        </button>
      </span>
    );
  }

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="number" min={0} value={val}
        onChange={e => setVal(e.target.value)}
        style={{ width: 70, textAlign: 'center' }}
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter') confirmer(); if (e.key === 'Escape') setEditing(false); }}
      />
      <button className="btn-primary btn-sm" style={{ fontSize: '.78rem', padding: '2px 8px' }} onClick={confirmer}>OK</button>
      <button className="btn-ghost btn-sm" style={{ fontSize: '.78rem', padding: '2px 8px' }} onClick={() => setEditing(false)}>Annuler</button>
    </span>
  );
}
