import { useEffect, useRef, useState } from "react";
import {
  Check,
  Download,
  Globe,
  Lock,
  Mic,
  Shield,
  Sparkles,
  AudioLines,
  Cpu,
  Database,
  Code2,
  Users,
  FileText,
  Code,
} from "lucide-react";
import Demo from "./Demo";
import data from "./data/home.json";
import { config } from "./data/config";
import JellyfishCanvas from "./jellyfish/JellyfishCanvas";
import CirclingElements from "./CirclingElements";
import BreathingText from "./BreathingText";
import "./gradient-button.css";
const featureIcons = [Lock, Code2, Globe, Sparkles, Mic, Users, FileText];
export function Hero() {
  return (
    <section className="hero">
      <JellyfishCanvas />
      <div className="hero-content">
        <h1>The Privacy-First AI Meeting Assistant &amp; Note Taker</h1>
        <p className="hero-description">
          MeetScribe records, transcribes, and summarizes meetings, 100% on your
          device. Audio and data never leave. Private, secure, in your control.
        </p>
        <div className="hero-actions">
          <a className="button gradient-button" href="#download">
            <Download size={18} />
            Download MeetScribe
          </a>
        </div>
      </div>
      <div className="benefits" aria-label="Benefits">
        <span>Open-Source Core</span>
        <span>Works with Zoom, Teams, Meet</span>
        <span>GDPR &amp; HIPAA Ready</span>
        <span>Offline ready</span>
      </div>
    </section>
  );
}
const privacyCards = [
  {
    title: "Native Audio & Desktop Controls",
    icon: AudioLines,
    items: [
      {
        lead: "WASAPI & Core Audio Loopback:",
        description:
          "Dual-channel capture for system output and microphone with zero virtual drivers required on Windows and macOS.",
      },
      {
        lead: "Windows Meeting Detection:",
        description:
          "Automatic call detection paired with a floating recording overlay bar and system tray controls.",
      },
      {
        lead: "Live Audio Meters & Waveforms:",
        description:
          "Web Audio visualizers for live input monitoring and post-recording playback analysis.",
      },
      {
        lead: "Chromium Companion Extension:",
        description:
          "Lightweight browser bridge adding meeting context and controls to Google Meet and Zoom.",
      },
    ],
  },
  {
    title: "Pluggable AI & Smart Fallback",
    icon: Cpu,
    items: [
      {
        lead: "Multi-Provider STT Registry:",
        description:
          "Modular speech recognition supporting Google Cloud STT, Sarvam AI, AssemblyAI, and Groq Whisper.",
      },
      {
        lead: "Flexible Note Generation:",
        description:
          "Summarize calls with Google Gemini, Anthropic Claude, or Groq using customized prompts.",
      },
      {
        lead: "Automated LLM Fallback:",
        description:
          "Configure secondary models to take over seamlessly if primary API requests fail or hit quota limits.",
      },
      {
        lead: "Bring Your Own Keys & Schemas:",
        description:
          "Full credential control with support for structured JSON fields or formatted Markdown minutes.",
      },
    ],
  },
  {
    title: "Local Library & Workspace Sync",
    icon: Database,
    items: [
      {
        lead: "Local SQLite Database:",
        description:
          "Fast disk-backed session library storing timestamped transcripts, decision logs, and action items.",
      },
      {
        lead: "One-Click Notion Publishing:",
        description:
          "Direct integration to push formatted meeting minutes and full transcripts into your Notion database.",
      },
      {
        lead: "Google Calendar Sync:",
        description:
          "Fetch upcoming call schedules and connect meeting notes straight from your desktop dashboard.",
      },
      {
        lead: "Multi-Format Exports:",
        description:
          "Export meeting summaries and timestamped transcripts directly to Markdown files or styled PDFs.",
      },
    ],
  },
];

