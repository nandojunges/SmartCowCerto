import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { FazendaProvider } from "./context/FazendaContext.jsx";
import "./index.css";

console.log("[BOOT]", new Date().toISOString());

window.addEventListener("beforeunload", () => {
  console.log("[beforeunload]", new Date().toISOString());
});
window.addEventListener("pagehide", (e) => {
  console.log("[pagehide] persisted=", e.persisted, new Date().toISOString());
});
window.addEventListener("pageshow", (e) => {
  console.log("[pageshow] persisted=", e.persisted, new Date().toISOString());
});
document.addEventListener("visibilitychange", () => {
  console.log("[visibility]", document.visibilityState, new Date().toISOString());
});

const appTree = (
  <BrowserRouter>
    <FazendaProvider>
      <App />
    </FazendaProvider>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  import.meta.env.DEV ? appTree : <React.StrictMode>{appTree}</React.StrictMode>
);
