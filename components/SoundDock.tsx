"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { startAmbient, stopAmbient, pluck, isAmbientOn } from "@/lib/ambient";

type NowPlaying =
  | { playing: false }
  | { playing: true; id: string; title: string; artist: string; image: string | null; url: string };

type Controller = {
  addListener: (ev: string, cb: (e: { data: { isPaused: boolean; position: number; duration: number } }) => void) => void;
  loadUri: (uri: string) => void;
  play: () => void;
  pause: () => void;
  destroy: () => void;
};
type IFrameAPI = {
  createController: (
    el: HTMLElement,
    opts: { uri: string; width: string | number; height: number },
    cb: (c: Controller) => void
  ) => void;
};

let apiPromise: Promise<IFrameAPI> | null = null;
function loadSpotifyApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    (window as unknown as { onSpotifyIframeApiReady: (a: IFrameAPI) => void }).onSpotifyIframeApiReady = resolve;
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    document.body.appendChild(s);
  });
  return apiPromise;
}

export default function SoundDock() {
  const [np, setNp] = useState<NowPlaying>({ playing: false });
  // last track we saw, so the dock can still show it after Josep stops
  const [track, setTrack] = useState<Extract<NowPlaying, { playing: true }> | null>(null);
  const misses = useRef(0);
  const josepStopped = useRef(false);
  const [mode, setMode] = useState<"off" | "ambient" | "spotify">("off");
  const holder = useRef<HTMLDivElement>(null);
  const ctrl = useRef<Controller | null>(null);
  const loadedId = useRef<string | null>(null);
  const [past, setPast] = useState(false);

  useEffect(() => {
    const on = () => setPast(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // poll what Josep is playing
  useEffect(() => {
    let alive = true;
    const get = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch("/api/now-playing", { cache: "no-store" });
        if (!r.ok) throw 0;
        const j = (await r.json()) as NowPlaying;
        if (!alive) return;
        if (j.playing) {
          misses.current = 0;
          setNp(j);
          setTrack(j);
        } else if (++misses.current >= 2) {
          setNp(j);
        }
      } catch {
        if (alive && ++misses.current >= 2) setNp({ playing: false });
      }
    };
    get();
    const id = setInterval(get, 20000);
    document.addEventListener("visibilitychange", get);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", get);
    };
  }, []);

  // clicking the field plucks a note while the ambient bed is on
  useEffect(() => {
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest("a,button,iframe,.dock")) return;
      if (isAmbientOn()) pluck(e.clientX / window.innerWidth);
    };
    window.addEventListener("pointerdown", down);
    return () => window.removeEventListener("pointerdown", down);
  }, []);

  const openSpotify = useCallback(async (trackId: string) => {
    const uri = `spotify:track:${trackId}`;
    if (!ctrl.current && loadedId.current && loadedId.current !== trackId) loadedId.current = null;
    if (ctrl.current) {
      if (loadedId.current !== trackId) ctrl.current.loadUri(uri);
      loadedId.current = trackId;
      ctrl.current.play();
      return;
    }
    const api = await Promise.race([
      loadSpotifyApi(),
      new Promise<null>((r) => setTimeout(() => r(null), 5000)),
    ]);
    if (!holder.current) return;
    holder.current.innerHTML = "";
    if (!api) {
      // loader script slow or blocked: plain embed, visitor taps play
      const f = document.createElement("iframe");
      f.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
      f.width = "100%";
      f.height = "80";
      f.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
      f.loading = "lazy";
      f.style.border = "0";
      holder.current.appendChild(f);
      loadedId.current = trackId;
      return;
    }
    const el = document.createElement("div");
    holder.current.appendChild(el);
    api.createController(el, { uri, width: "100%", height: 80 }, (c) => {
      ctrl.current = c;
      loadedId.current = trackId;
      // when the song a visitor is hearing finishes and Josep has stopped, fall back to ambient
      c.addListener("playback_update", (e) => {
        const d = e?.data;
        if (!d || !d.duration) return;
        const ended = d.position >= d.duration - 1200;
        if (ended && josepStopped.current) fallBack.current?.();
      });
      try {
        c.play();
      } catch {}
    });
  }, []);

  const closeSpotify = useCallback(() => {
    try {
      ctrl.current?.pause();
      ctrl.current?.destroy();
    } catch {}
    ctrl.current = null;
    loadedId.current = null;
    if (holder.current) holder.current.innerHTML = "";
  }, []);

  const fallBack = useRef<(() => void) | null>(null);
  fallBack.current = () => {
    closeSpotify();
    startAmbient();
    setMode("ambient");
  };

  // follow Josep: new song → load it. If he stops, never cut the song a visitor
  // is hearing; let it finish, then fall back to ambient.
  useEffect(() => {
    josepStopped.current = !np.playing;
    if (mode !== "spotify") return;
    if (np.playing && loadedId.current !== np.id) openSpotify(np.id);
  }, [np, mode, openSpotify]);

  const toggle = async () => {
    if (mode !== "off") {
      stopAmbient();
      closeSpotify();
      setMode("off");
      return;
    }
    if (np.playing) {
      setMode("spotify");
      await openSpotify(np.id);
    } else {
      await startAmbient();
      setMode("ambient");
    }
  };

  const switchTo = async (m: "ambient" | "spotify") => {
    if (m === "ambient") {
      closeSpotify();
      await startAmbient();
      setMode("ambient");
    } else if (np.playing) {
      stopAmbient();
      setMode("spotify");
      await openSpotify(np.id);
    }
  };

  const live = np.playing;
  const shown = live ? np : mode === "spotify" ? track : null;
  const on = mode !== "off";

  return (
    <div className={`dock ${on ? "on" : ""} ${mode === "spotify" ? "wide" : ""} ${past && !on && !live ? "mini" : ""}`}>
      <div className="dock-row">
        <button type="button" className="dock-btn" onClick={toggle} aria-pressed={on} aria-label={on ? "Sound off" : "Sound on"}>
          <span className={`bars ${on ? "play" : ""}`}>
            <i />
            <i />
            <i />
            <i />
          </span>
        </button>

        <div className="dock-text">
          {shown ? (
            <a href={shown.url} target="_blank" rel="noreferrer" className="dock-track">
              {shown.image && <img src={shown.image} alt="" width={30} height={30} />}
              <span>
                <span className="mono dock-label">
                  {live ? (
                    <>
                      <b className="live-dot" /> Josep is listening
                    </>
                  ) : (
                    "Josep was listening"
                  )}
                </span>
                <span className="dock-title">
                  {shown.title} <em>by {shown.artist}</em>
                </span>
              </span>
            </a>
          ) : (
            <span>
              <span className="mono dock-label">{on ? "Ambient" : "Sound"}</span>
              <span className="dock-title">{on ? "Click the field to play notes" : "Turn on for the full experience"}</span>
            </span>
          )}
        </div>

        {on && (live || mode === "spotify") && (
          <button type="button" className="mono dock-switch" onClick={() => switchTo(mode === "spotify" ? "ambient" : "spotify")}>
            {mode === "spotify" ? "Ambient" : "His song"}
          </button>
        )}
      </div>
      <div ref={holder} className="dock-embed" hidden={mode !== "spotify"} />
    </div>
  );
}
