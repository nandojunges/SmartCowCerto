import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Início", to: "/m" },
  { label: "Operações", to: "/m/operacoes" },
  { label: "Animais", to: "/m/animais" },
  { label: "Leite", to: "/m/leite" },
  { label: "Reprodução", to: "/m/repro" },
  { label: "Calendário", to: "/m/calendario" },
  { label: "Mais", to: "/m/mais" },
];

export default function MobileDrawerNav({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (to) => {
    navigate(to);
    onClose?.();
  };

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.45)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 180ms ease",
          zIndex: 44,
        }}
      />

      <aside
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "min(86vw, 320px)",
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          boxShadow: "8px 0 24px rgba(15, 23, 42, 0.15)",
          transform: open ? "translateX(0)" : "translateX(-102%)",
          transition: "transform 220ms ease",
          zIndex: 45,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px", borderBottom: "1px solid #e2e8f0" }}>
          <div>
            <strong style={{ fontSize: 18 }}>Menu</strong>
            <div style={{ fontSize: 12, color: "#64748b" }}>Navegação mobile</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            style={{
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#0f172a",
              borderRadius: 10,
              width: 36,
              height: 36,
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <nav aria-label="Menu lateral" style={{ display: "grid", gap: 8, padding: 12 }}>
          {menuItems.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/m" && location.pathname.startsWith(`${item.to}/`));

            return (
              <button
                key={item.to}
                type="button"
                onClick={() => handleNavigate(item.to)}
                style={{
                  border: active ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                  background: active ? "#eff6ff" : "#fff",
                  color: active ? "#1e40af" : "#0f172a",
                  borderRadius: 12,
                  minHeight: 44,
                  textAlign: "left",
                  padding: "10px 12px",
                  fontSize: 15,
                  fontWeight: active ? 700 : 500,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
