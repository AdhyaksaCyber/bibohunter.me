export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const ip = req.headers.get("CF-Connecting-IP") || "0.0.0.0";
    const ua = (req.headers.get("User-Agent") || "").toLowerCase();
    const country = req.cf?.country || "XX";
    const method = req.method;
    const origin = req.headers.get("Origin") || "";

    // =========================
    // 🧱 0. TRACE ID (logging)
    // =========================
    const trace = crypto.randomUUID();

    // =========================
    // 🚫 1. METHOD LOCKDOWN
    // =========================
    if (!["GET", "HEAD"].includes(method)) {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // =========================
    // 🚫 2. PATH ATTACK BLOCK
    // =========================
    const blocked = [".env", ".git", "wp-admin", "phpmyadmin"];
    if (blocked.some(p => url.pathname.includes(p))) {
      return new Response("Forbidden", { status: 403 });
    }

    // =========================
    // 🚫 3. UA FILTER
    // =========================
    const badUA = ["curl", "wget", "python", "scanner", "bot"];
    if (!ua || badUA.some(b => ua.includes(b))) {
      return new Response("Blocked", { status: 403 });
    }

    // =========================
    // 🚫 4. GEO BLOCK (opsional)
    // =========================
    const blockedCountry = ["KP"];
    if (blockedCountry.includes(country)) {
      return new Response("Blocked", { status: 403 });
    }

    // =========================
    // ⚠️ 5. RATE LIMIT (KV, PERSISTENT)
    // =========================
    const key = `rl:${ip}`;
    const now = Date.now();

    let data = await env.RATE_LIMIT.get(key, "json");
    if (!data) data = [];

    const WINDOW = 10000;
    const LIMIT = 150;

    data = data.filter(t => now - t < WINDOW);
    data.push(now);

    await env.RATE_LIMIT.put(key, JSON.stringify(data), {
      expirationTtl: 60
    });

    if (data.length > LIMIT) {
      return new Response("Too Many Requests", { status: 429 });
    }

    // =========================
    // 🔐 6. API PROTECTION
    // =========================
    if (url.pathname.startsWith("/api")) {

      // 🔒 Origin check (frontend lu doang)
      if (origin !== env.ALLOWED_ORIGIN) {
        return new Response("Forbidden", { status: 403 });
      }

      // 🔑 API key
      const key = req.headers.get("x-api-key");
      if (key !== env.API_KEY) {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    // =========================
    // 🌐 7. API PROXY (3 endpoint)
    // =========================
    if (url.pathname.startsWith("/api1")) {
      return fetch("https://api1.com/data");
    }

    if (url.pathname.startsWith("/api2")) {
      return fetch("https://api2.com/data");
    }

    if (url.pathname.startsWith("/api3")) {
      return fetch("https://api3.com/data");
    }

    // =========================
    // 📦 8. STATIC
    // =========================
    const res = await env.ASSETS.fetch(req);

    // =========================
    // 🔐 9. SECURITY HEADERS
    // =========================
    const headers = new Headers(res.headers);

    headers.set("X-Frame-Options", "DENY");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    headers.set(
      "Content-Security-Policy",
      "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:;"
    );

    headers.set("X-Trace-ID", trace);

    // =========================
    // 🧠 10. LOGGING
    // =========================
    console.log(JSON.stringify({
      trace,
      ip,
      path: url.pathname,
      ua,
      country
    }));

    return new Response(res.body, {
      status: res.status,
      headers
    });
  }
};
