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

const SPLIT_UI = {
  main: {
    route: 'main',
    checkerUrlId: 'checker-url',
    bodyId: 'split-body',
    totalId: 'split-total',
    warnId: 'split-total-warn',
    saveBtnId: 'btn-save-splits',
    msgId: 'split-save-msg',
  },
  hearing: {
    route: 'hearing',
    checkerUrlId: 'hearing-checker-url',
    bodyId: 'hearing-split-body',
    totalId: 'hearing-split-total',
    warnId: 'hearing-split-total-warn',
    saveBtnId: 'btn-save-hearing-splits',
    msgId: 'hearing-split-save-msg',
  },
  'hearing-be': {
    route: 'hearing-be',
    checkerUrlId: 'hearing-be-checker-url',
    bodyId: 'hearing-be-split-body',
    totalId: 'hearing-be-split-total',
    warnId: 'hearing-be-split-total-warn',
    saveBtnId: 'btn-save-hearing-be-splits',
    msgId: 'hearing-be-split-save-msg',
  },
};

const splitVariantsByRoute = { main: [], hearing: [], 'hearing-be': [] };

function renderSplitRow(v, route) {
  return `<tr data-lander="${v.lander_slug}" data-route="${route}">
    <td><strong>${v.lander_slug}</strong><br><span class="muted" style="font-size:12px;">${v.label}</span></td>
    <td><code>${v.destination_path}</code></td>
    <td>
      <input type="number" class="split-weight-input" min="0" max="100" value="${v.weight_percent}" data-lander="${v.lander_slug}" data-route="${route}">%
      <div class="split-bar"><div class="split-bar-fill" style="width:${v.weight_percent}%"></div></div>
    </td>
    <td>${v.stats?.lander_views ?? 0}</td>
    <td>${v.stats?.purchases ?? 0}</td>
    <td>${v.stats?.cr_lander_to_sale ?? '0.0%'}</td>
    <td>€${v.stats?.revenue ?? '0.00'}</td>
  </tr>`;
}

async function loadTrafficSplitsForRoute(ui) {
  const tbody = document.getElementById(ui.bodyId);
  try {
    const baseQs = getStatsQuery();
    const routeQs = baseQs ? `${baseQs}&route=${ui.route}` : `?route=${ui.route}`;
    const { data } = await api(`/api/admin/traffic-splits${routeQs}`);

    if (!data.ok) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty">${data.error || 'Fout'}</td></tr>`;
      return;
    }

    const baseUrl = `${window.location.origin}${data.checker_url}`;
    document.getElementById(ui.checkerUrlId).textContent = baseUrl;
    splitVariantsByRoute[ui.route] = data.variants || [];

    tbody.innerHTML = splitVariantsByRoute[ui.route]
      .map((v) => renderSplitRow(v, ui.route))
      .join('');

    updateSplitTotal(ui.route);
  } catch (err) {
    if (err.message !== 'Sessie verlopen') {
      tbody.innerHTML = `<tr><td colspan="7" class="empty">${err.message}</td></tr>`;
    }
  }
}

function loadTrafficSplits() {
  return Promise.all([
    loadTrafficSplitsForRoute(SPLIT_UI.main),
    loadTrafficSplitsForRoute(SPLIT_UI.hearing),
    loadTrafficSplitsForRoute(SPLIT_UI['hearing-be']),
  ]);
}

function updateSplitTotal(route) {
  const ui = SPLIT_UI[route];
  const inputs = document.querySelectorAll(`.split-weight-input[data-route="${route}"]`);
  let total = 0;
  inputs.forEach((input) => {
    total += parseInt(input.value, 10) || 0;
    const fill = input.closest('td')?.querySelector('.split-bar-fill');
    if (fill) fill.style.width = `${Math.min(100, parseInt(input.value, 10) || 0)}%`;
  });
  document.getElementById(ui.totalId).textContent = total;
  const warn = document.getElementById(ui.warnId);
  const saveBtn = document.getElementById(ui.saveBtnId);
  const invalid = total !== 100;
  warn.hidden = !invalid;
  saveBtn.disabled = invalid;
}

function collectSplitVariants(route) {
  return splitVariantsByRoute[route].map((v) => {
    const input = document.querySelector(
      `.split-weight-input[data-route="${route}"][data-lander="${v.lander_slug}"]`
    );
    return {
      lander_slug: v.lander_slug,
      weight_percent: parseInt(input?.value, 10) || 0,
      active: true,
    };
  });
}

async function saveSplitsForRoute(route) {
  const ui = SPLIT_UI[route];
  const msg = document.getElementById(ui.msgId);
  const btn = document.getElementById(ui.saveBtnId);
  btn.disabled = true;
  msg.hidden = true;

  try {
    const { data } = await api('/api/admin/traffic-splits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route, variants: collectSplitVariants(route) }),
    });

    msg.textContent = data.ok ? 'Splits opgeslagen!' : (data.error || 'Opslaan mislukt');
    msg.className = `split-save-msg ${data.ok ? 'ok' : 'err'}`;
    msg.hidden = false;
    if (data.ok) await loadTrafficSplitsForRoute(ui);
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'split-save-msg err';
    msg.hidden = false;
  } finally {
    updateSplitTotal(route);
  }
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

document.addEventListener('input', (e) => {
  if (e.target.classList.contains('split-weight-input') && e.target.dataset.route) {
    updateSplitTotal(e.target.dataset.route);
  }
});

async function copyCheckerUrl(urlElId, btnId) {
  const url = document.getElementById(urlElId).textContent;
  try {
    await navigator.clipboard.writeText(url);
    const btn = document.getElementById(btnId);
    btn.textContent = 'Gekopieerd!';
    setTimeout(() => { btn.textContent = 'Kopieer URL'; }, 2000);
  } catch {
    window.prompt('Kopieer deze URL:', url);
  }
}

document.getElementById('btn-copy-checker').addEventListener('click', () => {
  copyCheckerUrl('checker-url', 'btn-copy-checker');
});

document.getElementById('btn-copy-hearing-checker').addEventListener('click', () => {
  copyCheckerUrl('hearing-checker-url', 'btn-copy-hearing-checker');
});

document.getElementById('btn-copy-hearing-be-checker').addEventListener('click', () => {
  copyCheckerUrl('hearing-be-checker-url', 'btn-copy-hearing-be-checker');
});

document.getElementById('btn-save-splits').addEventListener('click', () => saveSplitsForRoute('main'));
document.getElementById('btn-save-hearing-splits').addEventListener('click', () => saveSplitsForRoute('hearing'));
document.getElementById('btn-save-hearing-be-splits').addEventListener('click', () => saveSplitsForRoute('hearing-be'));

loadStats();
loadTrafficSplits();
