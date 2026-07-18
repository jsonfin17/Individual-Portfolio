/* ============================================
   Jason Finsalyne — Frontend JavaScript
   NOTE: no email address appears anywhere in
   this file or the HTML — messages are relayed
   privately (Formspree or the Express backend).
   ============================================ */
'use strict';

// ---- footer year ----
document.getElementById('yr').textContent = new Date().getFullYear();

// ---- scroll reveal animations ----
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('show');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ---- mobile nav menu ----
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  // close the menu after tapping a link
  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    })
  );
}

// ---- LinkedIn connect button: copy a template message ----
// LinkedIn does not allow websites to pre-fill or send messages/invites,
// so we copy a ready-made note to the visitor's clipboard as they head to
// the profile — they can paste it into the connection request or message.
const liBtn = document.getElementById('li-connect');
const copyNote = document.getElementById('copy-note');
const TEMPLATE_MSG =
  "Hi Jason, I found your portfolio website and I'd love to add you to my professional network.";

if (liBtn && copyNote) {
  liBtn.addEventListener('click', () => {
    // don't preventDefault — the profile still opens in a new tab
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(TEMPLATE_MSG).then(() => {
        copyNote.textContent =
          'A template message was copied to your clipboard — paste it into your connection note or message!';
      }).catch(() => { /* clipboard blocked — no problem, profile still opens */ });
    }
  });
}

// ---- contact form ----
// SETUP (one-time): create a free form at https://formspree.io with your
// email, then paste the endpoint below, e.g. 'https://formspree.io/f/abcdwxyz'.
// Formspree forwards submissions to your inbox WITHOUT exposing the address —
// the endpoint ID reveals nothing. Leave empty to use the Express backend
// (/api/contact) instead when running server.js.
const FORM_ENDPOINT = '';

const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');

function setStatus(msg, ok) {
  statusEl.textContent = msg;
  statusEl.className = 'form-status ' + (ok ? 'ok' : 'err');
}

if (form) {
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();

    // honeypot: if the hidden field is filled, it's a bot — silently drop
    if (form.elements._gotcha && form.elements._gotcha.value) {
      return setStatus('Thanks! Your message has been sent.', true);
    }

    // client-side validation (server validates again — never trust the client)
    if (name.length < 2 || name.length > 100) return setStatus('Please enter your name (2–100 characters).', false);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus('Please enter a valid email address.', false);
    if (message.length < 10 || message.length > 2000) return setStatus('Message must be 10–2000 characters.', false);

    const endpoint = FORM_ENDPOINT || '/api/contact';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      if (res.ok) {
        form.reset();
        return setStatus('Thanks! Your message has been sent — I will get back to you.', true);
      }
      const data = await res.json().catch(() => ({}));
      return setStatus(data.error || 'Something went wrong — please reach out on LinkedIn instead.', false);
    } catch (_) {
      return setStatus('Message service unavailable — please connect with me on LinkedIn instead.', false);
    }
  });
}
