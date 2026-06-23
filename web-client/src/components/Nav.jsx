import { Link, useLocation } from 'react-router-dom';

const EggIcon = () => (
  <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
    <path d="M8 1C11 1 15 7 15 12.5C15 16.6 11.9 19 8 19C4.1 19 1 16.6 1 12.5C1 7 5 1 8 1Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export default function Nav({ user, onLogout }) {
  const { pathname } = useLocation();

  return (
    <nav className="app-nav">
      <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: '1.05rem', color: '#3D2F23', display: 'flex', alignItems: 'center', gap: 6 }}>
        <EggIcon /> {user.prenom}
      </span>
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        {[['/', 'Accueil'], ['/commandes', 'Commandes'], ['/profil', 'Profil']].map(([to, label]) => (
          <Link key={to} to={to} style={{
            color: pathname === to ? '#E0A516' : '#8B7355',
            textDecoration: 'none',
            fontWeight: pathname === to ? 600 : 500,
            fontSize: '.9rem',
          }}>
            {label}
          </Link>
        ))}
        <button onClick={onLogout} style={{ background: 'none', color: '#8B7355', fontWeight: 500, padding: 0, fontSize: '.85rem', borderRadius: 0 }}>
          Déco
        </button>
      </div>
    </nav>
  );
}
