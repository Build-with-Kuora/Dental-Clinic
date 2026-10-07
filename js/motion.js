/* Capizonda Dental Clinic: motion graphic video (GSAP timeline in a scalable 1280x720 stage) */
(function () {
  "use strict";

  var mg = document.getElementById("mg");
  var viewport = document.getElementById("mg-viewport");
  var stage = document.getElementById("mg-stage");
  if (!mg || !stage) return;

  // ---------- Fit the fixed-size stage into any viewport ----------
  // Stage is 1280x720 (landscape) or 720x900 on phones, set in CSS.
  function fit() {
    var bw = stage.offsetWidth, bh = stage.offsetHeight;
    var w = viewport.clientWidth, h = viewport.clientHeight;
    var s = Math.min(w / bw, h / bh);
    var x = (w - bw * s) / 2, y = (h - bh * s) / 2;
    stage.style.transform = "translate(" + x + "px," + y + "px) scale(" + s + ")";
  }
  fit();
  if ("ResizeObserver" in window) new ResizeObserver(fit).observe(viewport);
  else window.addEventListener("resize", fit);

  var gsap = window.gsap;
  if (!gsap) {
    // CDN unavailable: show the final "Book today" frame as a static poster.
    mg.classList.add("is-static");
    mg.querySelector(".mg-controls").hidden = true;
    return;
  }

  // ---------- Prep ----------
  var word = stage.querySelector("[data-split]");
  word.innerHTML = word.textContent.split("").map(function (c) { return "<span>" + c + "</span>"; }).join("");

  var smile = stage.querySelector(".s2-smile path");
  var smileLen = smile.getTotalLength();
  gsap.set(smile, { strokeDasharray: smileLen, strokeDashoffset: smileLen });

  var ring = stage.querySelector(".s4-ring circle");
  var ringLen = 2 * Math.PI * 190;
  gsap.set(ring, { strokeDasharray: ringLen, strokeDashoffset: ringLen });

  gsap.set(".s1-crown", { transformOrigin: "12% 10%" });
  gsap.set(".s6-pill", { transformOrigin: "50% 50%" });

  var CHAPTERS = [
    { t: 0, name: "Intro" },
    { t: 4.9, name: "Your smile is our passion" },
    { t: 9.3, name: "Modern technology" },
    { t: 14, name: "Meet Dr. Capizonda" },
    { t: 18.8, name: "Visit us" },
    { t: 23.2, name: "Book today" }
  ];

  // ---------- Timeline ----------
  var tl = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: "power3.out" }, onUpdate: onUpdate });

  // Scene 1: logo builds itself
  tl.fromTo(".mg-fade", { opacity: 1 }, { opacity: 0, duration: 0.6, ease: "none" }, 0)
    .set(".s1", { autoAlpha: 1 }, 0)
    .fromTo(".mg-bg-glow", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: "power2.out" }, 0)
    .fromTo(".s1-tooth", { y: 90, scale: 0.55, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 1, ease: "back.out(1.7)" }, 0.2)
    .fromTo(".s1-swoosh", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut" }, 0.85)
    .fromTo(".s1-crown", { y: -320, rotation: -50, autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, duration: 0.9, ease: "bounce.out" }, 1.1)
    .fromTo(".spark", { scale: 0, rotation: -90, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.4, stagger: 0.07, ease: "back.out(3)" }, 1.75)
    .to(".spark", { scale: 0, autoAlpha: 0, duration: 0.4, stagger: 0.05, ease: "power2.in" }, 2.6)
    .fromTo(".s1-word span", { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.045 }, 1.9)
    .fromTo(".s1-sub", { letterSpacing: "0.7em", autoAlpha: 0 }, { letterSpacing: "0.18em", autoAlpha: 1, duration: 1 }, 2.5)
    .to(".s1-mark", { y: -10, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 1 }, 2.6)
    .to(".s1", { autoAlpha: 0, scale: 0.92, y: -20, duration: 0.6, ease: "power2.in" }, 4.3);

  // Scene 2: tagline
  tl.set(".s2", { autoAlpha: 1 }, 4.9)
    .fromTo(".s2", { scale: 1 }, { scale: 1.04, duration: 4.4, ease: "none" }, 4.9)
    .fromTo(".s2-eyebrow", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 5.0)
    .fromTo(".s2-l1", { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "power4.out" }, 5.15)
    .fromTo(".s2-l2", { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "power4.out" }, 5.4)
    .to(smile, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, 6.0)
    .to([".s2-l1", ".s2-l2"], { yPercent: -110, duration: 0.5, stagger: 0.08, ease: "power3.in" }, 8.6)
    .to([".s2-eyebrow", ".s2-smile"], { autoAlpha: 0, duration: 0.4 }, 8.7)
    .set(".s2", { autoAlpha: 0 }, 9.3);

  // Scene 3: technology
  tl.set(".s3", { autoAlpha: 1 }, 9.3)
    .fromTo(".s3-title", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, 9.35)
    .fromTo(".s3-card", { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.15, ease: "back.out(1.4)" }, 9.7)
    .fromTo(".s3-icon", { scale: 0 }, { scale: 1, duration: 0.6, stagger: 0.15, ease: "back.out(2.5)" }, 9.9)
    .to(".s3-icon", { scale: 1.1, duration: 0.3, stagger: 0.25, yoyo: true, repeat: 1, ease: "sine.inOut" }, 11.4)
    .to(".s3-card", { y: -40, autoAlpha: 0, duration: 0.45, stagger: 0.08, ease: "power2.in" }, 13.4)
    .to(".s3-title", { autoAlpha: 0, duration: 0.4 }, 13.5)
    .set(".s3", { autoAlpha: 0 }, 14);

  // Scene 4: the dentist
  tl.set(".s4", { autoAlpha: 1 }, 14)
    .to(ring, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, 14.1)
    .fromTo(".s4-img", { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(50% at 50% 50%)", duration: 0.9 }, 14.3)
    .fromTo(".s4-img img", { scale: 1.3 }, { scale: 1, duration: 1.4 }, 14.3)
    .fromTo(".s4-eyebrow", { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5 }, 14.6)
    .fromTo(".s4-name", { clipPath: "inset(-20% 100% -20% -5%)" }, { clipPath: "inset(-20% -5% -20% -5%)", duration: 1.1, ease: "power2.inOut" }, 14.8)
    .fromTo(".s4-list li", { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, stagger: 0.15 }, 15.6)
    .to(".s4", { autoAlpha: 0, y: -20, duration: 0.5, ease: "power2.in" }, 18.2);

  // Scene 5: visit info
  tl.set(".s5", { autoAlpha: 1 }, 18.8)
    .fromTo(".s5-title", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, 18.85)
    .fromTo(".s5-photo", { clipPath: "inset(100% 0% 0% 0% round 32px)" }, { clipPath: "inset(0% 0% 0% 0% round 32px)", duration: 1, ease: "power3.inOut" }, 19.0)
    .fromTo(".s5-photo img", { scale: 1.25 }, { scale: 1.05, duration: 4, ease: "none" }, 19.0)
    .fromTo(".s5-row", { x: -60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, stagger: 0.2 }, 19.1)
    .fromTo(".s5-ic", { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.6, stagger: 0.2, ease: "back.out(2)" }, 19.2)
    .to(".s5", { autoAlpha: 0, scale: 0.96, duration: 0.5, ease: "power2.in" }, 22.7);

  // Scene 6: call to action
  tl.set(".s6", { autoAlpha: 1 }, 23.2)
    .fromTo(".s6-mark", { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(2)" }, 23.3)
    .fromTo(".s6-pill", { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.7, ease: "power4.out" }, 23.8)
    .fromTo(".s6-pill span", { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 24.2)
    .fromTo(".s6-meta", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 24.6)
    .to(".s6-pill", { scale: 1.05, duration: 0.4, yoyo: true, repeat: 1, ease: "sine.inOut" }, 25.3)
    .to(".mg-fade", { opacity: 1, duration: 0.8, ease: "none" }, 26.7);

  var DURATION = tl.duration();

  // ---------- Controls ----------
  var playBtn = document.getElementById("mg-play");
  var restartBtn = document.getElementById("mg-restart");
  var bigPlay = document.getElementById("mg-bigplay");
  var seek = document.getElementById("mg-seek");
  var timeEl = document.getElementById("mg-time");
  var captionEl = document.getElementById("mg-caption");
  var fsBtn = document.getElementById("mg-fs");
  var chaptersEl = document.getElementById("mg-chapters");

  var userPaused = false;
  var inView = false;
  var scrubbing = false;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  chaptersEl.innerHTML = CHAPTERS.slice(1).map(function (c) {
    return '<i style="left:' + (c.t / DURATION * 100).toFixed(2) + '%"></i>';
  }).join("");

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    return Math.floor(sec / 60) + ":" + (sec % 60 < 10 ? "0" : "") + (sec % 60);
  }

  var lastChapter = -1;
  function onUpdate() {
    var t = tl.time();
    var p = t / DURATION;
    if (!scrubbing) seek.value = Math.round(p * 1000);
    seek.style.setProperty("--p", (p * 100).toFixed(2) + "%");
    timeEl.textContent = fmt(t) + " / " + fmt(DURATION);
    var idx = 0;
    for (var i = 0; i < CHAPTERS.length; i++) if (t >= CHAPTERS[i].t) idx = i;
    if (idx !== lastChapter) { lastChapter = idx; captionEl.textContent = CHAPTERS[idx].name; }
  }

  function setPausedUI(paused) {
    mg.classList.toggle("is-paused", paused);
    // Big play button only when the viewer paused it (or reduced motion), not on auto-pause off-screen
    mg.classList.toggle("show-play", paused && (userPaused || reduceMotion));
    playBtn.setAttribute("aria-label", paused ? "Play video" : "Pause video");
  }
  function play() { tl.play(); setPausedUI(false); }
  function pause() { tl.pause(); setPausedUI(true); }

  function autoState() {
    if (userPaused || reduceMotion || document.hidden || !inView) {
      tl.pause();
      setPausedUI(true);
    } else {
      play();
    }
  }

  playBtn.addEventListener("click", function () {
    if (tl.paused()) { userPaused = false; reduceMotion = false; play(); }
    else { userPaused = true; pause(); }
  });
  bigPlay.addEventListener("click", function (e) {
    e.stopPropagation();
    userPaused = false; reduceMotion = false; play();
  });
  viewport.addEventListener("click", function () { playBtn.click(); });
  restartBtn.addEventListener("click", function () {
    userPaused = false; reduceMotion = false;
    tl.restart(); setPausedUI(false);
  });

  var wasPlaying = false;
  seek.addEventListener("pointerdown", function () { scrubbing = true; wasPlaying = !tl.paused(); tl.pause(); });
  seek.addEventListener("input", function () {
    tl.progress(seek.value / 1000);
    onUpdate();
  });
  seek.addEventListener("change", function () {
    scrubbing = false;
    if (wasPlaying) play(); else setPausedUI(true);
  });

  // Fullscreen (hidden where unsupported, e.g. iPhone Safari for non-video elements)
  var fsEnabled = document.fullscreenEnabled || document.webkitFullscreenEnabled;
  if (!fsEnabled) fsBtn.hidden = true;
  fsBtn.addEventListener("click", function () {
    var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (fsEl) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (viewport.requestFullscreen || viewport.webkitRequestFullscreen).call(viewport);
  });

  // Autoplay only while visible, pause when tab is hidden
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      autoState();
    }, { threshold: 0.35 }).observe(viewport);
  } else {
    inView = true;
  }
  document.addEventListener("visibilitychange", autoState);

  // Start once fonts are ready so the first frames render with brand type
  var started = false;
  function start() {
    if (started) return;
    started = true;
    if (reduceMotion) tl.time(3.6); // show a finished logo frame, wait for the user to press play
    else tl.time(0);
    onUpdate();
    autoState();
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
    setTimeout(start, 1500);
  } else {
    start();
  }
})();
