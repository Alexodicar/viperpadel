// ===================================================
//  VIPER PADEL CLUB — main.js
// ===================================================

// -- Popup Liga Pádel --
(function () {
  const overlay = document.getElementById('ligaPopup');
  const closeBtn = document.getElementById('ligaPopupClose');
  if (!overlay || !closeBtn) return;

  function closePopup() {
    overlay.classList.add('hidden');
  }

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePopup();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePopup();
  });
})();

// -- Navbar scroll effect --
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// -- Mobile nav toggle --
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    const isOpen = navLinks.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    spans[1].style.opacity   = isOpen ? '0' : '';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.querySelectorAll('span').forEach(s => {
        s.style.transform = ''; s.style.opacity = '';
      });
    });
  });
}

// -- Scroll-in animations --
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

// -- Particles (only on homepage) --
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = container.offsetWidth;
    H = canvas.height = container.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - .5) * .4;
      this.vy = (Math.random() - .5) * .4;
      this.r  = Math.random() * 1.5 + .5;
      this.a  = Math.random() * .5 + .1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(127,255,0,${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(127,255,0,${0.06 * (1 - dist/100)})`;
          ctx.lineWidth = .5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
}
initParticles();

// -- Hero stats counter (only on homepage) --
window.addEventListener('load', () => {
  document.querySelectorAll('.stat-n').forEach((el, i) => {
    const final = el.textContent;
    const num = parseInt(final.replace(/\D/g, ''));
    if (!num) return;
    let start = 0;
    const step = Math.ceil(num / 40);
    const suffix = final.replace(/\d/g, '');
    const timer = setInterval(() => {
      start = Math.min(start + step, num);
      el.textContent = start + suffix;
      if (start >= num) clearInterval(timer);
    }, 40 + i * 10);
  });
});

// -- Form submission (only on reservar page) --
const reserveForm = document.getElementById('reserveForm');
if (reserveForm) {
  reserveForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const nombre   = (this.nombre.value   || '').trim();
    const fecha    = (this.fecha.value    || '').trim();
    const hora     = (this.hora.value     || '').trim();
    const cancha   = (this.cancha.value   || '').trim();
    const whatsapp = (this.whatsapp.value || '').trim();

    // Formatear fecha legible: 2026-03-06 → 06/03/2026
    let fechaLegible = fecha;
    if (fecha) {
      const [y, m, d] = fecha.split('-');
      fechaLegible = `${d}/${m}/${y}`;
    }

    const mensaje =
      `¡Hola! Quiero confirmar mi reserva en Viper Pádel Club 🎾\n\n` +
      `👤 Nombre: ${nombre}\n` +
      `📅 Fecha: ${fechaLegible}\n` +
      `⏰ Hora: ${hora}\n` +
      `🏟️ Cancha: ${cancha}\n` +
      `📱 Mi WhatsApp: ${whatsapp}`;

    const numero = '525638357341'; // +52 56 3835 7341
    const url    = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
  });
}
