/* ══════════════════════════════════════════════════
   SLSUR Admin Panel — admin.js
   Matches your exact Supabase schema
   ══════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://zroahleyhzfglzydwmdv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-nxL1CwAqShZi4gYM9avKA_kJ0PmMEh'; // ← paste your anon key
const STORAGE_BUCKET = 'slsur-media';

/* ══════════════════════════════════════════════════
   YOUR EXACT SCHEMA
   ──────────────────────────────────────────────────
   leadership:       id, name, role, city, photo_url, display_order
   news_posts:       id, title, description, body, photo_url, image_url,
                     tags(text), published_date, published_at, created_at
   events:           id, title, city, date, time, location,
                     description, photo_url, created_at
   clubs:            id, name, category, description, photo_url, created_at
   gallery_items:    id, title, caption, category, photo_url,
                     image_url, url, created_at
   resources:        id, title, category, file_url, created_at
   contact_messages: id, name, email, subject, message, created_at
   ══════════════════════════════════════════════════ */

let db = null;
let useMock = true;

function initSupabase() {
  if (SUPABASE_KEY === 'sb_publishable_-nxL1CwAqShZi4gYM9avKA_kJ0PmMEh') {
    console.warn('Using mock data — paste your anon key into admin.js');
    useMock = true;
    return;
  }
  try {
    db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    useMock = false;
  } catch(e) {
    console.warn('Supabase init failed:', e);
    useMock = true;
  }
}

