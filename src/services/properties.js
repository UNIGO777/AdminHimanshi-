import { API_BASE_URL } from './config';
import { getAdminToken } from './token';

async function apiRequest(path, { method = 'GET', body } = {}) {
  const token = getAdminToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data;
}

async function uploadRequest(path, formData) {
  const token = getAdminToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Upload failed');
  return data;
}

export async function listProperties() {
  return apiRequest('/api/properties');
}

export async function searchProperties(params = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || String(v).trim() === '') continue;
    search.set(k, String(v));
  }
  const qs = search.toString();
  return apiRequest(`/api/properties/search${qs ? `?${qs}` : ''}`);
}

export async function getProperty(id) {
  return apiRequest(`/api/properties/${encodeURIComponent(id)}`);
}

export async function createProperty(payload) {
  return apiRequest('/api/properties', { method: 'POST', body: payload });
}

export async function updateProperty(id, payload) {
  return apiRequest(`/api/properties/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });
}

export async function deleteProperty(id) {
  return apiRequest(`/api/properties/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function listFeaturedProperties() {
  return apiRequest('/api/properties/featured');
}

export async function setPropertyFeatured(id, isFeatured) {
  return apiRequest(`/api/properties/${encodeURIComponent(id)}/featured`, { method: 'PATCH', body: { isFeatured } });
}

export async function uploadImage(file) {
  const form = new FormData();
  form.append('file', file);
  const data = await uploadRequest('/api/upload/image', form);
  return data?.url;
}

export async function uploadImages(files) {
  const form = new FormData();
  for (const f of files) form.append('files', f);
  const data = await uploadRequest('/api/upload/images', form);
  const list = Array.isArray(data?.files) ? data.files : [];
  return list.map((x) => x?.url).filter(Boolean);
}

export async function uploadVideo(file) {
  const form = new FormData();
  form.append('file', file);
  const data = await uploadRequest('/api/upload/video', form);
  return data?.url;
}

export async function searchQueries(params = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || String(v).trim() === '') continue;
    search.set(k, String(v));
  }
  const qs = search.toString();
  return apiRequest(`/api/queries/search${qs ? `?${qs}` : ''}`);
}

export async function searchRatings(params = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || String(v).trim() === '') continue;
    search.set(k, String(v));
  }
  const qs = search.toString();
  return apiRequest(`/api/ratings/search${qs ? `?${qs}` : ''}`);
}

export async function searchUsers(params = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || String(v).trim() === '') continue;
    search.set(k, String(v));
  }
  const qs = search.toString();
  return apiRequest(`/api/users/search${qs ? `?${qs}` : ''}`);
}

export async function setUserBlocked(id, isBlocked) {
  return apiRequest(`/api/users/${encodeURIComponent(id)}/block`, { method: 'PATCH', body: { isBlocked } });
}
