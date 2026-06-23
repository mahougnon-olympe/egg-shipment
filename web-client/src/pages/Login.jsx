import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ whatsapp: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { token, user } = await api.post('/auth/login', form);
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
          <label>Numéro WhatsApp</label>
          <input placeholder="+229XXXXXXXX" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
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
