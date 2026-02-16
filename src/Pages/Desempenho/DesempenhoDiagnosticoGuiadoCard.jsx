export default function DesempenhoDiagnosticoGuiadoCard() {
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
      <h2 style={{ margin: 0, fontSize: 18, color: "#111827" }}>Diagnóstico Guiado</h2>
      <p style={{ margin: "10px 0 0", color: "#4B5563", fontSize: 14 }}>
        Sem dados suficientes ainda. Assim que houver histórico, o SmartCow vai mostrar um diagnóstico aqui.
      </p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled
          style={{
            border: "1px solid #D1D5DB",
            background: "#F3F4F6",
            color: "#9CA3AF",
            borderRadius: 10,
            padding: "8px 12px",
          }}
        >
          Ver vacas afetadas
        </button>
        <button
          type="button"
          disabled
          style={{
            border: "1px solid #D1D5DB",
            background: "#F3F4F6",
            color: "#9CA3AF",
            borderRadius: 10,
            padding: "8px 12px",
          }}
        >
          Ver detalhes
        </button>
      </div>
    </section>
  );
}
