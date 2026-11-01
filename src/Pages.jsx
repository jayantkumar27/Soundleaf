import React, { useState, useEffect } from "react";
import { Calendar, Check, Download, ArrowRight, Play } from "lucide-react";
import { Accordion, Button, SmartLink } from "./components";
import pages from "./data/primary-pages.json";
import routeManifest from "./data/route-manifest.json";
const routeModules = import.meta.glob("./data/routes/*.json");
import { config } from "./data/config";
const localImage = (src) =>
  src?.startsWith("https://meetily.ai/")
    ? "/assets/" + src.split("/").pop()
    : src;
const proFeatures = [
  "All Pro features unlocked",
  "Speaker diarization (who said what)",
  "Custom AI model connector",
  "Custom summary templates",
  "Auto-detect meetings",
  "Advanced exports (PDF, DOCX, Markdown)",
  "Priority support",
];
function Checks({ items }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item}>
          <Check size={18} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
function PageHero({ title, description, children }) {
  return (
    <section className="page-hero">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children}
    </section>
  );
}
export function Pricing({ openDialog }) {
  return (
    <div className="pricing-page">
      <PageHero
        title="Simple, Transparent Pricing"
        description="Start with a free trial. No credit card required."
      />
      <div className="pricing-grid">
        <article className="price-card featured">
          <span className="plan-badge">POPULAR</span>
          <h2>Pro</h2>
          <div className="price">
            ${config.pricing.monthly} <s>${config.pricing.regularMonthly}</s>
          </div>
          <p>/user/month</p>
          <span className="billing">
            billed yearly at ${config.pricing.annual}/user
          </span>
          <p className="plan-description">
            Everything in trial, plus a full year of access and priority
            support.
          </p>
          <Button to="/buy-now" variant="green">
            Buy Now
          </Button>
          <Button variant="light" onClick={() => openDialog("trial")}>
            Request a 14 Day Free Trial
          </Button>
          <p className="delivery">Instant license delivery</p>
          <Checks items={proFeatures} />
        </article>
        <article className="price-card">
          <h2>Enterprise</h2>
          <div className="price">Custom</div>
          <p>For teams</p>
          <span className="billing">&nbsp;</span>
          <p className="plan-description">
            Volume licensing, dedicated support, and custom deployment options.
          </p>
          <Button onClick={() => openDialog("contact")}>
            <Calendar size={16} />
            Talk to Us
          </Button>
          <Checks
            items={[
              "10+ user licenses",
              "Volume discounts",
              "Dedicated support",
              "Custom deployment help",
            ]}
          />
        </article>
      </div>
      <Supplement
        route="/pricing"
        skip={["Simple, Transparent Pricing", "Pro", "Enterprise"]}
        openDialog={openDialog}
      />
    </div>
  );
}
export function Downloads({ openDialog }) {
  const [os, setOs] = useState("macOS");
  const downloadLinks =
    pages["/downloads"]?.links.filter((x) => /\.dmg|\.exe/i.test(x.href)) || [];
  return (
    <div className="downloads-page">
      <PageHero
        title="Download Meetily"
        description="Get started with Meetily on macOS or Windows"
      />
      <div className="pricing-grid">
        <article className="price-card">
          <h2>Try Pro for free</h2>
          <div className="price">Free</div>
          <p>14-day trial</p>
          <p className="plan-description">
            Full access to every Pro feature. No credit card required.
          </p>
          <Button onClick={() => openDialog("trial")}>
            Request a free trial
          </Button>
          <a href="#community-download" className="delivery">
            Download Free Community version
          </a>
          <Checks
            items={[
              ...proFeatures.slice(0, 3),
              "Auto-detect meetings",
              "No credit card required",
            ]}
          />
        </article>
        <article className="price-card featured">
          <span className="plan-badge">RECOMMENDED</span>
          <h2>Pro</h2>
          <div className="price">
            ${config.pricing.monthly} <s>${config.pricing.regularMonthly}</s>
          </div>
          <p>/user/month</p>
          <span className="billing">
            billed yearly at ${config.pricing.annual}
          </span>
          <p className="plan-description">
            For professionals who need speaker diarization and advanced
            features.
          </p>
          <Button to="/buy-now" variant="green">
            Buy Now
          </Button>
          <a
            className="delivery"
            href={
              downloadLinks.find((x) => /pro/i.test(x.href))?.href ||
              config.download
            }
          >
            Download Pro
          </a>
          <Checks
            items={[
              "Everything in trial",
              ...proFeatures.slice(1, 3),
              "Auto-detect meetings",
              "Advanced exports (PDF, DOCX)",
              "Priority support",
            ]}
          />
        </article>
      </div>
      <p className="center small-muted">Apple Silicon • macOS 11.0+</p>
      <section className="community-download" id="community-download">
        <div className="terminal-top">
          ~/MEETILY/COMMUNITY <span>MIT</span>
        </div>
        <div className="terminal-content">
          <span className="terminal-eyebrow">FREE · OPEN SOURCE</span>
          <h2>community edition.</h2>
          <p>
            Built in the open. MIT licensed. Runs entirely on your machine:
            real-time transcription, AI summaries, and 100% local processing.
            Your conversations stay on your device by default.
          </p>
          <SmartLink to="/free">More about Meetily Free →</SmartLink>
          <div className="terminal-columns">
            <div>
              <h3>$ WHAT'S INCLUDED</h3>
              <Checks
                items={[
                  "Real-time transcription",
                  "AI-powered summaries",
                  "Basic sharing (Copy)",
                  "Recordings saved locally",
                ]}
              />
            </div>
            <div>
              <h3>$ DOWNLOAD</h3>
              <div className="os-tabs">
                {["macOS", "Windows"].map((x) => (
                  <button
                    key={x}
                    aria-pressed={os === x}
                    onClick={() => setOs(x)}
                  >
                    {x}
                  </button>
                ))}
              </div>
              <Button
                to={
                  downloadLinks.find((x) =>
                    os === "macOS"
                      ? /\.dmg/.test(x.href) && !/pro/i.test(x.href)
                      : /\.exe/.test(x.href) && !/pro/i.test(x.href),
                  )?.href ||
                  "https://github.com/Zackriya-Solutions/meetily/releases/latest"
                }
                variant="light"
              >
                <Download size={17} />
                Install for {os}
              </Button>
              <p className="small-muted">
                {os === "macOS"
                  ? "Apple Silicon · macOS 11.0+"
                  : "Windows 10 or later · 64-bit"}
              </p>
            </div>
          </div>
          <a href={`${config.github}/releases`}>cd ../releases-on-github →</a>
        </div>
      </section>
      <section className="simple-cta">
        <h2>On Linux? Join the waitlist.</h2>
        <p>
          Native macOS and Windows desktop apps are available now. A native
          Linux desktop app is in development.
        </p>
        <Button to="/granola-for-linux">Join Linux waitlist</Button>
      </section>
      <Supplement
        route="/downloads"
        skip={[
          "Download Meetily",
          "Try Pro for free",
          "Pro",
          "community edition.",
          "On Linux? Join the waitlist.",
        ]}
        openDialog={openDialog}
      />
    </div>
  );
}
export function Pro({ openDialog }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="pro-page">
      <PageHero
        title={
          <>
            Meetily Pro
            <br />
            <span>For Individuals &amp; Teams</span>
          </>
        }
        description="Transcription runs locally. Summaries: choose local AI or BYOK - you decide."
      >
        <div className="hero-actions">
          <Button variant="green" onClick={() => openDialog("trial")}>
            Start 14-Day Free Trial
          </Button>
          <SmartLink to="#pro-features">See Pro features →</SmartLink>
        </div>
        <p className="small-muted">
          v{config.currentVersion} - Speaker identification, a refreshed
          interface, and steadier recordings.
        </p>
      </PageHero>
      <div className="pro-video">
        {playing ? (
          <iframe
            title="Meetily Pro product demonstration"
            src="https://www.youtube-nocookie.com/embed/FYuuRL9ba7o?autoplay=1&rel=0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            aria-label="Play Meetily Pro video"
            onClick={() => setPlaying(true)}
          >
            <img
              src="/assets/ProV1.5.0.png"
              alt="Meetily Pro interface preview"
            />
            <span>
              <Play size={32} fill="white" />
            </span>
          </button>
        )}
      </div>
      <div id="pro-features">
        <Supplement
          route="/pro"
          skip={["Meetily Pro\nFor Individuals & Teams"]}
          openDialog={openDialog}
        />
      </div>
    </div>
  );
}
export function Buy({ openDialog }) {
  const [quantity, setQuantity] = useState(1),
    [discount, setDiscount] = useState(false),
    [ready, setReady] = useState(false);
  const faqs = [];
  const collect = (n) => {
    if (n?.type === "faq") faqs.push({ q: n.q, a: n.a });
    else
      n?.children?.forEach((c) => {
        if (!Array.isArray(c)) collect(c);
      });
  };
  collect(pages["/buy-now"]?.blocks);
  return (
    <div className="buy-page">
      <PageHero
        title={
          <>
            Buy Meetily Pro <span className="discount">60% Off</span>
          </>
        }
      />
      <div className="buyer-grid">
        <form
          className="buyer-form"
          onSubmit={(e) => {
            e.preventDefault();
            setReady(true);
          }}
        >
          <h2>Buyer details</h2>
          <label>
            Your Name *
            <input required autoComplete="name" placeholder="John Smith" />
          </label>
          <label>
            Email Address *
            <input
              required
              type="email"
              autoComplete="email"
              placeholder="john@company.com"
            />
          </label>
          <label>
            Company Name *
            <input
              required
              autoComplete="organization"
              placeholder="Name / N/A"
            />
          </label>
          <button
            className="discount-toggle"
            type="button"
            onClick={() => setDiscount(!discount)}
            aria-expanded={discount}
          >
            Have a discount code?
          </button>
          {discount && (
            <label>
              Discount code
              <input placeholder="Enter your code" />
              <span className="small-muted">
                Codes are verified at Meetily’s checkout.
              </span>
            </label>
          )}
          <div className="buyer-total">
            <div>
              <strong>${config.pricing.annual * quantity}</strong>{" "}
              <s>${config.pricing.regularAnnual * quantity}</s>
              <p>${config.pricing.annual}/license/year</p>
            </div>
            <div className="quantity-control">
              <button
                type="button"
                aria-label="Decrease licenses"
                disabled={quantity === 1}
                onClick={() => setQuantity((q) => q - 1)}
              >
                −
              </button>
              <output aria-label="License quantity">{quantity}</output>
              <button
                type="button"
                aria-label="Increase licenses"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>
          <Button variant="green" type="submit">
            Continue to Payment
          </Button>
          {ready && (
            <p className="form-result" role="status">
              Payment is handled on Meetily’s website. No details have been
              submitted.{" "}
              <a href={config.checkout}>Continue to the official checkout →</a>
            </p>
          )}
          <div className="reassurance">
            <span>
              <Check />
              Secure checkout
            </span>
            <span>
              <Check />
              30-day refund
            </span>
            <span>
              <Check />
              Instant delivery
            </span>
          </div>
          <p className="buyer-contact">
            Questions?{" "}
            <button type="button" onClick={() => openDialog("contact")}>
              Contact us
            </button>
          </p>
        </form>
        <div>
          <section className="buyer-included">
            <h2>What's included</h2>
            <Checks
              items={[
                "Speaker diarization (who said what)",
                "Custom AI model connector",
                "Auto-detect meetings",
                "Advanced exports (PDF, DOCX)",
                "Latest feature updates",
                "Priority email support",
              ]}
            />
          </section>
          <section className="buyer-guarantees">
            <h2>Privacy &amp; Guarantees</h2>
            <Checks
              items={[
                "Privacy First - Transcription runs locally. For summaries, choose local AI or your own API key.",
                "30-Day Money Back - Full refund if not satisfied",
                "Instant License Delivery - Get your key via email immediately",
              ]}
            />
          </section>
        </div>
      </div>
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <Accordion items={faqs} />
      </section>
    </div>
  );
}

