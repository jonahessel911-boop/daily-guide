const { getSupabase } = require('./supabase');

async function insertLead(lead) {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('Leads: Supabase niet geconfigureerd');
    return { ok: false, error: 'not_configured' };
  }

  const row = {
    product_slug: lead.productSlug || 'zittu',
    country: (lead.country || 'NL').toUpperCase(),
    lander_slug: lead.landerSlug || null,
    naam: lead.naam || null,
    telefoon: lead.telefoon || null,
    email: lead.email || null,
    postcode: lead.postcode || null,
    huisnr: lead.huisnr || null,
    metadata: lead.metadata || {},
  };

  const { error } = await supabase.from('leads').insert(row);
  if (error) {
    console.error('Lead insert error:', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

async function getLeadStats({ from, to, product } = {}) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase niet geconfigureerd', rows: [], totals: { leads: 0 } };

  let query = supabase
    .from('leads')
    .select('lander_slug, product_slug, country, created_at')
    .order('created_at', { ascending: false })
    .limit(5000);

  if (product) query = query.eq('product_slug', product);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message, rows: [], totals: { leads: 0 } };

  const byLander = new Map();
  for (const row of data || []) {
    const lander = row.lander_slug || 'onbekend';
    const key = `${row.product_slug}|${lander}`;
    if (!byLander.has(key)) {
      byLander.set(key, {
        product_slug: row.product_slug,
        lander_slug: lander,
        leads: 0,
      });
    }
    byLander.get(key).leads += 1;
  }

  const rows = [...byLander.values()].sort((a, b) => b.leads - a.leads || a.lander_slug.localeCompare(b.lander_slug));
  const total = rows.reduce((sum, r) => sum + r.leads, 0);

  return {
    ok: true,
    rows: rows.map((r) => ({
      ...r,
      share: total > 0 ? `${((r.leads / total) * 100).toFixed(1)}%` : '0.0%',
    })),
    totals: { leads: total },
    product: product || 'all',
  };
}

module.exports = {
  insertLead,
  getLeadStats,
};
