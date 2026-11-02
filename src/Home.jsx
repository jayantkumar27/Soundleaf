import {
  Check,
  ChevronRight,
  Download,
  GitFork,
  Github,
  Globe,
  Lock,
  Mic,
  Shield,
  Sparkles,
  Star,
  Users,
  FileText,
  Code,
} from "lucide-react";
import { Stars, RollingStat } from "./components";
import Demo from "./Demo";
import data from "./data/home.json";
import { config } from "./data/config";
const featureIcons = [Lock, Sparkles, Globe, Sparkles, Mic, Users, FileText];
function Laurel({ flip = false }) {
  return (
    <img
      className={`laurel ${flip ? "flipped" : ""}`}
      src="/assets/laurel.svg"
      alt=""
      aria-hidden="true"
    />
  );
}
export function Hero() {
  return (
    <section className="hero">
      <div className="hero-proof">
        <Laurel />
        <div>
          <strong className="number-one">#1</strong>
          <span>Privacy first</span>
          <span>Ai Meeting Assistant</span>
          <a href={config.reviews}>
            <Stars />
          </a>
          <a href={config.github} className="users-proof">
            <strong>{data.stats.users} users</strong>
            <span>32.3K+ Github Stars</span>
          </a>
        </div>
        <Laurel flip />
      </div>
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
        <a className="button light" href={config.github}>
          <Github size={17} />
          View on GitHub
        </a>
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
function Community() {
  return (
    <section className="community">
      <a className="discord-pill" href={config.discord}>
        <i />
        Join our discord channel 🎊
        <ChevronRight size={14} />
      </a>
      <p className="community-eyebrow">Privacy-First AI Copilot for meetings</p>
      <h2>Loved by teams worldwide</h2>
      <p className="community-subtitle">
        #1 Trending Repository on GitHub - Loved by the open source community
      </p>
      <div className="stats">
        {[
          [Star, data.stats.stars, "Stars"],
          [Download, data.stats.downloads, "Downloads"],
          [GitFork, data.stats.forks, "Forks"],
        ].map(([Icon, value, label]) => (
          <div key={label}>
            <div>
              <Icon size={24} />
              <RollingStat value={value} />
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <a className="rating-pill" href={config.reviews}>
        <Stars />
        Rated 5/5 on G2
      </a>
      <div className="testimonial-viewport">
        <div className="testimonial-track">
          {[...data.testimonials, ...data.testimonials].map((item, i) => {
            const lines = item.text.split("\n").filter(Boolean);
            return (
              <article className="testimonial" key={i}>
                <div className="testimonial-author">
                  <Github size={14} />
                  <strong>{lines[0]}</strong>
                  <span>{lines[1]}</span>
                </div>
                <p>{lines.slice(2).join(" ").replace("Read more →", "")}</p>
                {item.href !== "#" && <a href={item.href}>Read more →</a>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
const privacyCards = [
  {
    title: "Why Choose MeetScribe?",
    icon: Sparkles,
    items: [
      "31,094+ GitHub Stars. 599,000+ Downloads",
      "Trusted by developers, founders, and privacy-first companies",
      "Fully Open Source & MIT Licensed",
      "Active community and regular updates",
    ],
  },
  {
    title: "Privacy by Default",
    icon: Shield,
    items: [
      "Transcription and recordings processed locally on your device",
      "Pluggable AI for summaries: local models or your own API keys",
      "GDPR/HIPAA/NIS2 compliant by design",
      "You choose how your data is handled. Always in control.",
    ],
  },
  {
    title: "Works with Any Platform",
    icon: Globe,
    items: [
      "Google Meet, Zoom, Microsoft Teams",
      "Any video conferencing software",
      "Any desktop microphone. Meetings & more",
      "Zero external accounts or cloud services required",
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
      <h2>Take Back Control of Your Meeting Data</h2>
      <p className="privacy-subtitle">
        AI-Powered Meeting Transcriptions - 100% Private, 100% Local, Open
        Source
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
              {items.map((item) => (
                <li key={item}>
                  <Check size={13} />
                  <span>{item}</span>
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
        <h2>Why Choose MeetScribe?</h2>
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
      <Community />
      <Privacy />
      <Features />
      <DownloadSection />
      <Values />
    </>
  );
}
