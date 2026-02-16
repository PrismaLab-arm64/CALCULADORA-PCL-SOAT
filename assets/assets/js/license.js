/* CALCULADORA PCL-SOAT — License verifier (HMAC-SHA256, offline)
   NOTE: Embedding an HMAC SECRET in a public repo exposes it. For production,
   migrate to asymmetric signing (private key offline, public key in PWA). */

(function () {
  "use strict";

  const STORAGE_KEY = "pclsoat_license_token_v1";

  // >>> IMPORTANT: SECRET must match the generator EXACTLY <<<
  const SECRET = "Sk1nn3r%%2025";

  function b64urlEncodeBytes(bytes) {
    let bin = "";
    const u8 = (bytes instanceof Uint8Array) ? bytes : new Uint8Array(bytes);
    for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function b64urlDecodeToBytes(b64url) {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64url.length + 3) % 4);
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function utf8(str) { return new TextEncoder().encode(str); }

  async function hmacSha256Base64Url(secret, message) {
    const key = await crypto.subtle.importKey(
      "raw",
      utf8(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, utf8(message));
    return b64urlEncodeBytes(new Uint8Array(sig));
  }

  function nowMs() { return Date.now(); }
  function daysLeft(expMs) { return Math.floor((expMs - nowMs()) / (24 * 3600 * 1000)); }

  async function verifyToken(token) {
    try {
      const t = (token || "").trim();
      if (!SECRET || SECRET.trim().length < 8) {
        return { ok: false, reason: "SECRET vacío o inválido en la PWA. Mantiene modo FREE." };
      }

      // Expected format: header.payload.signature (Base64URL)
      const parts = t.split(".");
      if (parts.length !== 3) return { ok: false, reason: "Token inválido: formato esperado header.payload.signature" };

      const hp = parts[0] + "." + parts[1];
      const sig = parts[2];

      const expected = await hmacSha256Base64Url(SECRET, hp);
      if (expected !== sig) return { ok: false, reason: "Firma inválida. SECRET no coincide o token alterado." };

      const payloadJson = new TextDecoder().decode(b64urlDecodeToBytes(parts[1]));
      const payload = JSON.parse(payloadJson);

      const expStr = payload.exp || payload.vencimiento || payload.expiry;
      const expMs = expStr ? Date.parse(expStr) : 0;
      if (!expMs || isNaN(expMs)) return { ok: false, reason: "Token sin vencimiento (exp) válido." };

      if (expMs <= nowMs()) return { ok: false, reason: "Licencia vencida." };

      return {
        ok: true,
        user: String(payload.user || payload.usuario || ""),
        plan: String(payload.plan || ""),
        exp: expStr,
        daysLeft: daysLeft(expMs),
        features: payload.features || payload.funciones || {},
        payload
      };
    } catch (err) {
      return { ok: false, reason: "Error validando token: " + (err && err.message ? err.message : String(err)) };
    }
  }

  function saveToken(token) { localStorage.setItem(STORAGE_KEY, token); }
  function loadToken() { return localStorage.getItem(STORAGE_KEY) || ""; }
  function clearToken() { localStorage.removeItem(STORAGE_KEY); }

  window.PCLSOAT_LICENSE = {
    verifyToken,
    saveToken,
    loadToken,
    clearToken,
    STORAGE_KEY
  };
})();
