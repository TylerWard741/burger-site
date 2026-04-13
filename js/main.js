/* ============================================================
   STACK & SONS BURGERS — MAIN JAVASCRIPT
   Handles: mobile menu toggle, sticky nav on scroll,
            and smooth scrolling for all anchor links.
   ============================================================ */

(function () {
  'use strict';

  /* ── Element References ──────────────────────────────────── */
  const navbar     = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const menuIcon   = document.getElementById('menuIcon');
  const mobileMenu = document.getElementById('mobileMenu');

  /* ============================================================
     1. STICKY NAV — changes appearance on scroll
     Adds `.navbar--scrolled` once the user scrolls past the
     hero, giving the transparent nav a solid dark background.
  ============================================================ */
  const SCROLL_THRESHOLD = 80; // px before nav changes state

  function handleNavScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  }

  // Run once on load (in case page is refreshed mid-scroll)
  handleNavScroll();

  // Listen for scroll — wrapped in requestAnimationFrame for performance
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        handleNavScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });


  /* ============================================================
     2. MOBILE MENU TOGGLE
     Opens/closes the mobile nav drawer and swaps the icon
     between a hamburger (ph-list) and an X (ph-x).
  ============================================================ */
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    mobileMenu.classList.add('navbar__mobile--open');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    // Swap icon: list → x
    menuIcon.className = 'ph ph-x';
    // Always show the solid nav background when menu is open
    navbar.classList.add('navbar--scrolled');
  }

  function closeMenu() {
    menuOpen = false;
    mobileMenu.classList.remove('navbar__mobile--open');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    // Swap icon: x → list
    menuIcon.className = 'ph ph-list';
    // Re-evaluate scroll position to decide if nav should stay solid
    handleNavScroll();
  }

  menuToggle.addEventListener('click', function () {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close the menu if a mobile nav link is clicked
  const mobileLinks = mobileMenu.querySelectorAll('.navbar__mobile-link, .navbar__mobile-cta');
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close the menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) {
      closeMenu();
      menuToggle.focus(); // Return focus to toggle for accessibility
    }
  });

  // Close the menu if the user clicks outside the navbar
  document.addEventListener('click', function (e) {
    if (menuOpen && !navbar.contains(e.target)) {
      closeMenu();
    }
  });


  /* ============================================================
     3. SMOOTH SCROLLING FOR NAV LINKS
     Intercepts clicks on anchor links (#section) and scrolls
     smoothly, accounting for the fixed navbar height.
  ============================================================ */
  const NAV_OFFSET = 72; // Match --navbar-h CSS variable

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');

      // Skip if it's just "#" with no target
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });

      // Update the URL hash without jumping
      history.pushState(null, '', targetId);
    });
  });


  /* ============================================================
     4. COUNT-UP ANIMATION — "15+" stat in Our Story section
     Triggers via IntersectionObserver every time the element
     enters the viewport (threshold 0.1). Leaving the viewport
     resets the counter so the next entry always replays from 0.

     Easing: easeOutQuart — fast start, dramatic slow finish.
     Suffix "+": opacity 0 the entire count, snaps to 1 at the end.
  ============================================================ */
  (function () {
    var countEl  = document.querySelector('.story__stat-count');
    var suffixEl = document.querySelector('.story__stat-suffix');

    // Bail gracefully if the elements aren't present
    if (!countEl || !suffixEl) return;

    var TARGET   = 15;
    var DURATION = 2500; // ms — total animation time

    // easeOutCubic: f(t) = 1 - (1-t)^3
    // Produces a fast initial surge that decelerates near the target,
    // making each final digit feel intentionally slow and weighty.
    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 1);
    }

    var rafId     = null; // rAF handle; null = no animation running
    var startTime = null; // timestamp set on the first tick

    // Stop any running animation and return the element to its initial state
    function reset() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      startTime = null;
      countEl.textContent    = '0';
      suffixEl.style.opacity = '0';
    }

    // Called once per frame while the animation is running
    function tick(now) {
      // Capture start time on the very first frame
      if (startTime === null) startTime = now;

      var elapsed  = now - startTime;
      var progress = Math.min(elapsed / DURATION, 1); // 0 → 1, clamped
      var eased    = easeOutQuart(progress);
      var value    = Math.floor(eased * TARGET);

      countEl.textContent = value;

      if (progress < 1) {
        // Keep going
        rafId = requestAnimationFrame(tick);
      } else {
        // Animation complete — snap to exact target, reveal the suffix instantly
        countEl.textContent    = TARGET;
        suffixEl.style.opacity = '1';
        rafId = null;
      }
    }

    function startAnimation() {
      reset();                             // wipe any previous run first
      rafId = requestAnimationFrame(tick); // kick off the first frame
    }

    // threshold: 0.1 — fires as soon as even 10% of the element is visible
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          startAnimation(); // entering viewport → play from 0
        } else {
          reset();          // leaving viewport → reset so next entry replays
        }
      });
    }, { threshold: 0.1 });

    observer.observe(countEl);
  }());

})();
