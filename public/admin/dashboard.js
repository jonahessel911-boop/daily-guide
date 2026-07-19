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

function getStatsQuery() {
  const range = document.getElementById('filter-range').value;
  const { from } = rangeToDates(range);
  return from ? `?from=${encodeURIComponent(from)}` : '';
}

function pageLabel(landerSlug) {
  if (landerSlug === 'checkout') return 'Checkout (ads)';
  if (landerSlug === 'pay') return 'Pay';
  return landerSlug || '—';
}

async function loadStats() {
  const qs = getStatsQuery();

  try {
    const { data } = await api(`/api/admin/stats${qs}`);

    if (!data.ok) {
      document.getElementById('stats-body').innerHTML =
        `<tr><td colspan="9" class="empty">${data.error || 'Fout bij laden'}</td></tr>`;
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
        '<tr><td colspan="9" class="empty">Nog geen data — bezoek /checkout of /pay om te starten.</td></tr>';
    } else {
      tbody.innerHTML = data.rows
        .map(
          (r) => `<tr>
          <td><strong>${pageLabel(r.lander_slug)}</strong><br><span class="muted" style="font-size:12px;">${r.product_slug}</span></td>
          <td>${r.country}</td>
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
  } catch (err) {
    if (err.message !== 'Sessie verlopen') {
      document.getElementById('stats-body').innerHTML =
        `<tr><td colspan="9" class="empty">${err.message}</td></tr>`;
    }
  }
}

document.getElementById('btn-refresh').addEventListener('click', () => {
  loadStats();
});
document.getElementById('filter-range').addEventListener('change', () => {
  loadStats();
});
document.getElementById('btn-logout').addEventListener('click', () => {
  clearToken();
  window.location.replace('/admin/');
});

document.getElementById('btn-test-purchase').addEventListener('click', async () => {
  const btn = document.getElementById('btn-test-purchase');
  const resultEl = document.getElementById('meta-test-result');
  const testCode = document.getElementById('meta-test-code').value.trim();
  if (testCode) sessionStorage.setItem('meta_test_event_code', testCode);

  const eventId = `test-admin-${Date.now()}`;
  const browserFired = window.MetaPixel?.trackPurchase(17, eventId) || false;

  btn.disabled = true;
  btn.textContent = 'Versturen…';
  resultEl.hidden = true;

  try {
    const { data } = await api('/api/admin/test-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, testEventCode: testCode || null, browserFired }),
    });

    const parts = [];
    if (browserFired) parts.push('Browser: Purchase');
    if (data.capi?.ok) parts.push('Server: Purchase (CAPI)');
    else if (data.capi?.skipped) parts.push('Server: overgeslagen (geen Meta token)');

    resultEl.textContent = `${parts.join(' · ') || data.message} — event_id: ${data.eventId}`;
    resultEl.className = `meta-test-result ${browserFired || data.ok ? 'ok' : 'err'}`;
    resultEl.hidden = false;
  } catch (err) {
    resultEl.textContent = (browserFired ? 'Browser Purchase verstuurd. ' : '') + (err.message || 'CAPI mislukt');
    resultEl.className = `meta-test-result ${browserFired ? 'ok' : 'err'}`;
    resultEl.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send test purchase';
  }
});

const savedTestCode = sessionStorage.getItem('meta_test_event_code');
if (savedTestCode) {
  document.getElementById('meta-test-code').value = savedTestCode;
}

loadStats();
