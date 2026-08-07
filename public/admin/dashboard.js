const AUTH_KEY = 'admin_auth_token';

const DELIVERY_LABELS = {
  nieuw: 'Nieuw',
  in_behandeling: 'In behandeling',
  verzonden: 'Verzonden',
  geleverd: 'Geleverd',
  geannuleerd: 'Geannuleerd',
};

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
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function qtyLabel(order) {
  const parts = [];
  if (order.cameras) parts.push(`${order.cameras}× camera`);
  if (order.printers) parts.push(`${order.printers}× printer`);
  if (order.hearings) parts.push(`${order.hearings}× hearing`);
  if (!parts.length && order.quantity) parts.push(`${order.quantity}×`);
  return parts.join(' · ') || '—';
}

function deliveryOptions(current, statuses) {
  const list = statuses?.length ? statuses : Object.keys(DELIVERY_LABELS);
  return list
    .map(
      (s) =>
        `<option value="${esc(s)}"${s === current ? ' selected' : ''}>${esc(
          DELIVERY_LABELS[s] || s
        )}</option>`
    )
    .join('');
}

function renderOrderCard(order, statuses) {
  const ship = order.shipping || {};
  const customer = order.customer || {};
  const addressBits = [ship.line1, ship.line2, ship.country].filter(Boolean);

  return `
  <article class="order-card" data-pi="${esc(order.payment_intent_id || '')}">
    <div class="order-card__top">
      <img class="order-card__img" src="${esc(order.product_image)}" alt="" width="72" height="72" loading="lazy">
      <div class="order-card__main">
        <div class="order-card__row">
          <strong class="order-card__id">${esc(order.order_number)}</strong>
          <span class="order-badge order-badge--pay">${esc(order.payment_status || '—')}</span>
        </div>
        <div class="order-card__product">${esc(order.product_name)} <span class="muted">· ${esc(qtyLabel(order))}</span></div>
        <div class="order-card__meta">${esc(fmtDate(order.created_at))} · €${esc(order.amount)} · ${esc(order.payment_method || '—')}</div>
      </div>
      <label class="order-delivery">
        <span>Levering</span>
        <select class="order-delivery-select" data-pi="${esc(order.payment_intent_id || '')}">
          ${deliveryOptions(order.delivery_status || 'nieuw', statuses)}
        </select>
      </label>
    </div>
    <div class="order-card__grid">
      <div>
        <h3>Klant</h3>
        <p>${esc(customer.name || '—')}</p>
        <p><a href="mailto:${esc(customer.email)}">${esc(customer.email || '—')}</a></p>
        <p>${esc(customer.phone || '—')}</p>
      </div>
      <div>
        <h3>Afleveradres</h3>
        ${
          addressBits.length
            ? addressBits.map((l) => `<p>${esc(l)}</p>`).join('')
            : '<p class="muted">Geen adres</p>'
        }
      </div>
      <div>
        <h3>Details</h3>
        <p>Land: ${esc(order.country || '—')}</p>
        <p>Lander: ${esc(order.lander_slug || '—')}</p>
        <p class="order-card__pi">PI: ${esc(order.payment_intent_id || '—')}</p>
      </div>
    </div>
  </article>`;
}

async function loadLeadStats() {
  const tbody = document.getElementById('leads-body');
  const totalEl = document.getElementById('leads-total');
  if (!tbody) return;

  try {
    const qs = getStatsQuery();
    const sep = qs ? '&' : '?';
    const { data } = await api(`/api/admin/leads${qs}${sep}product=zittu`);

    if (!data.ok) {
      tbody.innerHTML = `<tr><td colspan="3" class="empty">${esc(data.error || 'Fout bij laden')}</td></tr>`;
      if (totalEl) totalEl.textContent = 'Totaal: —';
      return;
    }

    const rows = data.rows || [];
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="empty">Nog geen Zittu-leads in deze periode.</td></tr>';
    } else {
      tbody.innerHTML = rows
        .map(
          (r, i) => `<tr>
          <td><strong>${esc(r.lander_slug)}</strong>${i === 0 ? ' <span class="muted">← meeste</span>' : ''}</td>
          <td>${r.leads}</td>
          <td>${esc(r.share)}</td>
        </tr>`
        )
        .join('');
    }

    if (totalEl) totalEl.textContent = `Totaal: ${data.totals?.leads ?? 0} leads`;
  } catch (err) {
    if (err.message !== 'Sessie verlopen') {
      tbody.innerHTML = `<tr><td colspan="3" class="empty">${esc(err.message)}</td></tr>`;
    }
  }
}

