import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Register({ onLogin }) {
  const [form, setForm] = useState({ nom: '', prenom: '', whatsapp: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { token, user } = await api.post('/auth/register', { ...form, role: 'client' });
      onLogin(token, user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div style={{ paddingTop: '2rem' }}>
      <h1 className="text-center">Créer un compte</h1>
      <form onSubmit={submit}>
        {[['Prénom', 'prenom'], ['Nom', 'nom']].map(([label, key]) => (
          <div className="form-group" key={key}>
            <label>{label}</label>
            <input {...f(key)} required />
          </div>
        ))}
        <div className="form-group">
          <label>Numéro WhatsApp *</label>
          <input placeholder="+229XXXXXXXX" {...f('whatsapp')} required />
        </div>
        <div className="form-group">
          <label>Email (optionnel)</label>
          <input type="email" {...f('email')} />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" {...f('password')} required minLength={6} />
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
