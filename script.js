/* ══════════════════════════════════════════════════════
   SLSUR — script.js  (Supabase-connected · FINAL VERSION)
   Replace your old script.js with this file entirely.
   Only two things to fill in: SUPABASE_URL + SUPABASE_KEY
   ══════════════════════════════════════════════════════ */

// SUPER BASE CONNECTOR //
const SUPABASE_URL = 'https://zroahleyhzfglzydwmdv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-nxL1CwAqShZi4gYM9avKA_kJ0PmMEh';
// ──────────────────────────────────────────────────────


const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ── Tag parser (handles text string or array) ── */
function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.startsWith('{'))
    return raw.replace(/[{}]/g, '').split(',').map(t => t.trim()).filter(Boolean);
  return raw.split(',').map(t => t.trim()).filter(Boolean);
}

function tagClass(tag) {
  const t = (tag || '').toUpperCase();
  if (t === 'NEWS')  return 'tag-news';
  if (t === 'EVENT') return 'tag-event';
  return 'tag-announcement';
}

/* ── Image helper: photo_url OR image_url OR url ── */
function getImg(row) {
  return row.photo_url || row.image_url || row.url || '';
}

/* ══════════════════════════════════════════════════════
   LEADERSHIP
   columns: id, name, role, city, photo_url, display_order
   ══════════════════════════════════════════════════════ */
