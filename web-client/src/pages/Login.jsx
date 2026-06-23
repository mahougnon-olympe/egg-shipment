import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const KEY = 'form_login_client';

export default function Login({ onLogin }) {
  const [form, setForm] = useState(() => {
    try { return { ...JSON.parse(sessionStorage.getItem(KEY) || '{}'), password: '' }; }
    catch { return { whatsapp: '', password: '' }; }
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const set = (field) => (e) => {
    const next = { ...form, [field]: e.target.value };
    setForm(next);
    if (field !== 'password') sessionStorage.setItem(KEY, JSON.stringify({ whatsapp: next.whatsapp }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { token, user } = await api.post('/auth/login', form);
      sessionStorage.removeItem(KEY);
      onLogin(token, user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ paddingTop: '2rem' }}>
      <h1 className="text-center">Connexion</h1>
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Numéro de téléphone</label>
          <input placeholder="+229 01 XX XX XX XX" value={form.whatsapp} onChange={set('whatsapp')} required />
          <small style={{ color: '#8B7355', fontSize: '.8rem' }}>Le numéro utilisé lors de l'inscription.</small>
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" value={form.password} onChange={set('password')} required />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary">Se connecter</button>
      </form>
      <p className="text-center mt-2">
        Pas de compte ? <Link to="/register" style={{ color: '#F97316' }}>S'inscrire</Link>
      </p>
    </div>
  );
}
