export default function ActionGrid({ actions = [] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: 12,
            background: "#fff",
            padding: "14px 10px",
            display: "grid",
            placeItems: "center",
            gap: 4,
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          <span style={{ fontSize: 20 }}>{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
