/* ===========================
   Aurum Motors — Three.js 3D scenes
   Loaded after THREE is available globally (via CDN)
   =========================== */

(function () {
  if (typeof THREE === "undefined") return;

  /* ===== HERO SCENE: floating gold particles + glowing torus knot ===== */
  function initHeroScene() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    // ---- Glowing centerpiece: a torus knot in gold ----
    const knotGeo = new THREE.TorusKnotGeometry(7, 1.6, 220, 32, 2, 3);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    scene.add(knot);

    // ---- Inner glow sphere ----
    const innerGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xf5d061,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    scene.add(inner);

    // ---- Outer ring ----
    const ringGeo = new THREE.TorusGeometry(13, 0.05, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37, transparent: true, opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    const ring2 = new THREE.Mesh(ringGeo, ringMat.clone());
    ring2.rotation.x = Math.PI / 3;
    const ring3 = new THREE.Mesh(ringGeo, ringMat.clone());
    ring3.rotation.x = -Math.PI / 3;
    scene.add(ring1, ring2, ring3);

    // ---- Floating gold particles ----
    const particleCount = 380;
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 80;
      positions[i*3+1] = (Math.random() - 0.5) * 60;
      positions[i*3+2] = (Math.random() - 0.5) * 60;
      speeds[i] = 0.005 + Math.random() * 0.02;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xf5d061, size: 0.18, transparent: true, opacity: 0.9, sizeAttenuation: true,
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // ---- Pointer-driven camera tilt ----
    let targetX = 0, targetY = 0;
    window.addEventListener("mousemove", (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    });

    const clock = new THREE.Clock();
    function tick() {
      const dt = clock.getDelta();
      const t = clock.elapsedTime;

      knot.rotation.x += dt * 0.18;
      knot.rotation.y += dt * 0.22;
      inner.rotation.x -= dt * 0.45;
      inner.rotation.y += dt * 0.30;

      ring1.rotation.z += dt * 0.12;
      ring2.rotation.z -= dt * 0.08;
      ring3.rotation.y += dt * 0.10;

      // particle drift
      const arr = pGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        arr[i*3+1] += speeds[i];
        if (arr[i*3+1] > 30) arr[i*3+1] = -30;
        arr[i*3]   += Math.sin(t + i) * 0.005;
      }
      pGeo.attributes.position.needsUpdate = true;

      // camera follow
      camera.position.x += (targetX * 6 - camera.position.x) * 0.04;
      camera.position.y += (-targetY * 4 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ===== AMBIENT BACKGROUND SCENE: subtle gold dust over whole page ===== */
  function initAmbientScene() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 200);
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    const count = 220;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 120;
      positions[i*3+1] = (Math.random() - 0.5) * 90;
      positions[i*3+2] = (Math.random() - 0.5) * 80;
      speeds[i] = 0.003 + Math.random() * 0.01;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xd4af37, size: 0.22, transparent: true, opacity: 0.55, sizeAttenuation: true,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    let scrollY = 0;
    window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

    function tick() {
      const arr = geo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        arr[i*3+1] += speeds[i];
        if (arr[i*3+1] > 45) arr[i*3+1] = -45;
      }
      geo.attributes.position.needsUpdate = true;
      pts.rotation.y = scrollY * 0.0003;
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();
  }

  function boot() {
    try { initHeroScene(); } catch (e) { /* WebGL unavailable — silent fallback */ }
    try { initAmbientScene(); } catch (e) { /* WebGL unavailable — silent fallback */ }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
