// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_ROOT = '/api/v1';

function HomePage() {
  const [titles, setTitles]   = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [count, setCount]     = useState(0);

  // загрузить страницу по любому URL (абсолютному или относительному)
  const loadPage = (url) => {
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => {
        setTitles(data.results);
        setNextUrl(data.next);
        setPrevUrl(data.previous);
        setCount(data.count);
      })
      .catch(err => {
        console.error('Failed to load titles:', err);
      });
  };

  // на монтировании грузим первую страницу
  useEffect(() => {
    loadPage(`${API_ROOT}/titles/`);
  }, []);

  return (
    <div className="home-page container">
      <h1>Все произведения ({count})</h1>

      <div className="title-list">
        {titles.map(title => (
          <div key={title.id} className="title-card">
            <h2>
              <Link to={`/titles/${title.id}`}>{title.name}</Link>
            </h2>
            <p className="title-meta">
              Категория: {title.category?.name || 'N/A'}
              {title.year ? ` | Год: ${title.year}` : ""}
            </p>
            <p>
              Рейтинг: <b>{title.rating != null ? title.rating.toFixed(1) : "N/A"}</b> / 10
            </p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          disabled={!prevUrl}
          onClick={() => prevUrl && loadPage(prevUrl)}
        >
          ← Предыдущая
        </button>
        <button
          disabled={!nextUrl}
          onClick={() => nextUrl && loadPage(nextUrl)}
        >
          Следующая →
        </button>
      </div>
    </div>
  );
}

export default HomePage;