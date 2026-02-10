import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import MobileShell from "./MobileShell";

const DESKTOP_PREF_KEY = "smartcow:prefer-desktop";

function getDesktopPreference() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.sessionStorage.getItem(DESKTOP_PREF_KEY) === "1";
}

function MobileShellHomeRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  const [preferDesktop, setPreferDesktop] = useState(getDesktopPreference);

  const mobilePath = useMemo(() => {
    const query = location.search ?? "";
    return `/m${query}`;
  }, [location.search]);

  const handleOpenMobile = () => {
    navigate(mobilePath, { replace: false });
  };

  const handleContinueDesktop = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(DESKTOP_PREF_KEY, "1");
    }
    setPreferDesktop(true);
  };

  if (preferDesktop) {
    return <DesktopShellPassthrough />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16, background: "#f5f7fb" }}>
      <div style={{ width: "100%", maxWidth: 420, border: "1px solid #dbe2f0", borderRadius: 14, background: "#fff", padding: 18, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>SmartCow no celular</h2>
        <p style={{ margin: "0 0 16px", color: "#4b5563", lineHeight: 1.4 }}>
          Detectamos um dispositivo móvel. Você pode abrir o modo celular para uma experiência otimizada,
          ou continuar no modo completo.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          <button type="button" onClick={handleOpenMobile} style={buttonPrimaryStyle}>
            Abrir modo celular
          </button>
          <button type="button" onClick={handleContinueDesktop} style={buttonSecondaryStyle}>
            Continuar no modo completo
          </button>
        </div>
      </div>
    </div>
  );
}

function DesktopShellPassthrough() {
  return <Outlet />;
}

const buttonPrimaryStyle = {
  border: "1px solid #1d4ed8",
  background: "#2563eb",
  color: "#fff",
  borderRadius: 10,
  padding: "12px 14px",
  fontWeight: 600,
  fontSize: 15,
};

const buttonSecondaryStyle = {
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#1f2937",
  borderRadius: 10,
  padding: "12px 14px",
  fontWeight: 600,
  fontSize: 15,
};

export default function SmartCowShell() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const inMobileRoute = location.pathname === "/m" || location.pathname.startsWith("/m/");

  if (inMobileRoute) {
    return <MobileShell />;
  }

  if (isMobile) {
    return <MobileShellHomeRedirect />;
  }

  return <DesktopShellPassthrough />;
}
