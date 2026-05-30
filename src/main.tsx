import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// D-1: React 19 SPA bootstrap. No router/state lib yet — those are
// slice-003 decisions (foundation R-4/R-6).
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
