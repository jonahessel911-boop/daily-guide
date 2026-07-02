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

async function api(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${getToken()}`,
  };
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    showLogin();
    throw new Error('Unauthorized');
  }
  return res.json();
}

function showLogin() {
  document.getElementById('login-screen').hidden = false;
  document.getElementById('dashboard').hidden = true;
}

function showDashboard() {
  document.getElementById('login-screen').hidden = true;
  document.getElementById('dashboard').hidden = false;
}

function rangeToDates(value) {
  if (value === 'all') return {};
  const days = parseInt(value, 10);
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from: from.toISOString() };
}

async function loadStats() {
  const range = document.getElementById('filter-range').value;
  const { from } = rangeToDates(range);
  const qs = from ? `?from=${encodeURIComponent(from)}` : '';

  const data = await api(`/api/admin/stats${qs}`);
  if (!data.ok) {
    document.getElementById('stats-body').innerHTML =
      `<tr><td colspan="10" class="empty">${data.error || 'Fout bij laden'}</td></tr>`;
    return;
  }

  const t = data.totals;
  document.getElementById('kpi-views').textContent = t.lander_views;
  document.getElementById('kpi-checkout').textContent = t.checkout_views;
  document.getElementById('kpi-ctr').textContent = t.ctr;
  document.getElementById('kpi-sales').textContent = t.purchases;
  document.getElementById('kpi-revenue').textContent = `€${t.revenue}`;
  document.getElementById('kpi-cr').textContent = t.cr;

  const tbody = document.getElementById('stats-body');
  if (!data.rows.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty">Nog geen data — bezoek een lander om te starten.</td></tr>';
  } else {
    tbody.innerHTML = data.rows
      .map(
        (r) => `<tr>
          <td><strong>${r.product_slug}</strong></td>
          <td>${r.country}</td>
          <td>${r.lander_slug}</td>
          <td>${r.lander_views}</td>
          <td>${r.checkout_views}</td>
          <td>${r.ctr_lander_to_checkout}</td>
          <td>${r.purchases}</td>
          <td>€${r.revenue}</td>
          <td>${r.cr_lander_to_sale}</td>
          <td>${r.cr_checkout_to_sale}</td>
        </tr>`
      )
      .join('');
  }

  const landersBody = document.getElementById('landers-body');
  landersBody.innerHTML = (data.landers || [])
    .map(
      (l) => `<tr>
        <td><code>${l.slug}</code></td>
        <td>${l.name}</td>
        <td>${l.product_slug}</td>
        <td><code>${l.path}</code></td>
      </tr>`
    )
    .join('');
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('admin-password').value;
  const errEl = document.getElementById('login-error');

  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();

  if (!data.ok) {
    errEl.textContent = 'Onjuist wachtwoord';
    errEl.hidden = false;
    return;
  }

  setToken(data.token);
  errEl.hidden = true;
  showDashboard();
  loadStats();
});

document.getElementById('btn-refresh').addEventListener('click', loadStats);
document.getElementById('filter-range').addEventListener('change', loadStats);
document.getElementById('btn-logout').addEventListener('click', () => {
  clearToken();
  showLogin();
});

if (getToken()) {
  showDashboard();
  loadStats();
} else {
  showLogin();
}
