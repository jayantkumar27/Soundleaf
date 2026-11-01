import React, { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Header, Footer, Dialog } from "./components";
import Home from "./Home";
import Blog from "./Blog";
import { Pricing, Downloads, Pro, Buy, ContentPage, pages } from "./Pages";
import "./styles.css";
import "./pages.css";
import { config } from "./data/config";
function App() {
  const [dialog, setDialog] = useState(null);
  const location = useLocation();
  const closeDialog = useCallback(() => setDialog(null), []);
  const route = location.pathname.replace(/\/$/, "") || "/";
  useEffect(() => {
    if (config.externalRoutes[route]) {
      window.location.replace(config.externalRoutes[route]);
      return;
    }
    document.title =
      route === "/"
        ? "Meetily (Meetly AI) - Privacy-First AI Meeting Assistant | Otter.ai & Granola Alternative"
        : pages[route]?.title || "Meetily";
    if (location.hash) {
      requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(location.hash.slice(1)))
          ?.scrollIntoView(),
      );
    } else window.scrollTo({ top: 0, behavior: "instant" });
    setDialog(null);
  }, [location, route]);
  const props = { openDialog: setDialog };
  return (
    <>
      <Header
        showAnnouncement={
          route === "/" ||
          pages[route]?.announcement ||
          pages[route]?.sections?.some((s) => s.text.startsWith("New"))
        }
      />
      <main id="main">
        {route === "/" ? (
          <Home {...props} />
        ) : route === "/pricing" ? (
          <Pricing {...props} />
        ) : route === "/downloads" ? (
          <Downloads {...props} />
        ) : route === "/pro" ? (
          <Pro {...props} />
        ) : route === "/buy-now" ? (
          <Buy {...props} />
        ) : route === "/blog" ? (
          <Blog />
        ) : (
          <ContentPage key={route} route={route} {...props} />
        )}
      </main>
      <Footer {...props} />
      {dialog && <Dialog type={dialog} onClose={closeDialog} />}
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
