// =======================================================
// ONESTOP — shared.js  (GTM dataLayer events baked in)
// Every line marked  ← GTM  is a dataLayer push
  whatsapp: '919999999999',

// ── 1. Initialize dataLayer BEFORE GTM snippet ─────────
window.dataLayer = window.dataLayer || [];          // ← GTM
function dlPush(obj) {
  // 🧹 Clear previous ecommerce (VERY IMPORTANT for GTM)
  window.dataLayer.push({ ecommerce: null });

  // 🚀 Push fresh event
  window.dataLayer.push(obj);

  // 👀 See events in console (for debugging)
  console.log("🔥 DL EVENT:", obj);
}

// ── 2. Page view — fires on every page load ────────────
dlPush({                                            // ← GTM
  event:      'page_view',
  page_path:   window.location.pathname,
  page_title:  document.title,
  page_type:  'agency_site'
});

// =================== SHARED DATA ===================
const siteData = {
  brandName: 'OneStop',
  whatsapp: '919999999999',
  services: [
    { id: 1, icon: '🌐', name: 'Website Setup', price: 'Starting ₹5,000', desc: 'Get your business online with a clean, modern, and professional website.', includes: ['Responsive design', 'SEO basics', 'Fast delivery', 'Mobile-first approach'], outcome: 'Your business goes from offline to online presence', paymentLink: '' },
    { id: 2, icon: '📱', name: 'Instagram Growth & Content', price: 'Starting ₹5,000/month', desc: 'Grow your Instagram with strategy, consistency, and high-performing content.', includes: ['Content planning', 'Caption writing', 'Posting strategy', 'Engagement tactics'], outcome: 'More reach, engagement, and growth', paymentLink: '' },
    { id: 3, icon: '🎬', name: 'Video Editing', price: 'Starting ₹2,000', desc: 'High-quality edits designed to grab attention and increase retention.', includes: ['Subtitles', 'Effects & transitions', 'Clean cuts', 'Color grading'], outcome: 'Content that performs better', paymentLink: '' }
  ],
  portfolio: [
    { id: 1, title: 'Fashion Brand Website', desc: 'Clean e-commerce site with product showcase', category: 'website', emoji: '👗', bg: '#1a1a2e' },
    { id: 2, title: 'Fitness Coach Reels',   desc: '30-day Instagram content series with 3x growth', category: 'content', emoji: '💪', bg: '#1a2e1a' },
    { id: 3, title: 'Startup Brand Film',    desc: 'Cinematic brand video for product launch', category: 'video', emoji: '🎥', bg: '#2e1a1a' },
    { id: 4, title: 'Food Blog Website',     desc: 'Recipe-focused site with clean navigation', category: 'website', emoji: '🍜', bg: '#2e2a1a' },
    { id: 5, title: 'Creator Logo Pack',     desc: 'Complete visual identity for a YouTuber', category: 'design', emoji: '🎨', bg: '#1a1e2e' },
    { id: 6, title: 'Podcast Reel Edits',    desc: '15 short-form clips for social media growth', category: 'video', emoji: '🎙️', bg: '#2a1a2e' }
  ],
  whyPoints: [
    { num: '01', title: 'Results, not just delivery', desc: 'We measure success by your growth, not just the tasks completed. Every move has a purpose.' },
    { num: '02', title: 'Personalized approach',      desc: 'Your brand is unique. We build custom strategies tailored to your goals and audience.' },
    { num: '03', title: 'Fast execution',             desc: 'Ideas lose momentum when delayed. We move quickly to keep your brand ahead.' },
    { num: '04', title: 'Built for creators',         desc: 'We understand the creator economy. We speak your language and know what works.' }
  ]
};

// =================== NAV MOBILE =====================
function toggleMenu() { document.getElementById('mobileMenu').classList.toggle('open'); }
function closeMenu()  { document.getElementById('mobileMenu').classList.remove('open'); }

// =================== REVEAL ANIMATION ===============
function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// =================== CART ===========================
let cart = JSON.parse(sessionStorage.getItem('os_cart') || '[]');
let coStep = 1;
let selectedPayment = 'card';

function saveCart() { sessionStorage.setItem('os_cart', JSON.stringify(cart)); }

function addToCart(e, service, btn) {
  e.stopPropagation();
  if (cart.find(i => i.id === service.id)) { openCart(); return; }
  cart.push({ ...service });
  saveCart(); updateCartUI();
  if (btn) { btn.textContent = 'Added'; btn.classList.add('added'); }
  const cc = document.getElementById('cartCount');
  if (cc) { cc.style.transform = 'scale(1.4)'; setTimeout(() => cc.style.transform = '', 200); }

  dlPush({                                          // ← GTM: add_to_cart
    event: 'add_to_cart',
    ecommerce: {
      currency: 'INR',
      items: [{ item_id: String(service.id), item_name: service.name, item_category: 'Digital Service', price: 0, quantity: 1 }]
    }
  });

  openCart();
}

