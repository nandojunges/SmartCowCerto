import { useNavigate } from "react-router-dom";

export default function TopBarMobile({ renderRight }) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "#ffffffea",
        backdropFilter: "blur(5px)",
        borderBottom: "1px solid #dbe1ea",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <div>
          <strong style={{ fontSize: 18 }}>SmartCow</strong>
          <div style={{ fontSize: 12, color: "#64748b" }}>Modo celular</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {renderRight ? renderRight() : null}
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
