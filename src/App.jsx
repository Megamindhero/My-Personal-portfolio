import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const skills = [
  { category: "Blockchain", items: ["Solidity", "Web3.js", "Ethers.js", "DeFi Protocols", "Smart Contracts", "NFT Architecture"] },
  { category: "AI & Research", items: ["Machine Learning", "LLM Integration", "AI Agents", "Data Pipelines", "Model Fine-tuning", "Prompt Engineering"] },
  { category: "Web3 & Community", items: ["Community Lead", "Growth Strategy", "Metric Analysis", "Safary Certified", "Web3 Onboarding", "DAO Governance", "Cohort 1 Alumni"] },
];

const stats = [
  { value: "5+", label: "Years in Crypto" },
  { value: "10+", label: "Projects Shipped" },
  { value: "∞", label: "Curiosity" },
];

function GlitchText({ text }) {
  return (
    <span className="glitch" data-text={text} style={{ position: "relative", display: "inline-block" }}>
      {text}
    </span>
  );
}

function AnimatedCounter({ value, label }) {
  const [displayed, setDisplayed] = useState("0");
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!isNaN(parseInt(value))) {
          let start = 0;
          const end = parseInt(value);
          const step = Math.ceil(end / 30);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) { setDisplayed(value); clearInterval(timer); }
            else setDisplayed(String(start) + (value.includes("+") ? "+" : ""));
          }, 40);
        } else {
          setDisplayed(value);
        }
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: "clamp(2.5rem, 5vw, 4rem)",
        color: "#00ffe0",
        lineHeight: 1,
        textShadow: "0 0 30px rgba(0,255,224,0.6)"
      }}>{displayed}</div>
      <div style={{ fontSize: "0.75rem", color: "#4a7a8a", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "6px" }}>{label}</div>
    </div>
  );
}

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeSkill, setActiveSkill] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@300;400;700&family=DM+Sans:ital,wght@0,300;0,400;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --neon: #00ffe0;
          --neon2: #0055ff;
          --neon3: #6600ff;
          --bg: #020509;
          --card: rgba(0,255,224,0.03);
          --border: rgba(0,255,224,0.1);
          --muted: #3a5a6a;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: #ddeef5;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        body::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(0,255,224,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,224,0.018) 1px, transparent 1px);
          background-size: 55px 55px;
          pointer-events: none;
          z-index: 0;
        }

        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(130px);
          pointer-events: none;
          z-index: 0;
          animation: blobFloat 14s ease-in-out infinite alternate;
        }
        .blob1 { width: 700px; height: 700px; background: var(--neon3); opacity: 0.12; top: -200px; right: -200px; }
        .blob2 { width: 500px; height: 500px; background: var(--neon2); opacity: 0.1; bottom: 5%; left: -150px; animation-delay: -5s; }
        .blob3 { width: 300px; height: 300px; background: var(--neon); opacity: 0.06; top: 45%; right: 5%; animation-delay: -9s; }

        @keyframes blobFloat {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(25px,-35px) scale(1.07); }
        }

        .cursor-glow {
          position: fixed;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,255,224,0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
          transform: translate(-50%, -50%);
          transition: left 0.1s, top 0.1s;
        }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 999;
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 60px;
          transition: background 0.4s, backdrop-filter 0.4s;
        }
        nav.scrolled {
          background: rgba(2,5,9,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 1rem;
          color: var(--neon);
          text-decoration: none;
          letter-spacing: 0.06em;
          text-shadow: 0 0 20px rgba(0,255,224,0.5);
        }
        .nav-links { display: flex; gap: 36px; list-style: none; }
        .nav-links a {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem; color: var(--muted);
          text-decoration: none; letter-spacing: 0.14em;
          text-transform: uppercase; transition: color 0.3s;
        }
        .nav-links a:hover { color: var(--neon); }

        section { position: relative; z-index: 1; }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          justify-content: center;
          padding: 120px 60px 80px;
          position: relative;
          overflow: hidden;
        }
        .hero-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: var(--neon);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 28px;
          opacity: 0;
          animation: fadeUp 0.8s 0.2s forwards;
        }
        .hero-tag::before { content: '> '; opacity: 0.5; }
        .hero-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(3.5rem, 8vw, 8rem);
          line-height: 0.95;
          letter-spacing: -0.02em;
          color: #fff;
          opacity: 0;
          animation: fadeUp 0.8s 0.4s forwards;
        }
        .hero-name .accent {
          color: transparent;
          -webkit-text-stroke: 1px rgba(0,255,224,0.6);
          display: block;
        }
        .hero-role {
          font-family: 'JetBrains Mono', monospace;
          font-size: clamp(0.85rem, 1.5vw, 1.1rem);
          color: var(--muted);
          margin-top: 28px;
          max-width: 520px;
          line-height: 1.7;
          opacity: 0;
          animation: fadeUp 0.8s 0.6s forwards;
        }
        .hero-role span { color: var(--neon); }
        .hero-actions {
          display: flex; gap: 16px; margin-top: 48px;
          opacity: 0;
          animation: fadeUp 0.8s 0.8s forwards;
          flex-wrap: wrap;
        }
        .btn-primary {
          background: var(--neon) !important;
          color: #020509 !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.12em !important;
          text-transform: uppercase !important;
          padding: 14px 32px !important;
          border-radius: 2px !important;
          border: none !important;
          transition: all 0.3s !important;
          box-shadow: 0 0 30px rgba(0,255,224,0.3) !important;
        }
        .btn-primary:hover {
          box-shadow: 0 0 50px rgba(0,255,224,0.6) !important;
          transform: translateY(-2px) !important;
        }
        .btn-outline {
          background: transparent !important;
          color: var(--neon) !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 0.75rem !important;
          font-weight: 400 !important;
          letter-spacing: 0.12em !important;
          text-transform: uppercase !important;
          padding: 14px 32px !important;
          border-radius: 2px !important;
          border: 1px solid rgba(0,255,224,0.3) !important;
          transition: all 0.3s !important;
        }
        .btn-outline:hover {
          border-color: var(--neon) !important;
          background: rgba(0,255,224,0.05) !important;
          box-shadow: 0 0 20px rgba(0,255,224,0.15) !important;
        }

        .hero-scroll {
          position: absolute; bottom: 40px; left: 60px;
          display: flex; align-items: center; gap: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem; color: var(--muted);
          letter-spacing: 0.15em; text-transform: uppercase;
          opacity: 0; animation: fadeUp 0.8s 1.2s forwards;
        }
        .scroll-line {
          width: 40px; height: 1px;
          background: linear-gradient(to right, var(--neon), transparent);
        }

        /* DIAGONAL DIVIDER */
        .divider-line {
          height: 1px;
          background: linear-gradient(to right, transparent, var(--border), transparent);
          margin: 0 60px;
          position: relative; z-index: 1;
        }

        /* STATS */
        .stats-section {
          padding: 60px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          position: relative; z-index: 1;
        }
        .stat-cell {
          background: var(--bg);
          padding: 40px;
          display: flex; flex-direction: column; align-items: center;
        }

        /* ABOUT */
        .about-section {
          padding: 120px 60px;
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 80px;
          align-items: center;
        }
        .section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          color: var(--neon);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 20px;
          display: flex; align-items: center; gap: 12px;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
          max-width: 60px;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 4vw, 3.5rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #fff;
          margin-bottom: 28px;
        }
        .about-body {
          font-size: 1rem;
          color: #7a9aaa;
          line-height: 1.9;
          font-weight: 300;
        }
        .about-body strong { color: var(--neon); font-weight: 400; }
        .about-visual {
          position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .avatar-frame {
          width: 280px; height: 280px;
          border: 1px solid var(--border);
          position: relative;
          background: var(--card);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .avatar-frame::before {
          content: '';
          position: absolute; inset: -1px;
          background: linear-gradient(135deg, var(--neon), transparent, var(--neon3));
          z-index: -1;
          opacity: 0.4;
          border-radius: 2px;
        }
        .avatar-inner {
          font-family: 'Bebas Neue', cursive;
          font-size: 5rem;
          color: rgba(0,255,224,0.15);
          letter-spacing: 0.1em;
          text-align: center;
          line-height: 1;
        }
        .avatar-tag {
          position: absolute;
          bottom: -1px; right: -1px;
          background: var(--neon);
          color: var(--bg);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 6px 12px;
          text-transform: uppercase;
        }
        .corner-tl {
          position: absolute; top: -8px; left: -8px;
          width: 16px; height: 16px;
          border-top: 2px solid var(--neon);
          border-left: 2px solid var(--neon);
        }
        .corner-br {
          position: absolute; bottom: -8px; right: -8px;
          width: 16px; height: 16px;
          border-bottom: 2px solid var(--neon);
          border-right: 2px solid var(--neon);
        }

        /* SKILLS */
        .skills-section { padding: 120px 60px; }
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          margin-top: 60px;
          background: var(--border);
        }
        .skill-card {
          background: var(--bg);
          padding: 40px;
          transition: background 0.3s;
          cursor: default;
        }
        .skill-card:hover { background: rgba(0,255,224,0.03); }
        .skill-cat {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          color: #fff;
          margin-bottom: 24px;
          display: flex; align-items: center; gap: 10px;
        }
        .skill-cat::before {
          content: '';
          width: 6px; height: 6px;
          background: var(--neon);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--neon);
          flex-shrink: 0;
        }
        .skill-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--muted);
          border: 1px solid rgba(0,255,224,0.12);
          padding: 5px 12px;
          letter-spacing: 0.08em;
          transition: all 0.25s;
        }
        .skill-tag:hover {
          color: var(--neon);
          border-color: rgba(0,255,224,0.4);
          background: rgba(0,255,224,0.05);
          box-shadow: 0 0 10px rgba(0,255,224,0.1);
        }

        /* CONTACT */
        .contact-section {
          padding: 120px 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
          border-top: 1px solid var(--border);
        }
        .contact-form { display: flex; flex-direction: column; gap: 16px; }
        .form-field {
          display: flex; flex-direction: column; gap: 8px;
        }
        .form-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .form-input {
          background: rgba(0,255,224,0.03);
          border: 1px solid var(--border);
          color: #ddeef5;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          padding: 14px 18px;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          border-radius: 2px;
        }
        .form-input::placeholder { color: var(--muted); }
        .form-input:focus {
          border-color: rgba(0,255,224,0.4);
          box-shadow: 0 0 20px rgba(0,255,224,0.08);
        }
        .form-textarea { resize: vertical; min-height: 120px; }

        .contact-links { display: flex; flex-direction: column; gap: 20px; margin-top: 40px; }
        .contact-link {
          display: flex; align-items: center; gap: 16px;
          text-decoration: none;
          padding: 20px;
          border: 1px solid var(--border);
          transition: all 0.3s;
          background: var(--card);
        }
        .contact-link:hover {
          border-color: rgba(0,255,224,0.3);
          background: rgba(0,255,224,0.04);
          transform: translateX(6px);
        }
        .contact-link-icon {
          width: 40px; height: 40px;
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .contact-link-info { flex: 1; }
        .contact-link-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .contact-link-value {
          font-size: 0.9rem;
          color: #ddeef5;
        }
        .contact-link-arrow { color: var(--neon); font-size: 1rem; }

        /* FOOTER */
        footer {
          padding: 40px 60px;
          border-top: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          position: relative; z-index: 1;
        }
        .footer-copy {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--muted);
          letter-spacing: 0.1em;
        }
        .footer-status {
          display: flex; align-items: center; gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--muted);
          letter-spacing: 0.1em;
        }
        .status-dot {
          width: 6px; height: 6px;
          background: #00ff88;
          border-radius: 50%;
          animation: pulse 2s infinite;
          box-shadow: 0 0 10px #00ff88;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* HAMBURGER */
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 6px;
          z-index: 999;
          background: none;
          border: none;
        }
        .hamburger span {
          display: block;
          width: 24px; height: 2px;
          background: var(--neon);
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* MOBILE MENU OVERLAY */
        .mobile-menu {
          display: none;
          position: fixed; inset: 0;
          background: rgba(2,5,9,0.97);
          backdrop-filter: blur(20px);
          z-index: 150;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 40px;
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.3s, transform 0.3s;
          pointer-events: none;
        }
        .mobile-menu.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }
        .mobile-menu a {
          font-family: 'Syne', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          letter-spacing: -0.02em;
          transition: color 0.3s, text-shadow 0.3s;
        }
        .mobile-menu a:hover { color: var(--neon); text-shadow: 0 0 30px rgba(0,255,224,0.5); }
        .mobile-menu-footer {
          position: absolute; bottom: 40px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem; color: var(--muted); letter-spacing: 0.15em;
        }
        .skills-scroll-hint { display: none; }

        @media (max-width: 768px) {
          nav { padding: 18px 24px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .mobile-menu { display: flex; }

          .hero { padding: 100px 24px 70px; min-height: 100svh; }
          .hero-tag { font-size: 0.6rem; letter-spacing: 0.1em; }
          .hero-scroll { left: 24px; bottom: 28px; }

          .stats-section {
            grid-template-columns: repeat(3, 1fr);
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .stats-section::-webkit-scrollbar { display: none; }
          .stat-cell { padding: 28px 16px; min-width: 90px; }

          .about-section { grid-template-columns: 1fr; padding: 60px 24px; gap: 40px; }
          .about-visual { justify-content: flex-start; }
          .avatar-frame { width: 200px; height: 200px; }
          .avatar-inner { font-size: 3.5rem; }

          .skills-section { padding: 60px 24px; }
          .skills-grid {
            grid-template-columns: repeat(3, 280px);
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            background: transparent;
            gap: 12px;
            padding-bottom: 8px;
          }
          .skills-grid::-webkit-scrollbar { display: none; }
          .skill-card { border: 1px solid var(--border); border-radius: 4px; min-width: 280px; }
          .skills-scroll-hint {
            display: flex; align-items: center; gap: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.6rem; color: var(--muted);
            letter-spacing: 0.1em; margin-top: 14px;
          }

          .contact-section { grid-template-columns: 1fr; padding: 60px 24px; gap: 40px; }
          footer { padding: 28px 24px; flex-direction: column; gap: 12px; text-align: center; }
          .divider-line { margin: 0 24px; }
          .section-title { font-size: clamp(1.8rem, 7vw, 3rem); }
        }

        @media (max-width: 380px) {
          .hero-name { font-size: clamp(2.8rem, 12vw, 4rem); }
          .stat-cell { padding: 20px 10px; }
        }
      `}</style>

      {/* Blobs */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />

      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />

      {/* MOBILE MENU OVERLAY */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        <a href="#skills" onClick={() => setMenuOpen(false)}>Skills</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        <div className="mobile-menu-footer">josepkingsley · blockchain · ai · web3</div>
      </div>

      {/* NAV */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href="#" className="nav-logo">JK://</a>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <button className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-tag">blockchain · ai · community lead · safary certified</div>
        <h1 className="hero-name">
          Josep
          <span className="accent">Kingsley</span>
        </h1>
        <p className="hero-role">
          <span>Blockchain Researcher</span> & <span>AI Engineer</span> building at the intersection
          of decentralized systems and intelligent machines. Community strategist bridging Web3 builders
          with the tools they need to scale.
        </p>
        <div className="hero-actions">
          <a href="#contact">
            <Button className="btn-primary">Hire Me</Button>
          </a>
          <a href="https://x.com/josepkingsley" target="_blank" rel="noopener noreferrer">
            <Button className="btn-outline">Follow on X →</Button>
          </a>
        </div>
        <div className="hero-scroll">
          <div className="scroll-line" />
          scroll to explore
        </div>
      </section>

      {/* STATS */}
      <div className="stats-section">
        {stats.map((s) => (
          <div key={s.label} className="stat-cell">
            <AnimatedCounter value={s.value} label={s.label} />
          </div>
        ))}
      </div>

      <div className="divider-line" style={{ marginTop: "0" }} />

      {/* ABOUT */}
      <section id="about" className="about-section">
        <div>
          <div className="section-label">Who I Am</div>
          <h2 className="section-title">Building the<br />Decentralized<br />Future</h2>
          <p className="about-body">
            I'm <strong>Josep Kingsley</strong> — a blockchain researcher and AI engineer passionate about
            the frontier where cryptographic systems meet intelligent agents. I design, research, and
            ship products that push what's possible in <strong>Web3 infrastructure</strong> and
            <strong> AI-driven automation</strong>.
            <br /><br />
            Beyond the code, I work as a <strong>Web3 Community Lead</strong> — driving growth through
            data-driven metric analysis, onboarding strategies, and community engagement. I'm proud to be
            <strong> Safary Certified</strong> and part of the <strong>first cohort</strong> — an early
            builder in the Web3 community space.
          </p>
          <div style={{ marginTop: "32px" }}>
            <Badge style={{
              background: "rgba(0,255,224,0.08)",
              color: "var(--neon)",
              border: "1px solid rgba(0,255,224,0.2)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              marginRight: "10px",
              marginBottom: "10px",
              borderRadius: "2px",
              padding: "6px 12px"
            }}>Open to Opportunities</Badge>
            <Badge style={{
              background: "rgba(0,255,224,0.08)",
              color: "var(--neon)",
              border: "1px solid rgba(0,255,224,0.2)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              marginRight: "10px",
              marginBottom: "10px",
              borderRadius: "2px",
              padding: "6px 12px"
            }}>🏆 Safary Certified · Cohort 1</Badge>
            <Badge style={{
              background: "transparent",
              color: "#4a7a8a",
              border: "1px solid rgba(0,255,224,0.08)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              marginRight: "10px",
              marginBottom: "10px",
              borderRadius: "2px",
              padding: "6px 12px"
            }}>Based in Nigeria 🇳🇬</Badge>
          </div>
        </div>
        <div className="about-visual">
          <div className="avatar-frame">
            <div className="corner-tl" />
            <div className="corner-br" />
            <div className="avatar-inner">
              <img 
  src="./josep.jpg" 
  alt="Josep Kingsley"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center top"
  }}
/>
              <div style={{ fontSize: "0.9rem", color: "rgba(0,255,224,0.2)", marginTop: "8px", letterSpacing: "0.2em" }}>0x///</div>
            </div>
            <div className="avatar-tag">Available for work</div>
          </div>
        </div>
      </section>

      <Separator style={{ background: "var(--border)", margin: "0 60px" }} />

      {/* SKILLS */}
      <section id="skills" className="skills-section">
        <div className="section-label">What I Do</div>
        <h2 className="section-title">Skills &<br />Expertise</h2>
        <div className="skills-grid">
          {skills.map((cat) => (
            <div key={cat.category} className="skill-card">
              <div className="skill-cat">{cat.category}</div>
              <div className="skill-tags">
                {cat.items.map((item) => (
                  <span key={item} className="skill-tag">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="skills-scroll-hint">← swipe to see more →</div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact-section">
        <div>
          <div className="section-label">Get In Touch</div>
          <h2 className="section-title">Let's Build<br />Something</h2>
          <p className="about-body" style={{ marginBottom: "0" }}>
            Whether you have a <strong>Web3 project</strong> that needs engineering muscle,
            a community that needs <strong>strategic growth</strong>, or an AI use case
            you want to explore — I'm all ears.
          </p>
          <div className="contact-links">
            <a href="https://x.com/josepkingsley" target="_blank" rel="noopener noreferrer" className="contact-link">
              <div className="contact-link-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#00ffe0">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            </div>
              <div className="contact-link-info">
                <div className="contact-link-label">Twitter / X</div>
                <div className="contact-link-value">@josepkingsley</div>
              </div>
              <div className="contact-link-arrow">→</div>
            </a>
            <a href="https://github.com/Megamindhero" target="_blank" rel="noopener noreferrer" className="contact-link">
              <div className="contact-link-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#00ffe0">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              </div>
              <div className="contact-link-info">
                <div className="contact-link-label">GitHub</div>
                <div className="contact-link-value">Megamindhero</div>
              </div>
              <div className="contact-link-arrow">→</div>
            </a>
            <a href="https://t.me/josepkingsley" target="_blank" rel="noopener noreferrer" className="contact-link">
              <div className="contact-link-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#00ffe0">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
              </svg>
              </div>
              <div className="contact-link-info">
                <div className="contact-link-label">Telegram</div>
                <div className="contact-link-value">@josepkingsley</div>
              </div>
              <div className="contact-link-arrow">→</div>
            </a>
          </div>
        </div>
        <div>
          <Card style={{
            background: "rgba(0,255,224,0.02)",
            border: "1px solid var(--border)",
            borderRadius: "2px"
          }}>
            <CardContent style={{ padding: "40px" }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.7rem",
                color: "var(--neon)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "28px"
              }}>Send a Message</div>
              <form className="contact-form" action="https://formspree.io/f/mqedykrd" method="POST">
                <div className="form-field">
                  <label className="form-label">Name</label>
                  <input className="form-input" placeholder="Your name" name="name" />
                </div>
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="your@email.com" name="email" />
                </div>
                <div className="form-field">
                  <label className="form-label">Message</label>
                  <textarea className="form-input form-textarea" placeholder="Tell me about your project..." name="message" />
                </div>
                <Button type="submit" className="btn-primary" style={{ width: "100%",     marginTop: "8px" }}>
                  Send Message →
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-copy">© 2025 Josep Kingsley. All rights reserved.</div>
        <div className="footer-status">
          <div className="status-dot" />
          Available for new projects
        </div>
      </footer>
    </>
  );
}
