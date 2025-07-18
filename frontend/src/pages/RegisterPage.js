// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { registerUser, confirmRegistration } from '../api';

function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: "", email: "", code: "" });
  const [message, setMessage] = useState("");

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form.username, form.email);
      setMessage("Код подтверждения отправлен на почту.");
      setStep(2);
    } catch (err) {
      console.error("Signup failed:", err);
      setMessage("Error during sign up. Perhaps this username/email is already in use.");
    }
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await confirmRegistration(form.username, form.code);
      const token = data.token;
      // Save token and refresh page state (in real App, we'd propagate to App context)
      localStorage.setItem('authToken', token);
      setMessage("Registration complete! Token obtained.");
      // Optionally redirect or inform App (if using context to update logged-in state)
      window.location.href = "/";  // redirect to home or reload
    } catch (err) {
      console.error("Confirmation failed:", err);
      setMessage("Invalid confirmation code. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1>Регистрация</h1>
      {step === 1 ? (
        <form onSubmit={handleSignupSubmit}>
          <div>
            <label>Никнейм:
              <input type="text" required
                     value={form.username}
                     onChange={e => setForm({ ...form, username: e.target.value })}/>
            </label>
          </div>
          <div>
            <label>Почта:
              <input type="email" required
                     value={form.email}
                     onChange={e => setForm({ ...form, email: e.target.value })}/>
            </label>
          </div>
          <button type="submit">Зарегистрироваться</button>
        </form>
      ) : (
        <form onSubmit={handleConfirmSubmit}>
          <p>{message}</p>
          <div>
            <label>Confirmation Code:
              <input type="text" required
                     value={form.code}
                     onChange={e => setForm({ ...form, code: e.target.value })}/>
            </label>
          </div>
          <button type="submit">Подтвердить</button>
        </form>
      )}
    </div>
  );
}

export default RegisterPage;