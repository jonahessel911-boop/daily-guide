const AUTH_KEY = 'admin_auth_token';

function getToken() {
  return sessionStorage.getItem(AUTH_KEY);
}

function clearToken() {
  sessionStorage.removeItem(AUTH_KEY);
}

if (!getToken()) {
  window.location.replace('/admin/');
}

async function parseJsonResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(res.ok ? 'Ongeldig antwoord van server' : `Serverfout (${res.status})`);
  }
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await parseJsonResponse(res);

  if (res.status === 401) {
    clearToken();
    window.location.replace('/admin/');
    throw new Error('Sessie verlopen');
  }

  return { res, data };
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

  try {
    const { data } = await api(`/api/admin/stats${qs}`);

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
      tbody.innerHTML =
        '<tr><td colspan="10" class="empty">Nog geen data — bezoek een lander om te starten.</td></tr>';
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
  } catch (err) {
    if (err.message !== 'Sessie verlopen') {
      document.getElementById('stats-body').innerHTML =
        `<tr><td colspan="10" class="empty">${err.message}</td></tr>`;
    }
  }
}

document.getElementById('btn-refresh').addEventListener('click', loadStats);
document.getElementById('filter-range').addEventListener('change', loadStats);
document.getElementById('btn-logout').addEventListener('click', () => {
  clearToken();
  window.location.replace('/admin/');
});

document.getElementById('btn-test-purchase').addEventListener('click', async () => {
  const btn = document.getElementById('btn-test-purchase');
  const resultEl = document.getElementById('meta-test-result');
  btn.disabled = true;
  btn.textContent = 'Versturen…';
  resultEl.hidden = true;

  try {
    const { data } = await api('/api/admin/test-purchase', { method: 'POST' });
    resultEl.textContent = data.message + (data.eventId ? ` (event_id: ${data.eventId})` : '');
    resultEl.className = `meta-test-result ${data.ok ? 'ok' : 'err'}`;
    resultEl.hidden = false;

    if (data.ok && data.eventId && typeof fbq === 'function') {
      fbq('track', 'Purchase', { currency: 'EUR', value: 17 }, { eventID: data.eventId });
    }
  } catch (err) {
    resultEl.textContent = err.message || 'Kon test niet versturen';
    resultEl.className = 'meta-test-result err';
    resultEl.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send test purchase';
  }
});

loadStats();
