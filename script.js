const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealElements.forEach((element) => observer.observe(element));

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ---------------------------------------------------------
   Ambient background animation — a slow, drifting network
   of connected points. Purely decorative (aria-hidden canvas),
   paused for reduced-motion users and when the tab is hidden.
--------------------------------------------------------- */
(() => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  let width, height, dpr;
  let points = [];
  let animationId = null;
  let isVisible = true;

  const ACCENT = "124, 156, 255";
  const LINK_DISTANCE = 150;

  function pointCount() {
    const area = width * height;
    return Math.min(90, Math.max(28, Math.round(area / 22000)));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = pointCount();
    if (points.length < target) {
      while (points.length < target) points.push(makePoint());
    } else {
      points = points.slice(0, target);
    }
  }

  function makePoint() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.4 + 0.6,
    };
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));
    }

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LINK_DISTANCE) {
          const alpha = (1 - dist / LINK_DISTANCE) * 0.35;
          ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of points) {
      ctx.fillStyle = `rgba(${ACCENT}, 0.55)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isVisible) animationId = requestAnimationFrame(step);
  }

  document.addEventListener("visibilitychange", () => {
    isVisible = document.visibilityState === "visible";
    if (isVisible && !animationId) {
      animationId = requestAnimationFrame(step);
    } else if (!isVisible && animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();
  animationId = requestAnimationFrame(step);
})();
