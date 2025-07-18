// src/pages/ProfilePage.js
import React, { useEffect, useState } from 'react';
import { fetchUserProfile, updateUserProfile } from '../api';

export default function ProfilePage({ token }) {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ first_name: "", last_name: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    fetchUserProfile(token)
      .then(data => {
        setUser(data);
        setEditData({
          first_name: data.first_name || "",
          last_name: data.last_name || ""
        });
      })
      .catch(err => console.error("Не удалось загрузить профиль:", err));
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateUserProfile(editData, token);
      setUser(updated);
      setMessage("Профиль успешно обновлён.");
      setEditMode(false);
    } catch (err) {
      console.error("Не удалось обновить профиль:", err);
      setMessage("Ошибка обновления профиля.");
    }
  };

  if (!user) {
    return <div className="container"><p>Загрузка профиля…</p></div>;
  }

  return (
    <div className="profile-page container">
      <h1>Профиль</h1>
      <div className="profile-card">
        {!editMode ? (
          <>
            <dl className="profile-info">
              <dt>Никнейм:</dt>   <dd>{user.username}</dd>
              <dt>Почта:</dt>     <dd>{user.email}</dd>
              <dt>Имя:</dt>       <dd>{user.first_name || "-"}</dd>
              <dt>Фамилия:</dt>   <dd>{user.last_name  || "-"}</dd>
            </dl>
            <button
              className="btn-edit"
              onClick={() => {
                setMessage("");
                setEditMode(true);
              }}
            >
              Редактировать
            </button>
          </>
        ) : (
          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-row">
              <label>
                Имя:
                <input
                  type="text"
                  value={editData.first_name}
                  onChange={e => setEditData({ ...editData, first_name: e.target.value })}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Фамилия:
                <input
                  type="text"
                  value={editData.last_name}
                  onChange={e => setEditData({ ...editData, last_name: e.target.value })}
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">Сохранить</button>
              <button type="button" className="btn-cancel" onClick={() => setEditMode(false)}>Отмена</button>
            </div>
          </form>
        )}
        {message && <p className="profile-msg">{message}</p>}
      </div>
    </div>
  );
}