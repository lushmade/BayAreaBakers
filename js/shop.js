// Bay Area Bakers — Shop Page Logic

// ── Image Carousel ────────────────────────────────────────────
function carouselNav(btn, direction) {
  const carousel = btn.closest('.product-carousel');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  let current = [...slides].findIndex(s => s.classList.contains('active'));
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  current = (current + direction + slides.length) % slides.length;
  slides[current].classList.add('active');
  dots[current].classList.add('active');
}

function carouselGoTo(dot, index) {
  const carousel = dot.closest('.product-carousel');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  slides[index].classList.add('active');
  dots[index].classList.add('active');
}

const PRICES = { jersey: 45, headband: 10, sweatpants: 36 };
const SHIP_RATES = { jersey: 13, headband: 13, sweatpants: 24 };

// Discount codes: code → discounted jersey price
const DISCOUNT_CODES = {
  'BAKERSBRIGADE2026': 25
};
let activeDiscount = null;   // null or { code, jerseyPrice }

// Cart: array of { type, label, price, shippingRate }
const cart = [];

// ── Size button selection ──────────────────────────────────────
document.querySelectorAll('.size-buttons').forEach(group => {
  group.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
});

// ── Size chart toggle ─────────────────────────────────────────
function toggleSizeChart(id) {
  const chart = document.getElementById(id);
  chart.hidden = !chart.hidden;
}

// ── Discount code ────────────────────────────────────────────
function applyDiscount() {
  var input = document.getElementById('discount-code');
  var msgEl = document.getElementById('discount-msg');
  var code  = input.value.trim().toUpperCase();

  msgEl.hidden = true;
  msgEl.className = 'discount-msg';

  if (!code) {
    msgEl.textContent = 'Please enter a discount code.';
    msgEl.classList.add('error');
    msgEl.hidden = false;
    return;
  }

  if (DISCOUNT_CODES[code] !== undefined) {
    activeDiscount = { code: code, jerseyPrice: DISCOUNT_CODES[code] };
    var saving = PRICES.jersey - activeDiscount.jerseyPrice;
    msgEl.textContent = 'Code applied! Jerseys are now $' + activeDiscount.jerseyPrice + ' ($' + saving + ' off). This code is only valid for Bay Area Bakers players.';
    msgEl.classList.add('success');
    msgEl.hidden = false;
    input.disabled = true;
    document.getElementById('discount-apply-btn').hidden = true;
    document.getElementById('discount-remove-btn').hidden = false;

    // Retroactively update all existing jerseys in the cart
    cart.forEach(function (item, idx) {
      if (item && item.type === 'jersey') {
        item.price = activeDiscount.jerseyPrice;
        // Update the rendered row
        var row = document.querySelector('.added-item[data-cart-index="' + idx + '"] .added-item-label');
        if (row) { row.textContent = item.label + ' — $' + item.price; }
      }
    });

    // Update displayed jersey price
    var priceEl = document.querySelector('#jersey-card .product-price');
    if (priceEl) {
      priceEl.innerHTML = '';
      var newPrice = document.createElement('span');
      newPrice.textContent = '$' + activeDiscount.jerseyPrice;
      var oldPrice = document.createElement('span');
      oldPrice.className = 'price-original';
      oldPrice.textContent = '$' + PRICES.jersey;
      priceEl.appendChild(newPrice);
      priceEl.appendChild(document.createTextNode(' '));
      priceEl.appendChild(oldPrice);
    }

    updateSummary();
  } else {
    activeDiscount = null;
    msgEl.textContent = 'Invalid discount code.';
    msgEl.classList.add('error');
    msgEl.hidden = false;
  }
}

