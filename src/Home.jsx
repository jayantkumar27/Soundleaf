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
  Users,
  FileText,
  Code,
} from "lucide-react";
import Demo from "./Demo";
import data from "./data/home.json";
import { config } from "./data/config";
import JellyfishCanvas from "./jellyfish/JellyfishCanvas";
const featureIcons = [Lock, Sparkles, Globe, Sparkles, Mic, Users, FileText];
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
          <a className="button green" href="#download">
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
function Privacy() {
  return (
    <section className="privacy-section" id="privacy-highlights">
      <span className="eyebrow-pill">
        <Lock size={12} />
        Open Source &amp; Privacy-First
      </span>
      <h2>Seamless Audio Capture, Custom AI Pipelines &amp; Automated Notes</h2>
      <p className="privacy-subtitle">
        Record system audio and mic inputs, transcribe with your preferred
        providers, and publish structured notes to your workspace.
      </p>
      <div className="privacy-grid">
        {privacyCards.map(({ title, icon: Icon, items }) => (
          <article className="privacy-card" key={title}>
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
                    <strong>{lead}</strong>{" "}
                    <span>{description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
export function Features() {
  return (
    <section className="features-section" id="features">
      <div className="section-title">
        <h2>Built for Local Control, Speed &amp; Zero Lock-In</h2>
        <p>Open source, privacy-focused, and built for developers</p>
      </div>
      <div className="feature-grid">
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
          <a className="button dark" href={config.downloads.windows} download>
            <Download size={17} />
            Windows x64 (.exe)
          </a>
          <a className="button light" href={config.downloads.macOS} download>
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
export default function Home({ openDialog }) {
  return (
    <>
      <div className="hero-atmosphere">
        <Hero />
        <Demo openDialog={openDialog} />
      </div>
      <Privacy />
      <Features />
      <DownloadSection />
      <Values />
    </>
  );
}
