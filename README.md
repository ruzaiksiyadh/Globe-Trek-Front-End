
# GlobeTrek — Premium Travel & Tour Booking Platform

GlobeTrek is a full-stack travel and tour booking platform. Travelers can
browse destinations, view detailed tour itineraries, book adventures with
live price calculation, and track booking status. A separate admin panel
lets a single administrator manage tours and approve or reject bookings.

This repository is the **frontend** — a static, vanilla HTML/CSS/JS site with
no build step. It talks to a real backend API for everything (accounts,
tours, bookings) rather than storing data in the browser.

**Backend repo:** [globetrek-backend](../../globetrek-backend) — Bun +
Elysia + SQLite. You need it running for this frontend to work; see its
README for setup.

---

## Features

- Cinematic homepage with destinations, featured tours, and an About section
- Tour detail pages with itinerary, included/excluded services, gallery, and reviews
- Full-screen glassmorphism booking flow with a live traveler counter and instant price preview
- Traveler registration/login and a dashboard showing booking status (Pending / Approved / Rejected)
- Separate Admin panel: dashboard stats, booking approval/rejection, tour management (create/edit/deactivate)
- Loading skeletons and a "Try Again" retry state if the backend is unreachable — the UI never just goes blank on failure
- Fully responsive, dark-navy/cyan glassmorphism design with scroll-reveal animations

## Tech stack

Vanilla JavaScript (ES2020+, `async/await`, no framework), HTML5, CSS3
(custom properties, no CSS framework), `fetch` for all API calls.

## Project structure

```
globetrek/
  index.html              Homepage
  tour-details.html       Tour detail + booking entry point
  login.html               Traveler login
  register.html             Traveler registration
  dashboard.html             Traveler account / booking history
  admin-login.html            Admin login (separate from traveler login)
  admin-dashboard.html         Admin panel: stats, bookings, tour management
  css/style.css                 Design system (colors, components, animations)
  js/
    api.js                       All backend communication — every function
                                  returns { ok, ...data, error? } so pages can
                                  show real loading/success/error states
    ui.js                         Shared navbar/footer, scroll reveal, toasts, auth guards
    booking.js                     The booking modal (traveler counter, live pricing)
    admin.js                       Admin dashboard logic
  images/                           Destination and tour photos 
                                    see the placeholder captions for which file is which)
  start.bat                         Windows: double-click to serve the site locally
```

## Running locally

You need the [backend](../../globetrek-backend) running first (defaults to
`http://localhost:4000`).

**Windows — one click:**
Double-click `start.bat`. It starts a local server on port 5500.

**Manual (any OS):**
```bash
bunx serve -l 5500
# or: python3 -m http.server 5500
```

Then open **`http://localhost:5500`** in your browser.

> **Note:** don't open `index.html` directly by double-clicking it (`file://`
> in the address bar). Logins use a secure cookie that browsers block on
> `file://` pages — it has to be served over `http://` as above.

## Configuring the API URL

By default, `js/api.js` automatically targets the backend on whatever host
you're browsing the frontend from (so `localhost` or your LAN IP both work
without editing anything). To point at a different backend — e.g. after
deploying — either:

- Set `window.GLOBETREK_API_BASE` before `api.js` loads, or
- Edit the fallback directly in `js/api.js`:
  ```js
  const API_BASE = window.GLOBETREK_API_BASE || `${window.location.protocol}//${window.location.hostname}:4000`;
  ```

## Security notes

- No passwords or admin credentials are ever stored or hashed in this
  frontend — all of that happens server-side in the backend.
- The demo/admin login page never displays credentials in the UI.
- Booking totals shown here are a live *preview* only; the backend always
  recalculates the authoritative price server-side before saving a booking.

## Deployment

This is a static site — deploy it anywhere that serves static files
(Netlify, Vercel, GitHub Pages, etc.). Point `API_BASE` at your deployed
backend URL, and make sure that backend's `CORS_ORIGINS` includes this
site's deployed URL.