async function loadStats() {
  const qs = getStatsQuery();

  try {
    const { data } = await api(`/api/admin/stats${qs}`);

    if (!data.ok) {
      document.getElementById('stats-body').innerHTML =
        `<tr><td colspan="4" class="empty">${data.error || 'Fout bij laden'}</td></tr>`;
      return;
    }

    const t = data.totals;
    document.getElementById('kpi-views').textContent = t.views ?? t.lander_views;
    document.getElementById('kpi-sales').textContent = t.purchases;
    document.getElementById('kpi-cr').textContent = t.conversion_rate || t.cr;
    document.getElementById('kpi-revenue').textContent = `€${t.revenue}`;

    const tbody = document.getElementById('stats-body');
    if (!data.rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="empty">Nog geen data.</td></tr>';
    } else {
      tbody.innerHTML = data.rows
        .map(
          (r) => `<tr>
          <td><strong>${r.product_name || r.product_slug}</strong></td>
          <td>${r.views}</td>
          <td>${r.conversion_rate}</td>
          <td>€${r.revenue}</td>
        </tr>`
        )
        .join('');
    }
  } catch (err) {
    if (err.message !== 'Sessie verlopen') {
      document.getElementById('stats-body').innerHTML =
        `<tr><td colspan="4" class="empty">${err.message}</td></tr>`;
    }
  }

  await loadLeadStats();
}

async function loadOrders() {
  const list = document.getElementById('orders-list');
  const countEl = document.getElementById('orders-count');
  list.innerHTML = '<p class="empty">Laden…</p>';

  try {
    const qs = getStatsQuery();
    const { data } = await api(`/api/admin/orders${qs}`);

    if (!data.ok) {
      list.innerHTML = `<p class="empty">${esc(data.error || 'Fout bij laden')}</p>`;
      countEl.textContent = '—';
      return;
    }

    const orders = data.orders || [];
    countEl.textContent = `${orders.length} order${orders.length === 1 ? '' : 's'}`;

    if (!orders.length) {
      list.innerHTML = '<p class="empty">Nog geen orders in deze periode.</p>';
      return;
    }

    list.innerHTML = orders.map((o) => renderOrderCard(o, data.delivery_statuses)).join('');
  } catch (err) {
    if (err.message !== 'Sessie verlopen') {
      list.innerHTML = `<p class="empty">${esc(err.message)}</p>`;
    }
  }
}

function setTab(tab) {
  document.querySelectorAll('.dash-tab').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.dash-panel').forEach((panel) => {
    const active = panel.dataset.panel === tab;
    panel.classList.toggle('is-active', active);
    panel.hidden = !active;
  });
  if (tab === 'orders') loadOrders();
}

document.querySelectorAll('.dash-tab').forEach((btn) => {
  btn.addEventListener('click', () => setTab(btn.dataset.tab));
});

document.getElementById('btn-refresh').addEventListener('click', () => {
  const active = document.querySelector('.dash-tab.is-active')?.dataset.tab || 'analytics';
  if (active === 'orders') loadOrders();
  else loadStats();
});
document.getElementById('filter-range').addEventListener('change', () => {
  const active = document.querySelector('.dash-tab.is-active')?.dataset.tab || 'analytics';
  if (active === 'orders') loadOrders();
  else loadStats();
});
document.getElementById('btn-logout').addEventListener('click', () => {
  clearToken();
  window.location.replace('/admin/');
});

document.getElementById('orders-list').addEventListener('change', async (e) => {
  const select = e.target.closest('.order-delivery-select');
  if (!select) return;
  const pi = select.dataset.pi;
  const delivery_status = select.value;
  if (!pi) return;

  select.disabled = true;
  try {
    const { data } = await api(`/api/admin/orders/${encodeURIComponent(pi)}/delivery`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_status }),
    });
    if (!data.ok) {
      alert(data.error || 'Status bijwerken mislukt');
      loadOrders();
    }
  } catch (err) {
    if (err.message !== 'Sessie verlopen') alert(err.message);
  } finally {
    select.disabled = false;
  }
});

document.getElementById('btn-test-purchase').addEventListener('click', async () => {
  const btn = document.getElementById('btn-test-purchase');
  const resultEl = document.getElementById('meta-test-result');
  const testCode = document.getElementById('meta-test-code').value.trim();
  if (testCode) sessionStorage.setItem('meta_test_event_code', testCode);

  const eventId = `test-admin-${Date.now()}`;
  const browserFired = false;

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
    parts.push('Browser Purchase: uit');
    if (data.capi?.ok) parts.push('Server: Purchase (CAPI)');
    else if (data.capi?.skipped) parts.push('Server: overgeslagen (geen Meta token)');

    resultEl.textContent = `${parts.join(' · ') || data.message} — event_id: ${data.eventId}`;
    resultEl.className = `meta-test-result ${data.ok ? 'ok' : 'err'}`;
    resultEl.hidden = false;
  } catch (err) {
    resultEl.textContent = err.message || 'CAPI mislukt';
    resultEl.className = 'meta-test-result err';
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
