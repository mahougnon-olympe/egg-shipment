import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { socket } from './socket';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Commandes from './pages/Commandes';
import Stock from './pages/Stock';
import Tarifs from './pages/Tarifs';
import Disponibilites from './pages/Disponibilites';
import Sidebar from './components/Sidebar';

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'vendeur') return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit('rejoindre_vendeur', user.id);
    }
    return () => socket.disconnect();
  }, [user]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    socket.disconnect();
  };

  return (
    <div className="layout">
      {user && <Sidebar user={user} onLogout={logout} />}
      <main className="main">
        <Routes>
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
          <Route path="/commandes" element={<ProtectedRoute user={user}><Commandes /></ProtectedRoute>} />
          <Route path="/stock" element={<ProtectedRoute user={user}><Stock /></ProtectedRoute>} />
          <Route path="/tarifs" element={<ProtectedRoute user={user}><Tarifs /></ProtectedRoute>} />
          <Route path="/disponibilites" element={<ProtectedRoute user={user}><Disponibilites /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
