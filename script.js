/* ===========================
   Aurum Motors — Shared interactions
   =========================== */

// Surface any uncaught errors visibly so silent breakages never happen again
window.addEventListener("error", (e) => {
  console.error("[Aurum] Uncaught error:", e.message, e.filename, e.lineno);
});

// ---------- Format currency in Indian style ----------
function formatINR(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

/* ===========================
   WISHLIST + COMPARE  (localStorage)
   =========================== */
const WISH_KEY = "aurum_wishlist";
const CMP_KEY = "aurum_compare";

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WISH_KEY) || "[]"); }
  catch { return []; }
}
function saveWishlist(arr) {
  localStorage.setItem(WISH_KEY, JSON.stringify(arr));
  updateBadges();
}
function toggleWishlist(id) {
  const list = getWishlist();
  const i = list.indexOf(id);
  if (i >= 0) list.splice(i, 1);
  else list.push(id);
  saveWishlist(list);
  return list.includes(id);
}
function isWished(id) { return getWishlist().includes(id); }

function getCompare() {
  try { return JSON.parse(localStorage.getItem(CMP_KEY) || "[]"); }
  catch { return []; }
}
function saveCompare(arr) {
  localStorage.setItem(CMP_KEY, JSON.stringify(arr));
  updateBadges();
}
function toggleCompare(id) {
  const list = getCompare();
  const i = list.indexOf(id);
  if (i >= 0) {
    list.splice(i, 1);
  } else {
    if (list.length >= 4) {
      showToast("You can compare up to 4 vehicles at once.");
      return false;
    }
    list.push(id);
  }
  saveCompare(list);
  return list.includes(id);
}
function isCompared(id) { return getCompare().includes(id); }

function updateBadges() {
  const w = getWishlist().length;
  const c = getCompare().length;
  document.querySelectorAll("[data-badge='wishlist']").forEach((el) => {
    el.textContent = w;
    el.classList.toggle("hidden", w === 0);
  });
  document.querySelectorAll("[data-badge='compare']").forEach((el) => {
    el.textContent = c;
    el.classList.toggle("hidden", c === 0);
  });
}

/* ===========================
   TOAST notifications
   =========================== */
function showToast(msg) {
  let t = document.getElementById("aurum-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "aurum-toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ===========================
   NAV
   =========================== */
function initNav() {
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  const menuBtn = document.querySelector(".menu-btn");
  const links = document.querySelector(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", () => links.classList.toggle("open"));
  }
  const here = window.location.pathname.replace(/\/$/, "").split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href && (href === here || (here === "" && href === "index.html"))) {
      a.classList.add("active");
    }
  });
}

/* ===========================
   GLOBAL SEARCH (in nav)
   =========================== */
function initSearch() {
  const input = document.getElementById("nav-search");
  const results = document.getElementById("nav-search-results");
  if (!input || !results) return;
  const cars = window.CARS || [];

  function close() { results.classList.remove("show"); results.innerHTML = ""; }

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { close(); return; }
    const matches = cars.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      (c.fuel || "").toLowerCase().includes(q)
    ).slice(0, 6);
    if (matches.length === 0) {
      results.innerHTML = `<div class="no-res">No matches for "${q}"</div>`;
    } else {
      results.innerHTML = matches.map((c) => `
        <a class="res-item" href="car-details.html?id=${c.id}">
          <img src="${c.image}" alt="${c.name}"/>
          <div class="meta">
            <div class="n">${c.name}</div>
            <div class="b">${c.brand} · ${formatINR(c.price)}</div>
          </div>
        </a>
      `).join("");
    }
    results.classList.add("show");
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) close();
  });
  input.addEventListener("focus", () => {
    if (input.value.trim()) input.dispatchEvent(new Event("input"));
  });
}

/* ===========================
   REVEAL on scroll
   =========================== */
