const WA = "233540572029";

/* ---------- BEFORE/AFTER SLIDER ---------- */
function buildSlider(el) {
  const before = el.dataset.before || 'ph-dust';
  const after  = el.dataset.after  || 'ph-clean';
  /* Real photo support: set data-before-img / data-after-img on the slider element
   * (either directly in HTML or via galleryData below) to use actual images.
   * When set, the real photo overrides the CSS gradient placeholder.
   * Example: data-before-img="/images/gallery/project-1-before.jpg"
   */
  const beforeImg = el.dataset.beforeImg || '';
  const afterImg  = el.dataset.afterImg  || '';

  const beforeStyle = beforeImg ? ` style="background-image:url('${beforeImg}')"` : '';
  const afterStyle  = afterImg  ? ` style="background-image:url('${afterImg}')"` : '';

  el.innerHTML = `
    <div class="img ph ${before} before-img"${beforeStyle} role="img" aria-label="Before cleaning"></div>
    <div class="img ph ${after} after-img"${afterStyle} role="img" aria-label="After cleaning"></div>
    <span class="lbl b">Before</span><span class="lbl a">After</span>
    <div class="ba-handle" role="slider" aria-label="Drag to compare before and after" aria-valuemin="2" aria-valuemax="98" aria-valuenow="50">
      <div class="knob"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    </div>`;

  const afterImgEl = el.querySelector('.after-img');
  const handle     = el.querySelector('.ba-handle');
  let dragging = false;

  function setPos(clientX) {
    const r = el.getBoundingClientRect();
    let p = ((clientX - r.left) / r.width) * 100;
    p = Math.max(2, Math.min(98, p));
    afterImgEl.style.clipPath = `inset(0 0 0 ${p}%)`;
    handle.style.left = p + '%';
    handle.setAttribute('aria-valuenow', Math.round(p));
  }

  el.addEventListener('mousedown',  e => { dragging = true; setPos(e.clientX); });
  window.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });
  window.addEventListener('mouseup',   () => { dragging = false; });
  el.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
  el.addEventListener('touchmove',  e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  el.addEventListener('touchend',   () => { dragging = false; });
}

/* ==========================================================
 * GALLERY DATA
 * Each item controls one before/after slider card.
 *
 * To add real photos:
 *   1. Drop images into /images/gallery/
 *      Naming convention: project-N-before.jpg / project-N-after.jpg
 *   2. Set beforeImg and afterImg to the path, e.g.:
 *      beforeImg: '/images/gallery/project-1-before.jpg'
 *      afterImg:  '/images/gallery/project-1-after.jpg'
 *   3. Leave beforeImg / afterImg as '' to keep the CSS gradient placeholder.
 *
 * The b / a fields are fallback CSS gradient class names — keep them as-is.
 * ========================================================== */
const galleryData = [
  { b: 'ph-dust',     a: 'ph-clean',    beforeImg: '', afterImg: '', t: '3-bedroom new build',    s: 'Post-construction deep clean' },
  { b: 'ph-waste-b',  a: 'ph-waste-a',  beforeImg: '', afterImg: '', t: 'Shopfront clearance',    s: 'First scheduled collection' },
  { b: 'ph-office-b', a: 'ph-office-a', beforeImg: '', afterImg: '', t: 'Office move-in',         s: 'Commercial recurring client' },
  { b: 'ph-site',     a: 'ph-fresh',    beforeImg: '', afterImg: '', t: 'Compound waste removal', s: 'Household one-off clearance' },
  { b: 'ph-dust',     a: 'ph-fresh',    beforeImg: '', afterImg: '', t: 'Institutional facility', s: 'Post-renovation clean' },
  { b: 'ph-site',     a: 'ph-clean',    beforeImg: '', afterImg: '', t: 'Retail unit handover',   s: 'Pre-opening deep clean' },
];

function renderGallery(containerId, items) {
  const c = document.getElementById(containerId);
  if (!c || c.dataset.built) return;
  c.dataset.built = '1';
  c.innerHTML = items.map(g => {
    const biAttr = g.beforeImg ? ` data-before-img="${g.beforeImg}"` : '';
    const aiAttr = g.afterImg  ? ` data-after-img="${g.afterImg}"` : '';
    return `<div class="gal-card">
      <div class="ba-slider" data-before="${g.b}" data-after="${g.a}"${biAttr}${aiAttr}></div>
      <div class="cap"><h4>${g.t}</h4><span>${g.s}</span></div>
    </div>`;
  }).join('');
  c.querySelectorAll('.ba-slider').forEach(buildSlider);
}

