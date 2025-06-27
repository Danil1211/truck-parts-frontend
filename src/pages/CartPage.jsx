import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = () => {
    if (cartItems.length > 0) {
      navigate('/checkout');
    }
  };

  return (
    <>
      <Header />
      <div className="cart-container">
        <button onClick={() => navigate('/')} className="btn-back">⬅ На главную</button>
        <h2>🛒 Ваша корзина</h2>

        {cartItems.length === 0 ? (
          <p className="empty">Корзина пуста</p>
        ) : (
          <>
            {cartItems.map(item => (
              <div className="cart-item" key={item._id}>
                <img src={item.image} alt={item.name} className="cart-image" />
                <div className="cart-details">
                  <h4>{item.name}</h4>
                  <p>{item.price} грн</p>
                  <div className="cart-controls">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                    <span className="cart-count">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                    <button className="btn-remove" onClick={() => removeFromCart(item._id)}>
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="cart-summary">
              <p><strong>Общая сумма:</strong> {total} грн</p>
              <div className="cart-buttons">
                <button className="btn-clear" onClick={clearCart}>Очистить</button>
                <button className="btn-order" onClick={handleOrder}>Оформить заказ</button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default CartPage;
