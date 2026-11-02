import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Header, Footer, Dialog } from "./components";
import Home from "./Home";
import "./styles.css";

if (
  window.location.pathname !== "/" &&
  window.location.pathname !== "/index.html"
) {
  window.location.replace("/");
} else {
  function App() {
    const [dialog, setDialog] = useState(null);
    return (
      <>
        <Header />
        <main id="main">
          <Home openDialog={setDialog} />
        </main>
        <Footer />
        {dialog && <Dialog type={dialog} onClose={() => setDialog(null)} />}
      </>
    );
  }

  createRoot(document.getElementById("root")).render(<App />);
}
