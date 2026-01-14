export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050').replace(/\/+$/, '');

export const DEFAULT_ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').trim();
