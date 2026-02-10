import { useNavigate } from "react-router-dom";
import Page from "../../app/layout/Page";
import Card from "../../app/ui/Card";

export default function NovoAnimalMobile() {
  const navigate = useNavigate();

  return (
    <Page title="Novo animal" description="Cadastro rápido (em breve)">
      <Card>
        <p style={{ margin: 0, color: "#475569" }}>
          O fluxo rápido de cadastro será adicionado na próxima etapa.
        </p>
        <button type="button" onClick={() => navigate("/m/animais")} style={{ marginTop: 12, border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", background: "#fff" }}>
          Voltar para lista
        </button>
      </Card>
    </Page>
  );
}