// Observed copy is stored as structured content, never fetched from the reference at runtime.
// Keep each original section, card group, list and comparison table intact.
function flattenNodes(node, out = []) {
  if (!node) return out;
  if (
    [
      "h1",
      "h2",
      "h3",
      "h4",
      "p",
      "li",
      "a",
      "button",
      "table",
      "img",
      "pre",
      "blockquote",
    ].includes(node.type)
  ) {
    out.push(node);
    return out;
  }
  node.children?.forEach((n) => flattenNodes(n, out));
  return out;
}
function cleanGroups(node) {
  if (!node) return null;
  if (["header", "footer", "nav", "script", "style"].includes(node.type))
    return null;
  if (["faq", "table", "video"].includes(node.type)) return node;
  if (node.children) {
    const children = node.children.map(cleanGroups).filter(Boolean);
    if (!children.length) return null;
    if (
      children.length === 1 &&
      ["div", "main"].includes(node.type) &&
      !node.layout &&
      !node.id
    )
      return children[0];
    return { ...node, children };
  }
  if (!node.text?.trim() && !node.src) return null;
  return node;
}
function ContentNode({ node, openDialog, level = 0 }) {
  const [open, setOpen] = useState(false),
    [notice, setNotice] = useState("");
  if (!node) return null;
  const { type, text, children, href, src } = node;
  if (type === "faq") return <Accordion items={[{ q: node.q, a: node.a }]} />;
  if (type === "video")
    return (
      <video
        className="content-video"
        controls
        preload="none"
        poster={localImage(node.poster)}
        src={src}
      />
    );
  if (type === "text") return <span>{text}</span>;
  if (type === "img")
    return (
      <img
        className="content-image"
        src={localImage(src)}
        alt={node.alt || ""}
        loading="lazy"
      />
    );
  if (type === "table")
    return (
      <div className="table-scroll">
        <table>
          <tbody>
            {children?.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) =>
                  i === 0 ? <th key={j}>{cell}</th> : <td key={j}>{cell}</td>,
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  if (type === "a") {
    if (text === "Skip to main content") return null;
    return (
      <SmartLink
        to={href}
        className={
          children
            ? "content-card-link"
            : text?.length < 48
              ? "content-link"
              : undefined
        }
      >
        {children
          ? children.map((n, i) => (
              <ContentNode key={i} node={n} openDialog={openDialog} />
            ))
          : text}
      </SmartLink>
    );
  }
  if (type === "button") {
    if (!text?.trim()) return null;
    if (/^(macOS|Windows)$/.test(text))
      return (
        <Button
          to={text === "macOS" ? "/downloads/mac" : "/downloads/windows"}
          variant="light"
        >
          {text}
        </Button>
      );
    return (
      <button
        className="content-button"
        aria-expanded={/\?$/.test(text) ? open : undefined}
        onClick={async (event) => {
          if (/trial|license key/i.test(text)) openDialog("trial");
          else if (/contact|talk|book|demo/i.test(text)) openDialog("contact");
          else if (/buy|purchase|checkout/i.test(text))
            window.location.assign(config.checkout);
          else if (/download|install/i.test(text))
            window.location.assign(config.download);
          else if (/waitlist/i.test(text)) {
            const form = document.querySelector(".inquiry-form");
            if (form) {
              form.scrollIntoView();
              form.querySelector("input")?.focus();
            } else window.location.assign("/granola-for-linux");
          } else if (/copy/i.test(text)) {
            const copiedText = /link/i.test(text)
              ? window.location.href
              : event.currentTarget.parentElement.querySelector("pre")
                  ?.innerText ||
                event.currentTarget.parentElement.innerText
                  .replace(text, "")
                  .trim();
            try {
              await navigator.clipboard.writeText(copiedText);
              setNotice("Copied!");
            } catch {
              setNotice("Select the text and use your browser’s Copy command.");
            }
          } else {
            setOpen(!open);
            setNotice(open ? "" : `${text} selected`);
          }
        }}
      >
        {text}
        {notice && (
          <span className="small-muted" role="status">
            {notice}
          </span>
        )}
      </button>
    );
  }
  if (["input", "select", "textarea", "label"].includes(type)) return null;
  if (
    [
      "h1",
      "h2",
      "h3",
      "h4",
      "p",
      "li",
      "pre",
      "blockquote",
      "summary",
    ].includes(type)
  ) {
    const Tag = type === "summary" ? "h3" : type;
    return <Tag id={node.id}>{text}</Tag>;
  }
  const isGrid = !!node.layout;
  const Tag = ["section", "ul", "ol", "article"].includes(type) ? type : "div";
  return (
    <Tag
      id={node.id}
      className={`${type === "section" ? "observed-section" : "content-group"} ${isGrid ? `content-grid ${node.layout}` : ""}`}
    >
      {children?.map((n, i) => (
        <ContentNode
          key={i}
          node={n}
          openDialog={openDialog}
          level={level + 1}
        />
      ))}
    </Tag>
  );
}
function Supplement({ route, skip = [], openDialog }) {
  const page = pages[route];
  if (!page) return null;
  const nodes = page.blocks;
  let sections = [];
  const visit = (n) => {
    if (n.type === "section") {
      sections.push(n);
      return;
    }
    n.children?.forEach(visit);
  };
  visit(nodes);
  const chosen = sections.filter((section) => {
    const heading = flattenNodes(section).find((x) => /^h[12]$/.test(x.type));
    return (
      heading &&
      !skip.includes(heading.text) &&
      !heading.text.includes("Why your meeting data")
    );
  });
  return (
    <div className="supplement">
      {chosen.map((node, i) => (
        <ContentNode key={i} node={cleanGroups(node)} openDialog={openDialog} />
      ))}
    </div>
  );
}
export function ContentPage({ route, openDialog }) {
  const [page, setPage] = useState(null);
  const meta = routeManifest[route];
  useEffect(() => {
    let cancelled = false;
    setPage(null);
    if (meta)
      routeModules[`./data/routes/${meta.file}.json`]?.().then((module) => {
        if (!cancelled) setPage(module.default);
      });
    return () => {
      cancelled = true;
    };
  }, [route, meta]);
  if (!meta)
    return (
      <section className="not-found">
        <h1>Page not found</h1>
        <p>This page isn’t part of the observed website.</p>
        <Button to="/">Back to Meetily</Button>
      </section>
    );
  if (!page)
    return (
      <div className="route-loading" role="status">
        Loading…
      </div>
    );
  const family =
    route === "/about"
      ? "about-page"
      : route.startsWith("/blog/")
        ? "article-page"
        : route.startsWith("/vs")
          ? "comparison-page"
          : route.startsWith("/use-cases")
            ? "industry-page"
            : route.startsWith("/privacy")
              ? "legal-page"
              : route.startsWith("/guides")
                ? "guide-page"
                : "product-page";
  return (
    <div className={`content-page ${family}`}>
      <ContentNode node={cleanGroups(page.blocks)} openDialog={openDialog} />
      {[
        "/granola-for-linux",
        "/license-request/organization",
        "/license-request",
      ].includes(route) && <InquiryForm route={route} />}
    </div>
  );
}
function InquiryForm({ route }) {
  const [message, setMessage] = useState("");
  return (
    <form
      className="inquiry-form"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(
          "Submission is not configured in this recreation. No information was sent. Please use the live Meetily website.",
        );
      }}
    >
      <h2>
        {route.includes("linux")
          ? "Join the Linux waitlist"
          : "Start your Meetily Pro trial"}
      </h2>
      <label>
        Your name
        <input required autoComplete="name" />
      </label>
      <label>
        Email address
        <input required type="email" autoComplete="email" />
      </label>
      <label>
        Company (optional)
        <input autoComplete="organization" />
      </label>
      <Button type="submit">
        {route.includes("linux") ? "Join waitlist" : "Request a trial"}
      </Button>
      {message && (
        <p role="status" className="form-result">
          {message} <a href={`https://meetily.ai${route}`}>Open Meetily</a>
        </p>
      )}
    </form>
  );
}
export { routeManifest as pages };
