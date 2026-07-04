
export async function createTrustToken({ score, turns, insight, stability, pressure }) {
  const payload = {
    score, turns, insight, stability, pressure
  };

  try {
    const response = await fetch('/api/trust-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) return await response.json();
  } catch {
    // Static hosting fallback. Production hosting should use the FastAPI backend.
  }

  const fallback = {
    scope: 'project-odin-contact-reveal',
    score, turns, insight, stability, pressure,
    issuedAt: new Date().toISOString()
  };
  const encoded = btoa(JSON.stringify(fallback)).replaceAll('=', '');
  return { token: `local-${encoded.slice(0, 24)}`, mode: 'local-fallback', issuedAt: fallback.issuedAt, score };
}
