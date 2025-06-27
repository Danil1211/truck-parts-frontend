import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__left">
        <Link to="/" className="logo">🚛 TruckParts</Link>
      </div>

      <div className="header__center">
        <input type="text" placeholder="Поиск по каталогу..." className="search-input" />
        <button className="search-btn">Поиск</button>
      </div>

      <div className="header__right">
        <Link to="/return">Возврат</Link>
        <Link to="/exchange">Обмен</Link>

        {user ? (
          <>
            <Link to="/profile">{user.name || 'Профиль'}</Link>
            {user.isAdmin && <Link to="/admin/orders">Админка</Link>}
          </>
        ) : (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}

        <div className="cart-link">
          <Link to="/cart">Корзина</Link>
          {totalItems > 0 && (
            <span className="cart-badge">{totalItems}</span>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
