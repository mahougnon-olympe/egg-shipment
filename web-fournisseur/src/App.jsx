import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { socket } from './socket';
import Login from './pages/Login';
import Inscription from './pages/Inscription';
import Dashboard from './pages/Dashboard';
import Livraisons from './pages/Livraisons';
import Sidebar from './components/Sidebar';

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'fournisseur') return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  useEffect(() => {
    if (user) socket.connect();
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
          <Route path="/inscription" element={<Inscription onLogin={login} />} />
          <Route path="/" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
          <Route path="/livraisons" element={<ProtectedRoute user={user}><Livraisons /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
