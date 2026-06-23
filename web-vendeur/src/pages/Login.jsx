import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const KEY = 'form_login_vendeur';

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
      if (user.role !== 'vendeur') return setError('Accès réservé au vendeur');
      sessionStorage.removeItem(KEY);
      onLogin(token, user);
      navigate('/');
    } catch (err) { setError(err.message); }
  };

  return (
    <div style={{ maxWidth: 360, margin: '4rem auto' }}>
      <h1>Connexion vendeur</h1>
      <form onSubmit={submit}>
        <div className="form-group">
          <label>WhatsApp</label>
          <input placeholder="+229XXXXXXXX" value={form.whatsapp} onChange={set('whatsapp')} required />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" value={form.password} onChange={set('password')} required />
        </div>
        {error && <p style={{ color: '#EF4444', marginBottom: '.5rem' }}>{error}</p>}
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Se connecter</button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Pas encore de compte ? <Link to="/inscription">Créer le compte vendeur</Link>
      </p>
    </div>
  );
}
