import { Link, useLocation } from 'react-router-dom';

export default function Nav({ user, onLogout }) {
  const { pathname } = useLocation();
  const link = (to, label) => (
    <Link to={to} style={{ fontWeight: pathname === to ? 700 : 400, color: '#F97316', textDecoration: 'none' }}>
      {label}
    </Link>
  );

  return (
    <nav style={{ background: '#fff', borderBottom: '1.5px solid #F97316', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <strong style={{ color: '#F97316' }}>🥚 {user.prenom}</strong>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {link('/', 'Accueil')}
        {link('/commandes', 'Mes commandes')}
        {link('/profil', 'Profil')}
        <button onClick={onLogout} style={{ background: 'none', color: '#9CA3AF', fontWeight: 400, padding: 0 }}>Déco</button>
      </div>
    </nav>
  );
}