function initReveal() {
  const els = document.querySelectorAll(".reveal:not(.visible)");
  if (!("IntersectionObserver" in window)) {
    els.forEach((e) => e.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  els.forEach((el) => io.observe(el));
}

/* ===========================
   3D TILT on cards
   =========================== */
function initTilt() {
  document.querySelectorAll(".car-card").forEach((card) => {
    if (card._tiltBound) return;
    card._tiltBound = true;
    card.addEventListener("mousemove", (ev) => {
      const r = card.getBoundingClientRect();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      const rx = ((y / r.height) - 0.5) * -8;
      const ry = ((x / r.width) - 0.5) * 8;
      card.style.transform = `translateY(-10px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}

/* ===========================
   CAR CARD HTML
   =========================== */
function carCardHTML(car) {
  const tag = car.type === "used"
    ? `<span class="tag used">Used · ${car.condition || ""}</span>`
    : `<span class="tag">New</span>`;
  const wished = isWished(car.id);
  const compared = isCompared(car.id);
  const yearAge = car.type === "used"
    ? `<span class="chip">${(car.kmDriven/1000).toFixed(0)}k km</span>
       <span class="chip">${new Date().getFullYear() - car.year} yrs</span>`
    : `<span class="chip">${car.hp} HP</span>
       <span class="chip">${car.transmission}</span>`;
  return `
    <div class="car-card reveal" data-id="${car.id}">
      <span class="shine"></span>
      ${tag}
      <button class="wish-btn ${wished ? "active" : ""}" data-wish="${car.id}" aria-label="Add to wishlist" title="Add to wishlist">
        <svg viewBox="0 0 24 24" fill="${wished ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9C.8 8.4 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.2 4.4 4.5 8-2.5 4.5-9.5 9-9.5 9z"/></svg>
      </button>
      <a class="card-link" href="car-details.html?id=${car.id}">
        <div class="img-wrap"><img loading="lazy" src="${car.image}" alt="${car.name}" /></div>
        <div class="body">
          <div class="brand">${car.brand}${car.type === "used" ? " · " + car.year : ""}</div>
          <h3>${car.name}</h3>
          <div class="price">${formatINR(car.price)}</div>
          <div class="specs">
            <span class="chip">${car.fuel}</span>
            ${yearAge}
          </div>
          <p class="desc">${car.desc}</p>
        </div>
      </a>
      <label class="cmp-pill" title="Add to compare">
        <input type="checkbox" data-cmp="${car.id}" ${compared ? "checked" : ""}/>
        <span>Compare</span>
      </label>
    </div>`;
}

// Backward-compat (used.html may use this name)
function usedCardHTML(car) { return carCardHTML(car); }

function bindCardActions(scope) {
  (scope || document).querySelectorAll("[data-wish]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const id = Number(btn.dataset.wish);
      const now = toggleWishlist(id);
      btn.classList.toggle("active", now);
      const svg = btn.querySelector("svg");
      if (svg) svg.setAttribute("fill", now ? "currentColor" : "none");
      showToast(now ? "Added to wishlist" : "Removed from wishlist");
    });
  });
  (scope || document).querySelectorAll("[data-cmp]").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      e.stopPropagation();
      const id = Number(cb.dataset.cmp);
      const wasOn = cb.checked;
      const nowOn = toggleCompare(id);
      cb.checked = nowOn;
      if (wasOn && nowOn) showToast("Added to compare");
      else if (!nowOn && wasOn) showToast("Compare list is full (max 4)");
      else if (!nowOn) showToast("Removed from compare");
    });
  });
}

/* ===========================
   GRIDS
   =========================== */
function renderFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  const list = (window.CARS || []).filter((c) => c.type === "new").slice(0, 12);
  grid.innerHTML = list.map(carCardHTML).join("");
  initReveal(); initTilt(); bindCardActions(grid);
}

function renderBuy() {
  const grid = document.getElementById("buy-grid");
  if (!grid) return;
  const cars = (window.CARS || []).filter((c) => c.type === "new");
  const brandSel = document.getElementById("f-brand");
  const fuelSel = document.getElementById("f-fuel");
  const priceRng = document.getElementById("f-price");
  const priceVal = document.getElementById("f-price-val");

  if (brandSel) {
    const brands = [...new Set(cars.map((c) => c.brand))].sort();
    brandSel.innerHTML = `<option value="">All Brands</option>` +
      brands.map((b) => `<option value="${b}">${b}</option>`).join("");
  }

  function apply() {
    const b = brandSel?.value || "";
    const f = fuelSel?.value || "";
    const max = priceRng ? Number(priceRng.value) : Infinity;
    if (priceVal) priceVal.textContent = formatINR(max);
    const filtered = cars.filter((c) =>
      (!b || c.brand === b) && (!f || c.fuel === f) && c.price <= max
    );
    grid.innerHTML = filtered.length === 0
      ? `<p style="grid-column:1/-1;text-align:center;color:var(--text-dim);padding:60px 0">No vehicles match your filters. Try widening your criteria.</p>`
      : filtered.map(carCardHTML).join("");
    initReveal(); initTilt(); bindCardActions(grid);
  }
  [brandSel, fuelSel, priceRng].forEach((el) => el && el.addEventListener("input", apply));
  apply();
}

function renderUsed() {
  const grid = document.getElementById("used-grid");
  if (!grid) return;
  const cars = (window.CARS || []).filter((c) => c.type === "used");
  const condSel = document.getElementById("f-condition");
  const fuelSel = document.getElementById("f-used-fuel");

  function apply() {
    const cond = condSel?.value || "";
    const f = fuelSel?.value || "";
    const filtered = cars.filter((c) =>
      (!cond || c.condition === cond) && (!f || c.fuel === f)
    );
    grid.innerHTML = filtered.length === 0
      ? `<p style="grid-column:1/-1;text-align:center;color:var(--text-dim);padding:60px 0">No vehicles match your filters.</p>`
      : filtered.map(carCardHTML).join("");
    initReveal(); initTilt(); bindCardActions(grid);
  }
  [condSel, fuelSel].forEach((el) => el && el.addEventListener("input", apply));
  apply();
}

/* ===========================
   CAR DETAILS  (gallery + EMI + currency + booking)
   =========================== */
function renderDetails() {
  const wrap = document.getElementById("details-wrap");
  if (!wrap) return;
  try {
    return _renderDetails(wrap);
  } catch (err) {
    console.error("[Aurum] renderDetails crashed:", err);
    wrap.innerHTML = `
      <div style="padding:60px 30px;text-align:center;border:1px solid var(--gold);border-radius:18px;background:rgba(212,175,55,0.05)">
        <h2 style="color:var(--gold-bright);font-family:var(--font-display);margin-bottom:16px">Vehicle details unavailable</h2>
        <p style="color:var(--text-dim);margin-bottom:24px">${err.message || "Something went wrong loading this vehicle."}</p>
        <a href="buy.html" class="btn btn-solid">Browse All Cars</a>
      </div>`;
  }
}
function _renderDetails(wrap) {
  const id = Number(new URLSearchParams(window.location.search).get("id"));
  const car = (window.CARS || []).find((c) => c.id === id) || (window.CARS || [])[0];
  if (!car) return;

  const isUsed = car.type === "used";
  const usedSpecs = isUsed
    ? `
      <div class="spec"><div class="lab">KM Driven</div><div class="val">${(car.kmDriven/1000).toFixed(1)}k km</div></div>
      <div class="spec"><div class="lab">Vehicle Age</div><div class="val">${new Date().getFullYear() - car.year} yrs</div></div>
      <div class="spec"><div class="lab">Condition</div><div class="val">${car.condition}</div></div>
      <div class="spec"><div class="lab">Year</div><div class="val">${car.year}</div></div>`
    : "";

  document.title = `${car.name} · Aurum Motors`;
  const wished = isWished(car.id);
  const compared = isCompared(car.id);

  wrap.innerHTML = `
    <div class="gallery reveal">
      <div class="main-img"><img id="main-img" src="${car.gallery[0]}" alt="${car.name}" /></div>
      <div class="thumbs">
        ${car.gallery.map((g, i) => `<img src="${g}" data-src="${g}" class="${i === 0 ? "active" : ""}" alt="${car.name}"/>`).join("")}
      </div>
    </div>
    <div class="info-col reveal delay-1">
      <div class="brand-tag">${car.brand} · ${isUsed ? "Pre-Owned" : "New"}</div>
      <h1>${car.name}</h1>
      <p class="summary">${car.desc}</p>
      <div class="price-big">
        <span id="price-display">${formatINR(car.price)}</span>
        <select id="currency-sel" class="currency-sel" title="Convert currency">
          <option value="INR">INR ₹</option>
          <option value="USD">USD $</option>
          <option value="EUR">EUR €</option>
          <option value="GBP">GBP £</option>
          <option value="AED">AED د.إ</option>
        </select>
      </div>
      <div class="spec-grid">
        <div class="spec"><div class="lab">Engine Power</div><div class="val">${car.hp} HP</div></div>
        <div class="spec"><div class="lab">Torque</div><div class="val">${car.torque}</div></div>
        <div class="spec"><div class="lab">Top Speed</div><div class="val">${car.topSpeed}</div></div>
        <div class="spec"><div class="lab">0–100 km/h</div><div class="val">${car.accel}</div></div>
        <div class="spec"><div class="lab">Fuel Type</div><div class="val">${car.fuel}</div></div>
        <div class="spec"><div class="lab">Transmission</div><div class="val">${car.transmission}</div></div>
        ${usedSpecs}
      </div>

      <div class="action-row">
        <button class="btn btn-solid" id="book-btn">Book Now</button>
        <button class="btn" id="testdrive-btn">Schedule Test Drive</button>
        <button class="btn ${wished ? "btn-active" : ""}" id="wish-btn">
          ${wished ? "♥ Wishlisted" : "♡ Wishlist"}
        </button>
        <button class="btn ${compared ? "btn-active" : ""}" id="cmp-btn">
          ${compared ? "✓ In Compare" : "⇄ Compare"}
        </button>
      </div>

      <!-- EMI CALCULATOR -->
      <div class="emi-box">
        <div class="emi-head">
          <div class="eyebrow">Finance Calculator</div>
          <h3>Estimate your monthly EMI</h3>
        </div>
        <div class="emi-controls">
          <div class="emi-field">
            <div class="emi-lab"><span>Down Payment</span><span id="dp-val">${formatINR(Math.round(car.price*0.2))}</span></div>
            <input type="range" id="dp-rng" min="0" max="${Math.round(car.price*0.6)}" step="${Math.max(10000, Math.round(car.price/200))}" value="${Math.round(car.price*0.2)}"/>
          </div>
          <div class="emi-field">
            <div class="emi-lab"><span>Tenure</span><span id="ten-val">5 yrs</span></div>
            <input type="range" id="ten-rng" min="1" max="8" step="1" value="5"/>
          </div>
          <div class="emi-field">
            <div class="emi-lab"><span>Interest Rate</span><span id="rate-val">9.5%</span></div>
            <input type="range" id="rate-rng" min="6" max="15" step="0.1" value="9.5"/>
          </div>
        </div>
        <div class="emi-results">
          <div class="emi-card">
            <div class="lab">Monthly EMI</div>
            <div class="val" id="emi-monthly">—</div>
          </div>
          <div class="emi-card">
            <div class="lab">Total Interest</div>
            <div class="val" id="emi-interest">—</div>
          </div>
          <div class="emi-card">
            <div class="lab">Total Payable</div>
            <div class="val" id="emi-total">—</div>
          </div>
        </div>
      </div>
    </div>`;

  // Gallery thumb switcher
  const mainImg = document.getElementById("main-img");
  document.querySelectorAll(".thumbs img").forEach((t) => {
    t.addEventListener("click", () => {
      document.querySelectorAll(".thumbs img").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      mainImg.src = t.dataset.src;
    });
  });

  // Currency converter (approx static rates, demo only)
  const RATES = { INR: 1, USD: 1/83, EUR: 1/90, GBP: 1/105, AED: 1/22.6 };
  const SYM = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "AED " };
  const priceDisp = document.getElementById("price-display");
  document.getElementById("currency-sel").addEventListener("change", (e) => {
    const cur = e.target.value;
    if (cur === "INR") { priceDisp.textContent = formatINR(car.price); return; }
    const v = car.price * RATES[cur];
    if (cur === "AED") {
      priceDisp.textContent = `${SYM[cur]}${Math.round(v).toLocaleString("en-US")}`;
    } else if (v >= 1000000) {
      priceDisp.textContent = `${SYM[cur]}${(v/1000000).toFixed(2)}M`;
    } else {
      priceDisp.textContent = `${SYM[cur]}${Math.round(v).toLocaleString("en-US")}`;
    }
  });

  // EMI calculator
  function calcEMI() {
    const dp = Number(document.getElementById("dp-rng").value);
    const ten = Number(document.getElementById("ten-rng").value);
    const rate = Number(document.getElementById("rate-rng").value);
    document.getElementById("dp-val").textContent = formatINR(dp);
    document.getElementById("ten-val").textContent = ten + (ten === 1 ? " yr" : " yrs");
    document.getElementById("rate-val").textContent = rate.toFixed(1) + "%";
    const principal = Math.max(0, car.price - dp);
    const months = ten * 12;
    const r = rate / 12 / 100;
    const emi = principal === 0 ? 0 : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const total = emi * months;
    const interest = total - principal;
    document.getElementById("emi-monthly").textContent = formatINR(Math.round(emi));
    document.getElementById("emi-interest").textContent = formatINR(Math.round(interest));
    document.getElementById("emi-total").textContent = formatINR(Math.round(total + dp));
  }
  ["dp-rng","ten-rng","rate-rng"].forEach((id)=>document.getElementById(id).addEventListener("input", calcEMI));
  calcEMI();

  // Wishlist + Compare buttons
  document.getElementById("wish-btn").addEventListener("click", (e) => {
    const now = toggleWishlist(car.id);
    e.target.classList.toggle("btn-active", now);
    e.target.textContent = now ? "♥ Wishlisted" : "♡ Wishlist";
    showToast(now ? "Added to wishlist" : "Removed from wishlist");
  });
  document.getElementById("cmp-btn").addEventListener("click", (e) => {
    const now = toggleCompare(car.id);
    e.target.classList.toggle("btn-active", now);
    e.target.textContent = now ? "✓ In Compare" : "⇄ Compare";
    if (!now && getCompare().includes(car.id)) showToast("Compare list is full (max 4)");
    else showToast(now ? "Added to compare" : "Removed from compare");
  });

  // Booking + test-drive forms
  const bookBtn = document.getElementById("book-btn");
  const tdBtn = document.getElementById("testdrive-btn");
  const formArea = document.getElementById("booking-area");
  function openForm(kind) {
    formArea.scrollIntoView({ behavior: "smooth", block: "start" });
    formArea.innerHTML = `
      <div class="form-shell reveal">
        <div class="section-head" style="margin-bottom:30px">
          <span class="eyebrow">${kind === "book" ? "Reserve Your Vehicle" : "Schedule Test Drive"}</span>
          <h2>${kind === "book" ? "Book " + car.name : "Test Drive " + car.name}</h2>
        </div>
        <form id="bk-form">
          <div class="field"><label>Full Name</label><input type="text" name="name" required placeholder="Your name"/></div>
          <div class="field"><label>Phone Number</label><input type="tel" name="phone" required placeholder="+91"/></div>
          <div class="field"><label>Address</label><textarea name="address" required placeholder="Delivery / pickup address"></textarea></div>
          <button type="submit" class="btn btn-solid" style="width:100%">${kind === "book" ? "Confirm Booking" : "Confirm Test Drive"}</button>
        </form>
        <div class="success-banner" id="bk-success">
          ✦ Thank you. Your request for ${car.name} has been received. Our concierge will contact you within 24 hours.
        </div>
      </div>`;
    initReveal();
    document.getElementById("bk-form").addEventListener("submit", (e) => {
      e.preventDefault();
      document.getElementById("bk-success").classList.add("show");
      e.target.reset();
    });
  }
  bookBtn.addEventListener("click", () => openForm("book"));
  tdBtn.addEventListener("click", () => openForm("td"));
}

/* ===========================
   WISHLIST PAGE
   =========================== */
function renderWishlist() {
  const grid = document.getElementById("wishlist-grid");
  const empty = document.getElementById("wishlist-empty");
  const count = document.getElementById("wishlist-count");
  if (!grid) return;
  const cars = (window.CARS || []).filter((c) => isWished(c.id));
  if (count) count.textContent = cars.length;
  if (cars.length === 0) {
    grid.style.display = "none";
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";
  grid.style.display = "";
  grid.innerHTML = cars.map(carCardHTML).join("");
  initReveal(); initTilt(); bindCardActions(grid);

  // Re-render when wishlist state changes
  grid.querySelectorAll("[data-wish]").forEach((btn) => {
    btn.addEventListener("click", () => setTimeout(renderWishlist, 50));
  });
}

/* ===========================
   COMPARE PAGE
   =========================== */
function renderCompare() {
  const wrap = document.getElementById("compare-wrap");
  if (!wrap) return;
  const ids = getCompare();
  const cars = (window.CARS || []).filter((c) => ids.includes(c.id));

  if (cars.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state reveal">
        <div class="ico-big">⇄</div>
        <h3>Your compare list is empty</h3>
        <p>Browse cars and tap "Compare" on any vehicle card to add it here. Compare up to 4 vehicles side-by-side.</p>
        <a href="buy.html" class="btn btn-solid">Browse Cars</a>
      </div>`;
    initReveal();
    return;
  }

  // Build the compare table
  const rows = [
    { lab: "Brand", get: (c) => c.brand },
    { lab: "Type", get: (c) => c.type === "new" ? "New" : `Pre-Owned · ${c.condition}` },
    { lab: "Price", get: (c) => `<strong style="color:var(--gold-bright)">${formatINR(c.price)}</strong>` },
    { lab: "Fuel", get: (c) => c.fuel },
    { lab: "Engine Power", get: (c) => c.hp + " HP" },
    { lab: "Torque", get: (c) => c.torque },
    { lab: "Top Speed", get: (c) => c.topSpeed },
    { lab: "0–100 km/h", get: (c) => c.accel },
    { lab: "Transmission", get: (c) => c.transmission },
    { lab: "Year", get: (c) => c.year || "2026" },
    { lab: "KM Driven", get: (c) => c.type === "used" ? `${(c.kmDriven/1000).toFixed(0)}k km` : "—" },
  ];

  // Highlight best price + lowest 0-100
  const minPrice = Math.min(...cars.map((c) => c.price));
  const maxHP = Math.max(...cars.map((c) => c.hp));

  wrap.innerHTML = `
    <div class="cmp-table reveal">
      <div class="cmp-row cmp-head">
        <div class="cmp-cell lab"></div>
        ${cars.map((c) => `
          <div class="cmp-cell head">
            <button class="cmp-remove" data-rm="${c.id}" title="Remove">✕</button>
            <a href="car-details.html?id=${c.id}">
              <img src="${c.image}" alt="${c.name}"/>
              <div class="n">${c.name}</div>
              <div class="b">${c.brand}</div>
            </a>
          </div>
        `).join("")}
      </div>
      ${rows.map((r) => `
        <div class="cmp-row">
          <div class="cmp-cell lab">${r.lab}</div>
          ${cars.map((c) => {
            let val = r.get(c);
            const isBestPrice = r.lab === "Price" && c.price === minPrice && cars.length > 1;
            const isMaxHP = r.lab === "Engine Power" && c.hp === maxHP && cars.length > 1;
            const cls = (isBestPrice || isMaxHP) ? "cmp-cell best" : "cmp-cell";
            return `<div class="${cls}">${val}${isBestPrice ? ' <span class="best-tag">Best</span>' : ""}${isMaxHP ? ' <span class="best-tag">Max</span>' : ""}</div>`;
          }).join("")}
        </div>
      `).join("")}
    </div>
    <div style="text-align:center;margin-top:40px">
      <button class="btn" id="cmp-clear">Clear All</button>
      <a href="buy.html" class="btn btn-solid">Add More Vehicles</a>
    </div>`;

  wrap.querySelectorAll("[data-rm]").forEach((b) => {
    b.addEventListener("click", () => {
      toggleCompare(Number(b.dataset.rm));
      renderCompare();
    });
  });
  document.getElementById("cmp-clear")?.addEventListener("click", () => {
    saveCompare([]); renderCompare();
  });
  initReveal();
}

/* ===========================
   SELL FORM
   =========================== */
function initSellForm() {
  const form = document.getElementById("sell-form");
  if (!form) return;
  const upload = document.getElementById("upload-zone");
  const fileIn = document.getElementById("car-image");
  if (upload && fileIn) {
    upload.addEventListener("click", () => fileIn.click());
    fileIn.addEventListener("change", () => {
      if (fileIn.files && fileIn.files[0]) {
        upload.querySelector(".hint").textContent = `✓ Selected: ${fileIn.files[0].name}`;
      }
    });
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("sell-success").classList.add("show");
    form.reset();
    if (upload) upload.querySelector(".hint").textContent = "Click to upload — JPG, PNG up to 5MB";
  });
}

function initBookingForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("booking-success").classList.add("show");
    form.reset();
  });
}

/* ===========================
   STATS counter
   =========================== */
function initStats() {
  const nums = document.querySelectorAll(".stat .num[data-target]");
  if (nums.length === 0) return;
  if (!("IntersectionObserver" in window)) {
    nums.forEach((n) => (n.textContent = n.dataset.target));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.target);
        const suffix = el.dataset.suffix || "";
        const duration = 1600;
        const start = performance.now();
        function tick(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const v = Math.floor(target * eased);
          el.textContent = v.toLocaleString("en-IN") + suffix;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  nums.forEach((n) => io.observe(n));
}

function initHeroParallax() {
  const rings = document.querySelector(".hero-rings");
  if (!rings) return;
  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    rings.style.transform = `translate(calc(-50% + ${x}px), calc(-45% + ${y}px))`;
  });
}

