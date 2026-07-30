/**
 * 1970cam v2 — buy block.
 * Prices and stock live in PRODUCT so they can be wired to Stripe later.
 */
(function () {
  const PRODUCT = {
    camera: {
      sku: '1970cam',
      title: '1970cam',
      price: 89.99,
      // Server charges a pair at this amount — keep both in sync.
      pairPrice: 159.99,
      maxQty: 5,
    },
    printer: {
      sku: 'printer',
      title: '1970cam Portable Printer',
      price: 89.99,
    },
    stock: {
      inStock: true,
      inStockLine: 'Op voorraad · Verzending binnen 2–5 werkdagen',
      outOfStockLine: 'Tijdelijk uitverkocht · Laat je e-mail achter',
    },
  };

  const CART_KEY = 'cam1970_cart_v1';
  const CHECKOUT_KEY = 'cam1970_checkout_cart';

  const euro = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

  const el = {
    qtyVal: document.getElementById('qty-val'),
    qtyMin: document.getElementById('qty-min'),
    qtyPlus: document.getElementById('qty-plus'),
    camPrice: document.getElementById('cam-price'),
    printer: document.getElementById('add-printer'),
    total: document.getElementById('total-price'),
    submit: document.getElementById('add-to-cart'),
    stock: document.getElementById('stock-line'),
  };

  if (!el.qtyVal || !el.submit) return;

  let qty = 1;

  function cameraTotal(n) {
    const pairs = Math.floor(n / 2);
    const singles = n % 2;
    return pairs * PRODUCT.camera.pairPrice + singles * PRODUCT.camera.price;
  }

  function render() {
    el.qtyVal.textContent = String(qty);
    el.qtyMin.disabled = qty <= 1;
    el.qtyPlus.disabled = qty >= PRODUCT.camera.maxQty;
    el.camPrice.textContent = euro.format(cameraTotal(qty));

    const total = cameraTotal(qty) + (el.printer.checked ? PRODUCT.printer.price : 0);
    el.total.textContent = euro.format(total);
  }

  function buildItems() {
    const items = [
      {
        sku: PRODUCT.camera.sku,
        qty,
        title: PRODUCT.camera.title,
        // null lets the pay page apply the pair price itself
        unitPrice: null,
      },
    ];
    if (el.printer.checked) {
      items.push({
        sku: PRODUCT.printer.sku,
        qty: 1,
        title: PRODUCT.printer.title,
        unitPrice: PRODUCT.printer.price,
      });
    }
    return items;
  }

  function goToPay() {
    const items = buildItems();
    const total = cameraTotal(qty) + (el.printer.checked ? PRODUCT.printer.price : 0);

    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(
          items.map((i) => ({
            sku: i.sku,
            title: i.title,
            qty: i.qty,
            unitPrice: i.sku === PRODUCT.camera.sku ? PRODUCT.camera.price : i.unitPrice,
          }))
        )
      );
      sessionStorage.setItem(
        CHECKOUT_KEY,
        JSON.stringify({
          items,
          qty,
          cameras: qty,
          total,
          productSlug: PRODUCT.camera.sku,
        })
      );
    } catch (_) {
      /* storage unavailable — the pay page falls back to the qty param */
    }

    window.MetaPixel?.trackAddToCart?.({
      value: total,
      contentIds: items.map((i) => i.sku),
      contentName: PRODUCT.camera.title,
      numItems: items.reduce((sum, i) => sum + i.qty, 0),
    });

    const params = new URLSearchParams({
      p: PRODUCT.camera.sku,
      c: 'nl',
      l: 'checkout-v2',
      qty: String(qty),
    });
    window.location.href = `/pay?${params.toString()}`;
  }

  el.qtyMin.addEventListener('click', () => {
    qty = Math.max(1, qty - 1);
    render();
  });

  el.qtyPlus.addEventListener('click', () => {
    qty = Math.min(PRODUCT.camera.maxQty, qty + 1);
    render();
  });

  el.printer.addEventListener('change', render);
  el.submit.addEventListener('click', goToPay);

  if (el.stock) {
    el.stock.textContent = PRODUCT.stock.inStock
      ? PRODUCT.stock.inStockLine
      : PRODUCT.stock.outOfStockLine;
  }
  el.submit.disabled = !PRODUCT.stock.inStock;

  render();
})();
