import { useState } from "react";
import DesempenhoHeader from "./DesempenhoHeader";
import DesempenhoDiagnosticoGuiadoCard from "./DesempenhoDiagnosticoGuiadoCard";
import DesempenhoKpisCockpit from "./DesempenhoKpisCockpit";
import DesempenhoGraficoPrincipalCard from "./DesempenhoGraficoPrincipalCard";
import DesempenhoAcaoDeHojeCard from "./DesempenhoAcaoDeHojeCard";
import DesempenhoDrillDownPanel from "./DesempenhoDrillDownPanel";

export default function Desempenho() {
  const [chipSelecionado, setChipSelecionado] = useState("Reprodução");
  const [periodo, setPeriodo] = useState("21d");
  const [drillDown, setDrillDown] = useState({ open: false, title: "", subtitle: "" });

  const abrirPainel = ({ title, subtitle }) => {
    setDrillDown({ open: true, title, subtitle });
  };

  return (
    <div style={{ padding: "28px 48px", background: "#F8FAFC", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1500, margin: "0 auto", display: "grid", gap: 16 }}>
        <DesempenhoHeader
          chipSelecionado={chipSelecionado}
          onChipChange={setChipSelecionado}
          periodo={periodo}
          onPeriodoChange={setPeriodo}
        />

        <DesempenhoDiagnosticoGuiadoCard />

        <DesempenhoKpisCockpit
          onVerKpi={(kpi) => abrirPainel({ title: kpi.titulo, subtitle: "Sem dados por enquanto" })}
        />

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          <DesempenhoGraficoPrincipalCard />
          <DesempenhoAcaoDeHojeCard
            onVerFicha={(item) =>
              abrirPainel({
                title: `Ficha ${item.brinco}`,
                subtitle: "Sem dados por enquanto",
              })
            }
          />
        </div>
      </div>

      <DesempenhoDrillDownPanel
        open={drillDown.open}
        title={drillDown.title}
        subtitle={drillDown.subtitle}
        onClose={() => setDrillDown((prev) => ({ ...prev, open: false }))}
      >
        Sem dados por enquanto.
      </DesempenhoDrillDownPanel>
    </div>
  );
}
