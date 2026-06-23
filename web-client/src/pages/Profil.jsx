import { useState } from 'react';
import { api } from '../services/api';

export default function Profil({ user, setUser }) {
  const [form, setForm] = useState({ nom: user.nom, prenom: user.prenom, whatsapp: user.whatsapp, email: user.email || '', password: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const updated = await api.put('/auth/me', { ...form, password: form.password || undefined });
      localStorage.setItem('user', JSON.stringify({ ...user, ...updated }));
      setUser({ ...user, ...updated });
      setMsg('Profil mis à jour');
    } catch (e) { setError(e.message); }
  };

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <h1>Mon profil</h1>
      <form onSubmit={submit}>
        {[['Prénom', 'prenom'], ['Nom', 'nom']].map(([label, key]) => (
          <div className="form-group" key={key}>
            <label>{label}</label>
            <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
          </div>
        ))}
        <div className="form-group">
          <label>WhatsApp</label>
          <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Email (optionnel)</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Nouveau mot de passe (laisser vide pour ne pas changer)</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} />
        </div>
        {msg && <p style={{ color: '#10B981' }}>{msg}</p>}
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary">Enregistrer</button>
      </form>
    </div>
  );
}
