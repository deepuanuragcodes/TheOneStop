// =======================================================
// ONESTOP — shared.js (ONLY DATA LAYER FIXED)
// =======================================================

// ── 1. Initialize dataLayer BEFORE GTM snippet ─────────
window.dataLayer = window.dataLayer || [];
function dlPush(obj) { window.dataLayer.push(obj); }

// ── HELPERS (ADDED FOR VALUE FIX) ─────────
function getNumericPrice(priceStr) {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^\d]/g, '')) || 0;
}
function getCartValue(cart) {
  return cart.reduce((t, i) => t + getNumericPrice(i.price), 0);
}

// ── 2. Page view — fires on every page load ────────────
dlPush({
  event: 'page_view',
  page_path: window.location.pathname,
  page_title: document.title,
  page_location: window.location.href,
  page_type: 'agency_site'
});

// =================== SHARED DATA ===================
const siteData = {
  brandName: 'OneStop',
  whatsapp: '919999999999',
  services: [
    { id: 1, icon: '🌐', name: 'Website Setup', price: 'Starting ₹5,000', desc: '', includes: [], outcome: '', paymentLink: '' },
    { id: 2, icon: '📱', name: 'Instagram Growth & Content', price: 'Starting ₹5,000/month', desc: '', includes: [], outcome: '', paymentLink: '' },
    { id: 3, icon: '🎬', name: 'Video Editing', price: 'Starting ₹2,000', desc: '', includes: [], outcome: '', paymentLink: '' }
  ]
};

// =================== CART ===========================
let cart = JSON.parse(sessionStorage.getItem('os_cart') || '[]');
let coStep = 1;
let selectedPayment = 'card';

function saveCart() { sessionStorage.setItem('os_cart', JSON.stringify(cart)); }

// ADD TO CART (FIXED)
function addToCart(e, service, btn) {
  e.stopPropagation();
  if (cart.find(i => i.id === service.id)) return;
  cart.push({ ...service });
  saveCart();

  dlPush({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'INR',
      value: getNumericPrice(service.price),
      items: [{
        item_id: String(service.id),
        item_name: service.name,
        item_category: 'Digital Service',
        price: getNumericPrice(service.price),
        quantity: 1
      }]
    }
  });
}

// REMOVE FROM CART (FIXED)
function removeFromCart(id) {
  const removed = cart.find(i => i.id === id);
  cart = cart.filter(i => i.id !== id);
  saveCart();

  if (removed) {
    dlPush({
      event: 'remove_from_cart',
      ecommerce: {
        currency: 'INR',
        value: getNumericPrice(removed.price),
        items: [{
          item_id: String(removed.id),
          item_name: removed.name,
          quantity: 1
        }]
      }
    });
  }
}

// VIEW CART (FIXED)
function openCart() {
  dlPush({
    event: 'view_cart',
    ecommerce: {
      currency: 'INR',
      value: getCartValue(cart),
      items: cart.map(s => ({
        item_id: String(s.id),
        item_name: s.name,
        item_category: 'Digital Service',
        price: getNumericPrice(s.price),
        quantity: 1
      }))
    }
  });
}

// BEGIN CHECKOUT (FIXED)
function openCheckout() {
  if (cart.length === 0) return;

  dlPush({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'INR',
      value: getCartValue(cart),
      items: cart.map(s => ({
        item_id: String(s.id),
        item_name: s.name,
        item_category: 'Digital Service',
        price: getNumericPrice(s.price),
        quantity: 1
      }))
    }
  });
}

// PAYMENT STEP (ADDED STANDARD EVENT)
function selectPayment(type) {
  selectedPayment = type;

  dlPush({
    event: 'add_payment_info',
    ecommerce: {
      currency: 'INR',
      payment_type: type,
      value: getCartValue(cart),
      items: cart.map(s => ({
        item_id: String(s.id),
        item_name: s.name,
        price: getNumericPrice(s.price),
        quantity: 1
      }))
    }
  });
}

// PURCHASE (CRITICAL FIX)
function completePurchase(user = {}) {
  const orderId = 'OS-' + Math.floor(100000 + Math.random() * 900000);

  dlPush({
    event: 'purchase',
    ecommerce: {
      transaction_id: orderId,
      currency: 'INR',
      value: getCartValue(cart), // FIXED (was 0 ❌)
      tax: 0,
      shipping: 0,
      payment_type: selectedPayment,
      items: cart.map(s => ({
        item_id: String(s.id),
        item_name: s.name,
        item_category: 'Digital Service',
        price: getNumericPrice(s.price),
        quantity: 1
      }))
    },
    user
  });

  cart = [];
  saveCart();
}

// CONTACT FORM (UPGRADED)
function handleSubmit() {
  dlPush({
    event: 'generate_lead',
    page_path: window.location.pathname
  });
}