// ── Remove discount code ────────────────────────────────────────
function removeDiscount() {
  activeDiscount = null;

  // Reset input
  var input = document.getElementById('discount-code');
  input.disabled = false;
  input.value = '';

  // Swap buttons back and hide message
  document.getElementById('discount-remove-btn').hidden = true;
  document.getElementById('discount-apply-btn').hidden = false;
  var msgEl = document.getElementById('discount-msg');
  msgEl.hidden = true;
  msgEl.className = 'discount-msg';

  // Revert all jerseys in cart to full price
  cart.forEach(function (item, idx) {
    if (item && item.type === 'jersey') {
      item.price = PRICES.jersey;
      var row = document.querySelector('.added-item[data-cart-index="' + idx + '"] .added-item-label');
      if (row) { row.textContent = item.label + ' — $' + item.price; }
    }
  });

  // Restore displayed jersey price
  var priceEl = document.querySelector('#jersey-card .product-price');
  if (priceEl) {
    priceEl.textContent = '$' + PRICES.jersey;
  }

  updateSummary();
}

// ── Add Jersey ────────────────────────────────────────────────
function addJersey() {
  const nameEl = document.getElementById('jersey-name');
  const numEl  = document.getElementById('jersey-number');
  const sizeEl = document.querySelector('#jersey-card .size-btn.selected');
  const errEl  = document.getElementById('jersey-error');

  const name   = nameEl.value.trim().toUpperCase();
  const number = numEl.value.trim();
  const size   = sizeEl ? sizeEl.dataset.size : null;

  errEl.hidden = true;

  if (!name || !number || !size) {
    errEl.textContent = 'Please fill in name, number, and select a size.';
    errEl.hidden = false;
    return;
  }

  if (!/^\d{1,2}$/.test(number)) {
    errEl.textContent = 'Number must be 0–99 (1 or 2 digits).';
    errEl.hidden = false;
    return;
  }

  const jerseyPrice = activeDiscount ? activeDiscount.jerseyPrice : PRICES.jersey;
  const label = `Jersey — #${number} ${name} (${size})`;
  cart.push({ type: 'jersey', label, price: jerseyPrice, shippingRate: SHIP_RATES.jersey });

  renderAddedItem('jersey-list', cart.length - 1, label, jerseyPrice);

  // Reset fields
  nameEl.value = '';
  numEl.value  = '';
  document.querySelectorAll('#jersey-card .size-btn').forEach(b => b.classList.remove('selected'));

  updateSummary();
}

// ── Add Headband ──────────────────────────────────────────────
function addHeadband() {
  const typeEl  = document.querySelector('input[name="headband-type"]:checked');
  const qtyEl   = document.getElementById('headband-qty');
  const errEl   = document.getElementById('headband-error');

  errEl.hidden = true;

  if (!typeEl) {
    errEl.textContent = 'Please select a headband type.';
    errEl.hidden = false;
    return;
  }

  const qty  = Math.max(1, parseInt(qtyEl.value) || 1);
  const type = typeEl.value;

  for (let i = 0; i < qty; i++) {
    const label = `Headband — ${type}`;
    cart.push({ type: 'headband', label, price: PRICES.headband, shippingRate: SHIP_RATES.headband });
    renderAddedItem('headband-list', cart.length - 1, label, PRICES.headband);
  }

  // Reset
  document.querySelectorAll('input[name="headband-type"]').forEach(r => r.checked = false);
  qtyEl.value = 1;

  updateSummary();
}

// ── Add Sweatpants ────────────────────────────────────────────
function addSweatpants() {
  const sizeEl = document.querySelector('#sweatpants-card .size-btn.selected');
  const qtyEl  = document.getElementById('sweats-qty');
  const errEl  = document.getElementById('sweats-error');

  errEl.hidden = true;

  if (!sizeEl) {
    errEl.textContent = 'Please select a size.';
    errEl.hidden = false;
    return;
  }

  const qty  = Math.max(1, parseInt(qtyEl.value) || 1);
  const size = sizeEl.dataset.size;

  for (let i = 0; i < qty; i++) {
    const label = `Sweatpants — ${size}`;
    cart.push({ type: 'sweatpants', label, price: PRICES.sweatpants, shippingRate: SHIP_RATES.sweatpants });
    renderAddedItem('sweats-list', cart.length - 1, label, PRICES.sweatpants);
  }

  // Reset
  document.querySelectorAll('#sweatpants-card .size-btn').forEach(b => b.classList.remove('selected'));
  qtyEl.value = 1;

  updateSummary();
}

