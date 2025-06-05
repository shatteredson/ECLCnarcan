  if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
        .catch(err => console.error('SW registration failed:', err));
      });
    }
    const isiOS = /iP(hone|ad|od)/.test(navigator.userAgent) && !window.MSStream;
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|/i.test(navigator.userAgent);
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (isMobile) {
        installBtn.style.display = 'inline-block';
      }
    });
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      installBtn.disabled = true;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.style.display = 'none'
    });
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxRVZcd0nZnjTBvwPTaHIsUck5wKHU8iEfmYaazWHIuqR0p8kLG6BrwqC-VCwNlHwRERg/exec';
function setUser(email,name){
  const btn = document.getElementById('account-btn');
  if(email){
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name||'');
    btn.textContent='Account';
    btn.onclick=()=>showPage('account-page');
  } else {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    btn.textContent='Sign Up / Login';
    btn.onclick=()=>showPage('login-page');
  }
  autoFillForms();
}
function logout(){
  setUser(null);
  showPage('home-page');
}
function autoFillForms(){
  const email = localStorage.getItem('userEmail') || '';
  const name = localStorage.getItem('userName') || '';
  document.getElementById('pickup-email').value = email;
  document.getElementById('report-email').value = email;
  document.getElementById('volunteer-email').value = email;
  document.querySelector('#pickup-form input[name="name"]').value = name;
  document.querySelector('#report-form input[name="name"]').value = name;
}
function handleLogin(res){
  if(res.status==='ok'){
    alert('Login successful');
    setUser(res.email,res.name);
    const greet=document.getElementById('account-greeting');
    if(greet) greet.textContent = res.name ? `Welcome, ${res.name}!` : `Welcome, ${res.email}!`;
    showPage('account-page');
  }else{
    alert('Invalid login');
  }
}
function loginSubmit(e){
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;
  const s=document.createElement('script');
  s.src=`${GAS_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}&callback=handleLogin`;
  document.body.appendChild(s);
}
function signupSubmit(e){
  e.preventDefault();
  const form=new FormData(document.getElementById('signup-form'));
  fetch(GAS_URL,{method:'POST',body:form})
    .then(res=>res.json())
    .then(data=>{
      if(data.status==='success'){
        alert('Signup submitted');
        showPage('login-page');
      } else {
        throw new Error('Signup error');
      }
    })
    .catch(()=>alert('Signup error'));
}
function updateMyImpact(){
  const email = localStorage.getItem('userEmail');
  if(!email){ document.getElementById('my-impact-stats').textContent='Please log in.'; return; }
  const range=document.getElementById('my-impact-range').value;
  const s=document.createElement('script');
  s.src=`${GAS_URL}?action=impactUser&email=${encodeURIComponent(email)}&range=${range}&callback=handleMyImpact`;
  document.body.appendChild(s);
}
function handleMyImpact(data){
  document.getElementById('my-impact-stats').innerHTML = `
    <p>Boxes Picked Up: ${data.pickedUp}</p>
    <p>Doses Used: ${data.dosesUsed}</p>
    <p>Lives Saved: ${data.livesSaved}</p>
    <p>Hospitalizations: ${data.hospitalizations}</p>`;
}
function updateAccountPage(){
  const greet=document.getElementById('account-greeting');
  const name=localStorage.getItem('userName')||'';
  const email=localStorage.getItem('userEmail')||'';
  if(greet) greet.textContent = name ? `Welcome, ${name}!` : `Welcome, ${email}!`;
}
    function handleImpact(data) {
      document.getElementById('impact-stats').innerHTML = `
        <p>Total Boxes Picked Up: ${data.pickedUp}</p>
        <p>Total Doses Used: ${data.dosesUsed}</p>
        <p>Lives Saved: ${data.livesSaved}</p>
        <p>Hospitalizations After Use: ${data.hospitalizations}</p>
      `;
    }
    function showPage(pageId) {
      const current = document.querySelector('.page.active');
      if (current) {
        current.classList.remove('active');
      }
      const next = document.getElementById(pageId);
      next.classList.add('active', 'fade-in');
      next.addEventListener(
        'animationend',
        () => next.classList.remove('fade-in'),
        {once: true}
      );
      if(pageId==='my-impact-page') updateMyImpact();
      if(pageId==='account-page') updateAccountPage();
    }
    function pickupSuccess() {
      const name = document.querySelector('#pickup-form input[name="name"]').value;
      alert(name ? `Thank you, ${name}, for connecting and supporting your community!` :
                   'Thank you for connecting and supporting your community!');
      document.getElementById('pickup-form').reset();
      showPage('home-page');
    }
    function reportSuccess() {
      const name = document.querySelector('#report-form input[name="name"]').value;
      alert(name ? `Thank you, ${name}, for helping save lives!` :
                   'Thank you for helping save lives!');
      document.getElementById('report-form').reset();
      showPage('home-page');
    }
    function volunteerSuccess() {
      const name = document.querySelector('#volunteer-form input[name="name"]').value
      alert(name ? `Thank you, ${name}, for reaching out to volunteer!` :
                   'Thank you for reaching out to volunteer!');
      document.getElementById('volunteer-form').reset();
      showPage('home-page');
    }
    function toggleExclusive(id) {
      ['reversal','death'].forEach(i => { if (i !== id) document.getElementById(i).checked = false; });
    }
