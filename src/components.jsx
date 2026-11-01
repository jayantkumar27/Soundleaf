import React, { useEffect, useRef, useState, useId } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  Github,
  Menu,
  X,
  Star,
  Youtube,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import home from "./data/home.json";
import { config } from "./data/config";

export function SmartLink({ to, href, children, ...props }) {
  const requested = to || href || "/";
  const url =
    config.externalRoutes[requested] ||
    (/^\/docs\//.test(requested)
      ? `https://docs.meetily.ai${requested.replace(/^\/docs/, "")}`
      : /^\/(features|developers|integrations)(\/|$)/.test(requested)
        ? `https://docs.meetily.ai${requested}`
        : requested);
  return url.startsWith("/") || url.startsWith("#") ? (
    <Link to={url} {...props}>
      {children}
    </Link>
  ) : (
    <a href={url} {...props}>
      {children}
    </a>
  );
}
export function Button({
  to,
  children,
  variant = "dark",
  className = "",
  ...props
}) {
  return to ? (
    <SmartLink to={to} className={`button ${variant} ${className}`} {...props}>
      {children}
    </SmartLink>
  ) : (
    <button className={`button ${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
export const useCases = [
  ["Project Management", "technology"],
  ["Mental Health", "psychology"],
  ["Legal", "legal"],
  ["Financial Services", "financial-services"],
  ["Healthcare", "healthcare"],
  ["Government", "government"],
];
export function Header({ showAnnouncement = true }) {
  const [announcement, setAnnouncement] = useState(true),
    [menu, setMenu] = useState(false),
    [dropdown, setDropdown] = useState(false),
    [scrolled, setScrolled] = useState(false);
  const ref = useRef(),
    toggle = useRef(),
    mobileToggle = useRef();
  const location = useLocation();
  useEffect(() => {
    setMenu(false);
    setDropdown(false);
  }, [location]);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 30);
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setDropdown(false);
    };
    const key = (e) => {
      if (e.key === "Escape") {
        if (dropdown) {
          setDropdown(false);
          toggle.current?.focus();
        }
        if (menu) {
          setMenu(false);
          mobileToggle.current?.focus();
        }
      }
    };
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
    };
  }, [dropdown, menu]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      {announcement && showAnnouncement && (
        <div className="announcement" role="region" aria-label="Announcement">
          <span className="new-badge">New</span>
          <span>Why your meeting data belongs on your device</span>
          <SmartLink to="/blog/why-meeting-data-belongs-on-your-device">
            Read the post
          </SmartLink>
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
          top: announcement && showAnnouncement && !scrolled ? "44px" : "0",
        }}
        ref={ref}
      >
        <nav className="nav-capsule" aria-label="Main navigation">
          <div className="brand-group">
            <SmartLink to="/" className="wordmark">
              meetily
            </SmartLink>
            <a className="github-badge" href={config.github}>
              <Github size={14} />
              <span>{home.stats.stars}</span>
            </a>
          </div>
          <div className="desktop-links">
            <SmartLink to="/pricing">Pricing</SmartLink>
            <div className="dropdown-wrap">
              <button
                ref={toggle}
                aria-expanded={dropdown}
                aria-controls="use-cases-menu"
                onClick={() => setDropdown(!dropdown)}
              >
                Use Cases <ChevronDown size={14} />
              </button>
              {dropdown && (
                <div id="use-cases-menu" className="dropdown">
                  {useCases.map(([label, slug]) => (
                    <SmartLink key={slug} to={`/use-cases/${slug}`}>
                      {label}
                      <ArrowUpRight size={14} />
                    </SmartLink>
                  ))}
                </div>
              )}
            </div>
            <SmartLink to="/pro">Meetily Pro</SmartLink>
            <SmartLink to="/blog">Blog</SmartLink>
            <a href={config.docs}>Docs</a>
          </div>
          <Button to="/downloads" className="nav-download">
            Download
          </Button>
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
              <SmartLink to="/" className="wordmark">
                meetily
              </SmartLink>
              <button aria-label="Close menu" onClick={() => setMenu(false)}>
                <X />
              </button>
            </div>
            <SmartLink to="/pricing">Pricing</SmartLink>
            <button
              aria-expanded={dropdown}
              onClick={() => setDropdown(!dropdown)}
            >
              Use Cases <ChevronDown size={18} />
            </button>
            {dropdown && (
              <div className="mobile-submenu">
                {useCases.map(([label, slug]) => (
                  <SmartLink to={`/use-cases/${slug}`} key={slug}>
                    {label}
                  </SmartLink>
                ))}
              </div>
            )}
            <SmartLink to="/pro">Meetily Pro</SmartLink>
            <SmartLink to="/blog">Blog</SmartLink>
            <a href={config.docs}>Docs</a>
            <Button to="/downloads">Download</Button>
          </div>
        )}
      </header>
    </>
  );
}
export function Footer({ openDialog }) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <SmartLink className="footer-wordmark" to="/">
            Meetily.
          </SmartLink>
          <a href={config.reviews} className="footer-rating">
            <Stars /> <span>on G2</span>
          </a>
          <p>
            Open-source AI meeting assistant for back to back confidential
            meetings. Your meetings stay on your device. Always private, always
            yours.
          </p>
          <div className="socials">
            {[
              [Github, config.github, "GitHub"],
              [MessageCircle, config.discord, "Discord"],
              [Youtube, "https://www.youtube.com/@meetily", "YouTube"],
              [
                Linkedin,
                "https://www.linkedin.com/company/106363062/",
                "LinkedIn",
              ],
            ].map(([Icon, url, label]) => (
              <a key={label} href={url} aria-label={label}>
                <Icon size={19} />
              </a>
            ))}
          </div>
        </div>
        {home.footer.map((group) => (
          <div key={group.title} className="footer-column">
            <h3>{group.title}</h3>
            {group.links.map((link) =>
              link.href === "contact" ? (
                <button key={link.text} onClick={() => openDialog("contact")}>
                  {link.text}
                </button>
              ) : (
                <SmartLink key={link.text} to={link.href}>
                  {link.text}
                </SmartLink>
              ),
            )}
          </div>
        ))}
      </div>
      <div className="footer-legal">
        <p>©2026 Zackriya Solutions</p>
        <p>
          The open sourced code is under MIT License - This software is provided
          "as is", without warranty of any kind.
        </p>
        <p>
          An advanced version of the tool is available under custom license.{" "}
          <button onClick={() => openDialog("contact")}>Contact us</button>
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
export function RollingStat({ value }) {
  const ref = useRef(),
    [display, setDisplay] = useState(value);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const number = parseFloat(value),
          suffix = value.replace(/^[\d.]+/, "");
        const precision = value.includes(".") ? 1 : 0;
        const start = performance.now();
        const update = (now) => {
          const progress = Math.min(1, (now - start) / 1000);
          setDisplay(
            (number * (1 - Math.pow(1 - progress, 3))).toFixed(precision) +
              suffix,
          );
          if (progress < 1) frame = requestAnimationFrame(update);
          else setDisplay(value);
        };
        frame = requestAnimationFrame(update);
      },
      { threshold: 0.5 },
    );
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return (
    <strong ref={ref} aria-label={value}>
      <span aria-hidden="true">{display}</span>
    </strong>
  );
}
export function Accordion({ items = home.faq }) {
  const [open, setOpen] = useState(null);
  const id = useId();
  return (
    <div className="accordion">
      {items.map((item, i) => (
        <div
          key={item.q}
          className={`faq-item ${open === i ? "expanded" : ""}`}
        >
          <button
            id={`${id}-button-${i}`}
            aria-expanded={open === i}
            aria-controls={`${id}-panel-${i}`}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>{item.q}</span>
            <ChevronDown size={20} />
          </button>
          <div
            id={`${id}-panel-${i}`}
            role="region"
            aria-labelledby={`${id}-button-${i}`}
            hidden={open !== i}
          >
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
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
            Meetily captures audio directly from your device. No bot needs to
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
                "License delivery is not configured in this recreation. No information was sent. Start a trial on meetily.ai to receive a real license.",
              );
            }}
          >
            <label>
              I am evaluating Meetily for *
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
              How did you hear about Meetily? (Optional)
              <input placeholder="I found Meetily through..." />
            </label>
            <Button type="submit">Get My License Key</Button>
            {result && (
              <p className="form-result" role="status">
                {result} <a href="https://meetily.ai/">Visit Meetily</a>
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
          <h2 id="dialog-title">Talk to Meetily</h2>
          <p>Book a 30-minute call with the Meetily team.</p>
          <Button
            to="https://cal.com/meetily/30min"
            target="_blank"
            rel="noreferrer"
          >
            Choose a time <ArrowUpRight size={17} />
          </Button>
          <p className="small-muted">Scheduling opens on Meetily’s calendar.</p>
        </>
      )}
    </dialog>
  );
}
