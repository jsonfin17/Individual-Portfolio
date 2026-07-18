# Jason Finsalyne — Portfolio Website

Classic, editorial-style portfolio with a JavaScript frontend and a Node.js/Express backend.

## Project structure

```
portfolio/
├── index.html        # page markup
├── css/
│   └── style.css     # all styling (vintage/classic theme)
├── js/
│   └── main.js       # frontend JS: scroll reveal + contact form
├── server.js         # Express backend: static hosting + /api/contact
├── package.json      # dependencies & scripts
├── .gitignore        # keeps node_modules, messages, secrets out of git
└── README.md
```

The frontend works standalone (open `index.html` or host on GitHub Pages). The backend adds a contact form API. **Your email address appears nowhere on the site or in the code** — see "Contact form → your inbox" below.

## Contact

The live site uses **LinkedIn as the only contact channel** — the contact section invites new professional connections and links to the profile, where visitors can hit Connect or Message. Websites cannot send LinkedIn messages on a visitor's behalf (LinkedIn doesn't allow it), so linking to the profile is the standard, secure approach.

### Optional: re-enable the contact form (email stays private)

The form handler is still in `js/main.js` and the backend API in `server.js`; only the form markup was removed from `index.html` (retrievable from git history once committed, or re-add a form with id `contact-form`). To make it deliver to your inbox on GitHub Pages, use **Formspree** (free, ~2 minutes):

1. Go to https://formspree.io → sign up with your email → New form.
2. Copy the endpoint it gives you (looks like `https://formspree.io/f/abcdwxyz`).
3. Paste it into `FORM_ENDPOINT` at the top of `js/main.js` and push.

Submissions are forwarded to your inbox. The endpoint ID is a random token — visitors and scrapers cannot derive your email from it. Formspree also adds its own spam filtering, and the form includes a honeypot field that silently drops bots.

Alternative (full-stack hosting on Render): leave `FORM_ENDPOINT` empty and the form posts to the Express backend, which stores messages privately in `data/messages.jsonl` (never committed, never served). To have the backend email you instead, add an email API like Resend with the key in `.env` — never put the address or keys in code.

## Run locally

Requires Node.js 18+ (https://nodejs.org).

```bash
npm install
npm start          # or: npm run dev  (auto-restarts on changes)
```

Open http://localhost:3000. Contact-form messages are saved to `data/messages.jsonl`.

## Put it on GitHub (best practice)

One-time setup — from this folder in a terminal:

```bash
git init
git add .
git commit -m "Initial commit: portfolio website"
git branch -M main
```

Create an empty repo on GitHub (github.com → + → New repository, name it `YOURUSERNAME.github.io` for a personal site, Public, no README), then:

```bash
git remote add origin https://github.com/YOURUSERNAME/YOURUSERNAME.github.io.git
git push -u origin main
```

Every future update:

```bash
git add .
git commit -m "Describe what changed"
git push
```

Tips: commit small and often with clear messages; never commit `node_modules`, `data/` or `.env` (the `.gitignore` already blocks them); use branches (`git checkout -b feature-x`) when experimenting.

## Hosting

**Frontend only — GitHub Pages (free, recommended to start).**
After pushing, go to repo Settings → Pages → Source: Deploy from a branch → `main` / root → Save. Live at `https://YOURUSERNAME.github.io` in ~2 minutes. The contact form will use the mailto fallback since Pages is static-only.

**Full stack (frontend + backend) — Render (free tier).**
1. Push the repo to GitHub (any repo name works).
2. https://render.com → New → Web Service → connect the repo.
3. Build command: `npm install` · Start command: `npm start`.
4. Deploy — you get `https://your-app.onrender.com` with the working contact API.
(Railway and Fly.io are similar alternatives. Vercel works too using serverless functions.)

You can do both: GitHub Pages as the main site, Render for the API later.

## Security — what's built in

- **CSP (Content-Security-Policy)**: only same-origin scripts/styles + Google Fonts can load; blocks XSS payload injection, inline-script abuse and iframe embedding (`frame-ancestors 'none'`).
- **Security headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (clickjacking), `Referrer-Policy`, `Permissions-Policy` (camera/mic/geo off), HSTS in production, `X-Powered-By` removed.
- **Input validation & sanitisation** on the contact API: type/length checks, email format check, control-character stripping — validated server-side (never trust the client).
- **Rate limiting**: max 5 contact submissions per IP per 15 minutes (anti-spam/abuse).
- **Request size cap**: JSON bodies limited to 10 KB (anti-DoS).
- **File exposure blocked**: `server.js`, `package.json`, `data/` (stored messages), `.env`, `.git` return 404 from the server; `.gitignore` keeps secrets and messages out of the repo.
- **Privacy**: no email address, phone number, or referee contacts appear anywhere on the site, in the JavaScript, or in the repo — the only public contact channel is LinkedIn plus the relayed form. Scrapers harvesting the page or the GitHub repo find nothing.
- **Anti-spam honeypot**: a hidden form field traps bots; submissions filling it are silently discarded.
- **External links** use `rel="noopener noreferrer"`.

Security notes for later: run `npm audit` occasionally and keep Express updated; if you add an email service, put API keys in `.env` (already gitignored), never in code; both GitHub Pages and Render serve over HTTPS automatically.

## Customising

- Colours/fonts: edit the `:root` variables at the top of `css/style.css`.
- Content: everything is plain HTML in `index.html` — sections are labelled.
- Form destination: `FORM_ENDPOINT` in `js/main.js` (Formspree) or the storage/email logic in `server.js`.
