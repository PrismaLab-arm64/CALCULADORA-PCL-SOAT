/* ui-tweaks.js — Producción: menos pistas + UX premium + gancho 2027 */
(() => {
  "use strict";

  const SHOW_RENEW_DAYS = 5;
  const RUN_EVERY_MS = 1200;

  const YEAR_GANCHO = "2027";
  const FALLBACK_YEAR = "2026";

  const norm = (s) => (s || "").toString().toLowerCase().trim();

  function injectStyleOnce(id, cssText) {
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = cssText;
    document.head.appendChild(style);
  }

  function isPremiumUI() {
    return Array.from(document.querySelectorAll("*"))
      .some(n => (n.textContent || "").includes("Estado: PREMIUM"));
  }

  function extractDaysLeft() {
    const nodes = Array.from(document.querySelectorAll("*"));
    for (const n of nodes) {
      const t = n.textContent || "";
      if (t.includes("Días restantes")) {
        const m = t.match(/Días\s+restantes\s*:\s*(\d+)/i);
        if (m) return parseInt(m[1], 10);
      }
    }
    return null;
  }

  function setSmallHint(text) {
    const el = document.getElementById("smmlvInfo");
    if (!el) return;
    el.textContent = text || "";
  }

  function ensure2027Gated(premium) {
    const sel = document.getElementById("year");
    if (!sel) return;

    let opt = sel.querySelector(`option[value="${YEAR_GANCHO}"]`);
    if (!opt) {
      opt = document.createElement("option");
      opt.value = YEAR_GANCHO;
      opt.textContent = YEAR_GANCHO;
      sel.insertBefore(opt, sel.firstChild);
    }

    const currentYear = String(new Date().getFullYear());
    const isYear2027 = (currentYear === YEAR_GANCHO);

    // Premium NO abre 2027 antes de tiempo. Solo se habilita cuando el año vigente sea 2027.
    const canUse2027 = premium && isYear2027;

    if (!canUse2027) {
      opt.disabled = true;
      if (!opt.textContent.includes("🔒")) opt.textContent = `${YEAR_GANCHO} 🔒`;

      if (sel.value === YEAR_GANCHO) {
        sel.value = FALLBACK_YEAR;
        setSmallHint("2027 se habilita cuando esté vigente.");
      }

      // Evita selección manual en FREE o antes de 2027
      if (!sel.__pclHooked) {
        sel.addEventListener("change", () => {
          if (sel.value === YEAR_GANCHO) {
            sel.value = FALLBACK_YEAR;
            setSmallHint("2027 se habilita cuando esté vigente.");
          } else {
            setSmallHint("");
          }
        });
        sel.__pclHooked = true;
      }
    } else {
      opt.disabled = false;
      opt.textContent = YEAR_GANCHO;
      setSmallHint("");
    }
  }

  function apply() {
    // Fondo azul tipo activación
    injectStyleOnce("pcl-blue-bg", `
      body{background:#08142b !important;}
      .topbar{background:#08142b !important;border-bottom:1px solid rgba(255,255,255,.08) !important;}
    `);

    // Ocultar indicadores (azul): Online / SW
    const net = document.getElementById("netStatus");
    const sw  = document.getElementById("swStatus");
    if (net) net.style.display = "none";
    if (sw) sw.style.display  = "none";

    // Quitar footer verde (Build)
    document.querySelectorAll("footer .footer, footer").forEach(() => {});
    document.querySelectorAll("footer .footer, footer").forEach(f => {
      const txt = (f.textContent || "");
      if (txt.includes("Build:") || txt.includes("Service Worker") || txt.includes("Modo offline")) {
        // Mantén el footer si te gusta la frase offline; tú dijiste que el bloque verde sobra -> lo oculto completo
        f.style.display = "none";
      }
    });

    // Quitar botón copiar del dictamen (naranja)
    const btnCopyDict = document.getElementById("btnCopyDictamen");
    if (btnCopyDict) btnCopyDict.style.display = "none";

    // Quitar nota del modal (localStorage/sin backend)
    document.querySelectorAll(".modal .muted.small, .modal .small.muted").forEach(el => {
      const t = (el.textContent || "");
      if (t.includes("localStorage") || t.toLowerCase().includes("sin backend")) {
        el.style.display = "none";
      }
    });

    // Panel Premium: en PREMIUM dejar solo contador y mostrar gestionar solo a ≤5 días
    const panel = document.getElementById("premiumPanel");
    if (!panel) return;

    const premium = isPremiumUI();
    const days = extractDaysLeft();

    const btnManage = document.getElementById("btnOpenLicense");
    const btnRemove = document.getElementById("btnClearLicense");

    if (premium) {
      // Oculta detalles, deja visible "Días restantes" (el app lo llena)
      // No tocamos el modal ni handlers
      Array.from(panel.querySelectorAll("*")).forEach(el => {
        const keep = (el.id === "premiumDays") || (el.textContent || "").includes("Días restantes");
        if (!keep && el !== panel) el.style.display = "none";
      });

      if (btnManage) {
        if (days !== null && days <= SHOW_RENEW_DAYS) btnManage.style.display = "";
        else btnManage.style.display = "none";
      }
      // Ocultar quitar licencia (tu decisión: menos superficie)
      if (btnRemove) btnRemove.style.display = "none";
    } else {
      // FREE: botón gestionar visible para activar
      if (btnManage) btnManage.style.display = "";
      if (btnRemove) btnRemove.style.display = "none";
    }

    // Gancho 2027
    ensure2027Gated(premium);
  }

  apply();
  setInterval(apply, RUN_EVERY_MS);
})();
