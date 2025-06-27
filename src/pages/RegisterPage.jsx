import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

function RegisterPage() {
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    // здесь можно добавить валидацию email/phone/password...
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка регистрации');
        return;
      }
      register(data.token);
      navigate('/', { replace: true });
    } catch {
      setError('Ошибка сервера');
    }
  };

  return (
    <>
      <Header />
      <div className="auth-container">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Назад на главную
        </button>
        <h2>Регистрация</h2>
        <form onSubmit={handleRegister}>
          <input name="name" placeholder="Имя" value={form.name} onChange={handleChange} required />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="phone" placeholder="Телефон (+380...)" value={form.phone} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} required />
          {error && <div className="error">{error}</div>}
          <button type="submit">Зарегистрироваться</button>
        </form>
      </div>
    </>
  );
}

export default RegisterPage;
