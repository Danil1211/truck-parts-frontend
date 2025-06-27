import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <Header />
      <main style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>

        <Link to="/" className="profile-btn" style={{ marginBottom: '1rem' }}>
          🏠 На главную
        </Link>

        <h2 style={{ marginBottom: '1rem' }}>👤 Профиль пользователя</h2>

        <p><strong>Email:</strong> {user?.email || 'не указано'}</p>
        <p><strong>Имя:</strong> {user?.name || 'не указано'}</p>
        <p><strong>Телефон:</strong> {user?.phone || 'не указано'}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '2rem' }}>
          <Link to="/change-password" className="btn-link">🔐 Изменить пароль</Link>
          <Link to="/orders" className="btn-link">📦 История заказов</Link>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#cc0000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Выйти из аккаунта
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ProfilePage;
