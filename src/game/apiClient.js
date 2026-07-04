
const API_BASE = import.meta.env?.VITE_ODIN_API_BASE || '';

export async function fetchBackendHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    if (!response.ok) throw new Error(`health ${response.status}`);
    return { online: true, data: await response.json() };
  } catch (error) {
    return { online: false, error: error.message };
  }
}

export async function fetchServerRepositories() {
  // Prefer the documented workshop endpoint; the backend also exposes
  // `/api/github/repositories` as a backwards‑compatible alias. If the
  // request fails, the caller will fall back to GitHub public API
  // transparently.
  const response = await fetch(`${API_BASE}/api/github/workshop`);
  if (!response.ok) throw new Error(`repository sync failed ${response.status}`);
  return response.json();
}

export async function verifyContactToken(token) {
  const response = await fetch(`${API_BASE}/api/contact/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  if (!response.ok) throw new Error(`contact verify failed ${response.status}`);
  return response.json();
}
