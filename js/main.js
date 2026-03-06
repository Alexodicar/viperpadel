// ═══════════════════════════════════════════════════
//  VIPER PÁDEL CLUB — main.js
// ═══════════════════════════════════════════════════

// ── Navbar scroll effect ──────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Mobile nav toggle ─────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

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

// ── Scroll-in animations ──────────────────────────
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

// ── Particles ─────────────────────────────────────
function initParticles() {
  const canvas = document.createElement('canvas');
  const container = document.getElementById('particles');
  if (!container) return;
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
    // draw connections
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

// ── Active nav link on scroll ─────────────────────
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navItems.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--green)' : '';
  });
}, { passive: true });

// ── Form submission ───────────────────────────────
document.querySelector('.reserve-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const btn = this.querySelector('button[type="submit"]');
  const nombre = this.querySelector('input[type="text"]').value.trim();
  const fecha = this.querySelector('input[type="date"]').value;
  const hora = this.querySelectorAll('select')[0].value;
  const cancha = this.querySelectorAll('select')[1].value;
  const whatsapp = this.querySelector('input[type="tel"]').value.trim();

  const reserva = { nombre, fecha, hora, cancha, whatsapp, createdAt: new Date().toISOString() };
  localStorage.setItem('viper_last_reserva', JSON.stringify(reserva));

  const originalText = btn.textContent;
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  try {
    const res = await fetch('/.netlify/functions/reserve-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reserva),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'No se pudo procesar la reserva');

    btn.textContent = '✅ Reserva confirmada';
    btn.style.background = '#5abf00';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.disabled = false;
      this.reset();
    }, 3000);
  } catch (err) {
    btn.textContent = '⚠️ Error al enviar';
    btn.style.background = '#c0392b';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.disabled = false;
    }, 3500);
  }
});

// ── Smooth reveal for hero stats ──────────────────
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

  const eventModal = document.getElementById('eventModal');
  const closeBtn = document.getElementById('eventModalClose');
  const dismissBtn = document.getElementById('eventModalDismiss');
  const backdrop = document.getElementById('eventModalBackdrop');

  if (eventModal) {
    eventModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    const closeModal = () => {
      eventModal.classList.remove('open');
      document.body.style.overflow = '';
    };

    closeBtn?.addEventListener('click', closeModal);
    dismissBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }
});
