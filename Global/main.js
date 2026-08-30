// 🔑 Config loaded from build-generated config.js
const SUPABASE_URL = "https://igyqackffggpyrcvihzw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KKe7DFftc9w3M3a1aVUVlQ_zO7KdfPP";

let supabaseClient = null;
let currentUser = null;
let currentProfile = null;

async function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials – config not loaded.');
    return;
  }
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialized');
  } catch (err) {
    console.error('Failed to initialize Supabase:', err);
  }
}

async function checkAuth() {
  if (!supabaseClient) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    currentUser = session.user;
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    currentProfile = profile;
  }
  updateNav();
}

function updateNav() {
  const navContainer = document.getElementById('nav-links');
  const mobileNavContainer = document.getElementById('mobile-nav-links');
  if (!navContainer) return;

  // ----- Define link order -----
  // Main pages (appear first)
  const mainPages = [
    { href: 'index.html', text: 'Home' },
    { href: 'about.html', text: 'About' },
    { href: 'contact.html', text: 'Contact' }
  ];



  // Build the full link list for desktop and mobile
  let desktopLinks = [];
  let mobileLinks = [];

  // 1. Main pages
  mainPages.forEach(p => {
    desktopLinks.push(p);
    mobileLinks.push(p);
  });

  // 2. Auth‑dependent links
  if (currentUser) {
    desktopLinks.push({ href: 'tracking.html', text: 'Tracking' });
    mobileLinks.push({ href: 'tracking.html', text: 'Tracking' });
    if (currentProfile && currentProfile.role === 'admin') {
      desktopLinks.push({ href: 'admin.html', text: 'Admin' });
      mobileLinks.push({ href: 'admin.html', text: 'Admin' });
    }
    // Logout is added as a button later (not in the link array)
  } else {
    desktopLinks.push({ href: 'login.html', text: 'Login' });
    mobileLinks.push({ href: 'login.html', text: 'Login' });
    desktopLinks.push({ href: 'signup.html', text: 'Sign Up', isSignup: true });
    mobileLinks.push({ href: 'signup.html', text: 'Sign Up', isSignup: true });
  }

  // 3. Footer pages – appended at the end
  footerPages.forEach(p => {
    desktopLinks.push(p);
    mobileLinks.push(p);
  });

  // ----- Build desktop markup (inline links) -----
  let desktopHtml = desktopLinks.map(link => {
    let cls = 'text-slate-700 hover:text-blue-600 font-medium transition';
    if (link.isSignup) {
      cls += ' bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700';
    }
    return `<a href="${link.href}" class="${cls}">${link.text}</a>`;
  }).join('');

  // Add logout button (desktop)
  if (currentUser) {
    desktopHtml += `<button onclick="logout()" class="text-slate-700 hover:text-blue-600 font-medium transition">Logout</button>`;
  }

  // ----- Build mobile markup (block, full‑width, padded) -----
  let mobileHtml = mobileLinks.map(link => {
    let cls = 'block w-full px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition';
    if (link.isSignup) {
      cls += ' bg-blue-600 text-white hover:bg-blue-700';
    }
    return `<a href="${link.href}" class="${cls}">${link.text}</a>`;
  }).join('');

  // Add logout button (mobile) as a full‑width block
  if (currentUser) {
    mobileHtml += `<button onclick="logout()" class="block w-full px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition text-left">Logout</button>`;
  }

  // Inject into containers
  navContainer.innerHTML = desktopHtml;
  if (mobileNavContainer) {
    mobileNavContainer.innerHTML = mobileHtml;
  }
}

async function logout() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
    currentUser = null;
    currentProfile = null;
    window.location.href = 'index.html';
  }
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('hidden');
}

// ----- Slideshow / Modal / Counter functions (unchanged) -----
let currentSlide = 0;
let slideInterval;

function initSlider() {
  const slides = document.querySelectorAll('.slide');
  if (slides.length === 0) return;
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.style.opacity = i === index ? '1' : '0';
    });
  }
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  showSlide(0);
  slideInterval = setInterval(nextSlide, 4500);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function animateCounters() {
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const updateCounter = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString();
      }
    };
    updateCounter();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await initSupabase();
  await checkAuth();
  initSlider();
  const statsSection = document.getElementById('stats-section');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      });
    });
    observer.observe(statsSection);
  }
});

window.onclick = function(event) {
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });
};