// ── Render an added item row ───────────────────────────────────
function renderAddedItem(listId, cartIndex, label, price) {
  const list = document.getElementById(listId);
  const item = document.createElement('div');
  item.className = 'added-item';
  item.dataset.cartIndex = cartIndex;

  const span = document.createElement('span');
  span.className = 'added-item-label';
  span.textContent = label + ' — $' + price;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'remove-btn';
  btn.setAttribute('aria-label', 'Remove');
  btn.textContent = '\u2715';
  btn.addEventListener('click', function () { removeItem(cartIndex); });

  item.appendChild(span);
  item.appendChild(btn);
  list.appendChild(item);
}

// ── Remove item ───────────────────────────────────────────────
function removeItem(cartIndex) {
  cart[cartIndex] = null; // null out rather than splice to preserve indices

  // Remove the DOM element that has this cartIndex
  document.querySelectorAll(`.added-item[data-cart-index="${cartIndex}"]`).forEach(el => el.remove());

  updateSummary();
}

// ── Update order summary ──────────────────────────────────────
function updateSummary() {
  const activeItems = cart.filter(Boolean);

  const summaryEmpty  = document.getElementById('summary-empty');
  const summaryList   = document.getElementById('summary-list');
  const summaryTotals = document.getElementById('summary-totals');

  // Show/hide Snohomish delivery option based on whether sweatpants are in cart
  const hasSweatpants = activeItems.some(i => i.type === 'sweatpants');
  const snohomishOption = document.getElementById('snohomish-delivery-option');
  const snohomishRadio = snohomishOption.querySelector('input[type="radio"]');
  snohomishOption.hidden = !hasSweatpants;
  // If sweatpants removed and Snohomish was selected, clear the selection
  if (!hasSweatpants && snohomishRadio.checked) {
    snohomishRadio.checked = false;
    updateDelivery();
  }

  if (activeItems.length === 0) {
    summaryEmpty.hidden  = false;
    summaryList.hidden   = true;
    summaryTotals.hidden = true;
    return;
  }

  summaryEmpty.hidden  = true;
  summaryList.hidden   = false;
  summaryTotals.hidden = false;

  // Rebuild list
  summaryList.innerHTML = '';
  activeItems.forEach(item => {
    const li = document.createElement('li');
    li.className = 'summary-item';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'summary-item-name';
    nameSpan.textContent = item.label;

    const priceSpan = document.createElement('span');
    priceSpan.className = 'summary-item-price';
    priceSpan.textContent = '$' + item.price;

    li.appendChild(nameSpan);
    li.appendChild(priceSpan);
    summaryList.appendChild(li);
  });

  const subtotal = activeItems.reduce((sum, item) => sum + item.price, 0);
  document.getElementById('summary-subtotal').textContent = `$${subtotal}`;

  // Discount row
  const discountRow = document.getElementById('summary-discount-row');
  if (activeDiscount) {
    const jerseyCount = activeItems.filter(i => i.type === 'jersey').length;
    if (jerseyCount > 0) {
      const perJerseySaving = PRICES.jersey - activeDiscount.jerseyPrice;
      const totalSaving = perJerseySaving * jerseyCount;
      document.getElementById('summary-discount').textContent = '-$' + totalSaving;
      discountRow.hidden = false;
    } else {
      discountRow.hidden = true;
    }
  } else {
    discountRow.hidden = true;
  }

  // Shipping
  const delivery = document.querySelector('input[name="delivery"]:checked');
  let shipping = 0;
  let shippingText = '—';

  if (delivery && (delivery.value === 'pickup' || delivery.value === 'breakers' || delivery.value === 'snohomish')) {
    shippingText = 'Free';
  } else if (delivery && delivery.value === 'ship') {
    const maxRate = Math.max(...activeItems.map(i => i.shippingRate));
    shipping = maxRate;
    shippingText = `$${shipping}`;
  }

  document.getElementById('summary-shipping').textContent = shippingText;
  document.getElementById('summary-total').textContent = `$${subtotal + shipping}`;

  // Update the ship cost label badge
  const shipCostLabel = document.getElementById('ship-cost-label');
  if (activeItems.length > 0) {
    const maxRate = Math.max(...activeItems.map(i => i.shippingRate));
    shipCostLabel.textContent = `$${maxRate} via USPS`;
  } else {
    shipCostLabel.textContent = '—';
  }
}

