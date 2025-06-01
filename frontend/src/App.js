import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import UserPanel from './pages/UserPanel';
import NoterPanel from './pages/NoterPanel';
import AdminPanel from './pages/AdminPanel';
import BlockchainTestPage from './pages/BlockchainTestPage';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [showTest, setShowTest] = useState(false);

  useEffect(() => {
    if (token) {
      const userData = JSON.parse(localStorage.getItem('jwt_user'));
      setUser(userData);
    }
  }, [token]);

  const handleLogin = (data) => {
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('jwt_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_user');
    setToken(null);
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.role && user.role.toLowerCase() === 'user') {
    return <UserPanel user={user} token={token} onLogout={handleLogout} />;
  }

  if (user.role && user.role.toLowerCase() === 'noter') {
    return <NoterPanel user={user} token={token} onLogout={handleLogout} />;
  }

  if (user.role && user.role.toLowerCase() === 'admin') {
    return <AdminPanel token={token} onLogout={handleLogout} />;
  }

  // Diğer roller için şimdilik hoşgeldin mesajı
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Hoşgeldin, Admin!</h1>
        <p className="mb-4">Giriş yaptınız: <span className="font-mono text-gray-700">{user.email}</span></p>
        <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Çıkış Yap</button>
      </div>
    </div>
  );
}

export default App;