/* ---------- COUNT UP ---------- */
function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || '';
  let cur = 0;
  const dur = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * e) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- ROUTER ---------- */
const pages  = document.querySelectorAll('.page');
const header = document.getElementById('header');

function route() {
  let path = location.hash.replace('#', '') || '/';
  if (!document.querySelector(`.page[data-page="${path}"]`)) path = '/';
  pages.forEach(p => p.classList.toggle('active', p.dataset.page === path));
  document.querySelectorAll('[data-route]').forEach(a => a.classList.toggle('active', a.dataset.route === path));
  header.classList.add('on-dark');
  window.scrollTo(0, 0);
  closeMenu();
  if (path === '/')        renderGallery('homeGallery', galleryData.slice(0, 3));
  if (path === '/gallery') renderGallery('fullGallery', galleryData);
  if (path === '/services') {
    document.querySelectorAll('.page[data-page="/services"] .ba-slider:not([data-built])').forEach(s => {
      s.dataset.built = '1';
      buildSlider(s);
    });
  }
  setupReveals();
  setupCounts();
  handleScroll();
}
window.addEventListener('hashchange', route);

/* ---------- SCROLL ---------- */
const topbar = document.getElementById('topbar');
function handleScroll() {
  const y = window.scrollY;
  if (y > 40) {
    header.classList.add('scrolled', 'lifted');
    topbar.classList.add('hide');
  } else {
    header.classList.remove('scrolled', 'lifted');
    topbar.classList.remove('hide');
  }
}
window.addEventListener('scroll', handleScroll, { passive: true });

/* ---------- MOBILE MENU ---------- */
const ham = document.getElementById('hamburger');
const mob = document.getElementById('mobileNav');
function closeMenu() {
  ham.classList.remove('open');
  mob.classList.remove('open');
  ham.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
ham.addEventListener('click', () => {
  const open = mob.classList.toggle('open');
  ham.classList.toggle('open', open);
  ham.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

/* ---------- REVEAL ---------- */
let io;
function setupReveals() {
  if (io) io.disconnect();
  const els = document.querySelectorAll('.page.active .reveal:not(.in)');
  io = new IntersectionObserver(
    es => { es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach(el => io.observe(el));
}

/* ---------- COUNTS ---------- */
let co;
function setupCounts() {
  if (co) co.disconnect();
  const els = document.querySelectorAll('.page.active [data-count]:not([data-done])');
  co = new IntersectionObserver(
    es => { es.forEach(e => { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } }); },
    { threshold: 0.5 }
  );
  els.forEach(el => co.observe(el));
}

/* ---------- WHATSAPP WIDGET ---------- */
const waFab   = document.getElementById('waFab');
const waPanel = document.getElementById('waPanel');
const waClose = document.getElementById('waClose');
const waBadge = document.querySelector('.wa-badge');

function toggleWA(f) {
  const open = f !== undefined ? f : !waPanel.classList.contains('open');
  waPanel.classList.toggle('open', open);
  waFab.setAttribute('aria-expanded', open);
  if (open && waBadge) waBadge.style.display = 'none';
}
waFab.addEventListener('click',  () => toggleWA());
waClose.addEventListener('click', () => toggleWA(false));

/* ---------- WHATSAPP FORM SENDERS ---------- */
function val(id) { return (document.getElementById(id).value || '').trim(); }
function openWA(m) { window.open(`https://wa.me/${WA}?text=${encodeURIComponent(m)}`, '_blank'); }

function sendQuote() {
  const name    = val('q-name')    || '(not given)';
  const phone   = val('q-phone')   || '(not given)';
  const email   = val('q-email');
  const service = val('q-service');
  const loc     = val('q-loc')     || '(not given)';
  const msg     = val('q-msg');
  let t = `*New Quote Request | GreenCycle Solutions*\n\nName: ${name}\nPhone: ${phone}\n`;
  if (email) t += `Email: ${email}\n`;
  t += `Service: ${service}\nLocation: ${loc}\n`;
  if (msg) t += `Details: ${msg}\n`;
  openWA(t);
}

function sendRegister() {
  const name  = val('r-name')  || '(not given)';
  const phone = val('r-phone') || '(not given)';
  const type  = val('r-type');
  const loc   = val('r-loc')   || '(not given)';
  openWA(`*Waste Collection Registration | GreenCycle Solutions*\n\nName: ${name}\nPhone: ${phone}\nProperty type: ${type}\nCollection area: ${loc}\n`);
}

/* expose to inline onclick handlers in HTML */
window.sendQuote    = sendQuote;
window.sendRegister = sendRegister;

/* ---------- INIT ---------- */
route();
