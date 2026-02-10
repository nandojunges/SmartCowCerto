export default function Card({ children, onClick, style }) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (event) => (event.key === "Enter" ? onClick() : null) : undefined}
      style={{
        border: "1px solid #dbe1ea",
        borderRadius: 12,
        background: "#fff",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
        padding: 12,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
