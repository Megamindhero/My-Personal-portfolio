// Edit everything about the site from this one file.

export type Project = {
  id: string;
  name: string;
  url: string;
  date: string; // shown as-is
  year: string;
  kind: string;
  line: string;
  stack: string[];
  hue: string; // accent the 3D field shifts to on hover
};

export const projects: Project[] = [
  {
    id: "qiss",
    name: "Qissbeauty",
    url: "https://qissbeautyworld.com/",
    date: "Nov 2026",
    year: "2026",
    kind: "E-commerce",
    line: "Storefront with catalogue, image storage and WhatsApp checkout.",
    stack: ["Next.js", "TypeScript", "Supabase"],
    hue: "#e05aa0",
  },
  {
    id: "lodgemate",
    name: "LodgeMate",
    url: "https://lodgemate.ng/",
    date: "Sep 2026",
    year: "2026",
    kind: "Platform",
    line: "Verified apartment listings with landlord, tenant and admin portals.",
    stack: ["Next.js", "TypeScript", "OTP auth"],
    hue: "#8b7bff",
  },
  {
    id: "draaaft",
    name: "Draaaft",
    url: "https://draaaft.netlify.app/",
    date: "Aug 2026",
    year: "2026",
    kind: "Tool",
    line: "Distraction-free writer that saves and restores .draaft files.",
    stack: ["HTML", "CSS", "JavaScript"],
    hue: "#f2efe6",
  },
  {
    id: "upolygunbroke",
    name: "UpolygunBroke",
    url: "https://upolygunbroke.netlify.app/",
    date: "Jul 2026",
    year: "2026",
    kind: "Trading",
    line: "Paper trading for Polymarket with live order books and smart-money feeds.",
    stack: ["JavaScript", "Polymarket CLOB API", "Falcon API"],
    hue: "#4dd8ff",
  },
  {
    id: "btcedge",
    name: "BTCEDGE",
    url: "https://aesthetic-flan-82c46c.netlify.app/",
    date: "Mar 2026",
    year: "2026",
    kind: "Signals",
    line: "Real-time UP/DOWN signals for 5-minute BTC markets from a Chainlink feed.",
    stack: ["JavaScript", "Chainlink", "WebSockets"],
    hue: "#ff9a3d",
  },
  {
    id: "flappynaira",
    name: "FlappyNaira",
    url: "https://flappynaira.netlify.app/",
    date: "Feb 2026",
    year: "2026",
    kind: "Game",
    line: "Mobile arcade game with a live leaderboard and Paystack extra lives.",
    stack: ["HTML5 Canvas", "JavaScript", "Paystack"],
    hue: "#ffd23d",
  },
];

export const stats = [
  { value: "5×", label: "Discord growth", sub: "600 → 3,000+ members · ReplicatsAI" },
  { value: "400%", label: "More daily actives", sub: "Recurring events · ReplicatsAI" },
  { value: "60%", label: "Fewer support tickets", sub: "Knowledge base · TokenSight" },
  { value: "70%+", label: "Event participation", sub: "AMAs · SmartFox" },
];

export const experience = [
  { org: "Falcon", role: "Community Lead & Tech Support", note: "The leading prediction market API. Community, onboarding and developer support", time: "Now" },
  { org: "Mitooshi", role: "Partner", note: "Launch videos & distribution for crypto projects", time: "Since 2026" },
  { org: "ReplicatsAI", role: "Lead Community Strategist", note: "600 → 3,000+ Discord, 400% DAU, weekly Vibe Spaces", time: "2025 to 2026" },
  { org: "Validatus", role: "Supervisory Blockchain Researcher", note: "Protocol-level research oversight", time: "2024 to 2026" },
  { org: "Redpill", role: "Community Moderator", note: "Overnight coverage, first response on FUD", time: "2024 to 2025" },
  { org: "TokenSight", role: "Lead Moderator", note: "Knowledge base & onboarding, 3× faster ramp-up", time: "2023 to 2024" },
  { org: "SmartFox", role: "Lead Moderator", note: "Cross-platform AMAs, steady through volatility", time: "2021 to 2022" },
];

export const playbook = [
  { n: "Architecture", d: "Discord and Telegram built to be navigated: roles, channels, bots, gates." },
  { n: "Onboarding", d: "First-week funnels and knowledge bases that turn joiners into regulars." },
  { n: "Rituals", d: "AMAs, Spaces and recurring events people actually show up for." },
  { n: "Ambassadors", d: "Programs and raid squads that carry the project past its own server." },
  { n: "Reporting", d: "Real numbers on growth, activity and retention. No vanity metrics." },
];

export const article = {
  title: "Decentralized AI Is a Beautiful Idea. It\u2019s Also Not Ready. Here\u2019s the Truth.",
  url: "https://x.com/josepkingsley",
};

export const links = {
  x: "https://x.com/josepkingsley",
  github: "https://github.com/Megamindhero",
  mitooshi: "https://mitooshi.com",
  linktree: "https://linktr.ee/Josepkingsley",
  telegram: "https://t.me/josepkingsley",
  discord: "josepkingsley",
  falcon: "https://x.com/FalconAPI",
  safary: "https://x.com/josepkingsley/status/1974573563266158756",
};

export const ACCENT = "#f4907f"; // salmon from the X banner
export const FROG = "#7fae5b"; // second tone, used sparingly
