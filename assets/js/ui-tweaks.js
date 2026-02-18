/* ui-tweaks.js — Producción: menos pistas + UX premium + gancho 2027
   - Premium panel: muestra Titular + Días restantes en una sola línea
   - Dictamen: botón "WhatsApp" SOLO en Premium (copia + abre wa.me)
*/
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
    const el = document.getElementById("premiumDays");
    if (el) {
      const m = (el.textContent || "").match(/(\d+)/);
      if (m) return parseInt(m[1], 10);
    }
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

  // Lee el nombre del titular desde:
  // 1) #premiumUser si app.min.js lo llena
  // 2) token guardado en localStorage (payload.user)
  function getLicenseUserFallback() {
    const pu = document.getElementById("premiumUser");
    if (pu) {
      const t = (pu.textContent || "").trim();
      const m = t.match(/usuario\s*:\s*(.+)$/i);
      if (m && m[1]) return m[1].trim();
      if (t && t.length <= 60) return t.replace(/^Usuario:\s*/i, "").trim();
    }

    // fallback: localStorage token -> payload.user
    try {
      const token = (localStorage.getItem("pclsoat_license_token_v1") || "").trim();
      if (!token) return "";
      const parts = token.split(".");
      if (parts.length !== 2) return "";
      const b64u = parts[0];
      const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64u.length + 3) % 4);
      const json = JSON.parse(atob(b64));
      const u = (json.user || "").toString().trim();
      return u;
    } catch {
      return "";
    }
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

  async function copyToClipboard(text) {
    const t = (text || "").toString();
    if (!t) return false;

    // Preferido
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(t); return true; } catch {}
    }

    // Fallback (execCommand)
    try {
      const ta = document.createElement("textarea");
      ta.value = t;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch {
      return false;
    }
  }

  function openWhatsAppShare(text) {
    const url = "https://wa.me/?text=" + encodeURIComponent(text || "");
    // no usamos window.location para no sacar la app; mejor nueva pestaña
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function apply() {
    // Fondo azul consistente
    injectStyleOnce("pcl-blue-bg", `
      body{background:#08142b !important;}
      .topbar{background:#08142b !important;border-bottom:1px solid rgba(255,255,255,.08) !important;}
    `);

    // Ocultar Online/SW (pistas)
    const net = document.getElementById("netStatus");
    const sw  = document.getElementById("swStatus");
    if (net) net.style.display = "none";
    if (sw)  sw.style.display  = "none";

    // Ocultar footer completo (modo offline/build) — como pediste
    document.querySelectorAll("footer.footer, footer").forEach(f => { f.style.display = "none"; });

    // Ocultar nota del modal (localStorage/sin backend)
    document.querySelectorAll(".modal .muted.small, .modal .small.muted").forEach(el => {
      const t = (el.textContent || "").toLowerCase();
      if (t.includes("localstorage") || t.includes("sin backend")) el.style.display = "none";
    });

    // Panel premium
    const panel = document.getElementById("premiumPanel");
    if (!panel) return;

    const premium = isPremiumUI();
    const days = extractDaysLeft();

    const btnManage = document.getElementById("btnOpenLicense");
    const btnRemove = document.getElementById("btnClearLicense");
    const elDays    = document.getElementById("premiumDays");
    const elUser    = document.getElementById("premiumUser");

    // Dictamen botón (solo Premium)
    const btnCopyDict = document.getElementById("btnCopyDictamen");
    const dict = document.getElementById("dictamen");

    if (premium) {
      // Armar línea premium: Titular + Días
      const user = getLicenseUserFallback();
      const name = user ? user : "Usuario";
      const dtxt = (typeof days === "number") ? String(days) : "—";
      if (elDays) {
        elDays.style.display = "";
        elDays.textContent = `${name} — Días restantes: ${dtxt}`;
      }
      if (elUser) elUser.style.display = "none";

      // Ocultar todo en el panel excepto la línea final (elDays)
      Array.from(panel.querySelectorAll("*")).forEach(el => {
        const keep = (el === elDays) || (el.id === "premiumDays");
        if (!keep && el !== panel) el.style.display = "none";
      });

      // Mostrar gestionar solo a <= 5 días
      if (btnManage) {
        if (days !== null && days <= SHOW_RENEW_DAYS) btnManage.style.display = "";
        else btnManage.style.display = "none";
      }

      // Ocultar quitar licencia (menos superficie)
      if (btnRemove) btnRemove.style.display = "none";

      // Dictamen: habilitar botón como WhatsApp (copia + comparte)
      if (btnCopyDict) {
        btnCopyDict.style.display = "";
        btnCopyDict.textContent = "WhatsApp";
        if (!btnCopyDict.__pclHooked) {
          btnCopyDict.addEventListener("click", async () => {
            const text = dict ? (dict.value || "") : "";
            if (!text.trim()) return;
            await copyToClipboard(text);
            openWhatsAppShare(text);
          });
          btnCopyDict.__pclHooked = true;
        }
      }

    } else {
      // FREE: botón gestionar visible (para activar), quitar licencia oculto
      if (btnManage) btnManage.style.display = "";
      if (btnRemove) btnRemove.style.display = "none";

      // FREE: dictamen NO se comparte (mantiene premium)
      if (btnCopyDict) btnCopyDict.style.display = "none";
    }

    // Gancho 2027
    ensure2027Gated(premium);
  }

  apply();
  setInterval(apply, RUN_EVERY_MS);
})();