function buyNow(e, service) {
  e.stopPropagation();
  if (!cart.find(i => i.id === service.id)) cart.push({ ...service });
  saveCart(); updateCartUI();

  dlPush({                                          // ← GTM: buy_now_click
    event: 'buy_now_click',
    service_name: service.name,
    service_id: String(service.id),
    service_price: service.price
  });

  openCheckout();
}

function removeFromCart(id) {
  const removed = cart.find(i => i.id === id);
  cart = cart.filter(i => i.id !== id);
  saveCart(); updateCartUI(); renderCartItems();

  if (removed) {
    dlPush({                                        // ← GTM: remove_from_cart
      event: 'remove_from_cart',
      ecommerce: {
        currency: 'INR',
        items: [{ item_id: String(removed.id), item_name: removed.name, quantity: 1 }]
      }
    });
  }
}

function updateCartUI() {
  const count = cart.length;
  document.querySelectorAll('.cart-count').forEach(cc => {
    cc.textContent = count;
    cc.classList.toggle('visible', count > 0);
  });
  const el = document.getElementById('cartItemCount');
  if (el) el.textContent = `${count} item${count !== 1 ? 's' : ''}`;
  renderCartItems();
}

function renderCartItems() {
  const list   = document.getElementById('cartItemsList');
  const footer = document.getElementById('cartFooter');
  if (!list) return;
  if (cart.length === 0) {
    list.innerHTML = `<div class="cart-empty"><span class="cart-empty-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></span>Your cart is empty.<br>Add a service to get started.</div>`;
    if (footer) footer.style.display = 'none';
    return;
  }
  list.innerHTML = cart.map(s => `
    <div class="cart-item">
      <div class="cart-item-icon">${s.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${s.name}</div>
        <div class="cart-item-price">${s.price}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${s.id})" title="Remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
    </div>`).join('');
  if (footer) {
    footer.style.display = 'block';
    document.getElementById('cartTotal').textContent = cart.length > 1 ? 'Custom Quote' : cart[0].price;
  }
}

function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartItems();

  dlPush({                                          // ← GTM: view_cart
    event: 'view_cart',
    cart_item_count: cart.length,
    ecommerce: {
      currency: 'INR',
      items: cart.map(s => ({ item_id: String(s.id), item_name: s.name, item_category: 'Digital Service', quantity: 1 }))
    }
  });
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
  document.body.style.overflow = '';
}

// =================== CHECKOUT =======================
function buildOrderSummaryHTML() {
  const items = cart.map(s => `<div class="order-mini-item"><span class="order-mini-name">${s.name}</span><span class="order-mini-price">${s.price}</span></div>`).join('');
  const total = cart.length > 1 ? 'Custom Quote' : (cart[0] ? cart[0].price : '—');
  return `<h5>Order Summary</h5>${items}<div class="order-mini-item order-mini-total"><span class="order-mini-name">Total</span><span class="order-mini-price">${total}</span></div>`;
}

function openCheckout() {
  if (cart.length === 0) return;
  closeCart(); coStep = 1; updateCoStep();
  ['coOrderSummary','coOrderSummary2','coOrderSummary3'].forEach(id => {
    const el = document.getElementById(id); if (el) el.innerHTML = buildOrderSummaryHTML();
  });
  document.getElementById('checkoutOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  dlPush({                                          // ← GTM: begin_checkout
    event: 'begin_checkout',
    ecommerce: {
      currency: 'INR',
      items: cart.map(s => ({ item_id: String(s.id), item_name: s.name, item_category: 'Digital Service', quantity: 1 }))
    }
  });
}

function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('open');
  document.body.style.overflow = '';
  coStep = 1;
  document.querySelectorAll('.checkout-section').forEach(s => s.classList.remove('active'));
  const s1 = document.getElementById('co-step-1'); if (s1) s1.classList.add('active');
  const cf = document.getElementById('checkoutFooter'); if (cf) cf.style.display = '';
}

