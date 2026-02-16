export default function DesempenhoGraficoPrincipalCard() {
  return (
    <section
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 14,
        padding: 20,
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 18, color: "#111827" }}>
        Funil reprodutivo por ciclos (placeholder)
      </h2>
      <div
        style={{
          marginTop: 14,
          height: 260,
          borderRadius: 12,
          border: "1px dashed #CBD5E1",
          background:
            "repeating-linear-gradient(45deg, #F3F4F6 0px, #F3F4F6 16px, #E5E7EB 16px, #E5E7EB 32px)",
          display: "grid",
          placeItems: "center",
          color: "#6B7280",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Área do gráfico principal (sem biblioteca por enquanto)
      </div>
    </section>
  );
}
