// src/pages/TitlePage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTitleDetail, fetchReviews, postReview } from '../api';

function TitlePage({ token }) {
  const { id } = useParams();            // title ID from URL
  const [title, setTitle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ text: "", score: 10 });

  useEffect(() => {
    // Fetch title details
    fetchTitleDetail(id).then(data => setTitle(data)).catch(console.error);
    // Fetch reviews for this title
    fetchReviews(id).then(data => setReviews(data.results || data)).catch(console.error);
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const reviewData = { text: newReview.text, score: Number(newReview.score) };
      const created = await postReview(id, reviewData, token);
      setReviews(prev => [...prev, created]);  // append new review to list
      setNewReview({ text: "", score: 10 });   // reset form
    } catch (err) {
      console.error("Failed to post review:", err);
      // Handle error (e.g., show message that user already reviewed or not authorized)
    }
  };

  if (!title) {
    return <div className="container"><p>Loading title details...</p></div>;
  }

  return (
    <div className="title-page container">
      <h1>{title.name}</h1>
      <p>
        <i>
          {title.genre
            ?.map(g => g.name)
            .join(', ')
          }
        </i>
        {' | '}
        {title.category?.name}
        {' | '}
        {title.year}
      </p>
      <p><b>Рейтинг:</b> {title.rating ? title.rating.toFixed(1) : "Пока нет рейтинга"} / 10
         ({title.review_count || reviews.length} reviews)</p>
      <p>{title.description}</p>

      <hr/>
      <h2>Отзывы</h2>
      {reviews.map(review => (
        <div key={review.id} className="review">
          <p><b>{review.author}:</b> {review.text}</p>
          <p>Оценка: <b>{review.score}</b>/10</p>
          {/* Comments listing could be added here if desired */}
        </div>
      ))}
      {reviews.length === 0 && <p>No reviews yet. Be the first to review this title!</p>}

      {token ? (
        <form className="review-form" onSubmit={handleReviewSubmit}>
          <h3>Оставить отзыв</h3>
          <textarea
            value={newReview.text}
            onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
            placeholder="Write your review..."
            required
          />
          <div>
            <label>Оценка: </label>
            <select
              value={newReview.score}
              onChange={(e) => setNewReview({ ...newReview, score: e.target.value })}>
              {[...Array(10).keys()].map(n => {
                 const score = n + 1;
                 return <option key={score} value={score}>{score}</option>;
              })}
            </select> / 10
          </div>
          <button type="submit">Сохранить</button>
        </form>
      ) : (
        <p><i><a href="/login">Войти</a> чтобы оставить отзыв.</i></p>
      )}
    </div>
  );
}

export default TitlePage;