function updateCoStep() {
  document.querySelectorAll('.checkout-section').forEach(s => s.classList.remove('active'));
  if (coStep === 4) {
    document.getElementById('co-success').classList.add('active');
    document.getElementById('checkoutFooter').style.display = 'none';
  } else {
    document.getElementById(`co-step-${coStep}`).classList.add('active');
    document.getElementById('checkoutFooter').style.display = '';
  }
  [1,2,3].forEach(n => {
    const dot = document.getElementById(`cdot-${n}`);
    const line = document.getElementById(`cline-${n}`);
    const lbl  = document.getElementById(`clbl-${n}`);
    if (dot)  { dot.className  = 'checkout-step-dot' + (n < coStep ? ' done' : n === coStep ? ' active' : ''); dot.textContent = n < coStep ? '✓' : n; }
    if (line)   line.className = 'checkout-step-line' + (n < coStep ? ' done' : '');
    if (lbl)    lbl.className  = 'checkout-step-lbl'  + (n === coStep ? ' active' : '');
  });
  const titles = ['','Your Details','Payment','Confirm Order'];
  const subs   = ['','Tell us who you are so we can get started.','Choose your preferred payment method.','Review and confirm your order.'];
  document.getElementById('coHeadTitle').textContent = titles[coStep] || '';
  document.getElementById('coHeadSub').textContent   = subs[coStep]   || '';
  document.getElementById('btnCoBack').style.display = coStep > 1 ? '' : 'none';
  document.getElementById('btnCoNext').textContent   = coStep === 3 ? 'Place Order' : 'Continue';
}

function coNext() {
  if (coStep === 1) {
    const fname = document.getElementById('co-fname').value.trim();
    const email = document.getElementById('co-email').value.trim();
    if (!fname || !email) { shakeField(!fname ? 'co-fname' : 'co-email'); return; }

    dlPush({ event: 'checkout_step_complete', checkout_step: 1, step_name: 'customer_details' }); // ← GTM

    coStep = 2;
  } else if (coStep === 2) {

    dlPush({                                        // ← GTM: checkout_step_complete step 2
      event: 'checkout_step_complete',
      checkout_step: 2,
      step_name: 'payment_method',
      payment_type: selectedPayment,
      ecommerce: { payment_type: selectedPayment }
    });

    coStep = 3;
    const fname = document.getElementById('co-fname').value;
    const lname = document.getElementById('co-lname').value;
    const email = document.getElementById('co-email').value;
    const phone = document.getElementById('co-phone').value;
    document.getElementById('coConfirmDetails').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem 1.5rem">
        <div><div style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Name</div><div style="color:var(--white);font-weight:600">${fname} ${lname}</div></div>
        <div><div style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Email</div><div style="color:var(--white);font-weight:600">${email}</div></div>
        <div><div style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Phone</div><div style="color:var(--white);font-weight:600">${phone || '—'}</div></div>
        <div><div style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Payment</div><div style="color:var(--white);font-weight:600;text-transform:capitalize">${selectedPayment}</div></div>
      </div>`;
  } else if (coStep === 3) {
    const btn = document.getElementById('btnCoNext');
    btn.textContent = 'Processing...'; btn.disabled = true;
    setTimeout(() => {
      btn.disabled = false; coStep = 4;
      const orderId = 'OS-' + Math.floor(100000 + Math.random() * 900000);
      document.getElementById('coOrderId').textContent = `Order #${orderId}`;
      const fname = document.getElementById('co-fname') ? document.getElementById('co-fname').value : '';
      const email = document.getElementById('co-email') ? document.getElementById('co-email').value : '';

      dlPush({                                      // ← GTM: purchase
        event: 'purchase',
        ecommerce: {
          transaction_id: orderId,
          currency: 'INR',
          value: 0,
          payment_type: selectedPayment,
          items: cart.map(s => ({ item_id: String(s.id), item_name: s.name, item_category: 'Digital Service', quantity: 1 }))
        },
        user: { name: fname, email: email }
      });

      cart = []; saveCart(); updateCartUI(); updateCoStep();
    }, 1800);
    return;
  }
  updateCoStep();
}

function coBack() { if (coStep > 1) { coStep--; updateCoStep(); } }

function shakeField(id) {
  const el = document.getElementById(id);
  el.style.borderColor = 'rgba(255,80,80,0.6)';
  el.style.boxShadow   = '0 0 0 3px rgba(255,80,80,0.1)';
  el.focus();
  setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 2000);
}
function selectPayment(type, el) {
  selectedPayment = type;
  document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('cardFields').classList.toggle('visible', type === 'card');
  document.getElementById('upiField').classList.toggle('visible', type === 'upi');
}
function formatCard(el) {
  let v = el.value.replace(/\D/g,'').substring(0,16);
  el.value = v.replace(/(.{4})/g,'$1 ').trim();
  document.getElementById('cardBrand').textContent = v.startsWith('4') ? 'VISA' : v.startsWith('5') ? 'MC' : v.startsWith('6') ? 'RuPay' : 'CARD';
}
function formatExpiry(el) {
  let v = el.value.replace(/\D/g,'');
  if (v.length >= 2) v = v.substring(0,2) + ' / ' + v.substring(2,4);
  el.value = v;
}

