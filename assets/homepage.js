const SUPABASE_URL = "https://gdqxktignefqfpanidob.supabase.co/rest/v1/subscribers";
const SUPABASE_ANON_KEY = "sb_publishable_hmxRQdEMamY2hzqD1ZQZFw_5smTvW9a";


// Scroll-reveal for feature/pricing cards (pure JS, no dependencies).
// Respects prefers-reduced-motion by leaving .reveal elements visible via CSS fallback.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });
} else {
  document.querySelectorAll('.reveal').forEach(function (el) {
    el.classList.add('is-visible');
  });
}

// FAQ accordion (pure JS, no dependencies)
document.querySelectorAll('.faq-item').forEach(function (item) {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', function () {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      }
    });
    item.classList.toggle('open', !isOpen);
    question.setAttribute('aria-expanded', (!isOpen).toString());
  });
});

document.getElementById('signup-form').addEventListener('submit', async function(e){
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Submitting...';
  try {
    const res = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ email: email, tier: 'free' })
    });
    if (res.ok) {
      statusEl.textContent = "You're in! Check your inbox soon for your first automation tip.";
      document.getElementById('signup-form').reset();
    } else {
      const txt = await res.text();
      if (txt.includes('duplicate') || res.status === 409) {
        statusEl.textContent = "You're already on the list!";
      } else {
        statusEl.textContent = 'Something went wrong. Please try again in a moment.';
      }
    }
  } catch(err) {
    statusEl.textContent = 'Network error. Please try again.';
  }
});
