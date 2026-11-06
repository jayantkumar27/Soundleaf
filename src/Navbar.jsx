import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { Menu, X } from "lucide-react";
import "./Navbar.css";

const navbarVariants = {
  expanded: {
    maxWidth: 1232,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 0,
    paddingRight: 0,
    borderRadius: 999,
    backgroundColor: "rgba(16, 23, 34, 0)",
    borderColor: "rgba(38, 50, 69, 0)",
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
  },
  compact: {
    maxWidth: 896,
    paddingTop: 9,
    paddingBottom: 9,
    paddingLeft: 18,
    paddingRight: 18,
    borderRadius: 999,
    backgroundColor: "rgba(16, 23, 34, 0.96)",
    borderColor: "rgba(38, 50, 69, 1)",
    boxShadow: "0 12px 36px rgba(0, 0, 0, 0.25)",
  },
};

const transition = {
  type: "spring",
  stiffness: 100,
  damping: 15,
  mass: 0.5,
};

export default function Navbar() {
  const [isCompact, setIsCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggle = useRef(null);
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (value) => {
    setIsCompact(value > 24);
  });

  useEffect(() => {
    setIsCompact(scrollY.get() > 24);
  }, [scrollY]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuToggle.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const motionTransition = prefersReducedMotion ? { duration: 0 } : transition;
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="meetscribe-header">
        <motion.nav
          className="meetscribe-navbar"
          aria-label="Main navigation"
          variants={navbarVariants}
          initial="expanded"
          animate={isCompact ? "compact" : "expanded"}
          transition={motionTransition}
        >
          <a href="/" className="wordmark meetscribe-brand">
            <img
              src="/assets/meetscribe.png"
              alt=""
              aria-hidden="true"
              width="26"
              height="26"
            />
            <span>MeetScribe</span>
          </a>
          <div className="desktop-links meetscribe-links">
            <a href="#workflow">How it works</a>
            <a href="#features">Features</a>
          </div>
          <div className="meetscribe-actions">
            <a className="button dark meetscribe-download" href="#download">
              Download
            </a>
            <button
              className="meetscribe-menu-toggle"
              ref={menuToggle}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="meetscribe-mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </motion.nav>
        {menuOpen && (
          <motion.div
            className="mobile-menu meetscribe-mobile-menu"
            id="meetscribe-mobile-menu"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionTransition}
          >
            <div className="meetscribe-mobile-title">
              <a
                href="/"
                className="wordmark meetscribe-brand"
                onClick={closeMenu}
              >
                <img
                  src="/assets/meetscribe.png"
                  alt=""
                  aria-hidden="true"
                  width="26"
                  height="26"
                />
                <span>MeetScribe</span>
              </a>
              <button
                className="meetscribe-mobile-close"
                aria-label="Close menu"
                onClick={closeMenu}
              >
                <X size={22} />
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
          </motion.div>
        )}
      </header>
    </>
  );
}