// =================== ADMIN ==========================
function openAdmin()  { document.getElementById('adminModal').classList.add('open'); renderAdminServices(); renderAdminPortfolio(); }
function closeAdmin() { document.getElementById('adminModal').classList.remove('open'); }
function switchTab(tab, e) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  (e || event).target.classList.add('active');
  document.getElementById(`tab-${tab}`).classList.add('active');
}
function showToast() {
  const t = document.getElementById('toast'); t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
function renderAdminServices() {
  document.getElementById('adminServicesList').innerHTML = siteData.services.map((s,i) => `
    <div class="admin-service-item">
      <div class="admin-service-header">
        <div class="admin-service-name">${s.icon} ${s.name}</div>
        <button class="admin-delete" onclick="siteData.services.splice(${i},1);renderAdminServices()">Remove</button>
      </div>
      <div class="admin-field"><label>Service Name</label><input type="text" value="${s.name}" onchange="siteData.services[${i}].name=this.value"></div>
      <div class="admin-field"><label>Icon (Emoji)</label><input type="text" value="${s.icon}" onchange="siteData.services[${i}].icon=this.value" style="width:80px"></div>
      <div class="admin-field"><label>Price Text</label><input type="text" value="${s.price}" onchange="siteData.services[${i}].price=this.value"></div>
      <div class="admin-field"><label>Description</label><textarea rows="2" onchange="siteData.services[${i}].desc=this.value">${s.desc}</textarea></div>
      <div class="admin-field"><label>Outcome</label><input type="text" value="${s.outcome}" onchange="siteData.services[${i}].outcome=this.value"></div>
      <div class="admin-field"><label>Payment Link (optional)</label><input type="text" value="${s.paymentLink||''}" placeholder="https://razorpay.me/yourlink" onchange="siteData.services[${i}].paymentLink=this.value"></div>
    </div>`).join('');
}
function addService() {
  siteData.services.push({ id: Date.now(), icon: '✨', name: 'New Service', price: 'Starting ₹0', desc: 'Service description', includes: ['Feature 1'], outcome: 'Outcome here', paymentLink: '' });
  renderAdminServices();
}
function renderAdminPortfolio() {
  document.getElementById('adminPortfolioList').innerHTML = siteData.portfolio.map((p,i) => `
    <div class="admin-service-item">
      <div class="admin-service-header">
        <div class="admin-service-name">${p.emoji} ${p.title}</div>
        <button class="admin-delete" onclick="siteData.portfolio.splice(${i},1);renderAdminPortfolio()">Remove</button>
      </div>
      <div class="admin-field"><label>Title</label><input type="text" value="${p.title}" onchange="siteData.portfolio[${i}].title=this.value"></div>
      <div class="admin-field"><label>Description</label><input type="text" value="${p.desc}" onchange="siteData.portfolio[${i}].desc=this.value"></div>
      <div class="admin-field"><label>Category</label><input type="text" value="${p.category}" placeholder="website/content/video/design" onchange="siteData.portfolio[${i}].category=this.value"></div>
      <div class="admin-field"><label>Emoji</label><input type="text" value="${p.emoji}" onchange="siteData.portfolio[${i}].emoji=this.value" style="width:80px"></div>
    </div>`).join('');
}
function addPortfolioItem() {
  siteData.portfolio.push({ id: Date.now(), title: 'New Project', desc: 'Project description', category: 'design', emoji: '🎨', bg: '#1a1a2e' });
  renderAdminPortfolio();
}

// =================== CONTACT FORM ==================
function handleSubmit() {
  const btn = document.querySelector('.submit-btn');
  if (!btn) return;
  btn.textContent = 'Sending...'; btn.disabled = true;

  const svc = document.querySelector('.contact-form select');
  dlPush({                                          // ← GTM: contact_form_submit
    event: 'contact_form_submit',
    selected_service: svc ? svc.value : 'unknown',
    page_path: window.location.pathname
  });

  setTimeout(() => {
    btn.textContent = 'Message Sent!'; btn.style.background = '#25D366';
    setTimeout(() => { btn.textContent = 'Send Message →'; btn.style.background = ''; btn.disabled = false; }, 3000);
  }, 1500);
}

// =================== INIT ==========================
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  initReveal();
  const coOverlay = document.getElementById('checkoutOverlay');
  if (coOverlay) coOverlay.addEventListener('click', e => { if (e.target === coOverlay) closeCheckout(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCheckout(); closeCart(); } });
});
