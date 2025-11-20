/**
 * app.js — shared logic for Eventify front-end integrated with Spring Boot API
 */

const API_BASE = '/api';
const YEAR_IDS = ['year','year2','year3','year4'];
YEAR_IDS.forEach(id => { const el = document.getElementById(id); if(el) el.textContent = new Date().getFullYear(); });

/* ---------- Helpers ---------- */
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

function setToken(token){
  if(token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

function getToken(){ return localStorage.getItem('token'); }

/* decode base64url */
function b64UrlDecode(str){
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  try { return atob(str); } catch(e){ return null; }
}

function decodeJwt(token){
  if(!token) return null;
  const parts = token.split('.');
  if(parts.length !== 3) return null;
  const payload = b64UrlDecode(parts[1]);
  if(!payload) return null;
  try { return JSON.parse(payload); } catch(e){ return null; }
}

function getProfileFromToken(){
  const t = getToken();
  if(!t) return null;
  const p = decodeJwt(t);
  if(!p) return null;
  return { username: p.sub || p.username || null, role: (p.role || null) };
}

/* simple toast */
function showToast(msg, type='info'){
  const el = document.createElement('div');
  el.textContent = msg;
  el.className = 'fixed bottom-6 right-6 px-4 py-2 rounded shadow text-white';
  el.style.zIndex = 9999;
  el.style.background =
    type === 'error' ? '#ef4444' :
    type === 'success' ? '#10b981' : '#60a5fa';
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 2500);
}

/* fetch wrapper injecting JWT */
async function apiFetch(path, opts = {}){
  const token = getToken();
  opts.headers = opts.headers || {};
  if(token) opts.headers['Authorization'] = 'Bearer ' + token;
  if(!opts.method) opts.method = 'GET';
  opts.headers['Accept'] = 'application/json';
  try {
    const res = await fetch(API_BASE + path, opts);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch(e) { data = text; }
    if(res.ok) return { ok:true, data };
    return { ok:false, status: res.status, error: data || res.statusText };
  } catch(err){
    return { ok:false, error: 'Network error: ' + err.message };
  }
}

/* ---------- Navbar Auth UI ---------- */
function renderAuthArea(){
  qsa('#authArea').forEach(area => {
    area.innerHTML = '';
    const profile = getProfileFromToken();
    if(profile && profile.username){
      const name = profile.username;
      area.innerHTML = `
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-sm normal-case">${name}</label>
          <ul tabindex="0" class="menu menu-compact dropdown-content mt-2 p-2 shadow bg-base-100 rounded-box w-52">
            <li><a href="myevents.html">My Events</a></li>
            ${profile.role === 'ADMIN' ? '<li><a href="admin.html">Admin</a></li>' : ''}
            <li><button id="btnLogout" class="btn btn-ghost w-full text-left">Sign out</button></li>
          </ul>
        </div>
      `;

      const btn = area.querySelector('#btnLogout');
      if(btn) btn.addEventListener('click', () => {
        setToken(null);
        location.href = "index.html";
      });

    } else {

      // ⭐ Added Register Button
      area.innerHTML = `
        <a href="login.html" class="btn btn-primary btn-sm">Sign in</a>
        <a href="register.html" class="btn btn-outline btn-sm border-primary text-primary">Register</a>
      `;
    }
  });
}

/* ---------- Theme toggle ---------- */
(function themeInit(){
  qsa('#themeToggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'eventify';
      const next = cur === 'eventify' ? 'light' : 'eventify';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('eventify:theme', next);
    });
  });
  const saved = localStorage.getItem('eventify:theme');
  if(saved) document.documentElement.setAttribute('data-theme', saved);
})();

/* DOM Ready */
document.addEventListener('DOMContentLoaded', () => {
  renderAuthArea();
  routeInit();
});

/* ---------- Routing ---------- */
function routeInit(){
  const page = document.body.getAttribute('data-page');
  if(page === 'home') loadUpcoming();
  else if(page === 'events') {
    loadEvents();
    const search = qs('#search');
    if(search) search.addEventListener('input', (e) => loadEvents(e.target.value));
  }
  else if(page === 'myevents') loadMyEvents();
  else if(page === 'admin') adminInit();
}

/* ---------- Upcoming events ---------- */
async function loadUpcoming(){
  const out = qs('#upcoming');
  if(!out) return;
  out.innerHTML = 'Loading…';
  const res = await apiFetch('/events');
  if(!res.ok) { out.innerHTML = `<div class="text-red-500">${res.error}</div>`; return; }
  const events = (res.data || []).slice(0,4);
  out.innerHTML = events.map(eventCardHtml).join('');
}

/* ---------- Events list ---------- */
function eventCardHtml(ev){
  const dateStr = ev.date || '';
  return `
    <div class="card bg-base-100 shadow p-4">
      <h3 class="text-lg font-semibold">${ev.title}</h3>
      <p class="text-sm">${ev.description || ''}</p>
      <p class="text-sm text-base-content/70 mt-2">${dateStr} • ${ev.location}</p>
      <div class="mt-3 flex gap-2">
          <button data-id="${ev.id}" class="btn btn-primary btn-sm registerBtn">Register</button>
      </div>
    </div>
  `;
}

async function loadEvents(query=''){
  const listEl = qs('#eventsList');
  if(!listEl) return;
  listEl.innerHTML = 'Loading…';

  const res = await apiFetch('/events');
  if(!res.ok) { listEl.innerHTML = `<div class="text-red-500">${res.error}</div>`; return; }

  let events = res.data || [];

  if(query){
    const q = query.toLowerCase();
    events = events.filter(e =>
      (e.title||'').toLowerCase().includes(q) ||
      (e.description||'').toLowerCase().includes(q) ||
      (e.location||'').toLowerCase().includes(q)
    );
  }

  listEl.innerHTML = events.map(eventCardHtml).join('');

  qsa('.registerBtn').forEach(btn => btn.addEventListener('click', async () => {
    await doRegister(parseInt(btn.getAttribute('data-id')));
  }));
}

