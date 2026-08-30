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

  // Helper: build an array of link objects (same for both menus)
  const links = [];

  // Common pages
  const commonPages = [
    { href: 'index.html', text: 'Home' },
    { href: 'about.html', text: 'About' },
    { href: 'contact.html', text: 'Contact' },
    { href: 'returns.html', text: 'Returns' },
    { href: 'policy.html', text: 'Policy' }
  ];
  commonPages.forEach(p => links.push(p));

  // Auth-dependent links
  if (currentUser) {
    links.push({ href: 'tracking.html', text: 'Tracking' });
    if (currentProfile && currentProfile.role === 'admin') {
      links.push({ href: 'admin.html', text: 'Admin' });
    }
    // Logout as a button (we'll treat it specially)
    // We'll handle logout as a separate element below
  } else {
    links.push({ href: 'login.html', text: 'Login' });
    links.push({ href: 'signup.html', text: 'Sign Up', isSignup: true });
  }

  // --- Build desktop markup (inline links, no block) ---
  let desktopHtml = links.map(link => {
    let cls = 'text-slate-700 hover:text-blue-600 font-medium transition';
    if (link.isSignup) {
      cls += ' bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700';
    }
    return `<a href="${link.href}" class="${cls}">${link.text}</a>`;
  }).join('');

  // Add logout button separately if logged in
  if (currentUser) {
    desktopHtml += `<button onclick="logout()" class="text-slate-700 hover:text-blue-600 font-medium transition">Logout</button>`;
  }

  // --- Build mobile markup (block links with padding) ---
  let mobileHtml = links.map(link => {
    // All mobile links are block, full width, with padding
    let cls = 'block w-full px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition';
    if (link.isSignup) {
      // For signup, we can make it stand out with a blue background
      cls += ' bg-blue-600 text-white hover:bg-blue-700';
    }
    return `<a href="${link.href}" class="${cls}">${link.text}</a>`;
  }).join('');

  // Add logout as a block button for mobile
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
  // ✅ No old chat code here anymore
});

window.onclick = function(event) {
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });
}
