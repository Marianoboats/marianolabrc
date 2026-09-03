/* =========================================================
   Mariano RC — interacción
   Sin dependencias. Vanilla JS.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Año en el pie ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      mobileNav.classList.toggle("is-open", !open);
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        toggle.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("is-open");
      }
    });
  }

  /* ---------- Filtros de la galería ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));

  if (filters.length && shots.length) {
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.dataset.filter;
        filters.forEach(function (f) {
          var active = f === btn;
          f.classList.toggle("is-active", active);
          f.setAttribute("aria-selected", String(active));
        });
        shots.forEach(function (shot) {
          var show = cat === "all" || shot.dataset.cat === cat;
          shot.classList.toggle("is-hidden", !show);
        });
        rebuildVisibleList();
      });
    });
  }

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  if (!lb) return;

  var lbImg = lb.querySelector(".lb-img");
  var lbCap = lb.querySelector(".lb-caption");
  var btnClose = lb.querySelector(".lb-close");
  var btnPrev = lb.querySelector(".lb-prev");
  var btnNext = lb.querySelector(".lb-next");

  var visible = [];      // figuras visibles actualmente
  var index = 0;
  var lastFocused = null;

  function rebuildVisibleList() {
    visible = shots.filter(function (s) { return !s.classList.contains("is-hidden"); });
  }
  rebuildVisibleList();

  function show(i) {
    if (!visible.length) return;
    index = (i + visible.length) % visible.length;
    var fig = visible[index];
    var img = fig.querySelector("img");
    var cap = fig.querySelector("figcaption");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || "";
    lbCap.textContent = cap ? cap.textContent : "";
  }

  function openAt(fig) {
    rebuildVisibleList();
    var i = visible.indexOf(fig);
    if (i === -1) return;
    lastFocused = document.activeElement;
    show(i);
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    btnClose.focus();
    document.addEventListener("keydown", onKey);
  }

  function close() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbImg.src = "";
    document.removeEventListener("keydown", onKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "Tab") { e.preventDefault(); btnClose.focus(); }
  }

  shots.forEach(function (fig) {
    fig.setAttribute("tabindex", "0");
    fig.setAttribute("role", "button");
    fig.addEventListener("click", function () { openAt(fig); });
    fig.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openAt(fig); }
    });
  });

  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", function () { show(index - 1); });
  btnNext.addEventListener("click", function () { show(index + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

  /* Deslizar en móvil */
  var touchX = null;
  lb.addEventListener("touchstart", function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });
})();