function updateImpact() {
  localStorage.setItem('impactRange', range);
  const s = document.createElement('script');
  s.src = `${GAS_URL}?action=impact&range=${range}&callback=handleImpact`;
  document.body.appendChild(s);
};
function wire(formId, onSuccess) {
  const form = document.getElementById(formId);
  form.addEventListener('submit', e => {
    e.preventDefault();
    fetch(GAS_URL, {
      method: 'POST',
      body: new FormData(form)
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        onSuccess();
      } else {
        throw new Error('Server error');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Sorry, there was an error submitting the form');
    });
  });
}
document.addEventListener('DOMContentLoaded', () => {
  wire('pickup-form', pickupSuccess);
  wire('report-form', reportSuccess);
  wire('volunteer-form', volunteerSuccess);
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', loginSubmit);
  const signupForm = document.getElementById('signup-form');
  if (signupForm) signupForm.addEventListener('submit', signupSubmit);
  const savedRange = localStorage.getItem('impactRange');
  if (savedRange) {
    document.getElementById('impact-range').value = savedRange;
  }
  updateImpact();
  const email = localStorage.getItem('userEmail');
  setUser(email,email?localStorage.getItem('userName'):null);
  if(email){
    updateMyImpact();
    updateAccountPage();
  }
});
const phoneInput = document.getElementById('vol-phone');
phoneInput.addEventListener('input', () => {
  let digits = phoneInput.value.replace(/\D/g, '');
  if (digits.length > 10) digits = digits.slice(0, 10);
  
  const part1 = digits.substring(0, 3);
  const part2 = digits.substring(3, 6);
  const part3 = digits.substring(6,10);

  if (digits.length <= 3) {
    phoneInput.value = part1 ? `(${part1}` : '';
  }
  else if (digits.length <= 6) {
    phoneInput.value = `(${part1})${part2}`;
  }
  else {
    phoneInput.value = `(${part1})${part2}-${part3}`;
  }
});
let devosData = null;
let currentDate = new Date();
async function loadDevotional(d = new Date()) {
  try {
    if (!devosData) {
      const resp = await fetch('devotions.json');
      devosData = await resp.json();
    }
    const key = `${d.getMonth()+1}-${d.getDate()}`;
    const today = devosData[key] || {
      verse: '"God is our refuge..." (Psalm 46:1)',
      text: "Unable to find today's devotional. Please check back later."
    };
    document.getElementById('devotional-verse').textContent = today.verse;
    const container = document.getElementById('devotional-text');
    container.innerHTML = '';
    today.text.split('\\n\\n').forEach(para => {
      const p = document.createElement('p');
      p.textContent = para;
      container.appendChild(p);
    });   
    document.getElementById('dev-date').textContent = 
      d.toLocaleDateString(undefined, {
        month: 'long', 
        day: 'numeric'
      });
  } catch (err) {
    console.error('Error loading devotional:', err);
    document.getElementById('dev-date').textContent = '';
    document.getElementById('devotional-verse').textContent =
      'Error loading devotional';
    document.getElementById('devotional-text').innerHTML = 
      "<p>Sorry, we couldn't load today's devotional. Please try again later.</p>";
  }
}
function shiftDay(offset) {
  currentDate.setDate(currentDate.getDate() + offset);
  loadDevotional(currentDate);
}
function shareDevotional() {
  const verse = document.getElementById('devotional-verse').textContent;
  const text = Array.from(document.getElementById('devotional-text').children)
    .map(p => p.textContent)
    .join('\n\n');
  const shareData = {
    title: 'ECLC Daily Devotional',
    text: `${verse}\n\n${text}`,
    url: window.location.href
  };
  if (navigator.share) {
    navigator.share(shareData).catch(err => console.error('Share failed', err));
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(`${verse}\n\n${text}\n${window.location.href}`)
      .then(() => alert('Devotional copied to clipboard!'))
      .catch(err => console.error('Copy failed', err));
  } else {
    alert('Sharing not supported on this browser');
  }
}
document.addEventListener('DOMContentLoaded', () => {
  loadDevotional(currentDate);
  document.getElementById('prev-day')
    .addEventListener('click', () => shiftDay(-1));
  document.getElementById('next-day')
    .addEventListener('click', () => shiftDay(1));
  const shareBtn = document.getElementById('share-devotional');
  if (shareBtn) {
    shareBtn.addEventListener('click', shareDevotional);
  }
});
window.addEventListener('DOMContentLoaded', () => {
  if (isiOS && !window.navigator.standalone) {
    const tip = document.createElement('div');
    tip.className = 'ios-install-tip';
    tip.textContent = 'To install: tap Share → Add to Home Screen';
    document.body.append(tip);
    setTimeout(() => tip.remove(), 15000);
  }
});
document.querySelectorAll('.button').forEach(btn => {
  console.log('attaching ripple listener to', btn);
  
  btn.addEventListener('click', function(e) {
    console.log('ripple click on', this);
    
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const size = Math.max(this.offsetWidth, this.offsetHeight);
    ripple.style.width = ripple.style.height = `${size}px`;
    
    const rect = this.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left - size/2}px`;
    ripple.style.top = `${e.clientY - rect.top - size/2}px`;
    
    this.appendChild(ripple);
    
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});
