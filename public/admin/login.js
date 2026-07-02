const AUTH_KEY = 'admin_auth_token';

function getToken() {
  return sessionStorage.getItem(AUTH_KEY);
}

function setToken(token) {
  sessionStorage.setItem(AUTH_KEY, token);
}

function clearToken() {
  sessionStorage.removeItem(AUTH_KEY);
}

async function parseJsonResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(res.ok ? 'Ongeldig antwoord van server' : `Serverfout (${res.status})`);
  }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('admin-password').value;
  const errEl = document.getElementById('login-error');
  const btn = e.target.querySelector('button[type="submit"]');

  errEl.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Bezig…';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await parseJsonResponse(res);

    if (!res.ok || !data.ok) {
      errEl.textContent = data.error || 'Inloggen mislukt';
      errEl.hidden = false;
      return;
    }

    setToken(data.token);
    window.location.href = '/admin/dashboard.html';
  } catch (err) {
    errEl.textContent = err.message || 'Kon niet verbinden met server';
    errEl.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Inloggen';
  }
});

if (getToken()) {
  window.location.replace('/admin/dashboard.html');
}
