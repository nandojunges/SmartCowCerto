export default function ListRow({ title, subtitle, right, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#fff",
        padding: "10px 12px",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <span>
        <span style={{ display: "block", fontWeight: 600, color: "#0f172a" }}>{title}</span>
        {subtitle ? <span style={{ display: "block", marginTop: 2, fontSize: 12, color: "#64748b" }}>{subtitle}</span> : null}
      </span>
      {right ? <span style={{ fontSize: 12, color: "#334155" }}>{right}</span> : null}
    </button>
  );
}
