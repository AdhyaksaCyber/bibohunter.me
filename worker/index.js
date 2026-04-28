export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);

    // 🚫 block common attack paths
    if (
      url.pathname.includes(".env") ||
      url.pathname.includes("wp-admin") ||
      url.pathname.includes("phpmyadmin")
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    const res = await env.ASSETS.fetch(req);
    const headers = new Headers(res.headers);

    // 🔐 real security headers (bukan meta)
    headers.set("Content-Security-Policy",
      "default-src 'none'; " +
      "script-src 'self' https://static.cloudflareinsights.com; " +
      "style-src 'self'; " +
      "img-src 'self' data:; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none'; " +
      "base-uri 'none';"
    );

    headers.set("X-Frame-Options", "DENY");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

    return new Response(res.body, {
      status: res.status,
      headers
    });
  }
};
