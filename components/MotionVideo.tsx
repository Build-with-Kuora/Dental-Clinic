"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PHONE_PATH } from "./icons";

// Motion graphic "video": a GSAP timeline on a fixed-size stage (1280x720, or 720x900 on
// phones via CSS) that is scaled to fit its frame, so it renders crisp at any size.

const CHAPTERS = [
  { t: 0, name: "Intro" },
  { t: 4.9, name: "Your smile is our passion" },
  { t: 9.3, name: "Modern technology" },
  { t: 14, name: "Meet Dr. Capizonda" },
  { t: 18.8, name: "Visit us" },
  { t: 23.2, name: "Book today" },
];

const fmt = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${s % 60 < 10 ? "0" : ""}${s % 60}`;
};

export function MotionVideo() {
  const mgRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);
  const bigPlayRef = useRef<HTMLButtonElement>(null);
  const seekRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const fsRef = useRef<HTMLButtonElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mg = mgRef.current!;
    const viewport = viewportRef.current!;
    const stage = stageRef.current!;
    const playBtn = playRef.current!;
    const restartBtn = restartRef.current!;
    const bigPlay = bigPlayRef.current!;
    const seek = seekRef.current!;
    const timeEl = timeRef.current!;
    const captionEl = captionRef.current!;
    const fsBtn = fsRef.current!;
    const chaptersEl = chaptersRef.current!;

    // ---------- Fit stage into frame ----------
    const fit = () => {
      const bw = stage.offsetWidth, bh = stage.offsetHeight;
      const w = viewport.clientWidth, h = viewport.clientHeight;
      const s = Math.min(w / bw, h / bh);
      stage.style.transform = `translate(${(w - bw * s) / 2}px,${(h - bh * s) / 2}px) scale(${s})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(viewport);

    let lastChapter = -1;
    let scrubbing = false;
    let userPaused = false;
    let inView = false;
    let reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tl!: gsap.core.Timeline;
    let duration = 0;

    function onUpdate() {
      const t = tl.time();
      const p = t / duration;
      if (!scrubbing) seek.value = String(Math.round(p * 1000));
      seek.style.setProperty("--p", (p * 100).toFixed(2) + "%");
      timeEl.textContent = `${fmt(t)} / ${fmt(duration)}`;
      let idx = 0;
      CHAPTERS.forEach((c, i) => { if (t >= c.t) idx = i; });
      if (idx !== lastChapter) {
        lastChapter = idx;
        captionEl.textContent = CHAPTERS[idx].name;
      }
    }

    // ---------- Timeline (selectors scoped to the stage) ----------
    const ctx = gsap.context(() => {
      const smile = stage.querySelector<SVGPathElement>(".s2-smile path")!;
      const smileLen = smile.getTotalLength();
      gsap.set(smile, { strokeDasharray: smileLen, strokeDashoffset: smileLen });
      const ring = stage.querySelector<SVGCircleElement>(".s4-ring circle")!;
      const ringLen = 2 * Math.PI * 190;
      gsap.set(ring, { strokeDasharray: ringLen, strokeDashoffset: ringLen });
      gsap.set(".s1-crown", { transformOrigin: "12% 10%" });
      gsap.set(".s6-pill", { transformOrigin: "50% 50%" });

      tl = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: "power3.out" }, onUpdate });

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
    }, stage);

    duration = tl.duration();
    chaptersEl.innerHTML = CHAPTERS.slice(1)
      .map((c) => `<i style="left:${((c.t / duration) * 100).toFixed(2)}%"></i>`)
      .join("");

    // ---------- Controls ----------
    const setPausedUI = (paused: boolean) => {
      mg.classList.toggle("is-paused", paused);
      // Big play button only when the viewer paused it (or reduced motion), not on auto-pause off-screen
      mg.classList.toggle("show-play", paused && (userPaused || reduceMotion));
      playBtn.setAttribute("aria-label", paused ? "Play video" : "Pause video");
    };
    const play = () => { tl.play(); setPausedUI(false); };
    const pause = () => { tl.pause(); setPausedUI(true); };
    const autoState = () => {
      if (userPaused || reduceMotion || document.hidden || !inView) {
        tl.pause();
        setPausedUI(true);
      } else {
        play();
      }
    };

    const onPlayClick = () => {
      if (tl.paused()) { userPaused = false; reduceMotion = false; play(); }
      else { userPaused = true; pause(); }
    };
    const onBigPlay = (e: Event) => { e.stopPropagation(); userPaused = false; reduceMotion = false; play(); };
    const onRestart = () => { userPaused = false; reduceMotion = false; tl.restart(); setPausedUI(false); };

    let wasPlaying = false;
    const onSeekDown = () => { scrubbing = true; wasPlaying = !tl.paused(); tl.pause(); };
    const onSeekInput = () => { tl.progress(Number(seek.value) / 1000); onUpdate(); };
    const onSeekChange = () => { scrubbing = false; if (wasPlaying) play(); else setPausedUI(true); };

    type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void; webkitFullscreenEnabled?: boolean };
    type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };
    const doc = document as FsDoc;
    if (!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled)) fsBtn.hidden = true;
    const onFs = () => {
      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc);
      } else {
        const el = viewport as FsEl;
        (el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el);
      }
    };

    playBtn.addEventListener("click", onPlayClick);
    bigPlay.addEventListener("click", onBigPlay);
    viewport.addEventListener("click", onPlayClick);
    restartBtn.addEventListener("click", onRestart);
    seek.addEventListener("pointerdown", onSeekDown);
    seek.addEventListener("input", onSeekInput);
    seek.addEventListener("change", onSeekChange);
    fsBtn.addEventListener("click", onFs);
    document.addEventListener("visibilitychange", autoState);

    // Autoplay only while visible
    const io = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      autoState();
    }, { threshold: 0.35 });

    // Start once fonts are ready so the first frames render with brand type
    let started = false;
    let disposed = false;
    const start = () => {
      if (started || disposed) return;
      started = true;
      tl.time(reduceMotion ? 3.6 : 0); // reduced motion: show a finished logo frame, wait for play
      onUpdate();
      io.observe(viewport);
    };
    document.fonts?.ready.then(start);
    const fallback = setTimeout(start, 1500);

    return () => {
      disposed = true;
      clearTimeout(fallback);
      io.disconnect();
      ro.disconnect();
      playBtn.removeEventListener("click", onPlayClick);
      bigPlay.removeEventListener("click", onBigPlay);
      viewport.removeEventListener("click", onPlayClick);
      restartBtn.removeEventListener("click", onRestart);
      seek.removeEventListener("pointerdown", onSeekDown);
      seek.removeEventListener("input", onSeekInput);
      seek.removeEventListener("change", onSeekChange);
      fsBtn.removeEventListener("click", onFs);
      document.removeEventListener("visibilitychange", autoState);
      ctx.revert();
    };
  }, []);

  return (
    <div className="hero-media">
      <div className="mg" id="mg" ref={mgRef} aria-label="Capizonda Dental Clinic motion graphic video" role="region">
        <div className="mg-viewport" ref={viewportRef}>
          <div className="mg-stage" ref={stageRef} aria-hidden="true">
            <div className="mg-bg">
              <div className="mg-bg-glow" />
              <div className="mg-bg-ring r1" />
              <div className="mg-bg-ring r2" />
              <div className="mg-particles">
                {Array.from({ length: 12 }, (_, i) => <i key={i} />)}
              </div>
            </div>

            {/* Scene 1: logo build */}
            <div className="mg-scene s1">
              <div className="s1-mark">
                <img className="s1-tooth" src="/assets/img/mark-tooth.png" alt="" />
                <img className="s1-swoosh" src="/assets/img/mark-swoosh.png" alt="" />
                <img className="s1-crown" src="/assets/img/mark-crown.png" alt="" />
                <span className="spark k1" /><span className="spark k2" /><span className="spark k3" /><span className="spark k4" />
              </div>
              <div className="s1-word">
                {"CAPIZONDA".split("").map((c, i) => <span key={i}>{c}</span>)}
              </div>
              <div className="s1-sub">DENTAL CLINIC</div>
            </div>

            {/* Scene 2: tagline */}
            <div className="mg-scene s2">
              <div className="s2-eyebrow">Capizonda Dental Clinic</div>
              <div className="line"><span className="s2-l1">Your smile</span></div>
              <div className="line"><span className="s2-l2">is our <em>passion!</em></span></div>
              <svg className="s2-smile" viewBox="0 0 600 120"><path d="M20 20 Q300 150 580 20" /></svg>
            </div>

            {/* Scene 3: technology */}
            <div className="mg-scene s3">
              <div className="s3-title">Modern tech. <em>Gentler care.</em></div>
              <div className="s3-cards">
                <div className="s3-card">
                  <div className="s3-icon">
                    <svg viewBox="0 0 48 48"><rect x="6" y="14" width="36" height="24" rx="5" /><circle cx="24" cy="26" r="7" /><circle cx="24" cy="26" r="2.5" className="fill" /><path d="M17 14l3-5h8l3 5" /></svg>
                  </div>
                  <div className="s3-name">Intraoral <br />Camera</div>
                  <div className="s3-desc">See exactly what we see</div>
                </div>
                <div className="s3-card">
                  <div className="s3-icon">
                    <svg viewBox="0 0 48 48"><rect x="7" y="12" width="34" height="26" rx="4" /><circle cx="21" cy="25" r="7" /><path d="M33 18v14M10 42h28M24 6v6" /></svg>
                  </div>
                  <div className="s3-name">Autoclave <br />Sterilization</div>
                  <div className="s3-desc">Hospital-grade clean tools</div>
                </div>
                <div className="s3-card">
                  <div className="s3-icon">
                    <svg viewBox="0 0 48 48"><rect x="6" y="16" width="36" height="22" rx="4" /><path d="M12 22h24" /><path d="M16 8l2 4M24 6v5M32 8l-2 4" /><path d="M14 30h20" /></svg>
                  </div>
                  <div className="s3-name">UV Sterilization <br />Box</div>
                  <div className="s3-desc">Extra layer of protection</div>
                </div>
              </div>
            </div>

            {/* Scene 4: dentist */}
            <div className="mg-scene s4">
              <div className="s4-photo">
                <svg className="s4-ring" viewBox="0 0 400 400"><circle cx="200" cy="200" r="190" /></svg>
                <div className="s4-img"><img src="/assets/img/dr-capizonda-head.jpg" alt="" /></div>
              </div>
              <div className="s4-copy">
                <div className="s4-eyebrow">Get to know your dentist</div>
                <div className="s4-name">Dr. Capizonda</div>
                <ul className="s4-list">
                  <li>Doctor of Dental Medicine, Iloilo Doctor&apos;s College</li>
                  <li>Member, PDA Iloilo Chapter</li>
                  <li>On a mission to reduce early tooth extractions</li>
                </ul>
              </div>
            </div>

            {/* Scene 5: visit info */}
            <div className="mg-scene s5">
              <div className="s5-copy">
                <div className="s5-title">Visit us</div>
                <div className="s5-row">
                  <span className="s5-ic"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg></span>
                  <span>Monday to Saturday<br /><b>9:00 AM to 5:00 PM</b><br /><small>Sunday by appointment only</small></span>
                </div>
                <div className="s5-row">
                  <span className="s5-ic"><svg viewBox="0 0 24 24"><path d={PHONE_PATH} /></svg></span>
                  <span>Call or text <b>0962 687 6076</b></span>
                </div>
                <div className="s5-row">
                  <span className="s5-ic"><svg viewBox="0 0 24 24"><path d="M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="10" r="2.5" /></svg></span>
                  <span>Brgy. West Habog-Habog, Molo, Iloilo City<br /><small>In front of Baluarte Elementary School</small></span>
                </div>
              </div>
              <div className="s5-photo"><img src="/assets/img/clinic-interior.jpg" alt="" /></div>
            </div>

            {/* Scene 6: call to action */}
            <div className="mg-scene s6">
              <img className="s6-mark" src="/assets/img/tooth-mark.png" alt="" />
              <div className="s6-pill"><span>BOOK YOUR APPOINTMENT TODAY</span></div>
              <div className="s6-meta"><span>Capizonda Dental Clinic</span><i /><span>0962 687 6076</span></div>
            </div>

            <div className="mg-fade" />
          </div>

          <button className="mg-bigplay" ref={bigPlayRef} type="button" aria-label="Play video">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </button>
        </div>

        <div className="mg-controls">
          <button className="mg-btn" ref={playRef} type="button" aria-label="Pause video">
            <svg className="ic-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
            <svg className="ic-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </button>
          <button className="mg-btn" ref={restartRef} type="button" aria-label="Restart video">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="mg-track">
            <input type="range" ref={seekRef} id="mg-seek" min={0} max={1000} defaultValue={0} step={1} aria-label="Seek video" />
            <div className="mg-chapters" ref={chaptersRef} aria-hidden="true" />
          </div>
          <span className="mg-time" ref={timeRef}>0:00</span>
          <button className="mg-btn" ref={fsRef} type="button" aria-label="Full screen">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
      <p className="mg-caption" ref={captionRef}>Intro</p>
    </div>
  );
}
