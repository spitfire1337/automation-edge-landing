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

// Safety net: force-reveal anything still waiting on IntersectionObserver shortly after
// load (covers slow scroll, bfcache restores, or environments where the observer never
// fires). Cards are already visible via CSS (opacity:1 by default) - this just finishes
// the slide-up transform so nothing is left mid-animation indefinitely.
window.addEventListener('load', function () {
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }, 1500);
});

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

// Reusable email-capture submit handler shared by the main footer signup form
// and the secondary mini-capture forms next to each pricing buy button.
// All forms post to the same Supabase "subscribers" endpoint/tier.
async function handleSignupSubmit(e, emailInputEl, statusEl, formEl) {
  e.preventDefault();
  const email = emailInputEl.value.trim();
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
      formEl.reset();
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
}

// Wires up a signup form by id, given matching email input and status element ids.
function initSignupForm(formId, emailId, statusId) {
  const formEl = document.getElementById(formId);
  if (!formEl) return;
  const emailInputEl = document.getElementById(emailId);
  const statusEl = document.getElementById(statusId);
  formEl.addEventListener('submit', function (e) {
    handleSignupSubmit(e, emailInputEl, statusEl, formEl);
  });
}

initSignupForm('signup-form', 'email', 'status');
initSignupForm('signup-form-card1', 'email-card1', 'status-card1');
initSignupForm('signup-form-card2', 'email-card2', 'status-card2');
initSignupForm('signup-form-card3', 'email-card3', 'status-card3');

// Toggle buttons that reveal the small inline email capture form near each
// pricing buy button, keeping the UI minimal until the user opts in.
document.querySelectorAll('.mini-capture-toggle').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const targetForm = document.getElementById(btn.getAttribute('data-target'));
    if (!targetForm) return;
    const willOpen = !targetForm.classList.contains('open');
    targetForm.classList.toggle('open', willOpen);
    if (willOpen) {
      const input = targetForm.querySelector('input[type="email"]');
      if (input) input.focus();
    }
  });
});
