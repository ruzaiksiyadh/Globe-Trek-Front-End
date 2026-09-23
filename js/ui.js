

function fmtMoney(n){ return '$' + n.toLocaleString('en-US', {minimumFractionDigits: n%1?2:0, maximumFractionDigits:2}); }

function isCurrentPageHome(){
  const p = (window.location.pathname || '').toLowerCase();
  return p === '' || p === '/' || p.endsWith('/index') || p.endsWith('/index.html') || (!p.includes('.html') && !p.endsWith('/admin'));
}


function buildNavbar(){
  const root = document.getElementById('app-navbar');
  if(!root) return;
  const isHome = isCurrentPageHome();
  const home = root.dataset.home || 'index.html';
  const prefix = isHome ? '' : home;
  const links = ['Home','Destinations','Tours','Experiences','About','Contact'].map(l=>{
    const anchor = l==='Home' ? (isHome ? '#home' : '') : '#'+l.toLowerCase();
    return `<a href="${prefix}${anchor}">${l}</a>`;
  }).join('');
  root.innerHTML = `
  <nav class="navbar" id="site-navbar">
    <div class="container">
      <a href="${isHome ? '#home' : home}" class="nav-logo">Globe<span>Trek</span></a>
      <div class="nav-links">${links}</div>
      <div class="nav-actions" data-auth-slot="desktop"></div>
      <button class="nav-burger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </nav>
  <div class="mobile-menu">
    ${links}
    <div data-auth-slot="mobile" style="display:flex; flex-direction:column; gap:18px; align-items:center;"></div>
  </div>`;
}

function buildFooter(){
  const root = document.getElementById('app-footer');
  if(!root) return;
  const isHome = isCurrentPageHome();
  const home = root.dataset.home || 'index.html';
  const prefix = isHome ? '' : home;
  root.innerHTML = `
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="nav-logo" style="margin-bottom:14px;">Globe<span>Trek</span></div>
          <p style="font-size:.88rem; max-width:280px;">Your journey starts here. Discover unforgettable destinations, extraordinary experiences and adventures that take you further.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><a href="${prefix}#destinations">Destinations</a></li>
            <li><a href="${prefix}#tours">Tours</a></li>
            <li><a href="${prefix}#experiences">Experiences</a></li>
            <li><a href="${prefix}#about">About</a></li>
          </ul>
        </div>
        <div>
          <h4>Account</h4>
          <ul>
            <li><a href="login.html">Login</a></li>
            <li><a href="register.html">Register</a></li>
            <li><a href="dashboard.html">My Bookings</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>hello@globetrek.travel</li>
            <li>+94 77 123 4567</li>
            <li>Colombo, Sri Lanka</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 GlobeTrek. All rights reserved.</span>
        <span>Explore. Experience. Escape.</span>
      </div>
    </div>
  </footer>`;
}


