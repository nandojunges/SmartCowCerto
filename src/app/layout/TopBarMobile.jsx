import { useNavigate } from "react-router-dom";

export default function TopBarMobile({ onOpenMenu, title = "SmartCow", right = null }) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: "#ffffffea",
        backdropFilter: "blur(5px)",
        borderBottom: "1px solid #dbe1ea",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menu"
            style={{
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#0f172a",
              borderRadius: 10,
              width: 40,
              height: 40,
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ☰
          </button>
          <div>
            <strong style={{ fontSize: 18 }}>{title}</strong>
            <div style={{ fontSize: 12, color: "#64748b" }}>Modo celular</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {right}
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#0f172a",
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Modo completo
          </button>
        </div>
      </div>
    </header>
  );
}
