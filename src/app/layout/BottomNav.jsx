import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { label: "Início", icon: "🏠", to: "/m" },
  { label: "Animais", icon: "🐄", to: "/m/animais" },
  { label: "Leite", icon: "🥛", to: "/m/leite" },
  { label: "Reprodução", icon: "🧬", to: "/m/repro" },
  { label: "Mais", icon: "☰", to: "/m/mais" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      aria-label="Navegação mobile"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#fff",
        borderTop: "1px solid #dbe1ea",
        padding: "8px 10px calc(8px + env(safe-area-inset-bottom, 0px))",
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        gap: 8,
        zIndex: 40,
      }}
    >
      {tabs.map((tab) => {
        const active = location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`);

        return (
          <button
            key={tab.to}
            type="button"
            onClick={() => navigate(tab.to)}
            style={{
              border: active ? "1px solid #94a3b8" : "1px solid transparent",
              borderRadius: 10,
              background: active ? "#eef2ff" : "#fff",
              color: active ? "#1e3a8a" : "#334155",
              padding: "6px 4px",
              display: "grid",
              placeItems: "center",
              fontSize: 12,
              gap: 2,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
