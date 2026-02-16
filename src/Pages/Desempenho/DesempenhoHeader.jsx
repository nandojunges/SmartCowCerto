const CHIPS = ["Reprodução", "Produção", "Financeiro"];
const PERIODOS = ["21d", "30d", "90d", "Ano", "Personalizado"];

export default function DesempenhoHeader({
  chipSelecionado,
  onChipChange,
  periodo,
  onPeriodoChange,
}) {
  const personalizado = periodo === "Personalizado";

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: 28, color: "#111827" }}>Desempenho</h1>
        <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChipChange(chip)}
              style={{
                border: "1px solid #D1D5DB",
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 600,
                background: chipSelecionado === chip ? "#E5F0FF" : "#FFFFFF",
                color: chipSelecionado === chip ? "#1D4ED8" : "#374151",
                cursor: "pointer",
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {PERIODOS.map((opcao) => (
          <button
            key={opcao}
            type="button"
            onClick={() => onPeriodoChange(opcao)}
            style={{
              border: "1px solid #D1D5DB",
              borderRadius: 10,
              padding: "6px 10px",
              fontSize: 13,
              fontWeight: 600,
              background: periodo === opcao ? "#1F2937" : "#FFFFFF",
              color: periodo === opcao ? "#FFFFFF" : "#374151",
              cursor: "pointer",
            }}
          >
            {opcao}
          </button>
        ))}

        {personalizado ? (
          <>
            <input
              type="text"
              placeholder="Início"
              readOnly
              style={{
                border: "1px solid #D1D5DB",
                borderRadius: 8,
                padding: "7px 9px",
                width: 95,
                fontSize: 13,
                background: "#F9FAFB",
              }}
            />
            <input
              type="text"
              placeholder="Fim"
              readOnly
              style={{
                border: "1px solid #D1D5DB",
                borderRadius: 8,
                padding: "7px 9px",
                width: 95,
                fontSize: 13,
                background: "#F9FAFB",
              }}
            />
          </>
        ) : null}
      </div>
    </header>
  );
}
