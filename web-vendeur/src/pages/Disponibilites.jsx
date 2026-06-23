import { useEffect, useState } from 'react';
import { api } from '../services/api';

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const MODES_PAIEMENT = [
  { id: 'mobile_money', label: 'Mobile Money' },
  { id: 'liquide',      label: 'Espèces (liquide)' },
];

export default function Disponibilites() {
  const [form, setForm] = useState({
    jours: [],
    heureDebut: '08:00',
    heureFin: '18:00',
    adressePointVente: '',
    modesPaiement: [],
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/disponibilites').then(d => { if (d?.jours) setForm({ modesPaiement: [], ...d }); }).catch(console.error);
  }, []);

  const toggleJour = (jour) => {
    setForm(f => ({
      ...f,
      jours: f.jours.includes(jour) ? f.jours.filter(j => j !== jour) : [...f.jours, jour],
    }));
  };

  const toggleMode = (id) => {
    setForm(f => ({
      ...f,
      modesPaiement: f.modesPaiement.includes(id)
        ? f.modesPaiement.filter(m => m !== id)
        : [...f.modesPaiement, id],
    }));
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    await api.put('/disponibilites', form);
    setMsg('Paramètres mis à jour');
    setTimeout(() => setMsg(''), 2000);
  };

  const actif = (val, liste) => liste.includes(val);

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
                    padding: '6px 12px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer', fontSize: '.85rem',
                    borderColor: actif(j, form.jours) ? '#E0A516' : 'rgba(61,47,35,0.18)',
                    background: actif(j, form.jours) ? 'rgba(224,165,22,0.10)' : 'transparent',
                    color: actif(j, form.jours) ? '#3D2F23' : '#8B7355',
                    fontWeight: actif(j, form.jours) ? 700 : 400,
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
            <input
              value={form.adressePointVente}
              onChange={e => setForm({ ...form, adressePointVente: e.target.value })}
              placeholder="Ex : Calavi, marché Dantokpa…"
            />
          </div>

          <div className="form-group">
            <label>Modes de paiement acceptés</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
              {MODES_PAIEMENT.map(m => {
                const on = actif(m.id, form.modesPaiement);
                return (
                  <button
                    type="button" key={m.id}
                    onClick={() => toggleMode(m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 10, border: '1.5px solid', cursor: 'pointer',
                      textAlign: 'left',
                      borderColor: on ? '#E0A516' : 'rgba(61,47,35,0.18)',
                      background: on ? 'rgba(224,165,22,0.07)' : 'transparent',
                    }}
                  >
                    <span style={{
                      width: 18, height: 18, borderRadius: 4, border: '1.5px solid',
                      borderColor: on ? '#E0A516' : 'rgba(61,47,35,0.3)',
                      background: on ? '#E0A516' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {on && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                    </span>
                    <span style={{ fontWeight: on ? 600 : 400, color: on ? '#3D2F23' : '#8B7355', fontSize: '.9rem' }}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {msg && <p style={{ color: '#3A7D44', marginBottom: '.5rem' }}>{msg}</p>}
          <button type="submit" className="btn-primary">Enregistrer</button>
        </form>
      </div>
    </>
  );
}
