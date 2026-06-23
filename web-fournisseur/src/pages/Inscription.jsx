import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const KEY = 'form_inscription_fournisseur';
const FIELDS = ['nom', 'prenom', 'whatsapp'];

export default function Inscription({ onLogin }) {
  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || '{}');
      return { nom: saved.nom || '', prenom: saved.prenom || '', whatsapp: saved.whatsapp || '', password: '', confirm: '' };
    } catch { return { nom: '', prenom: '', whatsapp: '', password: '', confirm: '' }; }
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const set = (field) => (e) => {
    const next = { ...form, [field]: e.target.value };
    setForm(next);
    if (!['password', 'confirm'].includes(field)) {
      const saved = Object.fromEntries(FIELDS.map(k => [k, next[k]]));
      sessionStorage.setItem(KEY, JSON.stringify(saved));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas');
    try {
      const { token, user } = await api.post('/auth/register', {
        role: 'fournisseur',
        nom: form.nom,
        prenom: form.prenom,
        whatsapp: form.whatsapp,
        password: form.password,
      });
      sessionStorage.removeItem(KEY);
      onLogin(token, user);
      navigate('/');
    } catch (err) { setError(err.message); }
  };

  return (
    <div style={{ maxWidth: 360, margin: '4rem auto' }}>
      <h1>Créer un compte fournisseur</h1>
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Prénom</label>
          <input value={form.prenom} onChange={set('prenom')} required />
        </div>
        <div className="form-group">
          <label>Nom</label>
          <input value={form.nom} onChange={set('nom')} required />
        </div>
        <div className="form-group">
          <label>WhatsApp</label>
          <input placeholder="+229XXXXXXXX" value={form.whatsapp} onChange={set('whatsapp')} required />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" value={form.password} onChange={set('password')} required />
        </div>
        <div className="form-group">
          <label>Confirmer le mot de passe</label>
          <input type="password" value={form.confirm} onChange={set('confirm')} required />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Créer le compte</button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '.9rem', color: '#8B7355' }}>
        Déjà un compte ? <Link to="/login" style={{ color: '#E0A516', fontWeight: 600 }}>Se connecter</Link>
      </p>
    </div>
  );
}