async function renderLeadership() {
  const grid = document.getElementById('leadershipGrid');
  if (!grid) return;

  const { data, error } = await db
    .from('leadership')
    .select('*')
    .order('display_order');

  if (error) { console.error('Leadership:', error); return; }

  if (!data || data.length === 0) {
    grid.innerHTML = '<p style="color:#6b7280;text-align:center;padding:40px;grid-column:1/-1">No leadership members added yet.</p>';
    return;
  }

  grid.innerHTML = data.map(l => `
    <div class="leader-card">
      <img src="${l.photo_url || ''}" alt="${l.name}" loading="lazy"
        onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(l.name)}&background=168B2F&color=fff&size=400'" />
      <div class="leader-overlay">
        <div class="leader-role">${l.role || ''}</div>
        <div class="leader-name">${l.name}</div>
        <div class="leader-city">${l.city || ''}</div>
      </div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════════
   NEWS & EVENTS
   news_posts columns: id, title, description, photo_url,
                       tags(text), published_at
   events columns:     id, title, city, date, time,
                       location, description, photo_url
   ══════════════════════════════════════════════════════ */
async function renderNews() {
  const newsGrid   = document.getElementById('newsGrid');
  const eventsList = document.getElementById('eventsList');
  if (!newsGrid && !eventsList) return;

  const [{ data: news, error: ne }, { data: events, error: ee }] = await Promise.all([
    db.from('news_posts').select('*').order('published_at', { ascending: false }).limit(3),
    db.from('events').select('*').order('date').limit(5)
  ]);

  if (ne) console.error('News error:', ne);
  if (ee) console.error('Events error:', ee);

  /* News cards */
  if (newsGrid) {
    if (!news || news.length === 0) {
      newsGrid.innerHTML = '<p style="color:#6b7280;grid-column:1/-1;text-align:center;padding:40px">No news posts yet.</p>';
    } else {
      newsGrid.innerHTML = news.map(n => {
        const tags = parseTags(n.tags);
        const img  = getImg(n);
        return `
          <div class="news-card">
            ${img ? `<img src="${img}" alt="${n.title}" class="news-card-img" loading="lazy" onerror="this.style.display='none'" />` : ''}
            <div class="news-card-body">
              <div class="news-tags">
                ${tags.map(t => `<span class="tag ${tagClass(t)}">${t}</span>`).join('')}
              </div>
              <h3 class="news-card-title">${n.title}</h3>
              <p class="news-card-desc">${n.description || ''}</p>
              <div class="news-card-date">📅 ${(n.published_at || '').slice(0, 10)}</div>
            </div>
          </div>`;
      }).join('');
    }
  }

  /* Events list */
  if (eventsList) {
    if (!events || events.length === 0) {
      eventsList.innerHTML = '<p style="color:#6b7280;padding:20px">No upcoming events yet.</p>';
    } else {
      eventsList.innerHTML = events.map(e => `
        <div class="event-item">
          <span class="event-city">${(e.city || '').toUpperCase()}</span>
          <span class="event-title">${e.title}</span>
          <div class="event-meta">
            <span>📅 ${e.date || ''} ${e.time ? '· ' + e.time : ''}</span>
            <span>📍 ${e.location || e.venue || ''}</span>
          </div>
        </div>`).join('');
    }
  }
}

/* ══════════════════════════════════════════════════════
   CLUBS
   columns: id, name, category, description, photo_url
   (icon, city, member_count added below via safe fallback)
   ══════════════════════════════════════════════════════ */
async function renderClubs() {
  const filterWrap = document.getElementById('clubsFilter');
  const grid       = document.getElementById('clubsGrid');
  if (!filterWrap || !grid) return;

  const { data: clubs, error } = await db.from('clubs').select('*').order('name');
  if (error) { console.error('Clubs:', error); return; }

  if (!clubs || clubs.length === 0) {
    filterWrap.innerHTML = '';
    grid.innerHTML = '<p style="color:#6b7280;grid-column:1/-1;text-align:center;padding:40px">No clubs added yet.</p>';
    return;
  }

  const catClassMap = {
    'arts':'cat-arts','cultural':'cat-cultural','faith':'cat-faith',
    'sports':'cat-sports','professional':'cat-professional','academic':'cat-academic'
  };

  const categories = ['All Clubs', ...new Set(clubs.map(c => c.category).filter(Boolean))];

  filterWrap.innerHTML = categories.map((cat, i) =>
    `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');

  function renderCards(filter) {
    const filtered = filter === 'All Clubs' ? clubs : clubs.filter(c => c.category === filter);
    grid.innerHTML = filtered.map(c => {
      const catClass = catClassMap[(c.category || '').toLowerCase()] || 'cat-academic';
      return `
        <div class="club-card">
          <div class="club-card-top">
            <div class="club-icon">${c.icon || '🏛️'}</div>
            <span class="club-category ${catClass}">${c.category || ''}</span>
          </div>
          <div class="club-name">${c.name}</div>
          <div class="club-desc">${c.description || ''}</div>
          <div class="club-footer">
            <span class="club-members">👥 ${c.member_count || 0} members</span>
            <span>${c.city || ''}</span>
          </div>
        </div>`;
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
   columns: id, title, caption, category, photo_url,
            image_url, url
   ══════════════════════════════════════════════════════ */
async function renderGallery() {
  const filterWrap = document.getElementById('galleryFilter');
  const grid       = document.getElementById('galleryGrid');
  if (!filterWrap || !grid) return;

  const { data: items, error } = await db.from('gallery_items').select('*');
  if (error) { console.error('Gallery:', error); return; }

  if (!items || items.length === 0) {
    filterWrap.innerHTML = '';
    grid.innerHTML = '<p style="color:#6b7280;grid-column:1/-1;text-align:center;padding:40px">No gallery photos yet.</p>';
    return;
  }

  const cats = ['All Photos', ...new Set(items.map(g => g.category).filter(Boolean))];

  filterWrap.innerHTML = cats.map((cat, i) =>
    `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');

  function renderItems(filter) {
    const filtered = filter === 'All Photos' ? items : items.filter(g => g.category === filter);
    grid.innerHTML = filtered.map(g => `
      <div class="gallery-item">
        <img src="${getImg(g)}" alt="${g.caption || g.title || ''}" loading="lazy" />
        <div class="gallery-overlay"><span>🔍</span></div>
      </div>`).join('');
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
   columns: id, title, category, file_url
   ══════════════════════════════════════════════════════ */
async function renderResources() {
  const filterWrap = document.getElementById('resourcesFilter');
  const grid       = document.getElementById('resourcesGrid');
  if (!filterWrap || !grid) return;

  const { data: resources, error } = await db.from('resources').select('*');
  if (error) { console.error('Resources:', error); return; }

  if (!resources || resources.length === 0) {
    filterWrap.innerHTML = '';
    grid.innerHTML = '<p style="color:#6b7280;grid-column:1/-1;text-align:center;padding:40px">No resources added yet.</p>';
    return;
  }

  const cats = ['All Resources', ...new Set(resources.map(r => r.category).filter(Boolean))];

  filterWrap.innerHTML = cats.map((cat, i) =>
    `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');

  function renderCards(filter) {
    const filtered = filter === 'All Resources' ? resources : resources.filter(r => r.category === filter);
    grid.innerHTML = filtered.map(r => `
      <div class="resource-card${r.is_urgent ? ' urgent' : ''}">
        <div class="resource-card-top">
          <div class="resource-icon">📄</div>
          ${r.is_urgent ? '<span class="urgent-badge">⚠ Urgent</span>' : ''}
        </div>
        <div class="resource-title">${r.title}</div>
        <div class="resource-desc">${r.description || ''}</div>
        ${r.contact_info ? `<div class="resource-contacts">${r.contact_info}</div>` : ''}
        ${r.file_url ? `<a href="${r.file_url}" target="_blank" class="text-link" style="margin-top:10px;display:inline-block">Download →</a>` : ''}
      </div>`).join('');
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
   CONTACT FORM
   columns: id, name, email, subject, message, created_at
   ══════════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const { error } = await db.from('contact_messages').insert({
      name:    form.fullName.value.trim(),   // ← "name" not "full_name"
      email:   form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim()
    });

    if (error) {
      console.error('Contact form error:', error);
      btn.textContent = '✕ Something went wrong. Please email us directly.';
      btn.style.background = '#dc2626';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 5000);
    } else {
      btn.textContent = '✓ Message sent! We\'ll be in touch.';
      btn.style.background = '#0f6622';
      form.reset();
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; }, 5000);
    }
  });
}

/* ══════════════════════════════════════════════════════
   NAVBAR + SCROLL SPY
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

function initScrollSpy() {
  const links = document.querySelectorAll('.nav-link');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { rootMargin: '-80px 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('section[id]').forEach(s => observer.observe(s));
}

/* ══════════════════════════════════════════════════════
   BOOT
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