import { useNavigate } from "react-router-dom";
import Page from "../../app/layout/Page";
import Card from "../../app/ui/Card";
import ListRow from "../../app/ui/ListRow";

const lancamentos = [
  { title: "Vaca 101", subtitle: "06:10 • 18,4 L", right: "Manhã" },
  { title: "Vaca 102", subtitle: "06:18 • 16,1 L", right: "Manhã" },
  { title: "Vaca 108", subtitle: "15:45 • 14,2 L", right: "Tarde" },
];

export default function LeiteMobile() {
  const navigate = useNavigate();

  return (
    <Page title="Leite" description="Resumo e lançamentos do dia">
      <Card>
        <div style={{ fontSize: 13, color: "#64748b" }}>Total do dia</div>
        <div style={{ marginTop: 4, fontSize: 26, fontWeight: 700 }}>2.840 L</div>
        <div style={{ marginTop: 4, fontSize: 13, color: "#475569" }}>96 vacas lançadas</div>
      </Card>

      <button type="button" onClick={() => navigate("/m/leite/lancar")} style={primaryButton}>
        Lançar leite
      </button>

      <Card>
        <strong style={{ display: "block", marginBottom: 10 }}>Lançamentos recentes</strong>
        <div style={{ display: "grid", gap: 8 }}>
          {lancamentos.map((item) => (
            <ListRow key={item.title + item.subtitle} title={item.title} subtitle={item.subtitle} right={item.right} onClick={() => {}} />
          ))}
        </div>
      </Card>
    </Page>
  );
}

const primaryButton = {
  border: "1px solid #1d4ed8",
  background: "#2563eb",
  color: "#fff",
  borderRadius: 10,
  padding: "12px 14px",
  fontWeight: 700,
};
