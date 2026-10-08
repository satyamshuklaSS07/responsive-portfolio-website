// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
nav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Contact form validation
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

function setError(input, message) {
  document.getElementById(input.id + '-error').textContent = message;
  input.classList.toggle('invalid', Boolean(message));
  input.setAttribute('aria-invalid', Boolean(message));
}

function validate(input) {
  const value = input.value.trim();
  if (!value) return setError(input, 'This field is required.'), false;
  if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return setError(input, 'Enter a valid email, like name@example.com.'), false;
  if (input.id === 'message' && value.length < 10)
    return setError(input, 'Write at least 10 characters.'), false;
  setError(input, '');
  return true;
}

const fields = [...form.querySelectorAll('input, textarea')];
fields.forEach((f) => f.addEventListener('blur', () => validate(f)));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = '';
  status.style.color = '';
  const results = fields.map(validate);
  if (!results.every(Boolean)) {
    fields.find((f) => f.classList.contains('invalid')).focus();
    return;
  }
  const endpoint = form.dataset.endpoint;
  if (endpoint.includes('YOUR_FORM_ID')) {
    status.style.color = '#b3261e';
    status.textContent = 'Form is not connected yet. Add your Formspree ID in index.html.';
    return;
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    });
    if (!res.ok) throw new Error('Request failed');
    status.textContent = 'Message sent. Thanks for reaching out!';
    form.reset();
  } catch (err) {
    status.style.color = '#b3261e';
    status.textContent = 'Could not send the message. Please try again.';
  }
});

// ---------- animations ----------
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Typing effect in hero
const typed = document.querySelector('.typed');
const words = JSON.parse(typed.dataset.words);
if (reduce) {
  typed.textContent = words[0];
} else {
  let w = 0, i = 0, deleting = false;
  (function type() {
    const word = words[w];
    typed.textContent = word.slice(0, i);
    let delay = deleting ? 40 : 90;
    if (!deleting && i === word.length) { deleting = true; delay = 1600; }
    else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
    i += deleting ? -1 : 1;
    setTimeout(type, delay);
  })();
}

// Reveal elements as they scroll into view
const items = document.querySelectorAll('.section h2, .section > p, .about-grid > *, .skills li, .card, .timeline li, form');
items.forEach((el, n) => {
  el.classList.add('reveal');
  el.style.setProperty('--d', (n % 4) * 0.1 + 's');
});
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.15 });
items.forEach((el) => revealObs.observe(el));

// Highlight the nav link of the section on screen
const links = document.querySelectorAll('nav a');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach((s) => sectionObs.observe(s));

// Scroll progress bar
const bar = document.querySelector('.progress');
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
}, { passive: true });


// ---------- 3D hero scene (three.js) ----------
(function () {
  const canvas = document.getElementById('scene');
  if (!canvas || typeof THREE === 'undefined') return;
  const hero = document.getElementById('home');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 8;

  scene.add(new THREE.AmbientLight(0x8899ff, 0.7));
  const blue = new THREE.PointLight(0x5b8cff, 2.2, 40); blue.position.set(5, 5, 6);
  const gold = new THREE.PointLight(0xffc233, 1.8, 40); gold.position.set(-5, -3, 4);
  scene.add(blue, gold);

  const group = new THREE.Group();
  scene.add(group);
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.5, 0),
    new THREE.MeshStandardMaterial({ color: 0x5b8cff, flatShading: true, metalness: 0.6, roughness: 0.3 })
  );
  const ring = new THREE.Mesh(
    new THREE.TorusKnotGeometry(2.5, 0.04, 220, 12, 2, 3),
    new THREE.MeshBasicMaterial({ color: 0xffc233 })
  );
  group.add(core, ring);

  const geos = [new THREE.OctahedronGeometry(0.28), new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.TetrahedronGeometry(0.3)];
  const minis = [];
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(geos[i % 3], new THREE.MeshStandardMaterial({
      color: i % 2 ? 0xffc233 : 0x7a9bff, flatShading: true, metalness: 0.4, roughness: 0.4 }));
    const a = Math.random() * Math.PI * 2, r = 3.2 + Math.random() * 1.8;
    m.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 5, Math.sin(a) * r * 0.6);
    m.userData = { s: 0.2 + Math.random() * 0.6, o: Math.random() * 6 };
    minis.push(m); group.add(m);
  }

  const N = 350, pos = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) pos[i] = (Math.random() - 0.5) * 22;
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x9db4ff, size: 0.04 }));
  scene.add(dust);

  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    group.position.x = w > 860 ? 2.8 : 0;
    group.scale.setScalar(w > 860 ? 1 : 0.75);
  }
  resize();
  addEventListener('resize', resize);

  let mx = 0, my = 0, visible = true;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    core.rotation.x = t * 0.35; core.rotation.y = t * 0.5;
    ring.rotation.x = t * 0.15; ring.rotation.z = t * 0.2;
    minis.forEach((m) => {
      m.rotation.x += 0.01 * m.userData.s * 3; m.rotation.y += 0.012;
      m.position.y += Math.sin(t * m.userData.s + m.userData.o) * 0.003;
    });
    dust.rotation.y = t * 0.02;
    group.rotation.y += (mx * 0.5 - group.rotation.y) * 0.05;
    group.rotation.x += (my * 0.3 - group.rotation.x) * 0.05;
    renderer.render(scene, camera);
  }
  if (reduce) renderer.render(scene, camera); else frame();
})();

// ---------- 3D tilt on project cards ----------
if (!reduce) {
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = 'perspective(800px) rotateX(' + ((0.5 - y) * 14) + 'deg) rotateY(' + ((x - 0.5) * 16) + 'deg) translateZ(10px)';
      card.style.setProperty('--gx', x * 100 + '%');
      card.style.setProperty('--gy', y * 100 + '%');
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}