function initNavbar(){
  const nav = document.querySelector('.navbar');
  if(!nav) return;
  const onScroll = () => {
    if(window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  const burger = document.querySelector('.nav-burger');
  const mobile = document.querySelector('.mobile-menu');
  if(burger && mobile){
    burger.addEventListener('click', ()=>{
      burger.classList.toggle('open');
      mobile.classList.toggle('open');
      document.body.style.overflow = mobile.classList.contains('open') ? 'hidden' : '';
    });
    mobile.querySelectorAll('a, button').forEach(el=>{
      el.addEventListener('click', ()=>{
        burger.classList.remove('open');
        mobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
  renderNavAuth(); 
}

async function renderNavAuth(){
  const user = await currentUser(); // hits the backend — was an instant localStorage read before
  document.querySelectorAll('[data-auth-slot]').forEach(slot=>{
    const mobile = slot.dataset.authSlot === 'mobile';
    slot.innerHTML = '';
    if(user){
      const account = document.createElement('a');
      account.href = 'dashboard.html';
      account.textContent = 'My Account';
      if(!mobile){ account.className = 'btn btn-ghost'; }
      const logout = document.createElement(mobile ? 'a' : 'button');
      logout.textContent = 'Logout';
      logout.href = mobile ? '#' : undefined;
      logout.className = mobile ? '' : 'btn btn-primary';
      logout.addEventListener('click', async (e)=>{ e.preventDefault(); await logoutUser(); window.location.href='index.html'; });
      slot.appendChild(account);
      slot.appendChild(logout);
    } else {
      const login = document.createElement('a');
      login.href = 'login.html'; login.textContent = 'Login';
      if(!mobile) login.className = 'btn btn-ghost';
      const register = document.createElement('a');
      register.href = 'register.html'; register.textContent = mobile ? 'Book Now' : 'Book Now';
      register.className = mobile ? '' : 'btn btn-primary';
      register.href = mobile ? 'tours.html' : '#tours';
      slot.appendChild(login);
      slot.appendChild(register);
    }
  });
}


function initReveal(){
  const els = document.querySelectorAll('.reveal, .reveal-scale');
  if(!('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  els.forEach(e=>io.observe(e));
}


function initCounters(){
  const nums = document.querySelectorAll('[data-count]');
  if(!nums.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      const dur = 1400; const start = performance.now();
      function tick(now){
        const p = Math.min(1, (now-start)/dur);
        const eased = 1 - Math.pow(1-p, 3);
        const val = target*eased;
        el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()) + suffix;
        if(p<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, {threshold:0.4});
  nums.forEach(n=>io.observe(n));
}


function ensureToastWrap(){
  let wrap = document.querySelector('.toast-wrap');
  if(!wrap){ wrap = document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
  return wrap;
}
function showToast(title, msg, type='info'){
  const wrap = ensureToastWrap();
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<div><b>${title}</b><div>${msg}</div></div>`;
  wrap.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.remove(), 500); }, 4200);
}


function initSmoothScroll(){
  document.addEventListener('click', (e)=>{
    const anchor = e.target.closest('a[href*="#"]');
    if(!anchor) return;

    const href = anchor.getAttribute('href');
    if(!href || href === '#') return;

    const hashIndex = href.indexOf('#');
    if(hashIndex === -1) return;
    const hash = href.slice(hashIndex);
    if(!hash || hash === '#') return;

    const isHome = isCurrentPageHome();
    const isTargetingCurrentPage = href.startsWith('#') || (isHome && (href.startsWith('index.html#') || href.startsWith('/#') || href.startsWith('/index#')));

    if(isTargetingCurrentPage){
      const targetEl = document.querySelector(hash);
      if(targetEl){
        e.preventDefault();
        history.pushState(null, '', hash);
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-links a[href$="${hash}"]`);
        if(activeLink) activeLink.classList.add('active');

        const burger = document.querySelector('.nav-burger');
        const mobile = document.querySelector('.mobile-menu');
        if(burger && mobile && mobile.classList.contains('open')){
          burger.classList.remove('open');
          mobile.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    }
  });
}

function initActiveNav(){
  const sections = document.querySelectorAll('main [id]');
  const links = document.querySelectorAll('.nav-links a[href*="#"], .mobile-menu a[href*="#"]');
  if(!sections.length || !links.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        const match = document.querySelectorAll(`.nav-links a[href$="#${entry.target.id}"], .mobile-menu a[href$="#${entry.target.id}"]`);
        match.forEach(l=>l.classList.add('active'));
      }
    });
  }, {rootMargin:'-25% 0px -55% 0px'});
  sections.forEach(s=>io.observe(s));
}


async function requireAuth(redirectTo){
  const user = await currentUser();
  if(!user){ window.location.href = 'login.html' + (redirectTo?('?next='+encodeURIComponent(redirectTo)):''); return null; }
  return user;
}
async function requireAdmin(){
  const user = await currentUser();
  if(!user || user.role !== 'Admin'){ window.location.href = 'admin-login.html'; return null; }
  return user;
}

document.addEventListener('DOMContentLoaded', ()=>{
  buildNavbar();
  buildFooter();
  initNavbar();
  initReveal();
  initCounters();
  initActiveNav();
  initSmoothScroll();

  if(window.location.hash){
    const target = document.querySelector(window.location.hash);
    if(target){
      setTimeout(()=>{ target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250);
    }
  }
});
