// app.js – unified, refactored initialization and fixes

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .catch(err => console.error('SW registration failed:', err));
  });
}

// --- PWA Install Prompt ---
const isiOS = /iP(hone|ad|od)/.test(navigator.userAgent) && !window.MSStream;
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (isMobile) installBtn.style.display = 'inline-flex';
});
installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  installBtn.disabled = true;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
});

// --- Constants ---
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxRVZcd0nZnjTBvwPTaHIsUck5wKHU8iEfmYaazWHIuqR0p8kLG6BrwqC-VCwNlHwRERg/exec';

// --- User/Account Functions ---
function setUser(email, name) {
  const btn = document.getElementById('account-btn');
  if (email) {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name || '');
    btn.textContent = 'Account';
  } else {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    btn.textContent = 'Sign Up / Login';
  }
  autoFillForms();
}
function logout() {
  setUser(null);
  showPage('home-page');
}
function autoFillForms() {
  const email = localStorage.getItem('userEmail') || '';
  const name = localStorage.getItem('userName') || '';
  ['pickup-email', 'report-email', 'volunteer-email']
    .forEach(id => document.getElementById(id).value = email);
  document.querySelector('#pickup-form input[name="name"]').value = name;
  document.querySelector('#report-form input[name="name"]').value = name;
}
function updateAccountPage() {
  const greet = document.getElementById('account-greeting');
  if (!greet) return;
  const name = localStorage.getItem('userName') || '';
  const email = localStorage.getItem('userEmail') || '';
  greet.textContent = name ? `Welcome, ${name}!` : `Welcome, ${email}!`;
}

// --- Authentication Handlers ---
function handleLogin(res) {
  if (res.status === 'ok') {
    alert('Login successful');
    setUser(res.email, res.name);
    updateAccountPage();
    showPage('account-page');
  } else {
    alert('Invalid login');
  }
}
function loginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;
  const s = document.createElement('script');
  s.src = `${GAS_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}&callback=handleLogin`;
  document.body.appendChild(s);
}
function signupSubmit(e) {
  e.preventDefault();
  const form = new FormData(document.getElementById('signup-form'));
  fetch(GAS_URL, { method: 'POST', body: form })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') showPage('login-page');
      else throw new Error('Signup error');
    })
    .catch(() => alert('Signup error'));
}

// --- Impact Handlers ---
function handleImpact(data) {
  document.getElementById('impact-stats').innerHTML = `
    <p>Total Boxes Picked Up: ${data.pickedUp}</p>
    <p>Total Doses Used: ${data.dosesUsed}</p>
    <p>Lives Saved: ${data.livesSaved}</p>
    <p>Hospitalizations: ${data.hospitalizations}</p>
  `;
}
function updateImpact() {
  const range = document.getElementById('impact-range').value;
  localStorage.setItem('impactRange', range);
  const s = document.createElement('script');
  s.src = `${GAS_URL}?action=impact&range=${range}&callback=handleImpact`;
  document.body.appendChild(s);
}
function handleMyImpact(data) {
  document.getElementById('my-impact-stats').innerHTML = `
    <p>Boxes Picked Up: ${data.pickedUp}</p>
    <p>Doses Used: ${data.dosesUsed}</p>
    <p>Lives Saved: ${data.livesSaved}</p>
    <p>Hospitalizations: ${data.hospitalizations}</p>
  `;
}
function updateMyImpact() {
  const email = localStorage.getItem('userEmail');
  if (!email) {
    document.getElementById('my-impact-stats').textContent = 'Please log in.';
    return;
  }
  const range = document.getElementById('my-impact-range').value;
  const s = document.createElement('script');
  s.src = `${GAS_URL}?action=impactUser&email=${encodeURIComponent(email)}&range=${range}&callback=handleMyImpact`;
  document.body.appendChild(s);
}

