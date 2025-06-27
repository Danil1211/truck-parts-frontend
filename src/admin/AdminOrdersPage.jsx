import React, { useEffect, useState } from 'react';
import './AdminPanel.css';
import { useAuth } from '../context/AuthContext';

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/orders/admin', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка при загрузке');
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки заказов');
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders
    .filter(o => {
      const v = search.toLowerCase();
      const okSearch =
        o._id.toLowerCase().includes(v) ||
        o.user?.email?.toLowerCase().includes(v) ||
        o.user?.name?.toLowerCase().includes(v) ||
        o.user?.phone?.toLowerCase().includes(v);
      const okStatus = statusFilter === 'all' || o.status === statusFilter;
      return okSearch && okStatus;
    })
    .sort((a,b) =>
      sortOrder==='desc'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  return (
    <div className="admin-orders-root">
      <div className="order-toolbar">
        <div className="order-filters-group">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Все статусы</option>
            <option value="new">Новые</option>
            <option value="processing">В обработке</option>
            <option value="shipped">Отправлены</option>
            <option value="done">Завершены</option>
          </select>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option value="desc">Сначала новые</option>
            <option value="asc">Сначала старые</option>
          </select>
          <input
            type="text"
            className="search-input"
            placeholder="Поиск по номеру, email, телефону или имени"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {!error && filtered.length === 0 && <p>Нет заказов</p>}

      <div className="orders-list">
        {filtered.map(order => (
          <div key={order._id} className="order-row">
            <div className="order-product">
              <img
                src={`http://localhost:3000${order.items[0]?.product?.image || '/images/no-image.png'}`}
                alt="Товар"
              />
              <div className="order-info">
                <div className="order-id">№ {order._id.slice(-6)}</div>
                <div className="order-date">
                  {new Date(order.createdAt).toLocaleString('ru-RU')}
                </div>
                <div className="order-title">
                  {order.items[0]?.product?.name || 'Товар'}
                </div>
              </div>
            </div>
            <div className="order-price">
              {order.totalPrice} ₴
              <span>{order.items.reduce((s,i)=>s+i.quantity,0)} шт.</span>
            </div>
            <div className="order-client">
              <strong>{order.user?.name}</strong><br/>
              {order.user?.email}<br/>
              {order.user?.phone || '—'}
            </div>
            <div className="order-shipping">
              📦 Новая Почта<br/>
              {order.novaPoshta}<br/>
              {order.address}<br/>
              {order.paymentMethod==='cod'?'Наложка':'Карта'}
            </div>
            <div className="order-status">
              <span className="status-badge">{order.status.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminOrdersPage;
