"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { projects, stats, experience, links, playbook, article } from "@/lib/data";
import { sceneState, setAccent } from "@/lib/store";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const v = max > 0 ? window.scrollY / max : 0;
      sceneState.scroll = v;
      setP(v);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);
  return p;
}

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () =>
      setT(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Africa/Lagos",
        })
      );
    f();
    const id = setInterval(f, 15000);
    return () => clearInterval(id);
  }, []);
  return <span>{t} WAT</span>;
}

function Counter() {
  const [n, setN] = useState(600);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now() + 900;
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - t0) / 2600));
      const e = 1 - Math.pow(1 - k, 3);
      setN(Math.round(600 + e * 2400));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <span>{n.toLocaleString("en-US")}{n >= 3000 ? "+" : ""}</span>;
}

export default function Home() {
  useReveal();
  const progress = useScrollProgress();
  const [active, setActive] = useState<number | null>(null);
  const tag = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const copyDiscord = () => {
    navigator.clipboard?.writeText(links.discord).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (tag.current) tag.current.style.transform = `translate3d(${e.clientX + 18}px, ${e.clientY + 18}px, 0)`;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  const enter = (i: number) => {
    setActive(i);
    setAccent(projects[i].hue);
  };
  const leave = () => {
    setActive(null);
    setAccent(null);
  };

  return (
    <>
      <Scene />
      <div className="progress" style={{ transform: `scaleX(${progress})` }} />

      <header className="nav">
        <a href="#top" className="mark">JK</a>
        <nav>
          <a href="#record">Communities</a>
          <a href="#playbook">Playbook</a>
          <a href="#builds">Builds</a>
          <a href="#contact">Contact</a>
        </nav>
        <span className="mono dim nav-clock"><Clock /></span>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <p className="mono eyebrow reveal">Crypto community growth strategist</p>
          <h1 className="display">
            <span className="line"><span>Josep</span></span>
            <span className="line"><span><em>Kingsley</em></span></span>
          </h1>
          <div className="hero-foot">
            <div className="hero-left reveal">
              <p className="lede">
                I build and grow Web3 communities on Discord, Telegram and X, and report on them with real numbers.
              </p>
              <p className="mono dim chips">
                <a href={links.falcon} target="_blank" rel="noreferrer">Community Lead · Falcon</a>
                <a href={links.mitooshi} target="_blank" rel="noreferrer">Partner · Mitooshi</a>
                <a href={links.safary} target="_blank" rel="noreferrer">Safary Club · Cohort 1</a>
              </p>
            </div>
            <div className="counter reveal">
              <span className="counter-v"><Counter /></span>
              <span className="mono dim">Discord members · ReplicatsAI · under 10 months</span>
            </div>
          </div>
        </section>

        {/* NUMBERS */}
        <section className="block">
          <div className="block-head reveal">
            <span className="mono dim">01</span>
            <h2>Community, measured</h2>
            <span className="mono dim">4+ years</span>
          </div>
          <div className="stats">
            {stats.map((s, i) => (
              <div className="stat reveal" key={s.label} style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="stat-v">{s.value}</span>
                <span className="stat-l">{s.label}</span>
                <span className="mono dim">{s.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* RECORD */}
        <section id="record" className="block">
          <div className="block-head reveal">
            <span className="mono dim">02</span>
            <h2>Communities I&rsquo;ve run</h2>
            <span className="mono dim">Discord · Telegram · X</span>
          </div>
          <ul className="record">
            {experience.map((e, i) => (
              <li className="reveal" key={e.org} style={{ transitionDelay: `${i * 50}ms` }}>
                <span className="org">{e.org}</span>
                <span className="role">
                  {e.role}
                  <em>{e.note}</em>
                </span>
                <span className="mono dim">{e.time}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* PLAYBOOK */}
        <section id="playbook" className="block">
          <div className="block-head reveal">
            <span className="mono dim">03</span>
            <h2>How I grow them</h2>
            <span className="mono dim">Playbook</span>
          </div>
          <ol className="playbook">
            {playbook.map((p, i) => (
              <li className="reveal" key={p.n} style={{ transitionDelay: `${i * 70}ms` }}>
                <span className="mono dim">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.n}</h3>
                <p>{p.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* WRITING */}
        <section className="block">
          <div className="block-head reveal">
            <span className="mono dim">04</span>
            <h2>Writing</h2>
            <span className="mono dim">Pinned on X</span>
          </div>
          <a className="article reveal" href={article.url} target="_blank" rel="noreferrer">
            <span className="article-t">{article.title}</span>
            <span className="mono">Read on X ↗</span>
          </a>
        </section>

        {/* SIDE BUILDS */}
        <section id="builds" className="block">
          <div className="block-head reveal">
            <span className="mono dim">05</span>
            <h2>Side builds</h2>
            <span className="mono dim">Built for fun, with AI</span>
          </div>

          <ul className="work" onPointerLeave={leave}>
            {projects.map((p, i) => (
              <li
                key={p.id}
                className="row reveal"
                style={{ ["--hue" as string]: p.hue, transitionDelay: `${i * 60}ms` }}
                onPointerEnter={() => enter(i)}
                onFocus={() => enter(i)}
              >
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className={active !== null && active !== i ? "muted" : ""}
                >
                  <span className="mono dim idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="name">{p.name}</span>
                  <span className="desc">{p.line}</span>
                  <span className="stack mono">
                    {p.stack.map((s) => (
                      <i key={s}>{s}</i>
                    ))}
                  </span>
                  <span className="mono date">{p.date}</span>
                  <span className="arrow">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* CONTACT */}
        <section id="contact" className="contact">
          <p className="mono dim reveal">Got a community that should be bigger? I&rsquo;m @josepkingsley everywhere.</p>
          <a className="big reveal" href={links.x} target="_blank" rel="noreferrer">
            Let&rsquo;s grow it<span className="dot">.</span>
          </a>
          <div className="contact-links reveal">
            <a href={links.x} target="_blank" rel="noreferrer">X ↗</a>
            <a href={links.telegram} target="_blank" rel="noreferrer">Telegram ↗</a>
            <button type="button" className="copy" onClick={copyDiscord}>
              {copied ? "Copied @josepkingsley" : "Discord @josepkingsley"}
            </button>
            <a href={links.linktree} target="_blank" rel="noreferrer">Linktree ↗</a>
            <a href={links.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
          <footer className="mono dim foot">
            <span>© {new Date().getFullYear()} Josep Kingsley 🦀</span>
            <span>Move to gather · Click to send a signal</span>
          </footer>
        </section>
      </main>

      <div ref={tag} className={`tag ${active !== null ? "on" : ""}`}>
        {active !== null && (
          <>
            <span className="mono">{projects[active].kind}</span>
            <span>Open site ↗</span>
          </>
        )}
      </div>
    </>
  );
}
