import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const KEY = 'form_register_client';
const FIELDS = ['nom', 'prenom', 'whatsapp', 'email'];

export default function Register({ onLogin }) {
  const [form, setForm] = useState(() => {
    try { return { ...{ nom: '', prenom: '', whatsapp: '', email: '', password: '' }, ...JSON.parse(sessionStorage.getItem(KEY) || '{}'), password: '' }; }
    catch { return { nom: '', prenom: '', whatsapp: '', email: '', password: '' }; }
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const set = (field) => (e) => {
    const next = { ...form, [field]: e.target.value };
    setForm(next);
    if (field !== 'password') {
      const saved = Object.fromEntries(FIELDS.map(k => [k, next[k]]));
      sessionStorage.setItem(KEY, JSON.stringify(saved));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { token, user } = await api.post('/auth/register', { ...form, role: 'client' });
      sessionStorage.removeItem(KEY);
      onLogin(token, user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ paddingTop: '2rem' }}>
      <h1 className="text-center">Créer un compte</h1>
      <form onSubmit={submit}>
        {[['Prénom', 'prenom'], ['Nom', 'nom']].map(([label, key]) => (
          <div className="form-group" key={key}>
            <label>{label}</label>
            <input value={form[key]} onChange={set(key)} required />
          </div>
        ))}
        <div className="form-group">
          <label>Numéro de téléphone</label>
          <input placeholder="+229 01 XX XX XX XX" value={form.whatsapp} onChange={set('whatsapp')} required />
          <small style={{ color: '#8B7355', fontSize: '.8rem' }}>De préférence votre numéro WhatsApp — le vendeur pourra vous contacter par WhatsApp.</small>
        </div>
        <div className="form-group">
          <label>Email (optionnel)</label>
          <input type="email" value={form.email} onChange={set('email')} />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" value={form.password} onChange={set('password')} required minLength={6} />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary">Créer mon compte</button>
      </form>
      <p className="text-center mt-2">
        Déjà un compte ? <Link to="/login" style={{ color: '#F97316' }}>Se connecter</Link>
      </p>
    </div>
  );
}
