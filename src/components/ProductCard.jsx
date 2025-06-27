import React from 'react';

function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <strong>{product.price} ₽</strong>
      <br />
      <button onClick={() => onAddToCart(product)}>Добавить в корзину</button>
    </div>
  );
}

export default ProductCard;
