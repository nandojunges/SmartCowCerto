import { ACAO_DE_HOJE_MOCK } from "./desempenhoMockData";

export default function DesempenhoAcaoDeHojeCard({ onVerFicha }) {
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
        Ação de Hoje — Vacas em risco (placeholder)
      </h2>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {ACAO_DE_HOJE_MOCK.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              padding: "10px 12px",
              display: "grid",
              gridTemplateColumns: "minmax(100px, 0.5fr) 1fr auto",
              alignItems: "center",
              gap: 10,
            }}
          >
            <strong style={{ color: "#111827", fontSize: 14 }}>{item.brinco}</strong>
            <span style={{ color: "#6B7280", fontSize: 13 }}>{item.motivo}</span>
            <button
              type="button"
              onClick={() => onVerFicha(item)}
              style={{
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                color: "#374151",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Ver ficha
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
