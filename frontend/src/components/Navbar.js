// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ token, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/"><b>YaMDb Reviews</b></Link>
      </div>
      <div className="nav-right">
        {token ? (
          <>
            <Link to="/profile">Профиль </Link>
            <a href="#logout" onClick={(e) => { e.preventDefault(); onLogout(); }}>Выйти</a>
          </>
        ) : (
          <>
            <Link to="/login">Войти </Link>
            <Link to="/register">Зарегистрироваться</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;