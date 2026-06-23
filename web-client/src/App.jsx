import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { socket } from './socket';
import Login from './pages/Login';
import Register from './pages/Register';
import Accueil from './pages/Accueil';
import Commander from './pages/Commander';
import MesCommandes from './pages/MesCommandes';
import Profil from './pages/Profil';
import Nav from './components/Nav';

function ProtectedRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit('rejoindre_client', user.id);
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
    <>
      {user && <Nav user={user} onLogout={logout} />}
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/register" element={<Register onLogin={login} />} />
          <Route path="/" element={<ProtectedRoute><Accueil /></ProtectedRoute>} />
          <Route path="/commander" element={<ProtectedRoute><Commander user={user} /></ProtectedRoute>} />
          <Route path="/commandes" element={<ProtectedRoute><MesCommandes /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><Profil user={user} setUser={setUser} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
