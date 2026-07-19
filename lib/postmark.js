const POSTMARK_API = 'https://api.postmarkapp.com/email';

function isConfigured() {
  return Boolean(
    process.env.POSTMARK_SERVER_TOKEN &&
      process.env.POSTMARK_FROM &&
      process.env.POSTMARK_NOTIFY_TO
  );
}

function formatEuro(amountCents, currency = 'EUR') {
  const amount = (amountCents || 0) / 100;
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency }).format(amount);
}

async function sendEmail({ to, subject, htmlBody, textBody }) {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  const from = process.env.POSTMARK_FROM;

  if (!token || !from) {
    return { ok: false, skipped: true, reason: 'not_configured' };
  }

  const res = await fetch(POSTMARK_API, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': token,
    },
    body: JSON.stringify({
      From: from,
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody,
      MessageStream: 'outbound',
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, error: data.Message || data.ErrorCode || `HTTP ${res.status}` };
  }

  return { ok: true, messageId: data.MessageID };
}

async function sendPurchaseNotification(intent) {
  if (!isConfigured()) {
    return { ok: false, skipped: true, reason: 'not_configured' };
  }

  const meta = intent.metadata || {};
  const amount = formatEuro(intent.amount, (intent.currency || 'eur').toUpperCase());
  const customerEmail = meta.customer_email || intent.receipt_email || '—';
  const paymentMethod = meta.payment_method || '—';
  const lander = meta.lander_slug || 'direct';
  const country = meta.country || 'NL';
  const product = meta.product || '1970cam';
  const orderId = meta.order_id || intent.id;

  const shippingLines = [];
  if (meta.customer_name) shippingLines.push(`Naam: ${meta.customer_name}`);
  if (meta.customer_phone) shippingLines.push(`Telefoon: ${meta.customer_phone}`);
  const street = meta.shipping_street || '';
  const houseNumber = meta.shipping_house_number || '';
  const addition = meta.shipping_house_addition || '';
  const postalCode = meta.shipping_postal_code || '';
  const city = meta.shipping_city || '';

  if (street || houseNumber || postalCode || city) {
    const housePart = [houseNumber, addition].filter(Boolean).join('-');
    const addressLine = [street, housePart].filter(Boolean).join(' ');
    if (addressLine) shippingLines.push(`Adres: ${addressLine}`);
    if (postalCode || city) {
      shippingLines.push(`Postcode / plaats: ${[postalCode, city].filter(Boolean).join(' ')}`);
    }
  }
  if (meta.shipping_country) shippingLines.push(`Land: ${meta.shipping_country}`);
  const shippingBlock = shippingLines.length ? `\n\nVerzending:\n${shippingLines.join('\n')}` : '';

  const subject = `Nieuwe aankoop — ${amount} (${customerEmail})`;

  const textBody = [
    'Nieuwe aankoop op the-daily-guide.com',
    '',
    `Bedrag: ${amount}`,
    `Klant e-mail: ${customerEmail}`,
    `Betaalmethode: ${paymentMethod}`,
    `Product: ${product}`,
    `Lander: ${lander}`,
    `Land: ${country}`,
    `Order: ${orderId}`,
    `Payment intent: ${intent.id}`,
    shippingBlock,
  ]
    .filter(Boolean)
    .join('\n');

  const shippingRows = shippingLines
    .map((line) => {
      const [label, ...rest] = line.split(':');
      return `<tr><td style="padding:8px 0;color:#64748b">${label.trim()}</td><td style="padding:8px 0">${rest.join(':').trim()}</td></tr>`;
    })
    .join('');

  const htmlBody = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:560px">
      <h2 style="margin:0 0 16px;font-size:20px">Nieuwe aankoop</h2>
      <p style="margin:0 0 20px;color:#475569">Er is zojuist een betaling geslaagd op <strong>the-daily-guide.com</strong>.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#64748b">Bedrag</td><td style="padding:8px 0;font-weight:700">${amount}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Klant e-mail</td><td style="padding:8px 0">${customerEmail}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Betaalmethode</td><td style="padding:8px 0">${paymentMethod}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Product</td><td style="padding:8px 0">${product}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Lander</td><td style="padding:8px 0">${lander}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Land</td><td style="padding:8px 0">${country}</td></tr>
        ${shippingRows}
        <tr><td style="padding:8px 0;color:#64748b">Order</td><td style="padding:8px 0">${orderId}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Payment intent</td><td style="padding:8px 0;font-family:monospace;font-size:12px">${intent.id}</td></tr>
      </table>
    </div>
  `.trim();

  return sendEmail({
    to: process.env.POSTMARK_NOTIFY_TO || 'jonahessel911@gmail.com',
    subject,
    htmlBody,
    textBody,
  });
}

async function sendTestEmail() {
  return sendEmail({
    to: process.env.POSTMARK_NOTIFY_TO || 'jonahessel911@gmail.com',
    subject: 'Postmark test — Slaap Beter Slapen',
    htmlBody: '<p><strong>Postmark werkt.</strong> Je ontvangt vanaf nu een mail bij elke nieuwe aankoop.</p>',
    textBody: 'Postmark werkt. Je ontvangt vanaf nu een mail bij elke nieuwe aankoop.',
  });
}

module.exports = {
  isConfigured,
  sendEmail,
  sendPurchaseNotification,
  sendTestEmail,
};
