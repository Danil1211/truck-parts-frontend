import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import TopNav from '../components/TopNav';
import Banner from '../components/Banner';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

function HomePage() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('http://localhost:3000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Ошибка загрузки товаров:', err));
  }, []);

  return (
    <>
      <Header />
      <TopNav />
      <Banner />
      <main className="container" style={{ padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '1.5rem' }}>Каталог автозапчастей</h1>
        <div className="products" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {products.map(prod => (
            <ProductCard key={prod._id} product={prod} onAddToCart={addToCart} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default HomePage;
