/* ── Supabase Config ── */
const SUPABASE_URL = 'https://zroahleyhzfglzydwmdv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-nxL1CwAqShZi4gYM9avKA_kJ0PmMEh';
const STORAGE_BUCKET = 'slsur-media';


/* ── Mock data (works before Supabase is configured) ── */
const MOCK = {
  news_posts: [
    { id:'1', title:'SLSUR Welcomes 2024 Cohort', description:'Over 60 new students arrived this semester.', tags:['ANNOUNCEMENT'], image_url:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&q=70', published_at:'2024-09-01' },
    { id:'2', title:'Welfare Petition Update', description:'Our team presented a petition to five universities.', tags:['NEWS'], image_url:'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300&q=70', published_at:'2024-08-15' },
    { id:'3', title:'Independence Day Gala', description:'Join us at the African Cultural Centre in Moscow.', tags:['EVENT'], image_url:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=70', published_at:'2025-04-27' },
  ],
  events: [
    { id:'1', title:'Independence Day Celebration', city:'Moscow', venue:'African Cultural Centre', event_date:'2025-04-27' },
    { id:'2', title:'Cultural Night — Taste of SL', city:'Saint Petersburg', venue:'Student Cultural Hall', event_date:'2025-03-08' },
    { id:'3', title:'Health Insurance Workshop', city:'Kazan', venue:'Student Affairs Office', event_date:'2025-02-15' },
  ],
  clubs: [
    { id:'1', name:'Creative Arts Collective', category:'Arts', description:'Painters, photographers, musicians and writers.', icon:'🎨', city:'Kazan', member_count:45 },
    { id:'2', name:'Cultural Heritage Society', category:'Cultural', description:'Preserving Sierra Leonean traditions.', icon:'🎭', city:'Moscow', member_count:120 },
    { id:'3', name:'Faith & Fellowship Circle', category:'Faith', description:'Spiritual grounding and community support.', icon:'🕊️', city:'Voronezh', member_count:60 },
    { id:'4', name:'Lions FC', category:'Sports', description:'Football, tournaments and fitness.', icon:'⚽', city:'Saint Petersburg', member_count:85 },
    { id:'5', name:'Medical & Health Sciences Network', category:'Professional', description:'Networking for future health professionals.', icon:'💼', city:'Multiple Cities', member_count:200 },
    { id:'6', name:'STEM Excellence Club', category:'Academic', description:'Peer tutoring and research collaboration.', icon:'📚', city:'Novosibirsk', member_count:95 },
  ],
  gallery_items: [
    { id:'1', image_url:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=70', category:'Social', caption:'Cultural Night 2024' },
    { id:'2', image_url:'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&q=70', category:'Academic', caption:'Study session' },
    { id:'3', image_url:'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=300&q=70', category:'Academic', caption:'Library visit' },
    { id:'4', image_url:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&q=70', category:'Graduation', caption:'Graduation ceremony' },
  ],
  resources: [
    { id:'1', title:'Russian Student Visa Guide', category:'Visa', description:'Step-by-step visa instructions.', is_urgent:false, contact_info:'' },
    { id:'2', title:'Emergency Contacts', category:'Emergency', description:'Critical phone numbers and contacts.', is_urgent:true, contact_info:'+7 (495) 956-6529' },
    { id:'3', title:'Finding Student Housing', category:'Housing', description:'Tips for the Russian rental market.', is_urgent:false, contact_info:'' },
    { id:'4', title:'Healthcare & Medical Insurance', category:'Health', description:'How to register with a polyclinic.', is_urgent:false, contact_info:'' },
  ],
  leadership: [
    { id:'1', name:'Abdul Kamara', role:'President', city:'Moscow', photo_url:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=70', display_order:1 },
    { id:'2', name:'Mariama Conteh', role:'Vice President', city:'Saint Petersburg', photo_url:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=70', display_order:2 },
    { id:'3', name:'Ibrahim Sesay', role:'General Secretary', city:'Kazan', photo_url:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', display_order:3 },
  ],
  contact_messages: [
    { id:'1', full_name:'Aminata Bah', email:'aminata@email.com', subject:'Membership query', message:'I just arrived in Moscow and would like to join SLSUR. How do I register?', sent_at:'2025-01-15T10:22:00Z', is_read:false },
    { id:'2', full_name:'Mohamed Turay', email:'mturay@email.com', subject:'Visa document help', message:'I need help understanding the documents required for visa renewal.', sent_at:'2025-01-14T14:05:00Z', is_read:false },
    { id:'3', full_name:'Fatima Jalloh', email:'fatj@email.com', subject:'Cultural event proposal', message:'I would like to propose a cultural showcase event for the community.', sent_at:'2025-01-13T09:11:00Z', is_read:false },
    { id:'4', full_name:'Ibrahim Koroma', email:'ibk@email.com', subject:'Housing advice', message:'Looking for advice on finding student accommodation near my university.', sent_at:'2025-01-10T16:30:00Z', is_read:true },
  ]
};

/* ── State ── */
let db = null;
let useMock = true;

/* ── Init Supabase ── */
function initSupabase() {
  if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    console.warn('Using mock data — paste your Supabase URL and KEY into admin.js to go live.');
    useMock = true;
    return;
  }
  try {
    db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    useMock = false;
  } catch(e) {
    console.warn('Supabase init failed, using mock:', e);
    useMock = true;
  }
}

/* ══════════════════════════════════════════════════
   IMAGE UPLOAD HELPER
   Uploads a file to Supabase Storage and returns
   the public URL. Falls back gracefully in mock mode.
   ══════════════════════════════════════════════════ */
async function uploadImage(file, folder = 'general') {
  // In mock mode — create a temporary local preview URL
  if (useMock) {
    return URL.createObjectURL(file);
  }

  const ext      = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await db.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Upload error:', error);
    showToast('Upload failed: ' + error.message, 'error');
    return null;
  }

  const { data: urlData } = db.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/* ══════════════════════════════════════════════════
   REUSABLE IMAGE UPLOAD WIDGET
   Call buildImagePicker(id, folder, existingUrl)
   to get the HTML for any modal form.
   ══════════════════════════════════════════════════ */
function buildImagePicker(inputId, folder, existingUrl = '') {
  return `
    <div class="img-picker" id="picker_${inputId}">
      <div class="img-picker-preview" id="preview_${inputId}">
        ${existingUrl
          ? `<img src="${existingUrl}" alt="Current photo" />`
          : `<div class="img-picker-placeholder">
               <span class="img-picker-icon">🖼️</span>
               <span>No image yet</span>
             </div>`
        }
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
            value="${existingUrl}"
            oninput="handleUrlInput('${inputId}')" />
        </div>
      </div>
      <div class="img-picker-status" id="status_${inputId}"></div>
      <!-- hidden field that holds the final URL used on save -->
      <input type="hidden" id="${inputId}" value="${existingUrl}" />
    </div>
  `;
}

/* Called when user picks a file from disk */
async function handleFileSelect(inputId, folder) {
  const fileInput = document.getElementById(`file_${inputId}`);
  const file = fileInput.files[0];
  if (!file) return;

  // Validate type + size (max 5 MB)
  const allowed = ['image/jpeg','image/png','image/webp','image/gif'];
  if (!allowed.includes(file.type)) {
    showToast('Only JPG, PNG, WebP or GIF allowed.', 'error'); return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('File too large — max 5 MB.', 'error'); return;
  }

  setPickerStatus(inputId, 'uploading', '⏳ Uploading…');

  const url = await uploadImage(file, folder);
  if (!url) { setPickerStatus(inputId, 'error', '✕ Upload failed'); return; }

  // Update hidden field + preview
  document.getElementById(inputId).value = url;
  document.getElementById(`url_${inputId}`).value = url;
  updatePreview(inputId, url);
  setPickerStatus(inputId, 'success', '✓ Photo uploaded');
}

/* Called when user types/pastes a URL */
function handleUrlInput(inputId) {
  const url = document.getElementById(`url_${inputId}`).value.trim();
  document.getElementById(inputId).value = url;
  if (url) updatePreview(inputId, url);
}

function updatePreview(inputId, url) {
  const preview = document.getElementById(`preview_${inputId}`);
  preview.innerHTML = `<img src="${url}" alt="Preview"
    onerror="this.parentElement.innerHTML='<div class=img-picker-placeholder><span>⚠️</span><span>Could not load image</span></div>'" />`;
}

function setPickerStatus(inputId, type, msg) {
  const el = document.getElementById(`status_${inputId}`);
  if (!el) return;
  el.textContent = msg;
  el.className = `img-picker-status status-${type}`;
  if (type === 'success') setTimeout(() => { el.textContent = ''; }, 3000);
}

/* ══════════════════════════════════════════════════
   DB HELPERS (Supabase or mock)
   ══════════════════════════════════════════════════ */
async function dbSelect(table, options = {}) {
  if (useMock) {
    let rows = [...(MOCK[table] || [])];
    if (options.order) rows.sort((a,b) => String(a[options.order]).localeCompare(String(b[options.order])));
    if (options.limit) rows = rows.slice(0, options.limit);
    return { data: rows, error: null };
  }
  let q = db.from(table).select('*');
  if (options.order) q = q.order(options.order, { ascending: options.asc !== false });
  if (options.limit) q = q.limit(options.limit);
  return await q;
}

async function dbInsert(table, row) {
  if (useMock) {
    row.id = String(Date.now());
    MOCK[table].push(row);
    return { data: row, error: null };
  }
  return await db.from(table).insert(row).select().single();
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
   AUTH
   ══════════════════════════════════════════════════ */
function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  const err   = document.getElementById('loginError');

  if (!email || !pass) { showLoginError('Please fill in both fields.'); return; }

  if (pass === 'admin' || !SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    err.classList.remove('show');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminShell').classList.remove('hidden');
    navigate('dashboard');
  } else {
    showLoginError('Invalid password. Demo password: "admin".');
  }
}

function showLoginError(msg) {
  const err = document.getElementById('loginError');
  err.textContent = msg;
  err.classList.add('show');
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
    clubs:'Clubs & Societies', gallery:'Gallery', resources:'Student Resources',
    leadership:'Leadership', messages:'Messages'
  };
  document.getElementById('breadcrumb').textContent = labels[page] || page;
  renderPage(page);
  document.getElementById('sidebar').classList.remove('open');
}

async function renderPage(page) {
  document.getElementById('pageContent').innerHTML =
    `<div style="text-align:center;padding:60px;color:var(--muted)">Loading…</div>`;
  switch(page) {
    case 'dashboard':  await renderDashboard(); break;
    case 'news':       await renderNews(); break;
    case 'events':     await renderEvents(); break;
    case 'clubs':      await renderClubs(); break;
    case 'gallery':    await renderGallery(); break;
    case 'resources':  await renderResources(); break;
    case 'leadership': await renderLeadership(); break;
    case 'messages':   await renderMessages(); break;
  }
}

/* ══════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════ */
async function renderDashboard() {
  const [{ data:news },{ data:events },{ data:clubs },{ data:msgs }] = await Promise.all([
    dbSelect('news_posts'), dbSelect('events'), dbSelect('clubs'), dbSelect('contact_messages')
  ]);
  const unread = (msgs||[]).filter(m => !m.is_read).length;

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Welcome back 👋</div>
        <div class="page-subtitle">Here's what's happening with SLSUR today.</div>
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
        <div class="stat-label">Upcoming Events</div>
        <div class="stat-value stat-blue">${(events||[]).length}</div>
        <div class="stat-sub">Across all cities</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Clubs</div>
        <div class="stat-value">${(clubs||[]).length}</div>
        <div class="stat-sub">Clubs & societies</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">New Messages</div>
        <div class="stat-value stat-amber">${unread}</div>
        <div class="stat-sub">Unread enquiries</div>
      </div>
    </div>

    <div class="dash-grid">
      <div class="dash-left">
        <div class="card">
          <div style="font-weight:700;font-size:15px;margin-bottom:16px">Quick actions</div>
          <div class="quick-actions">
            <button class="qa-btn" onclick="navigate('news')">
              <div class="qa-btn-icon">📰</div>
              <div class="qa-btn-label">Add news post</div>
              <div class="qa-btn-sub">Publish an article</div>
            </button>
            <button class="qa-btn" onclick="navigate('events')">
              <div class="qa-btn-icon">📅</div>
              <div class="qa-btn-label">Create event</div>
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
              <div class="qa-btn-sub">${unread} unread</div>
            </button>
          </div>
        </div>
      </div>

      <div class="dash-right">
        <div class="card messages-preview">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <div style="font-weight:700;font-size:15px">Recent messages</div>
            <a onclick="navigate('messages')" style="font-size:12px;color:var(--green);font-weight:600;cursor:pointer">View all →</a>
          </div>
          ${(msgs||[]).slice(0,4).map(m => `
            <div class="msg-item ${!m.is_read?'msg-unread':''}">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div class="msg-name">${m.full_name}</div>
                <div class="msg-time">${new Date(m.sent_at).toLocaleDateString()}</div>
              </div>
              <div class="msg-subj">${m.subject}</div>
            </div>
          `).join('')}
        </div>

        <div class="card">
          <div style="font-weight:700;font-size:15px;margin-bottom:14px">Upcoming events</div>
          ${(events||[]).slice(0,3).map(e => `
            <div style="padding:10px 0;border-bottom:1px solid var(--border)">
              <div style="font-size:13px;font-weight:600">${e.title}</div>
              <div style="font-size:11px;color:var(--muted);margin-top:3px">📅 ${e.event_date} · 📍 ${e.city}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ══════════════════════════════════════════════════
   NEWS  (with photo upload)
   ══════════════════════════════════════════════════ */
async function renderNews() {
  const { data } = await dbSelect('news_posts', { order:'published_at', asc:false });

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">News Posts</div>
        <div class="page-subtitle">${(data||[]).length} articles published</div>
      </div>
      <button class="btn-primary" onclick="openNewsModal()">+ Add article</button>
    </div>
    <div class="table-toolbar">
      <div class="search-wrap">
        <input type="text" placeholder="Search articles…" oninput="filterTable(this.value,'newsTable')" />
      </div>
    </div>
    <div class="table-wrap">
      <table id="newsTable">
        <thead>
          <tr><th>Photo</th><th>Title</th><th>Tags</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${(data||[]).map(n => `
            <tr>
              <td><img class="row-img" src="${n.image_url||''}" alt="" /></td>
              <td style="max-width:240px">
                <div style="font-weight:600;font-size:13px">${n.title}</div>
                <div style="font-size:11px;color:var(--muted);margin-top:2px">${(n.description||'').slice(0,65)}…</div>
              </td>
              <td>${(n.tags||[]).map(t=>`<span class="badge badge-green">${t}</span>`).join(' ')}</td>
              <td style="white-space:nowrap;font-size:12px">${n.published_at||''}</td>
              <td>
                <div class="td-actions">
                  <button class="btn-icon" onclick='openNewsModal(${JSON.stringify(n)})' title="Edit">✏️</button>
                  <button class="btn-icon" onclick="deleteRow('news_posts','${n.id}','renderNews')" title="Delete">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openNewsModal(row = null) {
  openModal(row ? 'Edit article' : 'Add article', `
    <div class="form-group"><label>Title</label>
      <input id="mTitle" value="${row?.title||''}" placeholder="Article headline" />
    </div>
    <div class="form-group"><label>Description</label>
      <textarea id="mDesc" rows="3" placeholder="Short summary…">${row?.description||''}</textarea>
    </div>

    <div class="form-group"><label>Article photo</label>
      ${buildImagePicker('mImg', 'news', row?.image_url||'')}
    </div>

    <div class="form-row">
      <div class="form-group"><label>Published date</label>
        <input id="mDate" type="date" value="${row?.published_at||new Date().toISOString().slice(0,10)}" />
      </div>
      <div class="form-group"><label>Tags (comma-separated)</label>
        <input id="mTags" value="${(row?.tags||[]).join(', ')}" placeholder="NEWS, FEATURED" />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveNews('${row?.id||''}')">
        ${row ? 'Save changes' : 'Publish article'}
      </button>
    </div>
  `);
}

async function saveNews(id) {
  const row = {
    title:        document.getElementById('mTitle').value.trim(),
    description:  document.getElementById('mDesc').value.trim(),
    image_url:    document.getElementById('mImg').value.trim(),
    published_at: document.getElementById('mDate').value,
    tags:         document.getElementById('mTags').value.split(',').map(t=>t.trim()).filter(Boolean)
  };
  if (!row.title) { showToast('Title is required.','error'); return; }
  const { error } = id ? await dbUpdate('news_posts',id,row) : await dbInsert('news_posts',row);
  if (error) { showToast('Error saving.','error'); console.error(error); return; }
  closeModal();
  showToast(id ? 'Article updated ✓' : 'Article published ✓','success');
  renderNews();
}

/* ══════════════════════════════════════════════════
   EVENTS
   ══════════════════════════════════════════════════ */
async function renderEvents() {
  const { data } = await dbSelect('events', { order:'event_date' });

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Events</div>
        <div class="page-subtitle">${(data||[]).length} events scheduled</div>
      </div>
      <button class="btn-primary" onclick="openEventsModal()">+ Add event</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Title</th><th>Date</th><th>City</th><th>Venue</th><th>Actions</th></tr></thead>
        <tbody>
          ${(data||[]).map(e => `
            <tr>
              <td style="font-weight:600">${e.title}</td>
              <td><span class="badge badge-blue">${e.event_date}</span></td>
              <td>${e.city}</td>
              <td style="color:var(--muted)">${e.venue}</td>
              <td>
                <div class="td-actions">
                  <button class="btn-icon" onclick='openEventsModal(${JSON.stringify(e)})'>✏️</button>
                  <button class="btn-icon" onclick="deleteRow('events','${e.id}','renderEvents')">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openEventsModal(row = null) {
  openModal(row ? 'Edit event' : 'Add event', `
    <div class="form-group"><label>Event title</label>
      <input id="mETitle" value="${row?.title||''}" placeholder="Event name" />
    </div>
    <div class="form-row">
      <div class="form-group"><label>Date</label>
        <input id="mEDate" type="date" value="${row?.event_date||''}" />
      </div>
      <div class="form-group"><label>City</label>
        <input id="mECity" value="${row?.city||''}" placeholder="Moscow" />
      </div>
    </div>
    <div class="form-group"><label>Venue</label>
      <input id="mEVenue" value="${row?.venue||''}" placeholder="Venue name" />
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveEvent('${row?.id||''}')">
        ${row ? 'Save changes' : 'Create event'}
      </button>
    </div>
  `);
}

async function saveEvent(id) {
  const row = {
    title:      document.getElementById('mETitle').value.trim(),
    event_date: document.getElementById('mEDate').value,
    city:       document.getElementById('mECity').value.trim(),
    venue:      document.getElementById('mEVenue').value.trim()
  };
  if (!row.title) { showToast('Title is required.','error'); return; }
  const { error } = id ? await dbUpdate('events',id,row) : await dbInsert('events',row);
  if (error) { showToast('Error saving.','error'); return; }
  closeModal(); showToast(id ? 'Event updated ✓' : 'Event created ✓','success'); renderEvents();
}

/* ══════════════════════════════════════════════════
   CLUBS
   ══════════════════════════════════════════════════ */
async function renderClubs() {
  const { data } = await dbSelect('clubs', { order:'name' });

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Clubs & Societies</div>
        <div class="page-subtitle">${(data||[]).length} clubs registered</div>
      </div>
      <button class="btn-primary" onclick="openClubModal()">+ Add club</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Icon</th><th>Club name</th><th>Category</th><th>Members</th><th>City</th><th>Actions</th></tr></thead>
        <tbody>
          ${(data||[]).map(c => `
            <tr>
              <td style="font-size:20px">${c.icon||'🏛️'}</td>
              <td>
                <div style="font-weight:600">${c.name}</div>
                <div style="font-size:11px;color:var(--muted)">${(c.description||'').slice(0,55)}…</div>
              </td>
              <td><span class="badge badge-green">${c.category}</span></td>
              <td>${c.member_count}</td>
              <td>${c.city}</td>
              <td>
                <div class="td-actions">
                  <button class="btn-icon" onclick='openClubModal(${JSON.stringify(c)})'>✏️</button>
                  <button class="btn-icon" onclick="deleteRow('clubs','${c.id}','renderClubs')">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openClubModal(row = null) {
  openModal(row ? 'Edit club' : 'Add club', `
    <div class="form-row">
      <div class="form-group"><label>Club name</label>
        <input id="mCName" value="${row?.name||''}" placeholder="Club name" />
      </div>
      <div class="form-group"><label>Icon (emoji)</label>
        <input id="mCIcon" value="${row?.icon||''}" placeholder="🎭" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Category</label>
        <select id="mCCat">
          ${['Arts','Cultural','Faith','Sports','Professional','Academic'].map(c =>
            `<option value="${c}" ${row?.category===c?'selected':''}>${c}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group"><label>City</label>
        <input id="mCCity" value="${row?.city||''}" placeholder="Moscow" />
      </div>
    </div>
    <div class="form-group"><label>Description</label>
      <textarea id="mCDesc" rows="3">${row?.description||''}</textarea>
    </div>
    <div class="form-group"><label>Member count</label>
      <input id="mCMem" type="number" value="${row?.member_count||0}" />
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveClub('${row?.id||''}')">
        ${row ? 'Save changes' : 'Add club'}
      </button>
    </div>
  `);
}

async function saveClub(id) {
  const row = {
    name:         document.getElementById('mCName').value.trim(),
    icon:         document.getElementById('mCIcon').value.trim(),
    category:     document.getElementById('mCCat').value,
    city:         document.getElementById('mCCity').value.trim(),
    description:  document.getElementById('mCDesc').value.trim(),
    member_count: parseInt(document.getElementById('mCMem').value)||0
  };
  if (!row.name) { showToast('Name is required.','error'); return; }
  const { error } = id ? await dbUpdate('clubs',id,row) : await dbInsert('clubs',row);
  if (error) { showToast('Error saving.','error'); return; }
  closeModal(); showToast(id ? 'Club updated ✓' : 'Club added ✓','success'); renderClubs();
}

/* ══════════════════════════════════════════════════
   GALLERY  (with photo upload)
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
      ${(data||[]).map(g => `
        <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--white);box-shadow:var(--shadow)">
          <img src="${g.image_url}" alt="${g.caption||''}"
            style="width:100%;height:130px;object-fit:cover;display:block" />
          <div style="padding:10px 12px">
            <div style="font-size:12px;font-weight:600;margin-bottom:4px">${g.caption||'—'}</div>
            <span class="badge badge-blue">${g.category}</span>
            <div style="display:flex;gap:6px;margin-top:10px">
              <button class="btn-icon" onclick='openGalleryModal(${JSON.stringify(g)})' style="flex:1;width:auto">✏️</button>
              <button class="btn-icon" onclick="deleteRow('gallery_items','${g.id}','renderGallery')" style="flex:1;width:auto">🗑️</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function openGalleryModal(row = null) {
  openModal(row ? 'Edit photo' : 'Add photo', `
    <div class="form-group"><label>Photo</label>
      ${buildImagePicker('mGImg', 'gallery', row?.image_url||'')}
    </div>
    <div class="form-row">
      <div class="form-group"><label>Caption</label>
        <input id="mGCap" value="${row?.caption||''}" placeholder="Short description" />
      </div>
      <div class="form-group"><label>Category</label>
        <select id="mGCat">
          ${['Cultural','Academic','Social','Graduation','Sports','General'].map(c =>
            `<option value="${c}" ${row?.category===c?'selected':''}>${c}</option>`
          ).join('')}
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveGallery('${row?.id||''}')">
        ${row ? 'Save changes' : 'Add photo'}
      </button>
    </div>
  `);
}

async function saveGallery(id) {
  const row = {
    image_url: document.getElementById('mGImg').value.trim(),
    caption:   document.getElementById('mGCap').value.trim(),
    category:  document.getElementById('mGCat').value
  };
  if (!row.image_url) { showToast('Please upload or paste a photo.','error'); return; }
  const { error } = id ? await dbUpdate('gallery_items',id,row) : await dbInsert('gallery_items',row);
  if (error) { showToast('Error saving.','error'); return; }
  closeModal(); showToast(id ? 'Photo updated ✓' : 'Photo added ✓','success'); renderGallery();
}

/* ══════════════════════════════════════════════════
   RESOURCES
   ══════════════════════════════════════════════════ */
async function renderResources() {
  const { data } = await dbSelect('resources');

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Student Resources</div>
        <div class="page-subtitle">${(data||[]).length} resources</div>
      </div>
      <button class="btn-primary" onclick="openResourceModal()">+ Add resource</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Title</th><th>Category</th><th>Urgent</th><th>Contact info</th><th>Actions</th></tr></thead>
        <tbody>
          ${(data||[]).map(r => `
            <tr>
              <td>
                <div style="font-weight:600">${r.title}</div>
                <div style="font-size:11px;color:var(--muted)">${(r.description||'').slice(0,60)}…</div>
              </td>
              <td><span class="badge badge-blue">${r.category}</span></td>
              <td>${r.is_urgent ? '<span class="badge badge-red">Urgent</span>' : '<span class="badge badge-gray">Normal</span>'}</td>
              <td style="font-size:12px;color:var(--muted)">${r.contact_info||'—'}</td>
              <td>
                <div class="td-actions">
                  <button class="btn-icon" onclick='openResourceModal(${JSON.stringify(r)})'>✏️</button>
                  <button class="btn-icon" onclick="deleteRow('resources','${r.id}','renderResources')">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openResourceModal(row = null) {
  openModal(row ? 'Edit resource' : 'Add resource', `
    <div class="form-group"><label>Title</label>
      <input id="mRTitle" value="${row?.title||''}" placeholder="Resource title" />
    </div>
    <div class="form-row">
      <div class="form-group"><label>Category</label>
        <select id="mRCat">
          ${['Visa','Emergency','Housing','Academic','Health','Legal','Cultural'].map(c =>
            `<option value="${c}" ${row?.category===c?'selected':''}>${c}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group"><label>Urgent?</label>
        <select id="mRUrgent">
          <option value="false" ${!row?.is_urgent?'selected':''}>No</option>
          <option value="true"  ${row?.is_urgent?'selected':''}>Yes — mark urgent</option>
        </select>
      </div>
    </div>
    <div class="form-group"><label>Description</label>
      <textarea id="mRDesc" rows="3">${row?.description||''}</textarea>
    </div>
    <div class="form-group"><label>Contact info</label>
      <input id="mRContact" value="${row?.contact_info||''}" placeholder="Phone / email" />
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveResource('${row?.id||''}')">
        ${row ? 'Save changes' : 'Add resource'}
      </button>
    </div>
  `);
}

async function saveResource(id) {
  const row = {
    title:        document.getElementById('mRTitle').value.trim(),
    category:     document.getElementById('mRCat').value,
    is_urgent:    document.getElementById('mRUrgent').value === 'true',
    description:  document.getElementById('mRDesc').value.trim(),
    contact_info: document.getElementById('mRContact').value.trim()
  };
  if (!row.title) { showToast('Title is required.','error'); return; }
  const { error } = id ? await dbUpdate('resources',id,row) : await dbInsert('resources',row);
  if (error) { showToast('Error saving.','error'); return; }
  closeModal(); showToast(id ? 'Resource updated ✓' : 'Resource added ✓','success'); renderResources();
}

/* ══════════════════════════════════════════════════
   LEADERSHIP  (with photo upload)
   ══════════════════════════════════════════════════ */
async function renderLeadership() {
  const { data } = await dbSelect('leadership', { order:'display_order' });

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Leadership</div>
        <div class="page-subtitle">${(data||[]).length} executive council members</div>
      </div>
      <button class="btn-primary" onclick="openLeaderModal()">+ Add member</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Photo</th><th>Name</th><th>Role</th><th>City</th><th>Order</th><th>Actions</th></tr></thead>
        <tbody>
          ${(data||[]).map(l => `
            <tr>
              <td><img class="row-avatar" src="${l.photo_url||''}" alt="${l.name}"
                onerror="this.style.display='none'" /></td>
              <td style="font-weight:600">${l.name}</td>
              <td><span class="badge badge-green">${l.role}</span></td>
              <td>${l.city}</td>
              <td>${l.display_order}</td>
              <td>
                <div class="td-actions">
                  <button class="btn-icon" onclick='openLeaderModal(${JSON.stringify(l)})'>✏️</button>
                  <button class="btn-icon" onclick="deleteRow('leadership','${l.id}','renderLeadership')">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openLeaderModal(row = null) {
  openModal(row ? 'Edit member' : 'Add member', `
    <div class="form-row">
      <div class="form-group"><label>Full name</label>
        <input id="mLName" value="${row?.name||''}" placeholder="Full name" />
      </div>
      <div class="form-group"><label>Role / title</label>
        <input id="mLRole" value="${row?.role||''}" placeholder="President" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>City</label>
        <input id="mLCity" value="${row?.city||''}" placeholder="Moscow" />
      </div>
      <div class="form-group"><label>Display order</label>
        <input id="mLOrder" type="number" value="${row?.display_order||1}" />
      </div>
    </div>
    <div class="form-group"><label>Profile photo</label>
      ${buildImagePicker('mLPhoto', 'leadership', row?.photo_url||'')}
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveLeader('${row?.id||''}')">
        ${row ? 'Save changes' : 'Add member'}
      </button>
    </div>
  `);
}

async function saveLeader(id) {
  const row = {
    name:          document.getElementById('mLName').value.trim(),
    role:          document.getElementById('mLRole').value.trim(),
    city:          document.getElementById('mLCity').value.trim(),
    display_order: parseInt(document.getElementById('mLOrder').value)||1,
    photo_url:     document.getElementById('mLPhoto').value.trim()
  };
  if (!row.name) { showToast('Name is required.','error'); return; }
  const { error } = id ? await dbUpdate('leadership',id,row) : await dbInsert('leadership',row);
  if (error) { showToast('Error saving.','error'); return; }
  closeModal(); showToast(id ? 'Member updated ✓' : 'Member added ✓','success'); renderLeadership();
}

/* ══════════════════════════════════════════════════
   MESSAGES
   ══════════════════════════════════════════════════ */
async function renderMessages() {
  const { data } = await dbSelect('contact_messages', { order:'sent_at', asc:false });
  const unread = (data||[]).filter(m => !m.is_read).length;
  const badge = document.getElementById('msgBadge');
  if (badge) { badge.textContent = unread; badge.style.display = unread ? '' : 'none'; }

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Messages</div>
        <div class="page-subtitle">${unread} unread · ${(data||[]).length} total</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:300px 1fr;gap:20px;align-items:start">
      <div class="table-wrap" style="border-radius:12px">
        <div style="padding:12px 16px;border-bottom:1px solid var(--border);font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)">Inbox</div>
        ${(data||[]).map(m => `
          <div class="msg-item ${!m.is_read?'msg-unread':''}" id="msgRow_${m.id}"
               onclick="viewMessage('${m.id}')"
               style="padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .15s"
               onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">
            <div style="display:flex;justify-content:space-between">
              <div class="msg-name">${m.full_name}</div>
              <div class="msg-time">${new Date(m.sent_at).toLocaleDateString()}</div>
            </div>
            <div class="msg-subj">${m.subject}</div>
          </div>
        `).join('')}
      </div>
      <div id="msgDetail">
        <div class="empty-state card">
          <div class="empty-state-icon">✉️</div>
          <h3>Select a message</h3>
          <p>Click a message on the left to read it.</p>
        </div>
      </div>
    </div>
  `;
  window._messages = data || [];
}

async function viewMessage(id) {
  const msg = window._messages.find(m => m.id === id);
  if (!msg) return;
  if (!msg.is_read) {
    await dbUpdate('contact_messages', id, { is_read: true });
    msg.is_read = true;
    const row = document.getElementById('msgRow_' + id);
    if (row) row.classList.remove('msg-unread');
    const badge = document.getElementById('msgBadge');
    if (badge) {
      const count = parseInt(badge.textContent||'0') - 1;
      badge.textContent = count;
      if (count <= 0) badge.style.display = 'none';
    }
  }
  document.getElementById('msgDetail').innerHTML = `
    <div class="msg-detail">
      <div class="msg-detail-header">
        <div class="msg-detail-from">${msg.full_name}</div>
        <div class="msg-detail-meta">${msg.email} · ${new Date(msg.sent_at).toLocaleString()}</div>
        <div class="msg-detail-subj">Subject: ${msg.subject}</div>
      </div>
      <div class="msg-detail-body">${msg.message}</div>
      <div style="margin-top:20px;display:flex;gap:10px">
        <a href="mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}" class="btn-primary">↩ Reply by email</a>
        <button class="btn-danger" onclick="deleteRow('contact_messages','${msg.id}','renderMessages')">Delete</button>
      </div>
    </div>
  `;
}

/* ══════════════════════════════════════════════════
   SHARED UTILITIES
   ══════════════════════════════════════════════════ */
async function deleteRow(table, id, rerenderFn) {
  if (!confirm('Delete this item? This cannot be undone.')) return;
  const { error } = await dbDelete(table, id);
  if (error) { showToast('Error deleting.','error'); return; }
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
  window._toastTimer = setTimeout(() => t.classList.add('hidden'), 3200);
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

  document.getElementById('logoutBtn').addEventListener('click', () => {
    document.getElementById('adminShell').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
  });

  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });

  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});