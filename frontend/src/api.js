// src/api.js
const API_BASE = '/api/v1';

async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const config = { method, headers };
  if (data) config.body = JSON.stringify(data);

  const response = await fetch(API_BASE + endpoint, config);
   // Сначала пытаемся распарсить JSON, иначе — текст
   let payload;
   try {
     payload = await response.json();
   } catch {
     payload = await response.text();
   }
   if (!response.ok) {
     const error = new Error(`API error ${response.status}: ${response.statusText}`);
     error.status  = response.status;
     error.payload = payload;
     throw error;
   }
   // Если нет контента, возвращаем null, иначе — распарсенный ответ
   return response.status !== 204 ? payload : null;
 }

// Specific API calls using the generic request:
export function fetchTitles() {
  return apiRequest('/titles/');  // GET list of all titles
}
export function fetchTitleDetail(id) {
  return apiRequest(`/titles/${id}/`);
}
export function fetchReviews(titleId) {
  return apiRequest(`/titles/${titleId}/reviews/`);
}
export function postReview(titleId, reviewData, token) {
  return apiRequest(`/titles/${titleId}/reviews/`, 'POST', reviewData, token);
}
export function postComment(titleId, reviewId, commentData, token) {
  return apiRequest(`/titles/${titleId}/reviews/${reviewId}/comments/`, 'POST', commentData, token);
}

// Auth-related:
export function registerUser(username, email) {
  // Initiate signup – get confirmation code via email
  return apiRequest('/auth/signup/', 'POST', { username, email });
}
export function confirmRegistration(username, code) {
  // Exchange confirmation code for token
  return apiRequest('/auth/token/', 'POST', { username, confirmation_code: code });
}
export function login(username, password) {
  // If the API had a direct login with password (not in YaMDb; uses confirmation code flow instead)
  // This function might not be used since YaMDb uses confirmation code to get token.
}
export function fetchUserProfile(token) {
  return apiRequest('/users/me/', 'GET', null, token);
}
export function updateUserProfile(data, token) {
  return apiRequest('/users/me/', 'PATCH', data, token);
}