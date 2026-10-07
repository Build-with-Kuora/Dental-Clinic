/* Capizonda Dental Clinic: site behavior (nav, reveals, hours, mobile bar, toast) */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  // ---------- Mobile nav ----------
  var header = document.querySelector(".site-header");
  var nav = document.getElementById("site-nav");
  var toggle = document.getElementById("nav-toggle");

  function setNav(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", function () {
    setNav(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setNav(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  // ---------- Header + mobile bar on scroll ----------
  var mobileBar = document.getElementById("mobile-bar");
  var hero = document.querySelector(".hero");
  var booking = document.getElementById("book");
  var bookingVisible = false;

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 10);
    var pastHero = y > hero.offsetHeight * 0.6;
    mobileBar.classList.toggle("is-visible", pastHero && !bookingVisible);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      bookingVisible = entries[0].isIntersecting;
      onScroll();
    }, { threshold: 0.15 }).observe(booking);
  }
  onScroll();

  // ---------- Active nav link ----------
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]:not(.btn)'));
  if ("IntersectionObserver" in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) {
      var target = document.querySelector(a.getAttribute("href"));
      if (target) sectionObs.observe(target);
    });
  }

  // ---------- Reveal on scroll ----------
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      revealObs.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // ---------- Open now (Philippine time, UTC+8) ----------
  var openEl = document.getElementById("open-now");
  function phNow() {
    var now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 8 * 3600000);
  }
  function updateOpen() {
    var d = phNow();
    var day = d.getDay();
    var mins = d.getHours() * 60 + d.getMinutes();
    var row = document.querySelector('.hours tr[data-day="' + day + '"]');
    document.querySelectorAll(".hours tr").forEach(function (tr) { tr.classList.remove("is-today"); });
    if (row) row.classList.add("is-today");

    var open = day !== 0 && mins >= 9 * 60 && mins < 17 * 60;
    openEl.classList.toggle("is-open", open);
    openEl.classList.toggle("is-closed", !open);
    if (open) {
      openEl.textContent = "Open now, until 5:00 PM";
    } else if (day === 0) {
      openEl.textContent = "Sunday: by appointment only";
    } else if (mins < 9 * 60) {
      openEl.textContent = "Closed now, opens at 9:00 AM";
    } else {
      openEl.textContent = day === 6 ? "Closed now, opens Monday 9:00 AM" : "Closed now, opens tomorrow 9:00 AM";
    }
  }
  updateOpen();
  setInterval(updateOpen, 60000);

  // ---------- Footer year ----------
  document.getElementById("year").textContent = phNow().getFullYear();

  // ---------- Toast (shared) ----------
  var toastEl = document.getElementById("toast");
  var toastTimer;
  window.cdcToast = function (msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-shown"); }, 3200);
  };
  window.cdcPhNow = phNow;
})();