function PrivacyCard({ title, icon: Icon, items }) {
  const [isHovered, setIsHovered] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });

  const updatePointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
    event.currentTarget.style.setProperty(
      "--spotlight-x",
      `${pointer.current.x}px`,
    );
    event.currentTarget.style.setProperty(
      "--spotlight-y",
      `${pointer.current.y}px`,
    );
  };

  return (
    <article
      className="privacy-card"
      onMouseEnter={(event) => {
        updatePointer(event);
        setIsHovered(true);
      }}
      onMouseMove={updatePointer}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CanvasRevealEffect isHovered={isHovered} pointer={pointer} />
      <h3>
        <span>
          <Icon size={18} />
        </span>
        {title}
      </h3>
      <ul>
        {items.map(({ lead, description }) => (
          <li key={lead}>
            <Check size={13} />
            <span>
              <strong>{lead}</strong> <span>{description}</span>
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function CanvasRevealEffect({ isHovered, pointer }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isHovered) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let context;
    try {
      context = canvas.getContext("2d");
    } catch {
      return undefined;
    }
    if (!context) return undefined;

    const colors = ["rgb(59, 130, 246)", "rgb(139, 92, 246)"];
    const pitch = 6;
    const dotSize = 2.5;
    let width = 0;
    let height = 0;
    let frame = 0;
    let dots = [];
    let startedAt = performance.now();

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];

      for (let y = pitch / 2; y < height; y += pitch) {
        for (let x = pitch / 2; x < width; x += pitch) {
          dots.push({
            x,
            y,
            color: colors[Math.random() < 0.5 ? 0 : 1],
            phase: Math.random() * Math.PI * 2,
            initialOpacity: 0.15 + Math.random() * 0.8,
          });
        }
      }
    };

    const draw = (now) => {
      const elapsed = now - startedAt;
      const waveRadius = elapsed * 1.2;
      context.clearRect(0, 0, width, height);

      for (const dot of dots) {
        const distance = Math.hypot(
          dot.x - pointer.current.x,
          dot.y - pointer.current.y,
        );
        const reveal = Math.min(
          1,
          Math.max(0, (waveRadius - distance + 36) / 72),
        );
        const shimmer = 0.55 + Math.sin(now * 0.002 + dot.phase) * 0.4;
        const opacity = (dot.initialOpacity * 0.35 + shimmer * 0.65) * reveal;
        if (opacity <= 0) continue;

        context.globalAlpha = opacity;
        context.fillStyle = dot.color;
        context.fillRect(
          dot.x - dotSize / 2,
          dot.y - dotSize / 2,
          dotSize,
          dotSize,
        );
      }

      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      context.clearRect(0, 0, width, height);
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [isHovered, pointer]);

  return (
    <div
      className="privacy-card-spotlight"
      aria-hidden="true"
      style={{ opacity: isHovered ? 1 : 0 }}
    >
      <canvas ref={canvasRef} width="0" height="0" />
    </div>
  );
}

function Privacy() {
  return (
    <section className="privacy-section" id="privacy-highlights">
      <span className="eyebrow-pill">
        <Lock size={12} />
        Open Source &amp; Privacy-First
      </span>
      <BreathingText
        as="h2"
        fromFontVariationSettings='"wght" 250'
        toFontVariationSettings='"wght" 800'
        duration={1.5}
        staggerDuration={0.018}
      >
        Seamless Audio Capture, Custom AI Pipelines &amp; Automated Notes
      </BreathingText>
      <p className="privacy-subtitle">
        Record system audio and mic inputs, transcribe with your preferred
        providers, and publish structured notes to your workspace.
      </p>
      <div className="privacy-grid">
        {privacyCards.map((card) => (
          <PrivacyCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
export function Features() {
  return (
    <section className="features-section" id="features">
      <div className="section-title">
        <h2>Why Choose MeetScribe?</h2>
        <p>
          Open-source, desktop-native meeting intelligence powered by your
          choice of AI providers.
        </p>
      </div>
      <div className="feature-slider" role="region" aria-label="MeetScribe features" tabIndex={0}>
        <div className="feature-slider-track">
          {[0, 1].map((copy) => (
            <div className="feature-slider-group" key={copy} aria-hidden={copy === 1 ? true : undefined} inert={copy === 1 ? true : undefined}>
              {data.features.map((feature, i) => {
                const Icon = featureIcons[i];
                return (
                  <article className="feature-card" key={feature.title}>
                    <Icon size={24} />
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
const integrationLogos = [
  { name: "Zoom", image: "/assets/zoom.png" },
  { name: "Google Meet", image: "/assets/meet.png" },
  { name: "Microsoft Teams", image: "/assets/teams.png" },
  { name: "Webex", image: "/assets/webex.png" },
  { name: "Discord", image: "/assets/discord.svg" },
  { name: "Slack", image: "/assets/slack.webp" },
];

function Integrations() {
  return (
    <section className="integrations-section" aria-labelledby="integrations-title">
      <div className="integrations-layout">
        <div className="section-title">
          <span className="integrations-eyebrow">WORKS ALONGSIDE YOUR TOOLS</span>
          <h2 id="integrations-title">Your meetings, in your flow</h2>
          <p>Capture meeting audio locally, wherever your conversations happen.</p>
        </div>
        <div className="orbit-stage">
          <CirclingElements radius="var(--orbit-radius)" duration={10} easing="linear" pauseOnHover>
            {integrationLogos.map(({ name, image }) => (
              <div className="integration-card" key={name}>
                <span className="integration-logo">
                  <img src={image} alt="" width="52" height="52" />
                </span>
                <strong>{name}</strong>
              </div>
            ))}
          </CirclingElements>
        </div>
      </div>
    </section>
  );
}
export function DownloadSection() {
  return (
    <section className="deployment-section" id="download">
      <div className="deployment-panel">
        <Download size={30} />
        <h2>Download MeetScribe</h2>
        <p>
          Get the latest version for your computer. Your meetings stay on your
          device.
        </p>
        <div className="download-options">
          <a className="button gradient-button" href={config.downloads.windows} download>
            <Download size={17} />
            Windows x64 (.exe)
          </a>
          <a className="button gradient-button gradient-button-variant" href={config.downloads.macOS} download>
            <Download size={17} />
            macOS Apple Silicon (.dmg)
          </a>
        </div>
        <span className="download-version">
          MeetScribe installers · Version {config.currentVersion}
        </span>
      </div>
    </section>
  );
}
export function Values() {
  return (
    <section className="values-section" id="about">
      <div className="section-title">
        <h2>What We Stand For</h2>
        <p>The principles that guide everything we build</p>
      </div>
      <div className="values-grid">
        {data.values.map((value, i) => {
          const Icon = [Shield, Code, Users][i];
          return (
            <article className="value-card" key={value.title}>
              <Icon size={26} />
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </article>
          );
        })}
      </div>
      <div className="values-actions">
        <a className="button" href="#features">
          Explore features
        </a>
        <a className="button light" href="#download">
          Download MeetScribe
        </a>
      </div>
    </section>
  );
}
export default function Home() {
  return (
    <>
      <div className="hero-atmosphere">
        <Hero />
        <Demo />
      </div>
      <Privacy />
      <Features />
      <Integrations />
      <DownloadSection />
      <Values />
    </>
  );
}
