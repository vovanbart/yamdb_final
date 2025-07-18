// src/pages/LoginPage.js
import React, { useState } from 'react';
import { confirmRegistration } from '../api';

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "", code: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await confirmRegistration(form.username, form.code);
      const token = data.token;
      onLogin(token);  // pass token up to App
    } catch (err) {
      console.error("Login failed:", err);
      setError("Не удалось войти. Проверьте никнейм и код.");
    }
  };

  return (
    <div className="container">
      <h1>Вход</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Никнейм:
            <input type="text" required
                   value={form.username}
                   onChange={e => setForm({ ...form, username: e.target.value })}/>
          </label>
        </div>
        <div>
          <label>Код:
            <input type="password" required
                   value={form.code}
                   onChange={e => setForm({ ...form, code: e.target.value })}/>
          </label>
        </div>
        <button type="submit">Войти</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
      <p>Нет аккаунта? <a href="/register">Зарегистрироваться</a>.</p>
    </div>
  );
}

export default LoginPage;