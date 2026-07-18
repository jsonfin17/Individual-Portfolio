/* ============================================
   Jason Finsalyne — Portfolio Backend
   Express server: serves the static site and a
   secured /api/contact endpoint.
   Run: npm install && npm start
   ============================================ */
'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- security headers (helmet-style, no extra deps) ----------
app.use((req, res, next) => {
  res.set({
    // Only allow resources from our own origin + Google Fonts
    'Content-Security-Policy':
      "default-src 'self'; " +
      "style-src 'self' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "script-src 'self'; " +
      "img-src 'self' data:; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    'X-Content-Type-Options': 'nosniff',       // no MIME sniffing
    'X-Frame-Options': 'DENY',                 // no clickjacking via iframes
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Opener-Policy': 'same-origin'
  });
  // HSTS only makes sense behind HTTPS (production)
  if (process.env.NODE_ENV === 'production') {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// hide the "X-Powered-By: Express" fingerprint
app.disable('x-powered-by');

// ---------- body parsing with a strict size limit ----------
app.use(express.json({ limit: '10kb' }));

// ---------- simple in-memory rate limiter for the contact API ----------
// max 5 requests per 15 minutes per IP — stops spam/abuse without extra deps
const hits = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS = 5;

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const entry = hits.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) { entry.count = 0; entry.start = now; }
  entry.count += 1;
  hits.set(ip, entry);
  if (entry.count > MAX_HITS) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  }
  next();
}

// periodically clear stale rate-limit entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, e] of hits) if (now - e.start > WINDOW_MS) hits.delete(ip);
}, WINDOW_MS).unref();

// ---------- validation helpers (never trust client input) ----------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(str) {
  // strip control characters; keep plain text only
  return String(str).replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

function validateContact(body) {
  if (typeof body !== 'object' || body === null) return 'Invalid payload.';
  const name = sanitize(body.name || '');
  const email = sanitize(body.email || '');
  const message = sanitize(body.message || '');
  if (name.length < 2 || name.length > 100) return 'Name must be 2–100 characters.';
  if (!EMAIL_RE.test(email) || email.length > 254) return 'Invalid email address.';
  if (message.length < 10 || message.length > 2000) return 'Message must be 10–2000 characters.';
  return { name, email, message };
}

// ---------- API: contact form ----------
app.post('/api/contact', rateLimit, (req, res) => {
  const result = validateContact(req.body);
  if (typeof result === 'string') {
    return res.status(400).json({ ok: false, error: result });
  }
  // Store messages as JSON lines. Swap this for nodemailer / an email API
  // (e.g. Resend, SendGrid) when you want messages emailed to you.
  const record = { ...result, at: new Date().toISOString() };
  const dir = path.join(__dirname, 'data');
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFile(path.join(dir, 'messages.jsonl'), JSON.stringify(record) + '\n', (err) => {
    if (err) {
      console.error('Failed to save message:', err);
      return res.status(500).json({ ok: false, error: 'Could not save your message.' });
    }
    res.json({ ok: true });
  });
});

// ---------- static site ----------
// Block server-side files BEFORE the static handler so they can never leak.
const BLOCKED = /^\/(server\.js|package(-lock)?\.json|data(\/|$)|node_modules(\/|$)|\.git(\/|$)|\.env)/;
app.use((req, res, next) => {
  if (BLOCKED.test(req.path)) return res.status(404).send('Not found');
  next();
});

app.use(express.static(path.join(__dirname), { index: 'index.html', extensions: ['html'] }));

app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
});
