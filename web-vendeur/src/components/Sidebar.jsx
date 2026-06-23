import { NavLink } from 'react-router-dom';

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
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#F97316' }}>🥚 Vendeur</div>
        <div style={{ fontSize: '.8rem', color: '#9CA3AF', marginTop: 2 }}>{user.prenom} {user.nom}</div>
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
