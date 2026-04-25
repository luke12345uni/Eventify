/* ============================================
   EVENTIFY — SHARED JAVASCRIPT
   Functionility control of event fetching,
   search/filer, dataform submission, CRUD and navigation
   ============================================ */

// ── NAVIGATION USERNAME ──
async function loadNavUser() {
  const event = document.getElementById('navUser');
  if (!event) return;
  try {
    const response  = await fetch('/api/me');
    if (!response.ok) return;
    const data = await response.json();
    event.textContent = '@' + data.username;
    event.classList.remove('hidden');
  } catch {}
}

// ── CATEGORY ICON ──
function categoryIcon(Category) {
  const icon = { Arts: '🎨', Sports: '⚽', Festival: '🎪', Music: '🎵', Business: '💼', Other: '📅' };
  return icon[Category] || '🗓️';
}

// ── ESCAPE HTML ──
function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── FORMAT DATE ──
function dataFormatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}



// ── SHOW INLINE ERROR / SUCCESS ──
function showMsg(id, msg, type = 'error') {
  const event = document.getElementById(id);
  if (!event) return;
  event.className = type === 'error' ? 'dataForm-error' : 'dataForm-success';
  event.textContent = msg;
  event.classList.remove('hidden');
}

// ── EVENTS LIST ──
async function loadEvents() {
  const container = document.getElementById('eventsList');
  if (!container) return;

  const search   = document.getElementById('searchInput')?.value  || '';
  const Category = document.getElementById('catFilter')?.value    || 'all';
  const Status   = document.getElementById('statusFilter')?.value || 'all';
  const dateFrom = document.getElementById('dateFilter')?.value   || '';
  const sort     = document.getElementById('sortFilter')?.value   || 'date';

  const params = new URLSearchParams({ search, category: Category, status: Status, sort });
  if (dateFrom) params.set('dateFrom', dateFrom);

  container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading events...</div>';

  try {
    const response    = await fetch('/api/events?' + params);
    const data   = await response.json();
    const events = data.events || [];

    // Update statistic cards 
    const totalEvent    = document.getElementById('statisticTotal');
    const cancelEvent   = document.getElementById('statisticCancelled');
    const upcomingEvent = document.getElementById('statisticUpcoming');
    if (totalEvent)    totalEvent.textContent    = events.length;
    if (cancelEvent)   cancelEvent.textContent   = events.filter(e => e.Status === 'cancelled').length;
    if (upcomingEvent) upcomingEvent.textContent = events.filter(e => e.Status === 'upcoming').length;
    

    const countEl = document.getElementById('resultsCount');
    if (countEl) countEl.textContent = `${events.length} event${events.length !== 1 ? 's' : ''} found`;

    if (events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state_icon">🗓️</div>
          <div class="empty-state_title">No events found</div>
          <div class="empty-state_desc">Try adjusting your search or filters</div>
          <a href="/add-event" class="btn btn--primary">Add an Event</a>
        </div>`;
      return;
    }

    container.innerHTML = `<div class="grid-3">${events.map(eventCard).join('')}</div>`;
  } catch {
    container.innerHTML = '<div class="empty-state"><div class="empty-state_title">Failed to load events</div></div>';
  }
}

function eventCard(e) {
  const categoryMap = { Music:'orange', Sports:'blue', Arts:'red', Festival:'blue', Business:'orange', Other:'' };
  const tagClass = categoryMap[e.Category] ? `category-label--${categoryMap[e.Category]}` : '';
  return `
    <div class="event-card">
      <div class="event-card_img">${categoryIcon(e.Category)}</div>
      <div class="event-card_body">
        <div class="event-card_meta">
          <span class="category-label ${tagClass}">${esc(e.Category)}</span>
          <span class="status status--${e.Status}">${e.Status}</span>
        </div>
        <div class="event-card_title">${esc(e.Title)}</div>
        <div class="event-card_detail">🗓️ ${dataFormatDate(e.Date)} at ${esc(e.Time)}</div>
        <div class="event-card_detail">📍 ${esc(e.Location)}</div>
        <div class="event-card_detail">👥 Capacity: ${e.Capacity}</div>
        <div class="event-card_detail">${e.Paid ? '💰 Paid' : '🆓 Free'}</div>
      </div>
      <div class="event-card_footer">
        <a href="/add-event?id=${e._id}" class="btn btn--outline btn--sm">🖋️ Edit</a>
        <button class="btn btn--danger btn--sm" onclick="deleteEvent('${e._id}', '${esc(e.Title)}')">🗑 Delete</button>
      </div>
    </div>`;
}



// ── ADD / EDIT FORM ─-
async function initEventForm() {
  const dataForm = document.getElementById('eventForm');
  if (!dataForm) return;

  const params = new URLSearchParams(location.search);
  const id     = params.get('id');
  const Title  = document.getElementById('dataFormTitle');
  if (Title) Title.textContent = id ? 'Edit Event' : 'Add New Event';
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) submitBtn.textContent = id ? 'Save Changes' : 'Create Event';

  // Load existing event data for edit
  if (id) {
    try {
      const response  = await fetch(`/api/events/${id}`);
      const data = await response.json();
      if (data.success) {
        const e = data.event;
        dataForm.Title.value       = e.Title;
        dataForm.Description.value = e.Description;
        dataForm.Category.value    = e.Category;
        dataForm.Date.value        = new Date(e.Date).toISOString().split('T')[0];
        dataForm.Time.value        = e.Time;
        dataForm.Location.value    = e.Location;
        dataForm.Capacity.value    = e.Capacity;
        dataForm.Paid.checked      = e.Paid;
        dataForm.Status.value      = e.Status;
      }
    } catch {}
  }

  dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const body = {
      Title:       dataForm.Title.value.trim(),
      Description: dataForm.Description.value.trim(),
      Category:    dataForm.Category.value,
      Date:        dataForm.Date.value,
      Time:        dataForm.Time.value,
      Location:    dataForm.Location.value.trim(),
      Capacity:    dataForm.Capacity.value,
      Paid:        dataForm.Paid.checked,
      Status:      dataForm.Status.value,
    };

    try {
      const url    = id ? `/api/events/${id}` : '/api/events';
      const method = id ? 'PUT' : 'POST';
      const response    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data   = await response.json();

      if (data.success) {
        window.location.href = '/events';
      } else {
        showMsg('dataFormMsg', data.message);
        btn.disabled = false;
        btn.textContent = id ? 'Save Changes' : 'Create Event';
      }
    } catch {
      showMsg('dataFormMsg', 'Something went wrong. Please try again. If issue persists contact user support.');
      btn.disabled = false;
      btn.textContent = id ? 'Save Changes' : 'Create Event';
    }
  });
}


// ── DELETE EVENT ──
async function deleteEvent(id, Title) {
  if (!confirm(`Delete "${Title}"? This cannot be undone so please make sure.`)) return;
  try {
    const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (response.ok) loadEvents();
    else alert('Failed to delete event, try again. If issue persists contact user support');
  } catch {
    alert('Failed to delete event, try again. If issue persists contact user support');
  }
}



// ── INIT ON LOAD ──
document.addEventListener('DOMContentLoaded', () => {
  loadNavUser();
  loadEvents();
  initEventForm();

  // Filter/sort change listeners
  ['catFilter','statusFilter','dateFilter','sortFilter'].forEach(id => {
    const event = document.getElementById(id);
    if (event) event.addEventListener('change', loadEvents);
  });

  const searchEl = document.getElementById('searchInput');
  if (searchEl) searchEl.addEventListener('input', onSearchInput);
})

// ── SEARCH DEBOUNCE ──
let searchTimer;
function onSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadEvents, 250);
};


