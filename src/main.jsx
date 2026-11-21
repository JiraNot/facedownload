import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

const rootElement = document.getElementById("root");
const basePath = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const normalizedPath = window.location.pathname.endsWith("/") ? window.location.pathname : `${window.location.pathname}/`;
const initialLanguage = normalizedPath.startsWith(`${basePath}en/`) ? "en" : "th";
const app = (
  <React.StrictMode>
    <App initialLanguage={initialLanguage} />
  </React.StrictMode>
);

if (rootElement.dataset.prerendered === "true") {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
