import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AdminOrdersPage.css';

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/orders/admin', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setOrders(data);
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при обновлении статуса');

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert('Ошибка обновления статуса: ' + err.message);
    }
  };

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '2rem' }}>
        <h1>📦 Заказы (админ)</h1>
        {error && <p className="error">{error}</p>}
        {orders.length === 0 && !error && <p>Нет заказов</p>}

        {orders.length > 0 && (
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Клиент</th>
                <th>Адрес</th>
                <th>Новая Почта</th>
                <th>Сумма</th>
                <th>Оплата</th>
                <th>Статус</th>
                <th>Товары</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.slice(-6)}</td>
                  <td>{order.user?.name}</td>
                  <td>{order.address}</td>
                  <td>{order.novaPoshta}</td>
                  <td>{order.total} грн</td>
                  <td>{order.paymentMethod === 'cod' ? 'Наложка' : 'Карта'}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="новый">новый</option>
                      <option value="в обработке">в обработке</option>
                      <option value="отправлен">отправлен</option>
                      <option value="доставлен">доставлен</option>
                      <option value="отменён">отменён</option>
                    </select>
                  </td>
                  <td>
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        {item.product?.name || '—'} × {item.quantity}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
      <Footer />
    </>
  );
}

export default AdminOrdersPage;
