import { useEffect, useState } from 'react';
import { api } from '../services/api';

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export default function Disponibilites() {
  const [form, setForm] = useState({ jours: [], heureDebut: '08:00', heureFin: '18:00', adressePointVente: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/disponibilites').then(d => { if (d?.jours) setForm(d); }).catch(console.error);
  }, []);

  const toggleJour = (jour) => {
    setForm(f => ({
      ...f,
      jours: f.jours.includes(jour) ? f.jours.filter(j => j !== jour) : [...f.jours, jour],
    }));
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    await api.put('/disponibilites', form);
    setMsg('Disponibilités mises à jour');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <>
      <h1>Disponibilités</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={enregistrer}>
          <div className="form-group">
            <label>Jours d'ouverture</label>
            <div className="flex" style={{ flexWrap: 'wrap', gap: '8px', marginTop: 4 }}>
              {JOURS.map(j => (
                <button
                  type="button" key={j}
                  onClick={() => toggleJour(j)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: '1.5px solid',
                    borderColor: form.jours.includes(j) ? '#F97316' : '#D1D5DB',
                    background: form.jours.includes(j) ? '#FFF0E6' : '#fff',
                    color: form.jours.includes(j) ? '#F97316' : '#6B7280',
                    fontWeight: form.jours.includes(j) ? 700 : 400,
                    cursor: 'pointer',
                    fontSize: '.85rem',
                  }}
                >
                  {j.charAt(0).toUpperCase() + j.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1" style={{ marginBottom: '.75rem' }}>
            <div style={{ flex: 1 }}>
              <label>Heure d'ouverture</label>
              <input type="time" value={form.heureDebut} onChange={e => setForm({ ...form, heureDebut: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Heure de fermeture</label>
              <input type="time" value={form.heureFin} onChange={e => setForm({ ...form, heureFin: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Adresse du point de vente (retrait)</label>
            <input value={form.adressePointVente} onChange={e => setForm({ ...form, adressePointVente: e.target.value })} placeholder="Ex: Calavi, marché Dantokpa..." />
          </div>
          {msg && <p style={{ color: '#10B981', marginBottom: '.5rem' }}>{msg}</p>}
          <button type="submit" className="btn-primary">Enregistrer</button>
        </form>
      </div>
    </>
  );
}