// --- Devotional Loading ---
let devosData = null;
let currentDate = new Date();
async function loadDevotional(d = new Date()) {
  try {
    if (!devosData) {
      const resp = await fetch('devotions.json');
      devosData = await resp.json();
    }
    const key = `${d.getMonth()+1}-${d.getDate()}`;
    const today = devosData[key] || { verse: '...', text: '...' };
    document.getElementById('devotional-verse').textContent = today.verse;
    const container = document.getElementById('devotional-text');
    container.innerHTML = '';
    today.text.split('\n\n').forEach(para => {
      const p = document.createElement('p'); p.textContent = para;
      container.appendChild(p);
    });
    document.getElementById('dev-date').textContent = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  } catch (err) {
    console.error('Error loading devotional:', err);
    document.getElementById('dev-date').textContent = '';
    document.getElementById('devotional-verse').textContent = "Error loading devotional";
    document.getElementById('devotional-text').innerHTML = '<p>Sorry, please try again later.</p>';
  }
}
function shiftDay(offset) { currentDate.setDate(currentDate.getDate()+offset); loadDevotional(currentDate); }
function shareDevotional() { /* unchanged */ }

// --- Utilities ---
function showPage(pageId) { /* unchanged fade-in and routing */ }
function pickupSuccess() { /* unchanged */ }
function reportSuccess() { /* unchanged */ }
function volunteerSuccess() { /* unchanged */ }
function wire(formId, onSuccess) { /* unchanged fetch+FormData */ }

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Forms
  wire('pickup-form', pickupSuccess);
  wire('report-form', reportSuccess);
  wire('volunteer-form', volunteerSuccess);
  document.getElementById('login-form')?.addEventListener('submit', loginSubmit);
  document.getElementById('signup-form')?.addEventListener('submit', signupSubmit);

  // Account button
  const accountBtn = document.getElementById('account-btn');
  accountBtn.addEventListener('click', e => {
    e.stopPropagation();
    const email = localStorage.getItem('userEmail');
    if (email) { updateAccountPage(); showPage('account-page'); }
    else showPage('login-page');
  });

  // User state
  const savedEmail = localStorage.getItem('userEmail');
  const savedName  = localStorage.getItem('userName');
  setUser(savedEmail, savedName);
  if (savedEmail) { updateMyImpact(); updateAccountPage(); }

  // Impact widget
  const savedRange = localStorage.getItem('impactRange');
  if (savedRange) document.getElementById('impact-range').value = savedRange;
  updateImpact();

  // Devotional
  loadDevotional(currentDate);
  document.getElementById('prev-day')?.addEventListener('click', () => shiftDay(-1));
  document.getElementById('next-day')?.addEventListener('click', () => shiftDay(1));
  document.getElementById('share-devotional')?.addEventListener('click', shareDevotional);

  // iOS install tip
  if (isiOS && !('standalone' in navigator && navigator.standalone)) {
    const tip = document.createElement('div');
    tip.className = 'ios-install-tip';
    tip.textContent = 'To install: tap Share → Add to Home Screen';
    document.body.append(tip);
    setTimeout(() => tip.remove(), 15000);
  }

  // Ripple effect
  document.querySelectorAll('.button').forEach(btn => {
    btn.addEventListener('click', e => {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const size = Math.max(btn.offsetWidth, btn.offsetHeight);
      ripple.style.width = ripple.style.height = `${size}px`;
      const rect = btn.getBoundingClientRect();
      ripple.style.left = `${e.clientX-rect.left-size/2}px`;
      ripple.style.top = `${e.clientY-rect.top-size/2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Phone input auto-format
  const phoneInput = document.getElementById('vol-phone');
  phoneInput.addEventListener('input', () => {
    let digits = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    const p1 = digits.substr(0, 3), p2 = digits.substr(3, 3), p3 = digits.substr(6, 4);
    if (digits.length <= 3) phoneInput.value = p1 ? `(${p1}` : '';
    else if (digits.length <= 6) phoneInput.value = `(${p1})${p2}`;
    else phoneInput.value = `(${p1})${p2}-${p3}`;
  });
});
