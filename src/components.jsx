import React, { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Check,
  Menu,
  X,
  Star,
} from "lucide-react";
import { config } from "./data/config";

export function Header() {
  const [announcement, setAnnouncement] = useState(true),
    [menu, setMenu] = useState(false),
    [scrolled, setScrolled] = useState(false);
  const mobileToggle = useRef();
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 30);
    const key = (e) => {
      if (e.key === "Escape") {
        if (menu) {
          setMenu(false);
          mobileToggle.current?.focus();
        }
      }
    };
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("keydown", key);
    };
  }, [menu]);
  const closeMenu = () => setMenu(false);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      {announcement && (
        <div className="announcement" role="region" aria-label="Announcement">
          <span className="new-badge">New</span>
          <span>
            MeetScribe {config.currentVersion} is ready. Your meeting data stays
            on your device.
          </span>
          <button
            aria-label="Dismiss announcement"
            onClick={() => setAnnouncement(false)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <header
        className={`site-header ${scrolled ? "is-scrolled" : ""}`}
        style={{
          top: announcement && !scrolled ? "44px" : "0",
        }}
      >
        <nav className="nav-capsule" aria-label="Main navigation">
          <div className="brand-group">
            <a href="/" className="wordmark">
              MeetScribe
            </a>
          </div>
          <div className="nav-actions">
            <div className="desktop-links">
              <a href="#workflow">How it works</a>
              <a href="#features">Features</a>
            </div>
            <a className="button dark nav-download" href="#download">
              Download
            </a>
          </div>
          <button
            className="mobile-toggle"
            ref={mobileToggle}
            aria-label="Toggle menu"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
        {menu && (
          <div className="mobile-menu">
            <div className="mobile-menu-title">
              <a href="/" className="wordmark" onClick={closeMenu}>
                MeetScribe
              </a>
              <button aria-label="Close menu" onClick={() => setMenu(false)}>
                <X />
              </button>
            </div>
            <a href="#workflow" onClick={closeMenu}>
              How it works
            </a>
            <a href="#features" onClick={closeMenu}>
              Features
            </a>
            <a className="button dark" href="#download" onClick={closeMenu}>
              Download
            </a>
          </div>
        )}
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a className="footer-wordmark" href="/">
            MeetScribe.
          </a>
          <a href={config.reviews} className="footer-rating">
            <Stars /> <span>on G2</span>
          </a>
          <p>
            Open-source AI meeting assistant for back to back confidential
            meetings. Your meetings stay on your device. Always private, always
            yours.
          </p>
        </div>
        <div className="footer-column">
          <h3>On this page</h3>
          <a href="#workflow">How it works</a>
          <a href="#features">Features</a>
        </div>
        <div className="footer-column">
          <h3>Downloads</h3>
          <a href={config.downloads.windows} download>
            Windows x64 (.exe)
          </a>
          <a href={config.downloads.macOS} download>
            macOS Apple Silicon (.dmg)
          </a>
        </div>
      </div>
      <div className="footer-legal">
        <p>©2026 Zackriya Solutions</p>
        <p>
          The open sourced code is under MIT License - This software is provided
          "as is", without warranty of any kind.
        </p>
      </div>
    </footer>
  );
}
export function Stars() {
  return (
    <span className="stars" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((n) => (
        <Star key={n} size={15} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}
export function Dialog({ type, onClose }) {
  const ref = useRef();
  const [result, setResult] = useState("");
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);
  const trial = type === "trial";
  return (
    <dialog
      ref={ref}
      className={`site-dialog ${trial ? "trial-dialog" : ""}`}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <button className="dialog-close" onClick={onClose} aria-label="Close">
        <X size={20} />
      </button>
      {type === "platforms" ? (
        <>
          <h2 id="dialog-title">Works with your favorite meeting platforms</h2>
          <div className="platform-list">
            {[
              "Zoom",
              "Microsoft Teams",
              "Google Meet",
              "Slack",
              "Webex",
              "GoToMeeting",
              "Discord",
              "Skype",
              "Any system audio",
            ].map((x) => (
              <div key={x}>
                <Check size={18} />
                {x}
              </div>
            ))}
          </div>
          <p>
            MeetScribe captures audio directly from your device. No bot needs to
            join your meeting.
          </p>
        </>
      ) : trial ? (
        <>
          <h2 id="dialog-title">Start Your 14-Day Pro Trial</h2>
          <p>No credit card required. Get instant access</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setResult(
                "License delivery is not configured in this recreation. No information was sent.",
              );
            }}
          >
            <label>
              I am evaluating MeetScribe for *
              <select required defaultValue="">
                <option value="" disabled>
                  Select one...
                </option>
                <option>For myself</option>
                <option>For my team/organization</option>
              </select>
            </label>
            <label>
              Your Name *
              <input
                name="name"
                autoComplete="name"
                required
                placeholder="John Doe"
              />
            </label>
            <label>
              Email *
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="john@company.com"
              />
            </label>
            <label>
              Company Name (Optional)
              <input placeholder="Acme Inc." autoComplete="organization" />
            </label>
            <label>
              Designation (Optional)
              <input placeholder="e.g. CEO, CTO, IT Admin, Product Manager" />
            </label>
            <label>
              How did you hear about MeetScribe? (Optional)
              <input placeholder="I found MeetScribe through..." />
            </label>
            <Button type="submit">Get My License Key</Button>
            {result && (
              <p className="form-result" role="status">
                {result}{" "}
                <a href="https://meetily.ai/">Visit the official product site</a>
              </p>
            )}
            <div className="form-reassurance">
              <span>
                <Check />
                Instant license delivery
              </span>
              <span>
                <Check />
                No credit card required
              </span>
              <span>
                <Check />
                14 days free
              </span>
            </div>
          </form>
        </>
      ) : (
        <>
          <Calendar size={30} />
          <h2 id="dialog-title">Talk to MeetScribe</h2>
          <p>Book a 30-minute call with the MeetScribe team.</p>
          <Button
            to="https://cal.com/meetily/30min"
            target="_blank"
            rel="noreferrer"
          >
            Choose a time <ArrowUpRight size={17} />
          </Button>
          <p className="small-muted">Scheduling opens on our calendar.</p>
        </>
      )}
    </dialog>
  );
}
