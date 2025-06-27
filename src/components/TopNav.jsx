import React from 'react';
import { Link } from 'react-router-dom';
import './TopNav.css';

function TopNav() {
  return (
    <nav className="top-nav">
      <div className="container">
        <ul className="nav-list">
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/catalog">Каталог</Link></li>
          <li><Link to="/about">О компании</Link></li>
          <li><Link to="/contacts">Контакты</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default TopNav;
