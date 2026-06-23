import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Tarifs() {
  const [tarifs, setTarifs] = useState([]);
  const [form, setForm] = useState({ prixUnitaire: '', label: '' });
  const [msg, setMsg] = useState('');

  const charger = () => api.get('/tarifs').then(setTarifs).catch(console.error);

  useEffect(() => { charger(); }, []);

  const ajouter = async (e) => {
    e.preventDefault();
    await api.post('/tarifs', { prixUnitaire: Number(form.prixUnitaire), label: form.label });
    setForm({ prixUnitaire: '', label: '' });
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

  return (
    <>
      <h1>Tarifs</h1>

      <div className="card" style={{ maxWidth: 420 }}>
        <h2>Ajouter un tarif</h2>
        <form onSubmit={ajouter}>
          <div className="form-group">
            <label>Label (ex: Calibre standard)</label>
            <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Prix unitaire (FCFA / plateau)</label>
            <input type="number" min={0} value={form.prixUnitaire} onChange={e => setForm({ ...form, prixUnitaire: e.target.value })} required />
          </div>
          {msg && <p style={{ color: '#10B981', marginBottom: '.5rem' }}>{msg}</p>}
          <button type="submit" className="btn-primary">Ajouter</button>
        </form>
      </div>

      {tarifs.map(t => (
        <div className="card flex justify-between items-center" key={t._id}>
          <div>
            <strong>{t.label}</strong>
            <p style={{ color: '#F97316', fontWeight: 600 }}>{t.prixUnitaire.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div className="flex gap-1">
            <button className={t.actif ? 'btn-ghost btn-sm' : 'btn-primary btn-sm'} onClick={() => toggle(t._id)}>
              {t.actif ? 'Désactiver' : 'Activer'}
            </button>
            <button className="btn-danger btn-sm" onClick={() => supprimer(t._id)}>✕</button>
          </div>
        </div>
      ))}
    </>
  );
}
