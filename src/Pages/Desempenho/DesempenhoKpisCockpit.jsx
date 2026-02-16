import { DESMPENHO_KPIS } from "./desempenhoMockData";

export default function DesempenhoKpisCockpit({ onVerKpi }) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
      }}
    >
      {DESMPENHO_KPIS.map((kpi) => (
        <article
          key={kpi.id}
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
            minHeight: 120,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>{kpi.titulo}</p>
            <strong style={{ display: "block", marginTop: 8, fontSize: 28, color: "#111827" }}>
              {kpi.valor}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => onVerKpi(kpi)}
            style={{
              alignSelf: "flex-start",
              marginTop: 12,
              border: "1px solid #D1D5DB",
              background: "#FFFFFF",
              color: "#374151",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Ver
          </button>
        </article>
      ))}
    </section>
  );
}