/* ===========================
   ADMIN
   =========================== */
function initAdmin() {
  const loginCard = document.getElementById("login-card");
  const dashboard = document.getElementById("dashboard");
  if (!loginCard || !dashboard) return;

  const isLoggedIn = sessionStorage.getItem("aurum_admin") === "1";
  if (isLoggedIn) showDashboard();

  document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = document.getElementById("u").value.trim();
    const p = document.getElementById("p").value.trim();
    const err = document.getElementById("err");
    if (u === "admin" && p === "1234") {
      sessionStorage.setItem("aurum_admin", "1");
      err.textContent = "";
      showDashboard();
    } else {
      err.textContent = "Invalid credentials. Try admin / 1234";
    }
  });

  document.getElementById("logout-btn")?.addEventListener("click", () => {
    sessionStorage.removeItem("aurum_admin");
    location.reload();
  });

  function showDashboard() {
    loginCard.style.display = "none";
    dashboard.style.display = "block";
    const cars = window.CARS || [];
    const newCount = cars.filter((c) => c.type === "new").length;
    const usedCount = cars.filter((c) => c.type === "used").length;
    const totalValue = cars.reduce((sum, c) => sum + c.price, 0);
    document.getElementById("d-total").textContent = cars.length;
    document.getElementById("d-new").textContent = newCount;
    document.getElementById("d-used").textContent = usedCount;
    document.getElementById("d-value").textContent = formatINR(totalValue);

    const tbody = document.getElementById("admin-tbody");
    tbody.innerHTML = cars
      .map(
        (c) => `
        <tr>
          <td>#${String(c.id).padStart(3, "0")}</td>
          <td>${c.name}</td>
          <td>${c.brand}</td>
          <td>${c.fuel}</td>
          <td><span class="chip">${c.type === "new" ? "New" : "Used"}</span></td>
          <td style="color:var(--gold-bright);font-weight:600">${formatINR(c.price)}</td>
        </tr>`
      )
      .join("");

    document.getElementById("add-car-btn")?.addEventListener("click", () => {
      document.getElementById("add-car-modal").classList.add("show");
    });
    document.getElementById("add-car-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const newCar = {
        id: cars.length + 1,
        name: fd.get("name"),
        brand: fd.get("brand"),
        price: Number(fd.get("price")),
        fuel: fd.get("fuel"),
        type: "new",
        hp: 500, torque: "—", topSpeed: "—", accel: "—",
        transmission: "Auto", year: new Date().getFullYear(),
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
        gallery: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80"],
        desc: "Newly added vehicle awaiting full specifications.",
      };
      cars.push(newCar);
      showDashboard();
      document.getElementById("add-car-modal").classList.remove("show");
      e.target.reset();
    });
    document.getElementById("close-modal")?.addEventListener("click", () => {
      document.getElementById("add-car-modal").classList.remove("show");
    });
  }
}

/* ===========================
   BOOT
   =========================== */
function safeRun(name, fn) {
  try { fn(); } catch (e) { console.error("[Aurum] " + name + " failed:", e); }
}
document.addEventListener("DOMContentLoaded", () => {
  safeRun("initNav", initNav);
  safeRun("initSearch", initSearch);
  safeRun("updateBadges", updateBadges);
  safeRun("initStats", initStats);
  safeRun("initHeroParallax", initHeroParallax);
  // Render dynamic content FIRST so initReveal can observe newly created .reveal nodes
  safeRun("renderFeatured", renderFeatured);
  safeRun("renderBuy", renderBuy);
  safeRun("renderUsed", renderUsed);
  safeRun("renderDetails", renderDetails);
  safeRun("renderWishlist", renderWishlist);
  safeRun("renderCompare", renderCompare);
  safeRun("initSellForm", initSellForm);
  safeRun("initBookingForm", initBookingForm);
  safeRun("initAdmin", initAdmin);
  safeRun("initReveal", initReveal);
});
