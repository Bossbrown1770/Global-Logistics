// 🔑 Config loaded from build-generated config.js
const SUPABASE_URL = window.__SUPABASE_CONFIG?.url;
const SUPABASE_ANON_KEY = window.__SUPABASE_CONFIG?.anonKey;

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
  const commonLinks = `
    <a href="index.html" class="text-slate-700 hover:text-blue-600 font-medium transition">Home</a>
    <a href="about.html" class="text-slate-700 hover:text-blue-600 font-medium transition">About</a>
    <a href="contact.html" class="text-slate-700 hover:text-blue-600 font-medium transition">Contact</a>
    <a href="returns.html" class="text-slate-700 hover:text-blue-600 font-medium transition">Returns</a>
    <a href="policy.html" class="text-slate-700 hover:text-blue-600 font-medium transition">Policy</a>
  `;
  let authLinks = '';
  if (currentUser) {
    authLinks += `<a href="tracking.html" class="text-slate-700 hover:text-blue-600 font-medium transition">Tracking</a>`;
    if (currentProfile && currentProfile.role === 'admin') {
      authLinks += `<a href="admin.html" class="text-slate-700 hover:text-blue-600 font-medium transition">Admin</a>`;
    }
    authLinks += `<button onclick="logout()" class="text-slate-700 hover:text-blue-600 font-medium transition">Logout</button>`;
  } else {
    authLinks += `
      <a href="login.html" class="text-slate-700 hover:text-blue-600 font-medium transition">Login</a>
      <a href="signup.html" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Sign Up</a>
    `;
  }
  navContainer.innerHTML = commonLinks + authLinks;
  if (mobileNavContainer) {
    mobileNavContainer.innerHTML = commonLinks + authLinks;
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

function toggleChat() {
  const chatWindow = document.getElementById('chat-window');
  if (chatWindow) chatWindow.classList.toggle('hidden');
}

async function processAIQuery() {
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  const userMsg = input.value.trim();
  if (!userMsg) return;
  messages.innerHTML += `<div class="text-right mb-2"><span class="inline-block bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">${escapeHtml(userMsg)}</span></div>`;
  input.value = '';
  messages.scrollTop = messages.scrollHeight;
  const typingId = 'typing-' + Date.now();
  messages.innerHTML += `<div id="${typingId}" class="mb-2"><span class="inline-block bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm">Thinking...</span></div>`;
  messages.scrollTop = messages.scrollHeight;
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg })
    });
    const data = await response.json();
    document.getElementById(typingId).remove();
    if (data.reply) {
      messages.innerHTML += `<div class="mb-2"><span class="inline-block bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm">${escapeHtml(data.reply)}</span></div>`;
    } else {
      messages.innerHTML += `<div class="mb-2"><span class="inline-block bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">Sorry, I couldn't process that. Please try again.</span></div>`;
    }
  } catch (error) {
    document.getElementById(typingId).remove();
    messages.innerHTML += `<div class="mb-2"><span class="inline-block bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">Connection error. Please check your internet.</span></div>`;
  }
  messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') processAIQuery();
    });
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
}