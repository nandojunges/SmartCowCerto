import { useState } from "react";
import Page from "../../app/layout/Page";
import Card from "../../app/ui/Card";
import ListRow from "../../app/ui/ListRow";

const filtros = ["Repro", "Saúde", "Bezerras"];

export default function CalendarioMobile() {
  const [dia, setDia] = useState(new Date().toISOString().slice(0, 10));
  const [filtroAtivo, setFiltroAtivo] = useState("Repro");

  return (
    <Page title="Calendário" description="Agenda rápida por dia">
      <Card>
        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "#334155" }}>
          Selecionar dia
          <input type="date" value={dia} onChange={(event) => setDia(event.target.value)} style={inputStyle} />
        </label>
      </Card>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {filtros.map((filtro) => (
          <button
            key={filtro}
            type="button"
            onClick={() => setFiltroAtivo(filtro)}
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: 999,
              background: filtroAtivo === filtro ? "#dbeafe" : "#fff",
              color: "#1e3a8a",
              padding: "8px 10px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {filtro}
          </button>
        ))}
      </div>

      <Card>
        <strong style={{ display: "block", marginBottom: 10 }}>Eventos de {dia}</strong>
        <div style={{ display: "grid", gap: 8 }}>
          <ListRow title="Vaca 107 - IA" subtitle="08:00 • curral 2" right={filtroAtivo} onClick={() => {}} />
          <ListRow title="Lote bezerras - vacina" subtitle="10:30 • setor B" right={filtroAtivo} onClick={() => {}} />
          <ListRow title="DG coletivo" subtitle="15:00 • tronco" right={filtroAtivo} onClick={() => {}} />
        </div>
      </Card>
    </Page>
  );
}

const inputStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "11px",
  fontSize: 15,
  background: "#fff",
};
