import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import './ProductPage.css';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка при загрузке');
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch((err) => {
        console.error('Ошибка загрузки товара:', err);
        setError('Ошибка загрузки товара');
      });
  }, [id]);

  const handleBuy = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(product);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  if (error) return <div className="container error">{error}</div>;
  if (!product) return <div className="container">Загрузка...</div>;

  return (
    <>
      <Header />
      <TopNav />
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn-back"
        >
          ← Назад
        </button>

        <div style={{ display: 'flex', gap: '2rem' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: '400px',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid #ccc',
            }}
          />

          <div style={{ flex: 1 }}>
            <h2>{product.name}</h2>
            <p><strong>{product.price} грн</strong></p>
            <p>{product.description}</p>

            <label htmlFor="qty">Количество:</label>
            <select
              id="qty"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            >
              {[...Array(10).keys()].map(n => (
                <option key={n + 1} value={n + 1}>
                  {n + 1}
                </option>
              ))}
            </select>

            <button onClick={handleBuy} className="btn-buy">Купить</button>
            {showToast && <div className="toast">Товар добавлен в корзину</div>}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductPage;
