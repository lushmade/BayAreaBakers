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

const PRICES = { jersey: 45, headband: 10, sweatpants: 40 };
const SHIP_RATES = { jersey: 13, headband: 13, sweatpants: 24 };

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

  const label = `Jersey — #${number} ${name} (${size})`;
  cart.push({ type: 'jersey', label, price: PRICES.jersey, shippingRate: SHIP_RATES.jersey });

  renderAddedItem('jersey-list', cart.length - 1, label, PRICES.jersey);

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

  // Shipping
  const delivery = document.querySelector('input[name="delivery"]:checked');
  let shipping = 0;
  let shippingText = '—';

  if (delivery && delivery.value === 'pickup') {
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
  const deliveryText = delivery.value === 'pickup' ? 'Pickup at US Quadball Cup' : 'Ship via USPS';
  const notes        = document.getElementById('order-notes').value.trim();

  // Submit to Google Form
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
