/* =========================================================
   PCL-SOAT License (HMAC) - Offline stable
   - Token: payloadB64u.signatureB64u
   - signature = HMAC_SHA256(payloadB64u, SECRET)
   ========================================================= */

(function () {
  // ⚠️ Debe ser EXACTAMENTE el mismo SECRET que uses en el license-generator.html
  const SECRET = "PCL::SOAT::2025::PREMIUM::CAMBIAME";

  const LS_KEY = "pcl_license_token_v1";

  const $ = (id) => document.getElementById(id);

  function b64uToBytes(b64u) {
    const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64u.length + 3) % 4);
    const str = atob(b64);
    const bytes = new Uint8Array(str.length);
    for (let i=0; i<str.length; i++) bytes[i] = str.charCodeAt(i);
    return bytes;
  }

  function bytesToText(bytes) { return new TextDecoder().decode(bytes); }
  function textToBytes(text) { return new TextEncoder().encode(text); }

  function b64uEncode(bytes) {
    let bin = "";
    const arr = new Uint8Array(bytes);
    for (let i=0; i<arr.length; i++) bin += String.fromCharCode(arr[i]);
    return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  }

  function todayISO(){
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const dd = String(d.getDate()).padStart(2,"0");
    return `${yyyy}-${mm}-${dd}`;
  }

  async function hmacSha256(message){
    const key = await crypto.subtle.importKey(
      "raw",
      textToBytes(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, textToBytes(message));
    return b64uEncode(sig);
  }

  async function verifyToken(token) {
    token = String(token||"").trim();
    if (!token || !token.includes(".")) return { ok:false, err:"Token inválido" };

    const [payloadB64u, sigB64u] = token.split(".", 2);
    if (!payloadB64u || !sigB64u) return { ok:false, err:"Token incompleto" };

    try {
      const expected = await hmacSha256(payloadB64u);
      if (expected !== sigB64u) return { ok:false, err:"Firma no coincide" };

      const payload = JSON.parse(bytesToText(b64uToBytes(payloadB64u)));
      if (!payload.user || !payload.exp) return { ok:false, err:"Payload incompleto" };
      if (String(payload.exp) < todayISO()) return { ok:false, err:"Licencia vencida" };

      return { ok:true, payload };
    } catch (e) {
      return { ok:false, err:"Token inválido" };
    }
  }

  function daysLeft(expISO){
    // cálculo simple por fecha ISO local
    const now = new Date();
    const exp = new Date(expISO + "T00:00:00");
    const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const b = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());
    return Math.floor((b - a) / 86400000);
  }

  function enableYear2027IfAllowed() {
    const premium = !!window.__PCL_PREMIUM__;
    const features = (window.__PCL_LICENSE__ && window.__PCL_LICENSE__.features) ? window.__PCL_LICENSE__.features : {};
    const allow2027 = premium && (features.y2027 === true || Object.keys(features).length === 0);

    document.querySelectorAll("select").forEach(sel => {
      const opt = Array.from(sel.options || []).find(o => String(o.value) === "2027" || /2027/.test(o.text || ""));
      if (opt) opt.disabled = !allow2027;
    });
  }

  function setPremiumUI(state){
    const premium = !!state.premium;
    window.__PCL_PREMIUM__ = premium;
    window.__PCL_LICENSE__ = state.payload || {};

    const statusEl = $("premiumStatus");
    const userEl = $("premiumUser");
    const daysEl = $("premiumDays");
    const btnClear = $("btnClearPremium");

    if (!statusEl) return; // si aún no existe el panel, no rompe

    if (premium) {
      const p = state.payload;
      const d = daysLeft(p.exp);
      statusEl.innerHTML = `Estado: <b>PREMIUM</b>`;
      userEl.style.display = "";
      daysEl.style.display = "";
      btnClear.style.display = "";
      userEl.textContent = `Usuario: ${p.user} | Plan: ${(p.plan||"premium").toUpperCase()}`;
      daysEl.textContent = `Vence: ${p.exp} | Días restantes: ${isFinite(d) ? d : "—"}`;
    } else {
      statusEl.innerHTML = `Estado: <b>FREE</b>`;
      userEl.style.display = "none";
      daysEl.style.display = "none";
      btnClear.style.display = "none";
    }
    enableYear2027IfAllowed();
  }

  function showMsg(txt, ok){
    const el = $("premiumMsg");
    if (!el) return;
    el.textContent = txt;
    el.style.color = ok ? "inherit" : "crimson";
  }

  async function loadExisting(){
    const token = localStorage.getItem(LS_KEY);
    if (!token) return setPremiumUI({ premium:false });

    const res = await verifyToken(token);
    if (!res.ok) {
      localStorage.removeItem(LS_KEY);
      return setPremiumUI({ premium:false });
    }
    setPremiumUI({ premium:true, payload: res.payload });
  }

  async function activateFromInput(){
    const token = ($("licenseTokenInput")?.value || "").trim();
    if (!token) return showMsg("Pega un token o carga un archivo.", false);

    const res = await verifyToken(token);
    if (!res.ok) return showMsg("❌ " + res.err, false);

    localStorage.setItem(LS_KEY, token);
    setPremiumUI({ premium:true, payload: res.payload });
    showMsg("✅ Premium activado.", true);
    $("premiumBox").style.display = "none";
  }

  function clearLicense(){
    localStorage.removeItem(LS_KEY);
    if ($("licenseTokenInput")) $("licenseTokenInput").value = "";
    setPremiumUI({ premium:false });
    showMsg("Licencia eliminada. Modo FREE.", true);
  }

  function wirePanel(){
    // Si no existe el panel, no rompe
    if (!$("btnOpenPremium")) return;

    $("btnOpenPremium").addEventListener("click", () => { $("premiumBox").style.display = ""; });
    $("btnClosePremium").addEventListener("click", () => { $("premiumBox").style.display = "none"; });
    $("btnValidateLicense").addEventListener("click", activateFromInput);
    $("btnClearPremium").addEventListener("click", clearLicense);

    $("licenseFileInput").addEventListener("change", async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      $("licenseTokenInput").value = (await f.text()).trim();
      showMsg("Archivo cargado. Pulsa “Validar licencia”.", true);
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    wirePanel();
    await loadExisting();
  });

  // Exponer funciones por si quieres activación programática
  window.PCL_ClearLicense = clearLicense;
})();
