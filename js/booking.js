/* Capizonda Dental Clinic: booking flow (demo, stores requests on this device) */
(function () {
  "use strict";

  var CLINIC_PHONE = "09626876076";
  var STORAGE_KEY = "cdc_bookings_v1";
  var DAYS_AHEAD = 21;

  var TOOTH = '<path d="M8 3C5.2 3 4 5.3 4 7.5c0 2.2.9 3.6 1.3 5.6.5 2.6.6 7.9 2.5 7.9 1.6 0 1.4-4.6 2.6-5.9.9-1 2.3-1 3.2 0 1.2 1.3 1 5.9 2.6 5.9 1.9 0 2-5.3 2.5-7.9.4-2 1.3-3.4 1.3-5.6C20 5.3 18.8 3 16 3c-1.6 0-2.6.8-4 .8S9.6 3 8 3z"/>';

  var SERVICES = [
    { id: "checkup", name: "Check-up & Consultation", local: "", dur: 30,
      desc: "Complete oral exam using our intraoral camera, so you see what we see.",
      icon: '<circle cx="14.5" cy="9.5" r="5.5"/><path d="M10.5 13.5L3.5 20.5"/>' },
    { id: "cleaning", name: "Oral Prophylaxis", local: "Cleaning", dur: 45,
      desc: "Removes plaque and tartar to keep teeth and gums healthy.",
      icon: '<path d="M11 3l1.8 4.7 4.7 1.8-4.7 1.8L11 16l-1.8-4.7L4.5 9.5l4.7-1.8z"/><path d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>' },
    { id: "restoration", name: "Tooth Restoration", local: "Pasta", dur: 45,
      desc: "Tooth-colored fillings that repair cavities, chips, and cracks.",
      icon: TOOTH + '<circle cx="12" cy="8.5" r="1.6"/>' },
    { id: "extraction", name: "Tooth Extraction", local: "Bunot", dur: 45,
      desc: "Gentle, careful removal when a tooth can no longer be saved.",
      icon: TOOTH },
    { id: "dentures", name: "Dentures", local: "Pustiso", dur: 30,
      desc: "Partial or complete dentures, fitted for comfort and a natural look.",
      icon: '<path d="M3 9c2 7.5 16 7.5 18 0z"/><path d="M8 9.5v3.2M12 9.5v4M16 9.5v3.2"/>' },
    { id: "whitening", name: "Teeth Whitening", local: "", dur: 60,
      desc: "Brighten your smile safely, guided by your dentist.",
      icon: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>' },
    { id: "braces", name: "Orthodontic Braces", local: "", dur: 30,
      desc: "Straighten teeth and correct your bite. Starts with a consultation.",
      icon: '<rect x="3.5" y="8.5" width="4.5" height="7" rx="1.2"/><rect x="9.75" y="8.5" width="4.5" height="7" rx="1.2"/><rect x="16" y="8.5" width="4.5" height="7" rx="1.2"/><path d="M1.5 12h21"/>' },
    { id: "kids", name: "Kids' Dental Care", local: "", dur: 30,
      desc: "Fluoride, sealants, and friendly first visits for little smiles.",
      icon: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2.2 4 2.2 4-2.2 4-2.2M9 9.5h.01M15 9.5h.01"/>' }
  ];

  var SLOTS_AM = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  var SLOTS_PM = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var $ = function (id) { return document.getElementById(id); };
  var phNow = window.cdcPhNow || function () { return new Date(); };
  var toast = window.cdcToast || function () {};

  var state = { step: 1, service: null, date: null, time: null };
  var lastBooking = null;

  // ---------- Storage ----------
  function loadBookings() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; }
  }
  function saveBookings(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  }

  // ---------- Helpers ----------
  function svg(inner, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + inner + "</svg>";
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseIso(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtTime(t) {
    var h = +t.slice(0, 2), m = t.slice(3);
    return ((h + 11) % 12 + 1) + ":" + m + " " + (h < 12 ? "AM" : "PM");
  }
  function fmtDate(s, long) {
    var d = parseIso(s);
    return (long ? DOW_LONG[d.getDay()] : DOW[d.getDay()]) + ", " + MONTHS[d.getMonth()].slice(0, long ? 99 : 3) + " " + d.getDate();
  }
  function getService(id) {
    for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i];
    return null;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Deterministic "already booked" slots so the demo calendar looks lived-in.
  function seededTaken(dateIso, slot) {
    var str = dateIso + slot, h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 100) < 24;
  }
  function slotStatus(dateIso, slot) {
    var now = phNow();
    if (dateIso === iso(now)) {
      var mins = +slot.slice(0, 2) * 60 + +slot.slice(3);
      if (mins <= now.getHours() * 60 + now.getMinutes() + 30) return "past";
    }
    var mine = loadBookings().some(function (b) { return b.date === dateIso && b.time === slot; });
    if (mine || seededTaken(dateIso, slot)) return "taken";
    return "open";
  }
  function openCount(dateIso) {
    return SLOTS_AM.concat(SLOTS_PM).filter(function (s) { return slotStatus(dateIso, s) === "open"; }).length;
  }

  // ---------- Services section cards ----------
  function renderServiceCards() {
    var grid = $("services-grid");
    grid.innerHTML = SERVICES.map(function (s) {
      return (
        '<article class="service-card reveal">' +
          '<span class="service-ic">' + svg(s.icon) + "</span>" +
          "<div>" +
            "<h3>" + s.name + (s.local ? ' <em class="service-local">(' + s.local + ")</em>" : "") + "</h3>" +
            "<p>" + s.desc + "</p>" +
            '<div class="service-meta">' +
              '<span class="service-time">Approx. ' + s.dur + " min</span>" +
              '<button class="service-book" type="button" data-service="' + s.id + '">Book this ' +
                svg('<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>') +
              "</button>" +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");

    grid.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-service]");
      if (!btn) return;
      pickService(btn.getAttribute("data-service"));
    });

    // Let main.js reveal observer pick up the new cards
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-in"); obs.unobserve(en.target); }
        });
      }, { threshold: 0.1 });
      grid.querySelectorAll(".reveal").forEach(function (el, i) {
        el.style.transitionDelay = (i % 4) * 70 + "ms";
        obs.observe(el);
      });
    } else {
      grid.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
    }
  }

  // ---------- Step 1: service options ----------
  function renderServiceOptions() {
    $("service-options").innerHTML = SERVICES.map(function (s) {
      return (
        '<label class="opt">' +
          '<input type="radio" name="service" value="' + s.id + '" />' +
          '<span class="service-ic">' + svg(s.icon) + "</span>" +
          '<span class="opt-body"><span class="opt-name">' + s.name + "</span>" +
          '<span class="opt-dur">' + (s.local ? s.local + " · " : "") + "approx. " + s.dur + " min</span></span>" +
          '<span class="opt-check">' + svg('<path d="M5 12l5 5 9-10"/>') + "</span>" +
        "</label>"
      );
    }).join("");

    $("service-options").addEventListener("change", function (e) {
      if (e.target.name !== "service") return;
      state.service = e.target.value;
      update();
      // Small delay so the selection is visible before moving on
      setTimeout(function () { if (state.step === 1) goTo(2); }, 280);
    });
  }

  // ---------- Step 2: dates & slots ----------
  function renderDates() {
    var start = phNow();
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    var html = "";
    for (var i = 0; i < DAYS_AHEAD; i++) {
      var d = new Date(start); d.setDate(start.getDate() + i);
      var key = iso(d);
      var isSun = d.getDay() === 0;
      var open = openCount(key);
      var tag, cls = "date-chip";
      if (open === 0) { tag = i === 0 ? "Closed" : "Full"; cls += " is-full"; }
      else if (isSun) { tag = "By appt."; cls += " is-sunday"; }
      else tag = open + " open";
      html +=
        '<button type="button" role="option" class="' + cls + '" data-date="' + key + '" aria-selected="' + (state.date === key) + '"' +
        (open === 0 ? " disabled" : "") + ' aria-label="' + fmtDate(key, true) + ", " + tag + '">' +
          '<span class="dw">' + (i === 0 ? "Today" : DOW[d.getDay()]) + "</span>" +
          '<span class="dn">' + d.getDate() + "</span>" +
          '<span class="dt">' + tag + "</span>" +
        "</button>";
    }
    $("date-strip").innerHTML = html;
    updateMonthLabel();
  }

  function updateMonthLabel() {
    var ref = state.date ? parseIso(state.date) : phNow();
    $("month-label").textContent = MONTHS[ref.getMonth()] + " " + ref.getFullYear();
  }

  function renderSlots() {
    var am = $("slots-am"), pm = $("slots-pm");
    if (!state.date) {
      am.innerHTML = '<p class="slots-empty">Pick a date above to see available times.</p>';
      pm.innerHTML = "";
      $("sunday-note").hidden = true;
      return;
    }
    $("sunday-note").hidden = parseIso(state.date).getDay() !== 0;
    function build(list) {
      return list.map(function (s) {
        var st = slotStatus(state.date, s);
        var label = fmtTime(s) + (st === "taken" ? ", already booked" : st === "past" ? ", unavailable" : "");
        return '<button type="button" class="slot" data-time="' + s + '" aria-pressed="' + (state.time === s) + '"' +
          (st !== "open" ? " disabled" : "") + ' aria-label="' + label + '">' + fmtTime(s) + "</button>";
      }).join("");
    }
    am.innerHTML = build(SLOTS_AM);
    pm.innerHTML = build(SLOTS_PM);
  }

  function bindSchedule() {
    $("date-strip").addEventListener("click", function (e) {
      var chip = e.target.closest("[data-date]");
      if (!chip || chip.disabled) return;
      state.date = chip.getAttribute("data-date");
      if (state.time && slotStatus(state.date, state.time) !== "open") state.time = null;
      $("date-strip").querySelectorAll("[data-date]").forEach(function (c) {
        c.setAttribute("aria-selected", String(c === chip));
      });
      updateMonthLabel();
      renderSlots();
      update();
    });
    document.querySelector(".slot-group").addEventListener("click", function (e) {
      var b = e.target.closest("[data-time]");
      if (!b || b.disabled) return;
      state.time = b.getAttribute("data-time");
      document.querySelectorAll(".slot").forEach(function (s) {
        s.setAttribute("aria-pressed", String(s === b));
      });
      update();
    });
    var strip = $("date-strip");
    $("date-prev").addEventListener("click", function () { strip.scrollBy({ left: -strip.clientWidth * 0.8, behavior: "smooth" }); });
    $("date-next").addEventListener("click", function () { strip.scrollBy({ left: strip.clientWidth * 0.8, behavior: "smooth" }); });
    strip.addEventListener("scroll", syncDateNav, { passive: true });
  }

  function syncDateNav() {
    var s = $("date-strip");
    $("date-prev").disabled = s.scrollLeft < 4;
    $("date-next").disabled = s.scrollLeft + s.clientWidth >= s.scrollWidth - 4;
  }

  // ---------- Steps ----------
  function stepValid(n) {
    if (n === 1) return !!state.service;
    if (n === 2) return !!(state.date && state.time);
    return true;
  }

  function goTo(n) {
    state.step = n;
    document.querySelectorAll(".step").forEach(function (f) {
      f.classList.toggle("is-active", +f.getAttribute("data-step") === n);
    });
    document.querySelectorAll("#stepper li").forEach(function (li) {
      var s = +li.getAttribute("data-step");
      li.classList.toggle("is-active", s === n);
      li.classList.toggle("is-done", s < n);
    });
    $("btn-back").hidden = n === 1;
    if (n === 2) { renderSlots(); requestAnimationFrame(syncDateNav); }
    update();

    var main = document.querySelector(".booking-main");
    var top = main.getBoundingClientRect().top;
    if (top < 60 || top > window.innerHeight * 0.6) {
      window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" });
    }
  }

  function update() {
    var svc = getService(state.service);
    $("sum-service").textContent = svc ? svc.name : "Not selected";
    $("sum-date").textContent = state.date ? fmtDate(state.date, false) : "Not selected";
    $("sum-time").textContent = state.time ? fmtTime(state.time) : "Not selected";
    $("sum-dur").textContent = svc ? "~" + svc.dur + " min" : "-";

    var next = $("btn-next");
    next.textContent = state.step === 3 ? "Confirm booking" : "Continue";
    next.disabled = !stepValid(state.step);
  }

  // ---------- Step 3: validation & submit ----------
  var form = $("booking-form");

  function normalizePhone(v) {
    var d = v.replace(/[^\d+]/g, "");
    if (d.indexOf("+63") === 0) d = "0" + d.slice(3);
    else if (d.indexOf("63") === 0 && d.length === 12) d = "0" + d.slice(2);
    return d;
  }
  function setErr(name, on) {
    var input = form.elements[name];
    var field = input && input.closest(".field");
    if (field) field.classList.toggle("has-error", on);
    var msg = form.querySelector('.err[data-for="' + name + '"]');
    if (msg) msg.classList.toggle("is-shown", on);
    return on;
  }
  function validateDetails() {
    var bad = false;
    var name = form.elements.name.value.trim();
    var phone = normalizePhone(form.elements.phone.value);
    var email = form.elements.email.value.trim();
    bad = setErr("name", name.length < 2) || bad;
    bad = setErr("phone", !/^09\d{9}$/.test(phone)) || bad;
    bad = setErr("email", email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) || bad;
    bad = setErr("consent", !form.elements.consent.checked) || bad;
    if (bad) {
      var first = form.querySelector(".has-error input, .err.is-shown");
      if (first && first.focus) first.focus();
    }
    return !bad;
  }
  ["name", "phone", "email"].forEach(function (n) {
    form.elements[n].addEventListener("input", function () { setErr(n, false); });
  });
  form.elements.consent.addEventListener("change", function () { setErr("consent", false); });

  function makeRef() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", out = "";
    for (var i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return "CDC-" + out;
  }

  function submit() {
    if (!validateDetails()) return;
    var svc = getService(state.service);
    var booking = {
      ref: makeRef(),
      service: svc.id,
      serviceName: svc.name,
      dur: svc.dur,
      date: state.date,
      time: state.time,
      name: form.elements.name.value.trim(),
      phone: normalizePhone(form.elements.phone.value),
      email: form.elements.email.value.trim(),
      type: form.elements.ptype.value,
      notes: form.elements.notes.value.trim(),
      created: new Date().toISOString()
    };
    var list = loadBookings(); list.push(booking); saveBookings(list);
    lastBooking = booking;
    showSuccess(booking);
    renderMyBookings();
  }

  function smsLink(b) {
    var body = "Hi Capizonda Dental Clinic! I'd like to book " + b.serviceName + " on " + fmtDate(b.date, true) +
      " at " + fmtTime(b.time) + ". Name: " + b.name + ". Ref: " + b.ref + ".";
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return "sms:" + CLINIC_PHONE + (ios ? "&" : "?") + "body=" + encodeURIComponent(body);
  }

  function showSuccess(b) {
    form.hidden = true;
    $("stepper").hidden = true;
    var s = $("success");
    s.hidden = false;
    $("success-ref").textContent = b.ref;
    $("success-phone").textContent = b.phone.replace(/^(\d{4})(\d{3})(\d{4})$/, "$1 $2 $3");
    $("success-card").innerHTML =
      "<div><span>Service</span><strong>" + esc(b.serviceName) + "</strong></div>" +
      "<div><span>Date</span><strong>" + fmtDate(b.date, true) + "</strong></div>" +
      "<div><span>Time</span><strong>" + fmtTime(b.time) + "</strong></div>" +
      "<div><span>Patient</span><strong>" + esc(b.name) + " (" + esc(b.type) + ")</strong></div>";
    $("success-sms").href = smsLink(b);
    s.focus({ preventScroll: true });
    var top = document.querySelector(".booking-main").getBoundingClientRect().top;
    window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" });
  }

  function resetFlow() {
    state = { step: 1, service: null, date: null, time: null };
    form.reset();
    form.hidden = false;
    $("stepper").hidden = false;
    $("success").hidden = true;
    renderDates();
    goTo(1);
  }

  // ---------- Calendar file ----------
  function downloadIcs(b) {
    var p = b.date.split("-"), h = +b.time.slice(0, 2), m = +b.time.slice(3);
    // Clinic times are Philippine time (UTC+8)
    var start = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], h - 8, m));
    var end = new Date(start.getTime() + b.dur * 60000);
    function stamp(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Capizonda Dental Clinic//Booking//EN", "BEGIN:VEVENT",
      "UID:" + b.ref + "@capizonda-dental", "DTSTAMP:" + stamp(new Date()),
      "DTSTART:" + stamp(start), "DTEND:" + stamp(end),
      "SUMMARY:" + b.serviceName + " - Capizonda Dental Clinic",
      "LOCATION:Brgy. West Habog-Habog\\, Molo\\, Iloilo City (in front of Baluarte Elementary School)",
      "DESCRIPTION:Booking ref " + b.ref + ". Awaiting clinic confirmation. Call or text 0962 687 6076.",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    var url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    var a = document.createElement("a");
    a.href = url; a.download = "capizonda-" + b.ref + ".ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // ---------- My bookings ----------
  function renderMyBookings() {
    var today = iso(phNow());
    var list = loadBookings().filter(function (b) { return b.date >= today; })
      .sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
    var wrap = $("my-bookings");
    wrap.hidden = list.length === 0;
    $("my-bookings-list").innerHTML = list.map(function (b) {
      return '<li class="mb-item"><div><strong>' + esc(b.serviceName) + "</strong>" +
        "<span>" + fmtDate(b.date, false) + " · " + fmtTime(b.time) + " · " + b.ref + "</span></div>" +
        '<button type="button" class="mb-cancel" data-ref="' + b.ref + '">Cancel</button></li>';
    }).join("");
  }
  $("my-bookings-list").addEventListener("click", function (e) {
    var btn = e.target.closest(".mb-cancel");
    if (!btn) return;
    if (!btn.classList.contains("is-confirm")) {
      btn.classList.add("is-confirm");
      btn.textContent = "Tap to confirm";
      setTimeout(function () {
        if (btn.isConnected) { btn.classList.remove("is-confirm"); btn.textContent = "Cancel"; }
      }, 3000);
      return;
    }
    var ref = btn.getAttribute("data-ref");
    saveBookings(loadBookings().filter(function (b) { return b.ref !== ref; }));
    renderMyBookings();
    renderDates();
    if (state.step === 2) renderSlots();
    toast("Request " + ref + " cancelled.");
  });

  // ---------- Wire up ----------
  $("btn-next").addEventListener("click", function () {
    if (state.step < 3) { if (stepValid(state.step)) goTo(state.step + 1); }
    else submit();
  });
  $("btn-back").addEventListener("click", function () { if (state.step > 1) goTo(state.step - 1); });
  form.addEventListener("submit", function (e) { e.preventDefault(); if (state.step === 3) submit(); });
  $("success-again").addEventListener("click", resetFlow);
  $("success-ics").addEventListener("click", function () {
    if (lastBooking) { downloadIcs(lastBooking); toast("Calendar file downloaded."); }
  });

  function pickService(id) {
    if (!$("success").hidden) resetFlow();
    state.service = id;
    var radio = form.querySelector('input[name="service"][value="' + id + '"]');
    if (radio) radio.checked = true;
    goTo(2);
    document.getElementById("book").scrollIntoView({ behavior: "smooth" });
    toast(getService(id).name + " selected. Now pick a schedule.");
  }

  renderServiceCards();
  renderServiceOptions();
  renderDates();
  bindSchedule();
  renderSlots();
  renderMyBookings();
  update();

  window.CDCBooking = { pick: pickService };
})();
