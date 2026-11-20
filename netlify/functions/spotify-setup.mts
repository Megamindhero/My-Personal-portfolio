// One-time helper to get the Spotify refresh token.
// 1. Visit /api/spotify/login and approve.
// 2. Copy the token shown into Netlify env var SPOTIFY_REFRESH_TOKEN, redeploy.
// Once SPOTIFY_REFRESH_TOKEN is set, these routes switch themselves off.

const SCOPES = "user-read-currently-playing user-read-playback-state";

const page = (body: string) =>
  new Response(
    `<!doctype html><meta name=viewport content="width=device-width"><body style="font:16px/1.5 system-ui;background:#0e0c0b;color:#f4ede4;padding:40px;max-width:720px">${body}</body>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );

export default async (req: Request) => {
  if (process.env.SPOTIFY_REFRESH_TOKEN) return page("<h2>Spotify is already connected.</h2>");
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return page("<h2>Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in Netlify first, then redeploy.</h2>");

  const url = new URL(req.url);
  const redirect = `${url.origin}/api/spotify/callback`;

  if (url.pathname.endsWith("/login")) {
    const q = new URLSearchParams({ response_type: "code", client_id: id, scope: SCOPES, redirect_uri: redirect });
    return Response.redirect(`https://accounts.spotify.com/authorize?${q}`, 302);
  }

  const code = url.searchParams.get("code");
  if (!code) return page(`<h2>No code returned.</h2><p>${url.searchParams.get("error") ?? ""}</p>`);
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirect }),
  });
  const j = await res.json();
  if (!j.refresh_token) return page(`<h2>Spotify said no.</h2><pre>${JSON.stringify(j, null, 2)}</pre>`);
  return page(
    `<h2>Connected.</h2><p>Copy this into Netlify as <b>SPOTIFY_REFRESH_TOKEN</b>, then redeploy. Keep it private.</p>
     <textarea readonly style="width:100%;height:120px;background:#1a1614;color:#f4907f;border:1px solid #333;padding:12px" onclick="this.select()">${j.refresh_token}</textarea>`
  );
};

export const config = { path: ["/api/spotify/login", "/api/spotify/callback"] };
