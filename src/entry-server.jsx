import React from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App.jsx";

export function render(language = "th") {
  return renderToString(
    <React.StrictMode>
      <App initialLanguage={language} />
    </React.StrictMode>,
  );
}
