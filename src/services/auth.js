import { API_BASE_URL } from './config';

export async function adminLogin(email) {
  const res = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Admin login failed');
  return data;
}

export async function adminVerifyOtp(email, otp) {
  const res = await fetch(`${API_BASE_URL}/api/admin/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Admin OTP verify failed');
  return data; // { token }
}
