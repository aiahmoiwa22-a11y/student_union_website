/* ══════════════════════════════════════════════════════
   SLSUR — script.js  (Supabase-connected · FINAL VERSION)
   Replace your old script.js with this file entirely.
   Only two things to fill in: SUPABASE_URL + SUPABASE_KEY
   ══════════════════════════════════════════════════════ */

// ── STEP 1: Paste your Supabase credentials here ──────
const SUPABASE_URL = 'https://zroahleyhzfglzydwmdv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-nxL1CwAqShZi4gYM9avKA_kJ0PmMEh';
// ──────────────────────────────────────────────────────

// ── Init Supabase client ───────────────────────────────
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ══════════════════════════════════════════════════════
   LEADERSHIP
   ══════════════════════════════════════════════════════ */
async function renderLeadership() {
  const grid = document.getElementById('leadershipGrid');
  if (!grid) return;

  const { data, error } = await db
    .from('leadership')
    .select('*')
    .order('display_order');

  if (error) { console.error('Leadership error:', error); return; }

  grid.innerHTML = (data || []).map(l => `
    <div class="leader-card">
      <img src="${l.photo_url || ''}" alt="${l.name}" loading="lazy" />
      <div class="leader-overlay">
        <div class="leader-role">${l.role}</div>
        <div class="leader-name">${l.name}</div>
        <div class="leader-city">${l.city}</div>
      </div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════════
   NEWS & EVENTS
   ══════════════════════════════════════════════════════ */
function tagClass(tag) {
  const t = (tag || '').toUpperCase();
  if (t === 'NEWS')         return 'tag-news';
  if (t === 'EVENT')        return 'tag-event';
  return 'tag-announcement';
}

async function renderNews() {
  const newsGrid  = document.getElementById('newsGrid');
  const eventsList = document.getElementById('eventsList');
  if (!newsGrid && !eventsList) return;

  const [{ data: news, error: ne }, { data: events, error: ee }] = await Promise.all([
    db.from('news_posts').select('*').order('published_at', { ascending: false }).limit(3),
    db.from('events').select('*').order('event_date').limit(5)
  ]);

  if (ne) console.error('News error:', ne);
  if (ee) console.error('Events error:', ee);

  if (newsGrid) {
    newsGrid.innerHTML = (news || []).map(n => `
      <div class="news-card">
        <img src="${n.image_url || ''}" alt="${n.title}" class="news-card-img" loading="lazy" />
        <div class="news-card-body">
          <div class="news-tags">
            ${(n.tags || []).map(t => `<span class="tag ${tagClass(t)}">${t}</span>`).join('')}
          </div>
          <h3 class="news-card-title">${n.title}</h3>
          <p class="news-card-desc">${n.description || ''}</p>
          <div class="news-card-date">📅 ${n.published_at || ''}</div>
        </div>
      </div>
    `).join('');
  }

  if (eventsList) {
    eventsList.innerHTML = (events || []).map(e => `
      <div class="event-item">
        <span class="event-city">${(e.city || '').toUpperCase()}</span>
        <span class="event-title">${e.title}</span>
        <div class="event-meta">
          <span>📅 ${e.event_date}</span>
          <span>📍 ${e.venue}</span>
        </div>
      </div>
    `).join('');
  }
}

/* ══════════════════════════════════════════════════════
   CLUBS
   ══════════════════════════════════════════════════════ */
async function renderClubs() {
  const filterWrap = document.getElementById('clubsFilter');
  const grid       = document.getElementById('clubsGrid');
  if (!filterWrap || !grid) return;

  const { data: clubs, error } = await db.from('clubs').select('*').order('name');
  if (error) { console.error('Clubs error:', error); return; }

  const categories = ['All Clubs', ...new Set((clubs || []).map(c => c.category))];

  filterWrap.innerHTML = categories.map((cat, i) =>
    `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');

  const catClassMap = {
    'arts': 'cat-arts', 'cultural': 'cat-cultural', 'faith': 'cat-faith',
    'sports': 'cat-sports', 'professional': 'cat-professional', 'academic': 'cat-academic'
  };

  function renderCards(filter) {
    const filtered = filter === 'All Clubs'
      ? (clubs || [])
      : (clubs || []).filter(c => c.category === filter);

    grid.innerHTML = filtered.map(c => {
      const catKey = (c.category || '').toLowerCase();
      const catClass = catClassMap[catKey] || 'cat-academic';
      return `
        <div class="club-card">
          <div class="club-card-top">
            <div class="club-icon">${c.icon || '🏛️'}</div>
            <span class="club-category ${catClass}">${c.category}</span>
          </div>
          <div class="club-name">${c.name}</div>
          <div class="club-desc">${c.description || ''}</div>
          <div class="club-footer">
            <span class="club-members">👥 ${c.member_count || 0} members</span>
            <span>${c.city || ''}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  renderCards('All Clubs');

  filterWrap.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCards(btn.dataset.cat);
  });
}

/* ══════════════════════════════════════════════════════
   GALLERY
   ══════════════════════════════════════════════════════ */
async function renderGallery() {
  const filterWrap = document.getElementById('galleryFilter');
  const grid       = document.getElementById('galleryGrid');
  if (!filterWrap || !grid) return;

  const { data: items, error } = await db.from('gallery_items').select('*');
  if (error) { console.error('Gallery error:', error); return; }

  const cats = ['All Photos', ...new Set((items || []).map(g => g.category))];

  filterWrap.innerHTML = cats.map((cat, i) =>
    `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');

  function renderItems(filter) {
    const filtered = filter === 'All Photos'
      ? (items || [])
      : (items || []).filter(g => g.category === filter);

    grid.innerHTML = filtered.map(g => `
      <div class="gallery-item">
        <img src="${g.image_url}" alt="${g.caption || g.category}" loading="lazy" />
        <div class="gallery-overlay"><span>🔍</span></div>
      </div>
    `).join('');
  }

  renderItems('All Photos');

  filterWrap.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderItems(btn.dataset.cat);
  });
}

/* ══════════════════════════════════════════════════════
   RESOURCES
   ══════════════════════════════════════════════════════ */
async function renderResources() {
  const filterWrap = document.getElementById('resourcesFilter');
  const grid       = document.getElementById('resourcesGrid');
  if (!filterWrap || !grid) return;

  const { data: resources, error } = await db.from('resources').select('*');
  if (error) { console.error('Resources error:', error); return; }

  const cats = ['All Resources', ...new Set((resources || []).map(r => r.category))];

  filterWrap.innerHTML = cats.map((cat, i) =>
    `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');

  function renderCards(filter) {
    const filtered = filter === 'All Resources'
      ? (resources || [])
      : (resources || []).filter(r => r.category === filter);

    grid.innerHTML = filtered.map(r => `
      <div class="resource-card${r.is_urgent ? ' urgent' : ''}">
        <div class="resource-card-top">
          <div class="resource-icon">📄</div>
          ${r.is_urgent ? '<span class="urgent-badge">⚠ Urgent</span>' : ''}
        </div>
        <div class="resource-title">${r.title}</div>
        <div class="resource-desc">${r.description || ''}</div>
        ${r.contact_info ? `<div class="resource-contacts">${r.contact_info}</div>` : ''}
      </div>
    `).join('');
  }

  renderCards('All Resources');

  filterWrap.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCards(btn.dataset.cat);
  });
}

/* ══════════════════════════════════════════════════════
   CONTACT FORM → Supabase insert
   ══════════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;

    btn.textContent = 'Sending…';
    btn.disabled = true;

    const { error } = await db.from('contact_messages').insert({
      full_name: form.fullName.value.trim(),
      email:     form.email.value.trim(),
      subject:   form.subject.value.trim(),
      message:   form.message.value.trim()
    });

    if (error) {
      console.error('Contact form error:', error);
      btn.textContent = '✕ Something went wrong. Try again.';
      btn.style.background = '#dc2626';
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
      }, 4000);
    } else {
      btn.textContent = '✓ Message sent! We\'ll be in touch.';
      btn.style.background = '#0f6622';
      form.reset();
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        btn.disabled = false;
      }, 5000);
    }
  });
}

/* ══════════════════════════════════════════════════════
   NAVBAR — blur on scroll + hamburger
   ══════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* ══════════════════════════════════════════════════════
   SCROLL SPY — highlights active nav link
   ══════════════════════════════════════════════════════ */
function initScrollSpy() {
  const links  = document.querySelectorAll('.nav-link');
  const navH   = 80;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l =>
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`)
        );
      }
    });
  }, {
    rootMargin: `-${navH}px 0px -55% 0px`,
    threshold: 0
  });

  document.querySelectorAll('section[id]').forEach(s => observer.observe(s));
}

/* ══════════════════════════════════════════════════════
   BOOT — runs everything on page load
   ══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderLeadership();
  renderNews();
  renderClubs();
  renderGallery();
  renderResources();
  initNavbar();
  initScrollSpy();
  initContactForm();
});