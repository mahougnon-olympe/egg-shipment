import { NavLink } from 'react-router-dom';

const EggIcon = () => (
  <svg width="15" height="19" viewBox="0 0 16 20" fill="none" aria-hidden="true">
    <path d="M8 1C11 1 15 7 15 12.5C15 16.6 11.9 19 8 19C4.1 19 1 16.6 1 12.5C1 7 5 1 8 1Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const links = [
  { to: '/', label: 'Tableau de bord' },
  { to: '/commandes', label: 'Commandes' },
  { to: '/stock', label: 'Stock' },
  { to: '/tarifs', label: 'Tarifs' },
  { to: '/disponibilites', label: 'Disponibilités' },
];

export default function Sidebar({ user, onLogout }) {
  return (
    <nav className="sidebar">
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(251,248,243,0.1)' }}>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: '1.05rem', color: '#FBF8F3', display: 'flex', alignItems: 'center', gap: 6 }}>
          <EggIcon /> Boutique
        </div>
        <div style={{ fontSize: '.8rem', color: 'rgba(251,248,243,0.45)', marginTop: 4 }}>{user.prenom} {user.nom}</div>
      </div>
      {links.map(({ to, label }) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
          {label}
        </NavLink>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <button onClick={onLogout} className="btn-ghost" style={{ width: '100%', fontSize: '.85rem' }}>Déconnexion</button>
      </div>
    </nav>
  );
}
