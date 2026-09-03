/* =========================================================
   Mariano RC — cambio de idioma  (ES · EN · DE · FR)
   Sin dependencias. Vanilla JS.

   Cómo funciona
   -------------
   · Las banderas se añaden solas a la cabecera.
   · El texto en español que ya está en la web es el "original".
     Al pulsar una bandera, se sustituye por su traducción del
     diccionario  i18n-textos.js  (buscándola por el texto español).
   · Lo que Mariano añada después (una foto nueva, una entrada de
     bitácora) y que NO esté en el diccionario se traduce solo con
     un servicio automático (MyMemory) y se marca como automática.
     Para que salga con buena calidad, hay que añadir esos textos
     a  i18n-textos.js  (ver las instrucciones en el README).
   ========================================================= */
(function () {
  "use strict";

  var DICT = window.MARIANO_I18N || {};
  var LS_KEY = "marianorc_lang";
  var SUPPORTED = ["es", "en", "de", "fr"];
  var DEFAULT = "es";

  /* Opcional: un correo aquí amplía la cuota de traducción automática
     de MyMemory (de 1000 a 50000 palabras/día). Puede quedar vacío. */
  var MT_EMAIL = "";

  var AUTO_LABEL = {
    en: "Automatic translation",
    de: "Automatische Übersetzung",
    fr: "Traduction automatique"
  };

  /* ---------- Banderas (SVG en línea, sin peticiones) ---------- */
  var FLAG = {
    es: '<svg viewBox="0 0 3 2" preserveAspectRatio="none" aria-hidden="true">' +
        '<rect width="3" height="2" fill="#c60b1e"/><rect y=".5" width="3" height="1" fill="#ffc400"/></svg>',
    en: '<svg viewBox="0 0 60 30" preserveAspectRatio="none" aria-hidden="true">' +
        '<clipPath id="ujc"><path d="M0 0v30h60V0z"/></clipPath>' +
        '<clipPath id="ujt"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath>' +
        '<g clip-path="url(#ujc)">' +
        '<path d="M0 0v30h60V0z" fill="#012169"/>' +
        '<path d="M0 0 60 30M60 0 0 30" stroke="#fff" stroke-width="6"/>' +
        '<path d="M0 0 60 30M60 0 0 30" clip-path="url(#ujt)" stroke="#c8102e" stroke-width="4"/>' +
        '<path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/>' +
        '<path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6"/></g></svg>',
    de: '<svg viewBox="0 0 5 3" preserveAspectRatio="none" aria-hidden="true">' +
        '<rect width="5" height="3" fill="#ffce00"/><rect width="5" height="2" fill="#d00"/><rect width="5" height="1"/></svg>',
    fr: '<svg viewBox="0 0 3 2" preserveAspectRatio="none" aria-hidden="true">' +
        '<rect width="3" height="2" fill="#fff"/><rect width="1" height="2" fill="#002395"/>' +
        '<rect x="2" width="1" height="2" fill="#ed2939"/></svg>'
  };
  var LANGS = [
    { code: "es", label: "Español" },
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "Français" }
  ];

  /* ---------- Selectores del contenido traducible ---------- */
  var CONTENT_SEL = [
    ".skip-link", ".brand-text small", ".site-nav a", ".mobile-nav a", ".header-cta",
    ".hero .eyebrow", ".hero h1", ".hero-lede", ".hero-actions .btn",
    ".intro-text > p", ".intro h2", ".services li", ".intro-text .btn", ".intro-media figcaption",
    ".section-head .eyebrow", ".section-head h2", ".section-head .section-sub",
    ".filters .filter", ".shot figcaption",
    ".posts .tag", ".posts h3", ".posts .post-body p", ".posts .post-more",
    ".bitacora .center .btn",
    ".contact .eyebrow", ".contact h2", ".contact-text > p:not(.contact-alt)",
    ".contact-alt .i18n-t", ".contact .btn",
    ".footer-tagline", ".footer-nav a", ".footer-legal .i18n-t",
    ".post-hero .back-link", ".post-hero .eyebrow", ".post-hero h1", ".post-hero .section-sub",
    ".entry-meta span", ".entry-meta time", ".entry h2", ".entry h3", ".entry > p",
    ".section.center .eyebrow", ".section.center h2", ".section.center .btn"
  ].join(",");

  var norm = function (s) { return (s || "").replace(/\s+/g, " ").trim(); };
  var keyOf = function (html) {
    return norm(String(html).replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, ""));
  };
  var djb2 = function (s) {
    var h = 5381, i = s.length;
    while (i) h = (h * 33) ^ s.charCodeAt(--i);
    return (h >>> 0).toString(36);
  };

  /* ---------- Estado / capturas del original ---------- */
  var content = [];        // [{el, html, key}]
  var attrs = [];          // [{el, name, es}]
  var mailtos = [];        // [{el, href}]
  var meta = {};
  var flagBtns = [];
  var autoToken = 0;
  var current = null;

  function capture() {
    var seen = [];
    Array.prototype.forEach.call(document.querySelectorAll(CONTENT_SEL), function (el) {
      if (seen.indexOf(el) > -1) return;
      seen.push(el);
      var html = el.innerHTML;
      content.push({ el: el, html: html, key: keyOf(html) });
    });

    Array.prototype.forEach.call(
      document.body.querySelectorAll('[alt]:not([alt=""]), [aria-label]'),
      function (el) {
        if (el.closest(".lang-switch")) return;
        ["alt", "aria-label"].forEach(function (name) {
          var v = el.getAttribute(name);
          if (v && norm(v)) attrs.push({ el: el, name: name, es: v });
        });
      }
    );

    Array.prototype.forEach.call(document.querySelectorAll('a[href^="mailto:"]'), function (el) {
      var href = el.getAttribute("href");
      if (href && href.indexOf("?") > -1) mailtos.push({ el: el, href: href });
    });

    var d = document.querySelector('meta[name="description"]');
    var ot = document.querySelector('meta[property="og:title"]');
    var od = document.querySelector('meta[property="og:description"]');
    meta = {
      titleEl: document.querySelector("title"), title: document.title,
      descEl: d, desc: d ? d.getAttribute("content") : null,
      ogtEl: ot, ogt: ot ? ot.getAttribute("content") : null,
      ogdEl: od, ogd: od ? od.getAttribute("content") : null
    };
  }

  /* ---------- Aplicar un idioma ---------- */
  function apply(lang) {
    if (SUPPORTED.indexOf(lang) < 0) lang = DEFAULT;
    current = lang;
    autoToken++;
    document.documentElement.lang = lang;
    try { localStorage.setItem(LS_KEY, lang); } catch (e) {}

    var d = DICT[lang] || {};
    var pending = [];

    content.forEach(function (c) {
      if (lang === "es") {
        c.el.innerHTML = c.html;
        c.el.classList.remove("i18n-auto");
        c.el.removeAttribute("title");
        return;
      }
      if (Object.prototype.hasOwnProperty.call(d, c.key)) {
        c.el.innerHTML = d[c.key];
        c.el.classList.remove("i18n-auto");
        c.el.removeAttribute("title");
      } else if (c.key) {
        pending.push(c);
      }
    });

    attrs.forEach(function (a) {
      if (lang === "es") { a.el.setAttribute(a.name, a.es); return; }
      var t = d[norm(a.es)];
      a.el.setAttribute(a.name, t != null ? t : a.es);
    });

    mailtos.forEach(function (m) {
      if (lang === "es") { m.el.setAttribute("href", m.href); return; }
      var email = m.href.slice(7).split("?")[0];
      var subj = d["@mailSubject"], body = d["@mailBody"];
      if (subj == null && body == null) { m.el.setAttribute("href", m.href); return; }
      m.el.setAttribute("href",
        "mailto:" + email + "?subject=" + encodeURIComponent(subj || "") +
        "&body=" + encodeURIComponent(body || ""));
    });

    applyMeta(lang, d);
    updateFlags(lang);

    if (lang !== "es" && pending.length) runAuto(pending, lang);
  }

  function applyMeta(lang, d) {
    var get = function (es) { return lang === "es" ? es : (d[norm(es)] || es); };
    if (meta.title) document.title = get(meta.title);
    if (meta.descEl) meta.descEl.setAttribute("content", get(meta.desc));
    if (meta.ogtEl) meta.ogtEl.setAttribute("content", get(meta.ogt));
    if (meta.ogdEl) meta.ogdEl.setAttribute("content", get(meta.ogd));
  }

  /* ---------- Respaldo: traducción automática (MyMemory) ---------- */
  function chunk(s, max) {
    if (s.length <= max) return [s];
    var parts = s.match(/[^.!?;]+[.!?;]*\s*/g) || [s];
    var res = [], cur = "";
    parts.forEach(function (p) {
      if ((cur + p).length > max && cur) { res.push(cur.trim()); cur = p; }
      else cur += p;
    });
    if (cur.trim()) res.push(cur.trim());
    var out = [];
    res.forEach(function (p) {
      while (p.length > max) { out.push(p.slice(0, max)); p = p.slice(max); }
      if (p) out.push(p);
    });
    return out;
  }

  function machineTranslate(text, lang) {
    text = norm(text);
    if (!text) return Promise.resolve("");
    if (!navigator.onLine) return Promise.reject(new Error("offline"));
    var ck = "mm:" + lang + ":" + djb2(text);
    try { var c = localStorage.getItem(ck); if (c !== null) return Promise.resolve(c); } catch (e) {}

    var out = [], p = Promise.resolve();
    chunk(text, 450).forEach(function (piece) {
      p = p.then(function () {
        var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(piece) +
          "&langpair=es|" + lang + (MT_EMAIL ? "&de=" + encodeURIComponent(MT_EMAIL) : "");
        return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
          var t = j && j.responseData && j.responseData.translatedText;
          var st = j && j.responseStatus;
          if (!t || (st && +st !== 200) ||
              /MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID LANGUAGE/i.test(t)) {
            throw new Error("mt");
          }
          out.push(t);
        });
      });
    });
    return p.then(function () {
      var res = out.join(" ");
      try { localStorage.setItem(ck, res); } catch (e) {}
      return res;
    });
  }

  function runAuto(items, lang) {
    var token = autoToken;
    if (items.length > 30) items = items.slice(0, 30);   // tope de seguridad
    var i = 0;
    (function next() {
      if (i >= items.length || token !== autoToken) return;
      var it = items[i++];
      machineTranslate(it.el.textContent, lang).then(function (t) {
        if (token === autoToken && t) {
          it.el.textContent = t;
          it.el.classList.add("i18n-auto");
          it.el.setAttribute("title", AUTO_LABEL[lang] || "");
        }
      })["catch"](function () {}).then(function () { setTimeout(next, 220); });
    })();
  }

  /* ---------- Interfaz de banderas ---------- */
  function buildSwitch() {
    var inner = document.querySelector(".header-inner");
    if (!inner || inner.querySelector(".lang-switch")) return;
    var box = document.createElement("div");
    box.className = "lang-switch";
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "Idioma / Language / Sprache / Langue");
    LANGS.forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lang-flag";
      b.setAttribute("data-lang", l.code);
      b.title = l.label;
      b.setAttribute("aria-label", l.label);
      b.innerHTML = FLAG[l.code] || "";
      b.addEventListener("click", function () { apply(l.code); });
      box.appendChild(b);
    });
    var toggle = inner.querySelector(".nav-toggle");
    if (toggle) inner.insertBefore(box, toggle); else inner.appendChild(box);
    flagBtns = Array.prototype.slice.call(box.querySelectorAll(".lang-flag"));
  }

  function updateFlags(lang) {
    flagBtns.forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  /* ---------- Idioma inicial ---------- */
  function initialLang() {
    var saved;
    try { saved = localStorage.getItem(LS_KEY); } catch (e) {}
    if (saved && SUPPORTED.indexOf(saved) > -1) return saved;
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || DEFAULT;
    nav = String(nav).slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(nav) > -1 ? nav : DEFAULT;
  }

  /* ---------- Arranque ---------- */
  function start() {
    capture();
    buildSwitch();
    apply(initialLang());
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
