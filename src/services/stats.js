import { API_BASE_URL } from './config';
import { getAdminToken } from './token';

export async function fetchWebsiteStats({ days = 30 } = {}) {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE_URL}/api/admin/stats?days=${encodeURIComponent(days)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to load stats');
  return data;
}

