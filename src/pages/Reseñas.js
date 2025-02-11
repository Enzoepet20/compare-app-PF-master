// src/pages/Reseñas.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ReviewList from '../components/ReviewList';
import AddReview from '../components/AddReview';
import { getAuth } from 'firebase/auth';
import { getProductsByCategory, addReview, getReviews } from '../functions/services/api';
import '../styles/ReseñasStyles.css';

function Reseñas() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [rating, setRating] = useState(0);

  const currentUser = getAuth().currentUser;

  useEffect(() => {
    // Cargar productos y reseñas al iniciar
    const loadInitialData = async () => {
      try {
        const electronicProducts = await getProductsByCategory('electronics');
        setProducts(electronicProducts);

        // Obtener reseñas desde la API
        const apiReviews = await getReviews();
        setReviews(apiReviews);
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      }
    };
    loadInitialData();
  }, []);

  const handleAddReview = async () => {
    if (!selectedProductId || !newReviewText || !rating) {
      alert('Por favor complete todos los campos.');
      return;
    }

    // Si el usuario no está autenticado, se envía userId como null para que se registre como "Anónimo"
    const reviewPayload = {
      productId: selectedProductId,
      comment: newReviewText,
      rating,
      userId: currentUser ? currentUser.uid : null
    };

    try {
      // Guardar en API
      const savedReview = await addReview(reviewPayload);

      // Actualizar estado con la nueva reseña
      setReviews(prevReviews => [savedReview, ...prevReviews]);

      // Opcional: guardar en localStorage como respaldo
      localStorage.setItem('reviews', JSON.stringify([savedReview, ...reviews]));

      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error al guardar reseña:', error);
      alert('Error al guardar la reseña. Se guardará localmente.');

      // Fallback: guardar en localStorage
      const newReview = {
        productId: selectedProductId,
        comment: newReviewText,
        rating,
        userId: currentUser ? currentUser.uid : null,
        username: currentUser ? currentUser.displayName || 'Anónimo' : 'Anónimo',
        createdAt: new Date().toISOString(),
      };
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem('reviews', JSON.stringify(updatedReviews));
    }
  };

  const resetForm = () => {
    setSelectedProductId('');
    setNewReviewText('');
    setRating(0);
  };

  return (
    <div className="reseñas-page">
      <Header />
      <div className="reseñas-container">
        <h2 className="section-title">Reseñas de Clientes</h2>
        <ReviewList reviews={reviews} products={products} />

        <button className="add-review-btn" onClick={() => setShowForm(true)}>
          Escribir una Reseña
        </button>

        {showForm && (
          <AddReview
            products={products}
            selectedProductId={selectedProductId}
            onProductIdChange={setSelectedProductId}
            newReviewText={newReviewText}
            onReviewTextChange={setNewReviewText}
            rating={rating}
            onRatingChange={setRating}
            onSubmit={handleAddReview}
            onCancel={() => {
              setShowForm(false);
              resetForm();
            }}
          />
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export default Reseñas;
