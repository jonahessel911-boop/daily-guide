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

let splitVariants = [];

async function loadTrafficSplits() {
  const tbody = document.getElementById('split-body');
  try {
    const { data } = await api(`/api/admin/traffic-splits${getStatsQuery()}`);

    if (!data.ok) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty">${data.error || 'Fout'}</td></tr>`;
      return;
    }

    const baseUrl = `${window.location.origin}/redirect`;
    document.getElementById('redirect-url').textContent = baseUrl;
    splitVariants = data.variants || [];

    tbody.innerHTML = splitVariants
      .map(
        (v) => `<tr data-lander="${v.lander_slug}">
          <td><strong>${v.lander_slug}</strong><br><span class="muted" style="font-size:12px;">${v.label}</span></td>
          <td><code>${v.destination_path}</code></td>
          <td>
            <input type="number" class="split-weight-input" min="0" max="100" value="${v.weight_percent}" data-lander="${v.lander_slug}">%
            <div class="split-bar"><div class="split-bar-fill" style="width:${v.weight_percent}%"></div></div>
          </td>
          <td>${v.stats?.lander_views ?? 0}</td>
          <td>${v.stats?.purchases ?? 0}</td>
          <td>${v.stats?.cr_lander_to_sale ?? '0.0%'}</td>
          <td>€${v.stats?.revenue ?? '0.00'}</td>
        </tr>`
      )
      .join('');

    updateSplitTotal();
  } catch (err) {
    if (err.message !== 'Sessie verlopen') {
      tbody.innerHTML = `<tr><td colspan="7" class="empty">${err.message}</td></tr>`;
    }
  }
}

function updateSplitTotal() {
  const inputs = document.querySelectorAll('.split-weight-input');
  let total = 0;
  inputs.forEach((input) => {
    total += parseInt(input.value, 10) || 0;
    const fill = input.closest('td')?.querySelector('.split-bar-fill');
    if (fill) fill.style.width = `${Math.min(100, parseInt(input.value, 10) || 0)}%`;
  });
  document.getElementById('split-total').textContent = total;
  const warn = document.getElementById('split-total-warn');
  const saveBtn = document.getElementById('btn-save-splits');
  const invalid = total !== 100;
  warn.hidden = !invalid;
  saveBtn.disabled = invalid;
}

function collectSplitVariants() {
  return splitVariants.map((v) => {
    const input = document.querySelector(`.split-weight-input[data-lander="${v.lander_slug}"]`);
    return {
      lander_slug: v.lander_slug,
      weight_percent: parseInt(input?.value, 10) || 0,
      active: true,
    };
  });
}

async function loadStats() {
  const qs = getStatsQuery();

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

document.getElementById('btn-refresh').addEventListener('click', () => {
  loadStats();
  loadTrafficSplits();
});
document.getElementById('filter-range').addEventListener('change', () => {
  loadStats();
  loadTrafficSplits();
});
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

document.getElementById('split-body').addEventListener('input', (e) => {
  if (e.target.classList.contains('split-weight-input')) updateSplitTotal();
});

document.getElementById('btn-copy-redirect').addEventListener('click', async () => {
  const url = document.getElementById('redirect-url').textContent;
  try {
    await navigator.clipboard.writeText(url);
    const btn = document.getElementById('btn-copy-redirect');
    btn.textContent = 'Gekopieerd!';
    setTimeout(() => { btn.textContent = 'Kopieer URL'; }, 2000);
  } catch {
    window.prompt('Kopieer deze URL:', url);
  }
});

document.getElementById('btn-save-splits').addEventListener('click', async () => {
  const msg = document.getElementById('split-save-msg');
  const btn = document.getElementById('btn-save-splits');
  btn.disabled = true;
  msg.hidden = true;

  try {
    const { data } = await api('/api/admin/traffic-splits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variants: collectSplitVariants() }),
    });

    msg.textContent = data.ok ? 'Splits opgeslagen!' : (data.error || 'Opslaan mislukt');
    msg.className = `split-save-msg ${data.ok ? 'ok' : 'err'}`;
    msg.hidden = false;
    if (data.ok) loadTrafficSplits();
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'split-save-msg err';
    msg.hidden = false;
  } finally {
    updateSplitTotal();
  }
});

loadStats();
loadTrafficSplits();