// ── Show/hide address fields on delivery change ────────────────
function updateDelivery() {
  const delivery = document.querySelector('input[name="delivery"]:checked');
  const addressFields = document.getElementById('address-fields');
  addressFields.hidden = !delivery || delivery.value !== 'ship';
  updateSummary();
}

// ── Order submission via Google Apps Script ──────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzCVSg6kr1AUIhfcOe7klTZhS8BwFMsFHYB6e2ch1AP0ztS9KJM_dt0VrEoOiBWNDLNpA/exec';

function submitOrder_data(data) {
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:     data.name,
      email:    data.email,
      payment:  data.payment,
      delivery: data.delivery,
      address:  data.address || '',
      items:    data.items,
      total:    data.total,
      notes:    data.notes || ''
    })
  }).catch(function () { /* no-cors opaque response expected */ });
}

// ── Form validation & submit ───────────────────────────────────
function submitOrder(e) {
  e.preventDefault();

  const errEl = document.getElementById('form-error');
  errEl.hidden = true;

  const activeItems = cart.filter(Boolean);
  if (activeItems.length === 0) {
    errEl.textContent = 'Please add at least one item to your order.';
    errEl.hidden = false;
    return;
  }

  const name     = document.getElementById('buyer-name').value.trim();
  const email    = document.getElementById('buyer-email').value.trim();
  const payment  = document.getElementById('buyer-payment').value.trim();
  const delivery = document.querySelector('input[name="delivery"]:checked');

  if (!name || !email || !payment || !delivery) {
    errEl.textContent = 'Please fill in all required fields.';
    errEl.hidden = false;
    return;
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEl.textContent = 'Please enter a valid email address.';
    errEl.hidden = false;
    return;
  }

  let address = '';
  if (delivery.value === 'ship') {
    const street = document.getElementById('addr-street').value.trim();
    const city   = document.getElementById('addr-city').value.trim();
    const state  = document.getElementById('addr-state').value.trim();
    const zip    = document.getElementById('addr-zip').value.trim();
    if (!street || !city || !state || !zip) {
      errEl.textContent = 'Please fill in your full shipping address.';
      errEl.hidden = false;
      return;
    }
    address = `${street}, ${city}, ${state} ${zip}`;
  }

  // Build order items text
  const itemLines = activeItems.map(item => item.label + ' — $' + item.price);
  const subtotal  = activeItems.reduce((sum, item) => sum + item.price, 0);
  let shipping    = 0;
  if (delivery.value === 'ship') {
    shipping = Math.max(...activeItems.map(i => i.shippingRate));
  }
  const total = subtotal + shipping;

  const itemsSummary = itemLines.join('\n');
  const totalText    = '$' + total + (shipping > 0 ? ' (incl. $' + shipping + ' shipping)' : ' (pickup)');
  const deliveryText = delivery.value === 'pickup' ? 'Pickup at US Quadball Cup'
    : delivery.value === 'breakers' ? 'Pickup at Bay Area Breakers Practice'
    : delivery.value === 'snohomish' ? 'Pickup at Snohomish National Qualifiers'
    : 'Ship via USPS';
  var notes = document.getElementById('order-notes').value.trim();
  if (activeDiscount) {
    notes = (notes ? notes + '\n' : '') + 'Discount code: ' + activeDiscount.code;
  }

  // Submit order data
  submitOrder_data({
    name:     name,
    email:    email,
    payment:  payment,
    delivery: deliveryText,
    address:  address,
    items:    itemsSummary,
    total:    totalText,
    notes:    notes
  });

  // Show confirmation inline (replace the order section, keep products visible)
  document.getElementById('confirm-name').textContent  = name;
  document.getElementById('confirm-email').textContent = email;

  var orderSection = document.querySelector('.order-section');
  var confirmation = document.getElementById('order-confirmation');

  // Move confirmation card into the order section
  orderSection.innerHTML = '';
  confirmation.hidden = false;
  orderSection.appendChild(confirmation);

  // Scroll to the confirmation
  orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
