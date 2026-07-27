/**
 * Stuurt Purchase-events naar Meta CAPI voor aankopen die nog niet bevestigd verstuurd zijn.
 *
 *   node scripts/backfill-meta-purchases.js            # toont wat er verstuurd zou worden
 *   node scripts/backfill-meta-purchases.js --send     # verstuurt daadwerkelijk
 *
 * Veilig om te herhalen: Meta dedupliceert op event_id (de payment intent), dus een aankoop
 * die de browserpixel al doorgaf telt niet dubbel.
 */
require('dotenv').config({ override: true });

const { listPurchasesMissingMetaCapi } = require('../lib/analytics');
const { sendPurchaseCapiOnce, getSuccessUrl } = require('../lib/fulfill-purchase');

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? require('stripe')(stripeKey) : null;

// Meta weigert events ouder dan 7 dagen; blijf daar met marge onder.
const MAX_AGE_SECONDS = 6 * 24 * 60 * 60;

function eventTimeFor(intent) {
  const oldestAllowed = Math.floor(Date.now() / 1000) - MAX_AGE_SECONDS;
  return Math.max(intent.created || 0, oldestAllowed);
}

function euro(cents) {
  return `€${((cents || 0) / 100).toFixed(2)}`;
}

async function main() {
  const send = process.argv.includes('--send');

  if (!stripe) {
    console.error('STRIPE_SECRET_KEY ontbreekt.');
    process.exit(1);
  }

  const { ok, error, rows } = await listPurchasesMissingMetaCapi();
  if (!ok) {
    console.error('Kon aankopen niet ophalen:', error);
    process.exit(1);
  }

  if (!rows.length) {
    console.log('Alle aankopen zijn al bevestigd naar Meta verstuurd.');
    return;
  }

  console.log(`${rows.length} aankoop(en) zonder bevestigde Meta CAPI:\n`);

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const label = `${row.product_slug} ${euro(row.amount_cents)} (${row.payment_intent_id})`;

    if (!send) {
      console.log(`  [dry-run] ${label}`);
      continue;
    }

    let intent;
    try {
      intent = await stripe.paymentIntents.retrieve(row.payment_intent_id);
    } catch (err) {
      console.error(`  MISLUKT ${label} — Stripe: ${err.message}`);
      failed += 1;
      continue;
    }

    if (intent.status !== 'succeeded') {
      console.log(`  overgeslagen ${label} — status ${intent.status}`);
      continue;
    }

    const result = await sendPurchaseCapiOnce(intent, {
      eventSourceUrl: getSuccessUrl(),
      eventTime: eventTimeFor(intent),
    });

    if (result.ok && result.skipped) {
      console.log(`  overgeslagen ${label} — ${result.reason}`);
    } else if (result.ok) {
      console.log(`  verstuurd  ${label}`);
      sent += 1;
    } else {
      console.error(`  MISLUKT   ${label} — ${JSON.stringify(result.error)}`);
      failed += 1;
    }
  }

  if (!send) {
    console.log('\nNiets verstuurd. Draai opnieuw met --send om door te zetten.');
    return;
  }

  console.log(`\nKlaar: ${sent} verstuurd, ${failed} mislukt.`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
