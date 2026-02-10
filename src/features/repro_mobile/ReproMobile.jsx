import { useNavigate } from "react-router-dom";
import Page from "../../app/layout/Page";
import Card from "../../app/ui/Card";
import ListRow from "../../app/ui/ListRow";

export default function ReproMobile() {
  const navigate = useNavigate();

  return (
    <Page title="Reprodução" description="Pendências e registros rápidos">
      <Card>
        <strong style={{ display: "block", marginBottom: 8 }}>Pendências IA</strong>
        <div style={{ display: "grid", gap: 8 }}>
          <ListRow title="Vaca 107" subtitle="Cio observado hoje" right="Prioridade" onClick={() => {}} />
          <ListRow title="Vaca 132" subtitle="24h após protocolo" right="Hoje" onClick={() => {}} />
        </div>
      </Card>

      <Card>
        <strong style={{ display: "block", marginBottom: 8 }}>Pendências DG</strong>
        <div style={{ display: "grid", gap: 8 }}>
          <ListRow title="Vaca 118" subtitle="32 dias pós IA" right="Amanhã" onClick={() => {}} />
          <ListRow title="Vaca 140" subtitle="34 dias pós IA" right="Hoje" onClick={() => {}} />
        </div>
      </Card>

      <div style={{ display: "grid", gap: 8 }}>
        <button type="button" onClick={() => navigate("/m/repro/ia")} style={actionButton}>Registrar IA</button>
        <button type="button" onClick={() => navigate("/m/repro/dg")} style={actionButton}>Registrar DG</button>
        <button type="button" onClick={() => navigate("/m/repro/protocolos")} style={actionButton}>Protocolos</button>
      </div>
    </Page>
  );
}

const actionButton = {
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  background: "#fff",
  padding: "12px",
  textAlign: "left",
  fontWeight: 600,
};
