import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CheckoutPage.css'; // ✅ обязательно подключи

function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [novaPoshta, setNovaPoshta] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    if (!address || !novaPoshta || !paymentMethod) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product: item._id,
            quantity: item.quantity,
          })),
          address,
          novaPoshta,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка оформления заказа');
        setLoading(false);
        return;
      }

      clearCart();
      navigate('/thanks');
    } catch (err) {
      setError('Сервер недоступен');
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="checkout-grid">
        {/* Левая колонка — товары */}
        <section className="checkout-left">
          <h2>🧾 Ваш заказ</h2>
          <ul className="checkout-list">
            {cartItems.map(item => (
              <li key={item._id}>
                {item.name} — {item.quantity} шт. × {item.price} грн
              </li>
            ))}
          </ul>
          <p className="checkout-total"><strong>Итого:</strong> {total} грн</p>

          <button onClick={() => navigate('/cart')} className="btn-back">⬅ Назад в корзину</button>
        </section>

        {/* Правая колонка — форма */}
        <section className="checkout-right">
          <h2>📦 Доставка и оплата</h2>

          <div className="checkout-user">
            <p><strong>Имя:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Телефон:</strong> {user?.phone}</p>
          </div>

          <input
            type="text"
            placeholder="Адрес"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="checkout-input"
          />
          <input
            type="text"
            placeholder="Отделение Новой Почты"
            value={novaPoshta}
            onChange={e => setNovaPoshta(e.target.value)}
            className="checkout-input"
          />

          <div className="checkout-payment">
            <label>
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={e => setPaymentMethod(e.target.value)}
              />
              Оплата при получении
            </label>
            <label>
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={e => setPaymentMethod(e.target.value)}
              />
              Оплата картой
            </label>
          </div>

          {error && <p className="checkout-error">{error}</p>}

          <button onClick={handleSubmit} disabled={loading} className="btn-order">
            {loading ? 'Отправка...' : 'Оформить заказ'}
          </button>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default CheckoutPage;
