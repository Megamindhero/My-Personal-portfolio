// GET /api/now-playing → what Josep is playing on Spotify right now.
// Needs SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN in Netlify env vars.
// Without them it just answers { playing: false } and the site uses the ambient sound.

let cached: { token: string; exp: number } | null = null;

async function accessToken() {
  if (cached && Date.now() < cached.exp) return cached.token;
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!id || !secret || !refresh) return null;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  cached = { token: j.access_token, exp: Date.now() + (j.expires_in - 60) * 1000 };
  return cached.token;
}

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      // edge-cache for 15s so visitors share one Spotify call
      "Netlify-CDN-Cache-Control": "public, s-maxage=15, stale-while-revalidate=15",
      "Cache-Control": "no-store",
    },
  });

export default async () => {
  try {
    const token = await accessToken();
    if (!token) return json({ playing: false });
    const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status !== 200) return json({ playing: false });
    const d = await res.json();
    const t = d?.item;
    if (!d?.is_playing || !t || d.currently_playing_type !== "track") return json({ playing: false });
    return json({
      playing: true,
      id: t.id,
      title: t.name,
      artist: (t.artists || []).map((a: { name: string }) => a.name).join(", "),
      image: t.album?.images?.[1]?.url ?? t.album?.images?.[0]?.url ?? null,
      url: t.external_urls?.spotify,
    });
  } catch {
    return json({ playing: false });
  }
};

export const config = { path: "/api/now-playing" };