/* ---------- Register for event ---------- */
async function doRegister(eventId){
  const token = getToken();
  if(!token){
    alert("Please log in to register.");
    location.href = "login.html";
    return;
  }

  const res = await apiFetch(`/registrations/event/${eventId}`, { method:'POST' });

  if(!res.ok){
    showToast(res.error, "error");
    return;
  }

  showToast("Registered successfully!", "success");
}

/* ---------- My Events ---------- */
async function loadMyEvents(){
  const out = qs('#myEventsArea');
  if(!out) return;

  if(!getToken()){
    out.innerHTML = `Please <a href="login.html" class="text-primary underline">login</a>.`;
    return;
  }

  const res = await apiFetch('/registrations/me');
  if(!res.ok){ out.innerHTML = `<div class="text-red-500">${res.error}</div>`; return; }

  const list = res.data || [];
  out.innerHTML = list.map(r => `
    <div class="card bg-base-100 shadow p-4">
      <h3 class="font-semibold">${r.event.title}</h3>
      <p class="text-sm">${r.event.date} • ${r.event.location}</p>
    </div>
  `).join('');
}

/* ---------- Admin ---------- */
function adminInit(){
  const profile = getProfileFromToken();
  const adminMsg = qs('#adminMsg');

  if(!profile || profile.role !== 'ADMIN'){
    adminMsg.innerHTML = "Login as admin to manage events.";
    return;
  }

  qs('#btnCreate').addEventListener('click', adminCreateHandler);
  qs('#btnClear').addEventListener('click', adminClearForm);

  loadAdminList();
}

async function adminCreateHandler(){
  const title = qs('#ev_title').value.trim();
  const description = qs('#ev_desc').value.trim();
  const date = qs('#ev_date').value;
  const location = qs('#ev_loc').value.trim();
  const seats = parseInt(qs('#ev_seats').value, 10);
  const msg = qs('#adminMsg');

  if(!title || !date || !location){
    msg.textContent = "Fill all details";
    msg.classList.add("text-red-500");
    return;
  }

  const ev = { title, description, date, location, seats };

  const res = await apiFetch('/events', {
    method:'POST',
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(ev)
  });

  if(!res.ok){ msg.textContent = res.error; msg.classList.add("text-red-500"); return; }

  msg.textContent = "Event created!";
  msg.classList.remove("text-red-500");

  adminClearForm();
  loadAdminList();
}

function adminClearForm(){
  qs('#ev_title').value = "";
  qs('#ev_desc').value = "";
  qs('#ev_date').value = "";
  qs('#ev_loc').value = "";
  qs('#ev_seats').value = "";
}

async function loadAdminList(){
  const area = qs('#adminList');
  if(!area) return;

  const res = await apiFetch('/events');
  if(!res.ok){ area.innerHTML = `<div class="text-red-500">${res.error}</div>`; return; }

  const events = res.data || [];
  area.innerHTML = events.map(ev => `
    <div class="card bg-base-100 shadow p-3 flex justify-between items-center">
      <div>
        <div class="font-semibold">${ev.title}</div>
        <div class="text-sm text-base-content/70">${ev.date} • ${ev.location}</div>
      </div>
      <button class="btn btn-error btn-sm" data-id="${ev.id}">Delete</button>
    </div>
  `).join('');

  qsa('.btn-error').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const res = await apiFetch(`/events/${id}`, { method:'DELETE' });
      if(res.ok){
        showToast("Event deleted!", "success");
        loadAdminList();
      } else {
        showToast(res.error, "error");
      }
    });
  });
}

/* ---------- Login Page Logic ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = qs('#doLogin');
  if(!loginBtn) return;

  loginBtn.addEventListener('click', async () => {
    const username = qs('#loginUsername').value.trim();
    const password = qs('#loginPassword').value.trim();
    const msg = qs('#loginMsg');

    if(!username || !password){
      msg.textContent = "Enter username & password";
      msg.classList.add("text-red-500");
      return;
    }

    const res = await fetch('/api/auth/login', {
      method:'POST',
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json().catch(()=>null);

    if(!res.ok){
      msg.textContent = data || "Login failed";
      msg.classList.add("text-red-500");
      return;
    }

    localStorage.setItem("token", data.token);
    const payload = decodeJwt(data.token);

    msg.textContent = "Login successful!";
    msg.classList.add("text-green-600");

    setTimeout(()=>{
      if(payload.role === "ADMIN") location.href = "admin.html";
      else location.href = "index.html";
    },800);
  });
});

// REGISTRATION PAGE HANDLER
document.addEventListener("DOMContentLoaded", () => {
    const regBtn = document.getElementById("registerBtn");
    if (!regBtn) return;

    regBtn.addEventListener("click", async () => {
        const username = document.getElementById("regUser").value.trim();
        const password = document.getElementById("regPass").value.trim();
        const msg = document.getElementById("regMsg");

        if (!username || !password) {
            msg.textContent = "Please fill all fields";
            msg.classList.add("text-red-500");
            return;
        }

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.text();

        if (!res.ok) {
            msg.textContent = data;
            msg.classList.add("text-red-500");
            return;
        }

        msg.textContent = "Account created! Redirecting to login...";
        msg.classList.remove("text-red-500");
        msg.classList.add("text-green-600");

        setTimeout(() => window.location.href = "login.html", 1000);
    });
});
