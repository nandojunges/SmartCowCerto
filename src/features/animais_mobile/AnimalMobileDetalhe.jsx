import { useNavigate, useParams } from "react-router-dom";
import Page from "../../app/layout/Page";
import Card from "../../app/ui/Card";
import ListRow from "../../app/ui/ListRow";

const eventos = [
  { title: "IA registrada", subtitle: "12/01/2026 • Touro Orion", right: "Repro" },
  { title: "Controle leite", subtitle: "Ontem • 31,5 L", right: "Leite" },
  { title: "Vacinação", subtitle: "05/01/2026 • Brucelose", right: "Saúde" },
];

export default function AnimalMobileDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Page title={`Animal ${id}`} description="Detalhes e ações rápidas">
      <button type="button" onClick={() => navigate(-1)} style={backButtonStyle}>
        ← Voltar
      </button>

      <Card>
        <div style={{ display: "grid", gap: 6 }}>
          <div><strong>Número/Brinco:</strong> {id}</div>
          <div><strong>Categoria:</strong> Vaca lactante</div>
          <div><strong>DEL:</strong> 112 dias</div>
          <div><strong>Última IA:</strong> 12/01/2026</div>
          <div><strong>Previsão Parto:</strong> 20/10/2026</div>
        </div>
      </Card>

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <button type="button" onClick={() => navigate("/m/leite/lancar")} style={actionButtonStyle}>Registrar leite</button>
        <button type="button" onClick={() => navigate("/m/repro/ia")} style={actionButtonStyle}>Registrar IA</button>
        <button type="button" onClick={() => navigate("/m/repro/dg")} style={actionButtonStyle}>Registrar DG</button>
        <button type="button" onClick={() => alert("Em breve: ocorrências") } style={actionButtonStyle}>Ocorrência</button>
      </div>

      <Card>
        <strong style={{ display: "block", marginBottom: 10 }}>Últimos eventos</strong>
        <div style={{ display: "grid", gap: 8 }}>
          {eventos.map((evento) => (
            <ListRow key={evento.title} title={evento.title} subtitle={evento.subtitle} right={evento.right} onClick={() => {}} />
          ))}
        </div>
      </Card>
    </Page>
  );
}

const backButtonStyle = {
  justifySelf: "start",
  border: "1px solid #cbd5e1",
  borderRadius: 9,
  background: "#fff",
  padding: "8px 10px",
};

const actionButtonStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  background: "#fff",
  padding: "12px 10px",
  fontWeight: 600,
};
