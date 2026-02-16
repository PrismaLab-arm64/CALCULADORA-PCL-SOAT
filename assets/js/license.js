/* PCL-SOAT — Validador SIMPLE (PWA)
   Token: payloadB64u.signatureB64u   (2 partes)
*/
(function() {
  "use strict";

  const STORAGE_KEY = "pclsoat_license_token_v1";
  const SECRET = "Sk1nn3r%%2025"; // Debe coincidir con el generador offline

  function b64uToBytes(b64u) {
    const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64u.length + 3) % 4);
    const str = atob(b64);
    const bytes = new Uint8Array(str.length);
    for (let i=0; i<str.length; i++) bytes[i] = str.charCodeAt(i);
    return bytes;
  }

  function b64uEncode(bytes) {
    let bin = "";
    const arr = new Uint8Array(bytes);
    for (let i=0; i<arr.length; i++) bin += String.fromCharCode(arr[i]);
    return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  }

  function textToBytes(s) { return new TextEncoder().encode(s); }
  function bytesToText(b) { return new TextDecoder().decode(b); }
  function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const dd = String(d.getDate()).padStart(2,"0");
    return `${yyyy}-${mm}-${dd}`;
  }

  async function hmacSha256(secret, message) {
    const key = await crypto.subtle.importKey(
      "raw",
      textToBytes(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, textToBytes(message));
    return b64uEncode(sig);
  }

  async function verifyToken(token) {
    try {
      const t = (token || "").trim();
      if (!SECRET) return { ok:false, reason:"SECRET no configurado en la PWA." };
      const parts = t.split(".");
      if (parts.length !== 2) return { ok:false, reason:"Token inválido: se esperan 2 partes payload.signature" };

      const payloadB64u = parts[0];
      const sigB64u = parts[1];

      const expected = await hmacSha256(SECRET, payloadB64u);
      if (expected !== sigB64u) return { ok:false, reason:"Firma inválida (token modificado o SECRET no coincide)." };

      const payload = JSON.parse(bytesToText(b64uToBytes(payloadB64u)));
      if (!payload.exp) return { ok:false, reason:"Payload inválido: exp faltante." };
      if (payload.exp < todayISO()) return { ok:false, reason:"Licencia vencida." };

      const expMs = Date.parse(payload.exp);
      const daysLeft = Math.floor((expMs - Date.now()) / (24*3600*1000));

      return {
        ok:true,
        user: String(payload.user || ""),
        plan: String(payload.plan || ""),
        exp: payload.exp,
        daysLeft,
        features: payload.features || {},
        payload
      };
    } catch (e) {
      return { ok:false, reason:"Error validando token: " + (e && e.message ? e.message : String(e)) };
    }
  }

  function saveToken(token) { localStorage.setItem(STORAGE_KEY, token); }
  function loadToken() { return localStorage.getItem(STORAGE_KEY) || ""; }
  function clearToken() { localStorage.removeItem(STORAGE_KEY); }

  window.PCLSOAT_LICENSE = {
    verifyToken, saveToken, loadToken, clearToken, STORAGE_KEY
  };
})();
