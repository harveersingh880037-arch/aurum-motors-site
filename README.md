# Aurum Motors

A multi-page luxury car marketplace built with **vanilla HTML, CSS, and JavaScript** (no framework). Black & gold theme, Three.js powered 3D hero, and full e-commerce-style flows for browsing, comparing, wishlisting, and selling cars.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — 3D WebGL hero, featured cars, brand story, stats |
| `buy.html` | New car catalog with brand / fuel / price filters |
| `used.html` | Pre-owned catalog with year, kilometers, condition filters |
| `car-details.html` | Full vehicle page — gallery, specs, EMI calculator, currency converter, booking |
| `sell.html` | Sell-your-car form (saves submissions to localStorage) |
| `wishlist.html` | All wishlisted cars |
| `compare.html` | Side-by-side comparison of up to 4 cars (best-price highlighted) |
| `about.html` | Company story, features, milestones |
| `contact.html` | Contact form + showroom info |
| `admin.html` | Owner portal (login: `admin` / `1234`) — manages sell submissions and bookings |

## Shared assets

- `data.js` — 35 car records (new + used) with full specs and gallery URLs
- `script.js` — All shared interactions (nav, search, wishlist, compare, EMI, currency, render functions, admin)
- `style.css` — Theme tokens, responsive layouts, 3D CSS transforms
- `three-scene.js` — Three.js scenes (WebGL hero + ambient gold dust on every page)

## Theme

- **Gold**: `#d4af37` (accent), `#f5d061` (bright)
- **Background**: `#050505`
- **Fonts**: Playfair Display (display), Poppins (body)

## How to run

This project is set up as a [Vite](https://vitejs.dev) MPA. From the project root:

```bash
pnpm install
pnpm --filter @workspace/car-marketplace run dev
```

Or open `index.html` directly in a browser — all features work standalone since data, scripts, and styles are local.

## 3D effects

- **Hero (homepage)**: Three.js scene with rotating gold torus knot, glowing icosahedron, three orbital rings, 380 floating particles, and mouse-driven camera tilt.
- **Ambient background (every page)**: 220 floating gold dust particles, scroll-driven rotation.
- **CSS 3D depth**: Cards lift their image and badges forward at different Z-depths on hover. Buttons extrude with a glow. Stat tiles and feature cards rotate on X/Y axes. Gallery acts as a 3D coverflow. The `Æ` logo mark spins on its Y-axis.
- **Accessibility**: `prefers-reduced-motion` disables all 3D hover and ambient animations. WebGL is feature-detected — devices without it see the static fallback.

## State

All user state is stored in `localStorage` under these keys: `aurum.wishlist`, `aurum.compare`, `aurum.bookings`, `aurum.sell-submissions`. Admin session uses `sessionStorage`.