/* ── Mock data matching your schema ── */
const MOCK = {
  leadership: [
    { id:'1', name:'Abdul Kamara',   role:'President',         city:'Moscow',           photo_url:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=70', display_order:1 },
    { id:'2', name:'Mariama Conteh', role:'Vice President',    city:'Saint Petersburg', photo_url:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=70', display_order:2 },
    { id:'3', name:'Ibrahim Sesay',  role:'General Secretary', city:'Kazan',            photo_url:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', display_order:3 },
  ],
  news_posts: [
    { id:'1', title:'SLSUR Welcomes 2024 Cohort', description:'Over 60 new students arrived.', tags:'ANNOUNCEMENT', photo_url:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&q=70', published_at:'2024-09-01T00:00:00Z' },
    { id:'2', title:'Welfare Petition Update', description:'Our team presented a petition.', tags:'NEWS', photo_url:'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300&q=70', published_at:'2024-08-15T00:00:00Z' },
  ],
  events: [
    { id:'1', title:'Independence Day Celebration', city:'Moscow', date:'2025-04-27', time:'18:00', location:'African Cultural Centre', description:'Annual celebration.' },
    { id:'2', title:'Cultural Night — Taste of SL', city:'Saint Petersburg', date:'2025-03-08', time:'19:00', location:'Student Cultural Hall', description:'Food and music.' },
    { id:'3', title:'Health Insurance Workshop', city:'Kazan', date:'2025-02-15', time:'10:00', location:'Student Affairs Office', description:'Registration help.' },
  ],
  clubs: [
    { id:'1', name:'Creative Arts Collective', category:'Arts', description:'Painters, photographers, musicians.', photo_url:'' },
    { id:'2', name:'Cultural Heritage Society', category:'Cultural', description:'Preserving Sierra Leonean traditions.', photo_url:'' },
    { id:'3', name:'Lions FC', category:'Sports', description:'Football and fitness.', photo_url:'' },
  ],
  gallery_items: [
    { id:'1', caption:'Cultural Night 2024', category:'Social', photo_url:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=70', title:'' },
    { id:'2', caption:'Library visit', category:'Academic', photo_url:'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=300&q=70', title:'' },
  ],
  resources: [
    { id:'1', title:'Russian Student Visa Guide', category:'Visa', file_url:'' },
    { id:'2', title:'Emergency Contacts', category:'Emergency', file_url:'' },
  ],
  contact_messages: [
    { id:'1', name:'Aminata Bah', email:'aminata@email.com', subject:'Membership query', message:'How do I join SLSUR?', created_at:'2025-01-15T10:22:00Z' },
    { id:'2', name:'Mohamed Turay', email:'mturay@email.com', subject:'Visa help', message:'I need help with visa renewal.', created_at:'2025-01-14T14:05:00Z' },
  ]
};

/* ══════════════════════════════════════════════════
   DB HELPERS
   ══════════════════════════════════════════════════ */
async function dbSelect(table, options = {}) {
  if (useMock) {
    let rows = [...(MOCK[table] || [])];
    if (options.order) rows.sort((a,b) => String(a[options.order]||'').localeCompare(String(b[options.order]||'')));
    if (options.limit) rows = rows.slice(0, options.limit);
    return { data: rows, error: null };
  }
  let q = db.from(table).select('*');
  if (options.order) q = q.order(options.order, { ascending: options.asc !== false });
  if (options.limit) q = q.limit(options.limit);
  return await q;
}

async function dbInsert(table, row) {
  if (useMock) { row.id = String(Date.now()); MOCK[table].push(row); return { data: row, error: null }; }
  const { data, error } = await db.from(table).insert(row).select().single();
  return { data, error };
}

async function dbUpdate(table, id, changes) {
  if (useMock) {
    const idx = MOCK[table].findIndex(r => r.id === id);
    if (idx !== -1) Object.assign(MOCK[table][idx], changes);
    return { error: null };
  }
  return await db.from(table).update(changes).eq('id', id);
}

async function dbDelete(table, id) {
  if (useMock) {
    const idx = MOCK[table].findIndex(r => r.id === id);
    if (idx !== -1) MOCK[table].splice(idx, 1);
    return { error: null };
  }
  return await db.from(table).delete().eq('id', id);
}

/* ══════════════════════════════════════════════════
   IMAGE UPLOAD
   ══════════════════════════════════════════════════ */
async function uploadImage(file, folder = 'general') {
  if (useMock) return URL.createObjectURL(file);
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await db.storage.from(STORAGE_BUCKET).upload(path, file, { cacheControl:'3600', upsert:false });
  if (error) { showToast('Upload failed: ' + error.message, 'error'); return null; }
  const { data: urlData } = db.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

function buildImagePicker(inputId, folder, existingUrl = '') {
  return `
    <div class="img-picker">
      <div class="img-picker-preview" id="preview_${inputId}">
        ${existingUrl
          ? `<img src="${existingUrl}" alt="Current" />`
          : `<div class="img-picker-placeholder"><span class="img-picker-icon">🖼️</span><span>No image yet</span></div>`}
      </div>
      <div class="img-picker-actions">
        <label class="btn-upload" for="file_${inputId}">
          📁 Choose from computer
          <input type="file" id="file_${inputId}" accept="image/*"
            onchange="handleFileSelect('${inputId}','${folder}')" style="display:none" />
        </label>
        <span class="img-picker-or">or</span>
        <div class="img-picker-url-wrap">
          <input type="text" id="url_${inputId}" placeholder="Paste image URL…"
            value="${existingUrl}" oninput="handleUrlInput('${inputId}')" />
        </div>
      </div>
      <div class="img-picker-status" id="status_${inputId}"></div>
      <input type="hidden" id="${inputId}" value="${existingUrl}" />
    </div>`;
}

async function handleFileSelect(inputId, folder) {
  const file = document.getElementById(`file_${inputId}`).files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Max file size is 5 MB.', 'error'); return; }
  setPickerStatus(inputId, 'uploading', '⏳ Uploading…');
  const url = await uploadImage(file, folder);
  if (!url) { setPickerStatus(inputId, 'error', '✕ Upload failed'); return; }
  document.getElementById(inputId).value = url;
  document.getElementById(`url_${inputId}`).value = url;
  updatePreview(inputId, url);
  setPickerStatus(inputId, 'success', '✓ Photo uploaded');
}

function handleUrlInput(inputId) {
  const url = document.getElementById(`url_${inputId}`).value.trim();
  document.getElementById(inputId).value = url;
  if (url) updatePreview(inputId, url);
}

function updatePreview(inputId, url) {
  document.getElementById(`preview_${inputId}`).innerHTML =
    `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=img-picker-placeholder><span>⚠️</span><span>Cannot load image</span></div>'" />`;
}

function setPickerStatus(inputId, type, msg) {
  const el = document.getElementById(`status_${inputId}`);
  if (!el) return;
  el.textContent = msg;
  el.className = `img-picker-status status-${type}`;
  if (type === 'success') setTimeout(() => { el.textContent = ''; }, 3000);
}

/* ══════════════════════════════════════════════════
   AUTHENTICATION
   ══════════════════════════════════════════════════ */
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass  = document.getElementById("loginPassword").value;
  const btn   = document.getElementById("loginBtn");

  if (!email || !pass) { showLoginError("Please fill in both fields."); return; }

  btn.textContent = "Signing in…";
  btn.disabled = true;

  // Fallback demo mode if Supabase not configured
  if (useMock) {
    btn.textContent = "Sign in →";
    btn.disabled = false;
    if (pass === "admin") {
      document.getElementById("loginError").classList.remove("show");
      document.getElementById("loginScreen").classList.add("hidden");
      document.getElementById("adminShell").classList.remove("hidden");
      navigate("dashboard");
    } else {
      showLoginError("Supabase not connected yet. Demo password: admin");
    }
    return;
  }

  // Real Supabase authentication
  const { data, error } = await db.auth.signInWithPassword({ email, password: pass });

  btn.textContent = "Sign in →";
  btn.disabled = false;

  if (error) {
    showLoginError("Wrong email or password. Please try again.");
    return;
  }

  // Success
  document.getElementById("loginError").classList.remove("show");
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("adminShell").classList.remove("hidden");

  const nameEl = document.querySelector(".admin-name");
  if (nameEl) nameEl.textContent = data.user?.email?.split("@")[0] || "Admin";

  navigate("dashboard");
}

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  el.textContent = msg; el.classList.add('show');
}

/* ══════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════ */
function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(el =>
    el.classList.toggle('active', el.dataset.page === page)
  );
  const labels = {
    dashboard:'Dashboard', news:'News Posts', events:'Events',
    clubs:'Clubs & Societies', gallery:'Gallery', resources:'Resources',
    leadership:'Leadership', messages:'Messages'
  };
  document.getElementById('breadcrumb').textContent = labels[page] || page;
  renderPage(page);
  document.getElementById('sidebar').classList.remove('open');
}

async function renderPage(page) {
  document.getElementById('pageContent').innerHTML = 
    '<div style="text-align:center;padding:60px;color:var(--muted)">Loading...</div>';

  const map = {
    dashboard: 'renderDashboard',
    news: 'renderNews',
    events: 'renderEvents',
    clubs: 'renderClubs',
    gallery: 'renderGallery',
    resources: 'renderResources',
    leadership: 'renderLeadership',
    messages: 'renderMessages'
  };

  const fnName = map[page];

  if (fnName && typeof window[fnName] === 'function') {
    await window[fnName]();
  } else {
    document.getElementById('pageContent').innerHTML = 
      '<div style="text-align:center;padding:60px;color:var(--muted)">Section under construction.</div>';
  }
}


/* ══════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════ */

async function renderDashboard() {
  const [{ data:news },{ data:events },{ data:clubs },{ data:msgs }] = await Promise.all([
    dbSelect('news_posts'), dbSelect('events'), dbSelect('clubs'), dbSelect('contact_messages')
  ]);

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Welcome back 👋</div>
        <div class="page-subtitle">SLSUR Admin Panel — manage your site content below.</div>
      </div>
      <a href="index.html" target="_blank" class="btn-primary">↗ View website</a>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">News Posts</div>
        <div class="stat-value stat-green">${(news||[]).length}</div>
        <div class="stat-sub">Published articles</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Events</div>
        <div class="stat-value stat-blue">${(events||[]).length}</div>
        <div class="stat-sub">Scheduled events</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Clubs</div>
        <div class="stat-value">${(clubs||[]).length}</div>
        <div class="stat-sub">Active clubs</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Messages</div>
        <div class="stat-value stat-amber">${(msgs||[]).length}</div>
        <div class="stat-sub">Contact enquiries</div>
      </div>
    </div>

    <div class="dash-grid">
      <div class="dash-left">
        <div class="card">
          <div style="font-weight:700;font-size:15px;margin-bottom:14px">Quick actions</div>
          <div class="quick-actions">
            <button class="qa-btn" onclick="navigate('news')">
              <div class="qa-btn-icon">📰</div>
              <div class="qa-btn-label">Add news post</div>
              <div class="qa-btn-sub">Publish an article</div>
            </button>
            <button class="qa-btn" onclick="navigate('events')">
              <div class="qa-btn-icon">📅</div>
              <div class="qa-btn-label">Add event</div>
              <div class="qa-btn-sub">Schedule an event</div>
            </button>
            <button class="qa-btn" onclick="navigate('gallery')">
              <div class="qa-btn-icon">🖼️</div>
              <div class="qa-btn-label">Upload photos</div>
              <div class="qa-btn-sub">Add to gallery</div>
            </button>
            <button class="qa-btn" onclick="navigate('messages')">
              <div class="qa-btn-icon">✉️</div>
              <div class="qa-btn-label">View messages</div>
              <div class="qa-btn-sub">${(msgs||[]).length} total</div>
            </button>
          </div>
        </div>
      </div>
      <div class="dash-right">
        <div class="card">
          <div style="font-weight:700;font-size:15px;margin-bottom:14px">Recent messages</div>
          ${(msgs||[]).slice(0,4).map(m => `
            <div class="msg-item">
              <div style="display:flex;justify-content:space-between">
                <div class="msg-name">${m.name || m.full_name || '—'}</div>
                <div class="msg-time">${new Date(m.created_at||Date.now()).toLocaleDateString()}</div>
              </div>
              <div class="msg-subj">${m.subject||'—'}</div>
            </div>`).join('')}
          <a onclick="navigate('messages')" style="font-size:12px;color:var(--green);font-weight:600;cursor:pointer;display:block;margin-top:12px">View all →</a>
        </div>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════
   NEWS POSTS
   Schema: title, description, tags(text), photo_url, published_at
   ══════════════════════════════════════════════════ */
async function renderNews() {
  const { data } = await dbSelect('news_posts', { order:'published_at', asc:false });

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">News Posts</div>
        <div class="page-subtitle">${(data||[]).length} articles</div>
      </div>
      <button class="btn-primary" onclick="openNewsModal()">+ Add article</button>
    </div>
    <div class="table-toolbar">
      <div class="search-wrap">
        <input type="text" placeholder="Search…" oninput="filterTable(this.value,'newsTable')" />
      </div>
    </div>
    <div class="table-wrap">
      <table id="newsTable">
        <thead><tr><th>Photo</th><th>Title</th><th>Tags</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          ${(data||[]).map(n => `
            <tr>
              <td><img class="row-img" src="${n.photo_url||n.image_url||''}" alt="" onerror="this.style.display='none'" /></td>
              <td style="max-width:220px">
                <div style="font-weight:600">${n.title}</div>
                <div style="font-size:11px;color:var(--muted)">${(n.description||'').slice(0,60)}…</div>
              </td>
              <td><span class="badge badge-green">${n.tags||'—'}</span></td>
              <td style="font-size:12px;white-space:nowrap">${(n.published_at||'').slice(0,10)}</td>
              <td>
                <div class="td-actions">
                  <button class="btn-icon" onclick='openNewsModal(${JSON.stringify(n)})'>✏️</button>
                  <button class="btn-icon" onclick="deleteRow('news_posts','${n.id}','renderNews')">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function openNewsModal(row = null) {
  openModal(row ? 'Edit article' : 'Add article', `
    <div class="form-group"><label>Title</label>
      <input id="mTitle" value="${row?.title||''}" placeholder="Article headline" />
    </div>
    <div class="form-group"><label>Description</label>
      <textarea id="mDesc" rows="3">${row?.description||''}</textarea>
    </div>
    <div class="form-group"><label>Tags (e.g. NEWS, FEATURED, EVENT)</label>
      <input id="mTags" value="${row?.tags||''}" placeholder="NEWS" />
    </div>
    <div class="form-group"><label>Published date</label>
      <input id="mDate" type="date" value="${(row?.published_at||new Date().toISOString()).slice(0,10)}" />
    </div>
    <div class="form-group"><label>Article photo</label>
      ${buildImagePicker('mImg','news', row?.photo_url||row?.image_url||'')}
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveNews('${row?.id||''}')">
        ${row ? 'Save changes' : 'Publish'}
      </button>
    </div>`);
}

async function saveNews(id) {
  const row = {
    title:        document.getElementById('mTitle').value.trim(),
    description:  document.getElementById('mDesc').value.trim(),
    tags:         document.getElementById('mTags').value.trim(),
    published_at: document.getElementById('mDate').value,
    photo_url:    document.getElementById('mImg').value.trim()
  };
  if (!row.title) { showToast('Title is required.','error'); return; }
  const { error } = id ? await dbUpdate('news_posts',id,row) : await dbInsert('news_posts',row);
  if (error) { showToast('Error: '+error.message,'error'); console.error(error); return; }
  closeModal(); showToast(id?'Article updated ✓':'Article published ✓','success'); renderNews();
}

/* ══════════════════════════════════════════════════
   EVENTS
   Schema: title, city, date, time, location, description, photo_url
   ══════════════════════════════════════════════════ */
async function renderEvents() {
  const { data } = await dbSelect('events', { order:'date' });

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Events</div>
        <div class="page-subtitle">${(data||[]).length} events</div>
      </div>
      <button class="btn-primary" onclick="openEventsModal()">+ Add event</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Title</th><th>Date</th><th>Time</th><th>City</th><th>Location</th><th>Actions</th></tr></thead>
        <tbody>
          ${(data||[]).map(e => `
            <tr>
              <td style="font-weight:600">${e.title}</td>
              <td><span class="badge badge-blue">${e.date||'—'}</span></td>
              <td>${e.time||'—'}</td>
              <td>${e.city||'—'}</td>
              <td style="color:var(--muted)">${e.location||'—'}</td>
              <td>
                <div class="td-actions">
                  <button class="btn-icon" onclick='openEventsModal(${JSON.stringify(e)})'>✏️</button>
                  <button class="btn-icon" onclick="deleteRow('events','${e.id}','renderEvents')">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function openEventsModal(row = null) {
  openModal(row ? 'Edit event' : 'Add event', `
    <div class="form-group"><label>Event title</label>
      <input id="mETitle" value="${row?.title||''}" placeholder="Event name" />
    </div>
    <div class="form-row">
      <div class="form-group"><label>Date</label>
        <input id="mEDate" type="date" value="${row?.date||''}" />
      </div>
      <div class="form-group"><label>Time</label>
        <input id="mETime" type="time" value="${row?.time||''}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>City</label>
        <input id="mECity" value="${row?.city||''}" placeholder="Moscow" />
      </div>
      <div class="form-group"><label>Location / Venue</label>
        <input id="mELocation" value="${row?.location||''}" placeholder="Venue name" />
      </div>
    </div>
    <div class="form-group"><label>Description</label>
      <textarea id="mEDesc" rows="3">${row?.description||''}</textarea>
    </div>
    <div class="form-group"><label>Event photo (optional)</label>
      ${buildImagePicker('mEImg','events', row?.photo_url||'')}
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveEvent('${row?.id||''}')">
        ${row ? 'Save changes' : 'Create event'}
      </button>
    </div>`);
}

async function saveEvent(id) {
  const row = {
    title:       document.getElementById('mETitle').value.trim(),
    date:        document.getElementById('mEDate').value,
    time:        document.getElementById('mETime').value,
    city:        document.getElementById('mECity').value.trim(),
    location:    document.getElementById('mELocation').value.trim(),
    description: document.getElementById('mEDesc').value.trim(),
    photo_url:   document.getElementById('mEImg').value.trim()
  };
  if (!row.title) { showToast('Title is required.','error'); return; }
  const { error } = id ? await dbUpdate('events',id,row) : await dbInsert('events',row);
  if (error) { showToast('Error: '+error.message,'error'); console.error(error); return; }
  closeModal(); showToast(id?'Event updated ✓':'Event created ✓','success'); renderEvents();
}

/* ══════════════════════════════════════════════════
   CLUBS
   Schema: name, category, description, photo_url
   ══════════════════════════════════════════════════ */
async function renderClubs() {
  const { data } = await dbSelect('clubs', { order:'name' });

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Clubs & Societies</div>
        <div class="page-subtitle">${(data||[]).length} clubs</div>
      </div>
      <button class="btn-primary" onclick="openClubModal()">+ Add club</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Photo</th><th>Name</th><th>Category</th><th>Description</th><th>Actions</th></tr></thead>
        <tbody>
          ${(data||[]).map(c => `
            <tr>
              <td><img class="row-img" src="${c.photo_url||''}" alt="" onerror="this.style.display='none'" /></td>
              <td style="font-weight:600">${c.name}</td>
              <td><span class="badge badge-green">${c.category||'—'}</span></td>
              <td style="color:var(--muted);font-size:12px">${(c.description||'').slice(0,60)}…</td>
              <td>
                <div class="td-actions">
                  <button class="btn-icon" onclick='openClubModal(${JSON.stringify(c)})'>✏️</button>
                  <button class="btn-icon" onclick="deleteRow('clubs','${c.id}','renderClubs')">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function openClubModal(row = null) {
  openModal(row ? 'Edit club' : 'Add club', `
    <div class="form-row">
      <div class="form-group"><label>Club name</label>
        <input id="mCName" value="${row?.name||''}" placeholder="Club name" />
      </div>
      <div class="form-group"><label>Category</label>
        <select id="mCCat">
          ${['Arts','Cultural','Faith','Sports','Professional','Academic'].map(c =>
            `<option value="${c}" ${row?.category===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group"><label>Description</label>
      <textarea id="mCDesc" rows="3">${row?.description||''}</textarea>
    </div>
    <div class="form-group"><label>Club photo</label>
      ${buildImagePicker('mCImg','clubs', row?.photo_url||'')}
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveClub('${row?.id||''}')">
        ${row ? 'Save changes' : 'Add club'}
      </button>
    </div>`);
}

async function saveClub(id) {
  const row = {
    name:        document.getElementById('mCName').value.trim(),
    category:    document.getElementById('mCCat').value,
    description: document.getElementById('mCDesc').value.trim(),
    photo_url:   document.getElementById('mCImg').value.trim()
  };
  if (!row.name) { showToast('Name is required.','error'); return; }
  const { error } = id ? await dbUpdate('clubs',id,row) : await dbInsert('clubs',row);
  if (error) { showToast('Error: '+error.message,'error'); console.error(error); return; }
  closeModal(); showToast(id?'Club updated ✓':'Club added ✓','success'); renderClubs();
}

/* ══════════════════════════════════════════════════
   GALLERY
   Schema: title, caption, category, photo_url, image_url, url
   ══════════════════════════════════════════════════ */
async function renderGallery() {
  const { data } = await dbSelect('gallery_items');

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Gallery</div>
        <div class="page-subtitle">${(data||[]).length} photos</div>
      </div>
      <button class="btn-primary" onclick="openGalleryModal()">+ Add photo</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px">
      ${(data||[]).map(g => {
        const img = g.photo_url||g.image_url||g.url||'';
        return `
          <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--white);box-shadow:var(--shadow)">
            ${img ? `<img src="${img}" alt="${g.caption||''}" style="width:100%;height:130px;object-fit:cover;display:block" />` : '<div style="height:130px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:2rem">🖼️</div>'}
            <div style="padding:10px 12px">
              <div style="font-size:12px;font-weight:600;margin-bottom:4px">${g.caption||g.title||'—'}</div>
              <span class="badge badge-blue">${g.category||'—'}</span>
              <div style="display:flex;gap:6px;margin-top:10px">
                <button class="btn-icon" onclick='openGalleryModal(${JSON.stringify(g)})' style="flex:1;width:auto">✏️</button>
                <button class="btn-icon" onclick="deleteRow('gallery_items','${g.id}','renderGallery')" style="flex:1;width:auto">🗑️</button>
              </div>
            </div>
          </div>`; }).join('')}
    </div>`;
}

function openGalleryModal(row = null) {
  const img = row ? (row.photo_url||row.image_url||row.url||'') : '';
  openModal(row ? 'Edit photo' : 'Add photo', `
    <div class="form-group"><label>Photo</label>
      ${buildImagePicker('mGImg','gallery', img)}
    </div>
    <div class="form-row">
      <div class="form-group"><label>Caption</label>
        <input id="mGCap" value="${row?.caption||''}" placeholder="Short description" />
      </div>
      <div class="form-group"><label>Category</label>
        <select id="mGCat">
          ${['Cultural','Academic','Social','Graduation','Sports','General'].map(c =>
            `<option value="${c}" ${row?.category===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveGallery('${row?.id||''}')">
        ${row ? 'Save changes' : 'Add photo'}
      </button>
    </div>`);
}

async function saveGallery(id) {
  const row = {
    photo_url: document.getElementById('mGImg').value.trim(),
    caption:   document.getElementById('mGCap').value.trim(),
    category:  document.getElementById('mGCat').value
  };
  if (!row.photo_url) { showToast('Please upload or paste a photo.','error'); return; }
  const { error } = id ? await dbUpdate('gallery_items',id,row) : await dbInsert('gallery_items',row);
  if (error) { showToast('Error: '+error.message,'error'); console.error(error); return; }
  closeModal(); showToast(id?'Photo updated ✓':'Photo added ✓','success'); renderGallery();
}

/* ══════════════════════════════════════════════════
   RESOURCES
   Schema: title, category, file_url
   ══════════════════════════════════════════════════ */
async function renderResources() {
  const { data } = await dbSelect('resources');

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Resources</div>
        <div class="page-subtitle">${(data||[]).length} resources</div>
      </div>
      <button class="btn-primary" onclick="openResourceModal()">+ Add resource</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Title</th><th>Category</th><th>File URL</th><th>Actions</th></tr></thead>
        <tbody>
          ${(data||[]).map(r => `
            <tr>
              <td style="font-weight:600">${r.title}</td>
              <td><span class="badge badge-blue">${r.category||'—'}</span></td>
              <td style="font-size:11px;color:var(--muted)">
                ${r.file_url ? `<a href="${r.file_url}" target="_blank" style="color:var(--blue)">View file</a>` : '—'}
              </td>
              <td>
                <div class="td-actions">
                  <button class="btn-icon" onclick='openResourceModal(${JSON.stringify(r)})'>✏️</button>
                  <button class="btn-icon" onclick="deleteRow('resources','${r.id}','renderResources')">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function openResourceModal(row = null) {
  openModal(row ? 'Edit resource' : 'Add resource', `
    <div class="form-group"><label>Title</label>
      <input id="mRTitle" value="${row?.title||''}" placeholder="Resource title" />
    </div>
    <div class="form-group"><label>Category</label>
      <select id="mRCat">
        ${['Visa','Emergency','Housing','Academic','Health','Legal','Cultural'].map(c =>
          `<option value="${c}" ${row?.category===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>File URL (PDF, link, etc.)</label>
      <input id="mRFile" value="${row?.file_url||''}" placeholder="https://…" />
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveResource('${row?.id||''}')">
        ${row ? 'Save changes' : 'Add resource'}
      </button>
    </div>`);
}

async function saveResource(id) {
  const row = {
    title:    document.getElementById('mRTitle').value.trim(),
    category: document.getElementById('mRCat').value,
    file_url: document.getElementById('mRFile').value.trim()
  };
  if (!row.title) { showToast('Title is required.','error'); return; }
  const { error } = id ? await dbUpdate('resources',id,row) : await dbInsert('resources',row);
  if (error) { showToast('Error: '+error.message,'error'); console.error(error); return; }
  closeModal(); showToast(id?'Resource updated ✓':'Resource added ✓','success'); renderResources();
}

/* ══════════════════════════════════════════════════
   MESSAGES
   Schema: id, name, email, subject, message, created_at
   ══════════════════════════════════════════════════ */
async function renderMessages() {
  const { data } = await dbSelect('contact_messages', { order:'created_at', asc:false });

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Messages</div>
        <div class="page-subtitle">${(data||[]).length} total enquiries</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:300px 1fr;gap:20px;align-items:start">
      <div class="table-wrap" style="border-radius:12px">
        <div style="padding:12px 16px;border-bottom:1px solid var(--border);font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)">Inbox</div>
        ${(data||[]).map(m => `
          <div onclick="viewMessage('${m.id}')"
            style="padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .15s"
            onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">
            <div style="display:flex;justify-content:space-between">
              <div style="font-weight:600;font-size:13px">${m.name||m.full_name||'—'}</div>
              <div style="font-size:11px;color:var(--muted)">${new Date(m.created_at||Date.now()).toLocaleDateString()}</div>
            </div>
            <div style="font-size:12px;color:var(--muted)">${m.subject||'—'}</div>
          </div>`).join('')}
      </div>
      <div id="msgDetail">
        <div class="empty-state card">
          <div class="empty-state-icon">✉️</div>
          <h3>Select a message</h3>
          <p>Click a message on the left to read it.</p>
        </div>
      </div>
    </div>`;
  window._messages = data || [];
}

function viewMessage(id) {
  const msg = window._messages.find(m => m.id === id);
  if (!msg) return;
  document.getElementById('msgDetail').innerHTML = `
    <div class="msg-detail">
      <div class="msg-detail-header">
        <div class="msg-detail-from">${msg.name||msg.full_name||'—'}</div>
        <div class="msg-detail-meta">${msg.email||''} · ${new Date(msg.created_at||Date.now()).toLocaleString()}</div>
        <div class="msg-detail-subj">Subject: ${msg.subject||'—'}</div>
      </div>
      <div class="msg-detail-body">${msg.message||''}</div>
      <div style="margin-top:20px;display:flex;gap:10px">
        <a href="mailto:${msg.email||''}?subject=Re: ${encodeURIComponent(msg.subject||'')}" class="btn-primary">↩ Reply by email</a>
        <button class="btn-danger" onclick="deleteRow('contact_messages','${msg.id}','renderMessages')">Delete</button>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════
   SHARED UTILITIES
   ══════════════════════════════════════════════════ */
async function deleteRow(table, id, rerenderFn) {
  if (!confirm('Delete this item? This cannot be undone.')) return;
  const { error } = await dbDelete(table, id);
  if (error) { showToast('Error deleting: '+error.message,'error'); return; }
  showToast('Deleted ✓','success');
  window[rerenderFn]();
}

function filterTable(query, tableId) {
  const q = query.toLowerCase();
  document.querySelectorAll(`#${tableId} tbody tr`).forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function openModal(title, bodyHTML) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.add('hidden'), 3500);
}

/* ══════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();

  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('loginPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
  });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    if (!useMock) await db.auth.signOut();
    document.getElementById("adminShell").classList.add("hidden");
    document.getElementById("loginScreen").classList.remove("hidden");
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
  });

  document.querySelectorAll('.nav-item').forEach(el =>
    el.addEventListener('click', () => navigate(el.dataset.page))
  );

  document.getElementById('sidebarToggle').addEventListener('click', () =>
    document.getElementById('sidebar').classList.toggle('open')
  );

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});