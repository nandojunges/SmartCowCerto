import { useNavigate } from "react-router-dom";
import Page from "../../app/layout/Page";
import Card from "../../app/ui/Card";

export default function ProtocolosMobile() {
  const navigate = useNavigate();

  return (
    <Page title="Protocolos" description="Atalho de protocolos reprodutivos">
      <Card>
        <p style={{ margin: 0, color: "#475569" }}>
          Visão mobile de protocolos será disponibilizada em breve.
        </p>
        <button type="button" onClick={() => navigate("/m/repro")} style={{ marginTop: 12, border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", background: "#fff" }}>
          Voltar para reprodução
        </button>
      </Card>
    </Page>
  );
}
